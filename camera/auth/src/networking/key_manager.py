"""
Key Manager

Loads and randomly creates the keys needed to communicate with the backend
Serial is from the Raspberry Pi's device tree
"""

import uuid
import base64
from os import makedirs, remove
from os.path import exists

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import cryptography.hazmat.primitives.serialization as Serialization

class Keys():
    """
    Private Key and UUID container class
    """

    @staticmethod
    def create_random_key():
        """Create a random Private/Public key pair and UUID for tests"""
        key = Ed25519PrivateKey.generate()
        uid = str(uuid.uuid4())
        return Keys(key, uid)

    @staticmethod
    def create_key_from_disk():
        """Create keys from stored private key and UUID"""
        priv_key = _load_key()
        uid = _load_uuid()
        if priv_key is None or uid is None:
            return None
        return Keys(priv_key, uid)

    def __init__(self, priv_key, uid):
        self.priv_key: Ed25519PrivateKey = priv_key
        self.uuid: str = uid

    def _sign(self, data):
        if self.priv_key is None:
            raise Exception("Private Key does not exist")
        return self.priv_key.sign(data)

    def get_auth_token(self):
        """Get an authentication token using UUID signed by private key"""
        token = self._sign(self.uuid.encode())
        return base64.b64encode(token).decode()

    def persist(self):
        """Persist keys to disk so they can be loaded later"""
        priv_bytes = self.priv_key.private_bytes(
            Serialization.Encoding.PEM,
            Serialization.PrivateFormat.OpenSSH,
            Serialization.NoEncryption()
        )

        # Make sure eyespy directory exists
        makedirs("/home/pi/.eyespy", exist_ok=True)
        with open(_DEFAULT_KEY_LOC, 'wb') as file:
            file.write(priv_bytes)

        with open(_DEFAULT_UUID_LOC, 'w', encoding="utf8") as file:
            file.write(self.uuid)

    def destroy_keys(self):
        """Delete UUID and Private Key from disk"""
        self.uuid = None
        self.priv_key = None

        if exists(_DEFAULT_KEY_LOC):
            remove(_DEFAULT_KEY_LOC)
        if exists(_DEFAULT_UUID_LOC):
            remove(_DEFAULT_UUID_LOC)


class KeyManager():
    """
    Manager which can be passed around and shared. Manager is still valid even if keys change.
    If no keys and serial is defined, the manager will try to load them from disk
    """

    @staticmethod
    def create_test_key_manager(serial):
        """Creates and return a key manager with random keys"""
        return KeyManager(Keys.create_random_key(), serial)

    @staticmethod
    def create_key_manager_from_disk():
        """Create a key manager from keys on disk"""
        return KeyManager(Keys.create_key_from_disk, _get_serial())

    def __init__(self, keys, serial):
        self.keys: Keys = keys
        self.serial: str = serial

    def gen_keys(self):
        """
        Create new pair of keys and UUID. Note that from this point, the UUID is invalid
        and will need to be set from the backend
        """
        self.keys = Keys.create_random_key()
        self.keys.persist()

    def clear_keys(self):
        """
        Destroy key if camera is dissassociated from an account
        """
        self.keys.destroy_keys()
        self.keys = None

    def get_public_key(self):
        """Get the public part of the private/public key pair"""
        return self.keys.priv_key.public_key()

    def get_auth_token(self):
        """Get authentication token from Keys object"""
        return self.keys.get_auth_token()

def _is_raspi():
    if not exists('/sys/firmware/devicetree/base/model'):
        return False

    with open('/sys/firmware/devicetree/base/model', 'r', encoding="utf8") as model:
        if 'raspberry pi' in model.read().lower():
            return True
    return False

_DEFAULT_KEY_LOC = "/home/pi/.eyespy/key"
_DEFAULT_UUID_LOC = "/home/pi/.eyespy/uuid"
def _load_key(filename = _DEFAULT_KEY_LOC):
    if not exists(filename):
        return None

    with open(filename, 'rb') as priv_file:
        priv_key = priv_file.read()
        return Serialization.load_ssh_private_key(priv_key, None)

def _load_uuid(filename = _DEFAULT_UUID_LOC):
    if not exists(filename):
        return None

    with open(filename, 'r', encoding="utf8") as uuid_file:
        return uuid_file.buffer.read().decode("utf8").rstrip("\n")

def _get_serial():
    if not _is_raspi():
        return None

    with open('/sys/firmware/devicetree/base/serial-number', 'r', encoding="utf8") as serial:
        return serial.read().rstrip('\x00')
