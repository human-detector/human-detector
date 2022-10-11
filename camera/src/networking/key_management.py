import base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import io

def _is_raspi():
    try:
        with io.open('/sys/firmware/devicetree/base/model', 'r') as model:
            if 'raspberry pi' in model.read().lower():
                return True
    except Exception: pass
    return False

_DEFAULT_KEY_LOC = "~/.eyespy/key"
def _load_key(filename = _DEFAULT_KEY_LOC):
    with open(filename, 'rb') as priv_file:
        priv_key = priv_file.read()
        return Ed25519PrivateKey.from_private_bytes(priv_key)

def _get_serial():
    if not _is_raspi():
        return None
    
    with open('/sys/firmware/devicetree/base/serial-number', 'r') as serial:
        return serial.read()

class KeyManager():
    @staticmethod
    def create_random_key(id):
        key = Ed25519PrivateKey.generate()
        return KeyManager(key, id)

    def __init__(self, priv_key = _load_key(), serial = _get_serial()):
        self.priv_key = priv_key
        self.serial = serial

    def get_priv_key(self):
        return self.priv_key
    
    def get_serial(self):
        return self.serial

    def sign(self, data):
        return self.priv_key.sign(data)
        
    def get_auth_token(self):
        token = self.sign(str.encode(self.get_serial()))
        return base64.b64encode(token).decode()