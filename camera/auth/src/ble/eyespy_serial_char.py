import cryptography.hazmat.primitives.serialization as Serialization
from networking.key_manager import KeyManager
from .dbus_interface.dbus_bluez_interface import Characteristic
from networking import Keys, KeyManager
import json

class EyeSpySerialCharacteristic(Characteristic):
    EYESPY_SERIAL_UUID = "8b83fee2-373c-46a5-a782-1db9118431d9"
    def __init__(self, bus, index, service, key_manager: KeyManager):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_SERIAL_UUID,
            ['read'],
            service, index
        )
        self.key_manager = key_manager
    
    def ReadValue(self, options):
        # TODO: Do not create new keys when trying to connect
        # This could end up real bad
        try:
            new_keys = Keys.create_random_key()
            self.key_manager.set_keys(new_keys)
            new_keys.persist()
            out_str = json.dumps({
                "Serial": self.key_manager.get_serial(),
                "PubKey": new_keys.get_priv_key().public_key().public_bytes(
                    Serialization.Encoding.PEM,
                    Serialization.PublicFormat.SubjectPublicKeyInfo
                ).decode()
            })
        except Exception as err:
            print (err.with_traceback())
        return out_str.encode("ascii")