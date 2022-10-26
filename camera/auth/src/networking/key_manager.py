from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import cryptography.hazmat.primitives.serialization as Serialization
from os.path import expanduser, exists
from os import makedirs
import base64
import uuid
import io

def _is_raspi():
    try:
        with io.open('/sys/firmware/devicetree/base/model', 'r') as model:
            if 'raspberry pi' in model.read().lower():
                return True
    except Exception: pass
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
    with open(filename, 'r') as uuid_file:
        return uuid_file.buffer.read()

def _get_serial():
    if not _is_raspi():
        return None
    
    with open('/sys/firmware/devicetree/base/serial-number', 'r') as serial:
        return serial.read().rstrip('\x00')

class Keys():
    @staticmethod
    def create_random_key():
        key = Ed25519PrivateKey.generate()
        id = str(uuid.uuid4())
        return Keys(key, id)

    def __init__(self, priv_key = None, id = None):
        self.priv_key: Ed25519PrivateKey = _load_key() if priv_key is None else priv_key
        self.uuid = _load_uuid() if id is None else id

    def get_priv_key(self):
        return self.priv_key

    def get_uuid(self):
        return self.uuid
    
    def sign(self, data):
        return self.priv_key.sign(data)
        
    def get_auth_token(self):
        token = self.sign(str.encode(self.uuid))
        return base64.b64encode(token).decode()

    def persist(self):
        priv_bytes = self.priv_key.private_bytes(
            Serialization.Encoding.PEM,
            Serialization.PrivateFormat.OpenSSH,
            Serialization.NoEncryption()
        )

        # Make sure eyespy directory exists
        makedirs("/home/pi/.eyespy", exist_ok=True)
        with open(_DEFAULT_KEY_LOC, 'w') as file:
            file.write(priv_bytes)
        with open(_DEFAULT_UUID_LOC, 'w') as file:
            file.write(self.uuid)


class KeyManager():
    @staticmethod
    def create_random_key(serial):
        return KeyManager(Keys.create_random_key(), serial)

    def __init__(self, keys = None, serial = None):
        self.keys = keys if keys is not None else Keys()
        self.serial = serial if serial is not None else _get_serial()

    def set_keys(self, keys):
        self.keys = keys

    def get_keys(self):
        return self.keys

    def get_serial(self):
        return self.serial
    
    def get_auth_token(self):
        return self.keys.get_auth_token()
