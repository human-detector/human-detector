import cryptography.hazmat.primitives.serialization as Serialization
from networking.key_manager import KeyManager
from networking.wifi_manager import DeviceState, WifiManager
from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_errors import NotPermittedException
from networking import Keys, KeyManager
import json

class EyeSpySerialCharacteristic(Characteristic):
    """
    Characteristic which generates a private key and returns it
    """
    EYESPY_SERIAL_UUID = "8b83fee2-373c-46a5-a782-1db9118431d9"
    def __init__(self, bus, index, service, key_manager: KeyManager, wifi_manager: WifiManager):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_SERIAL_UUID,
            ['read'],
            service, index
        )
        self.key_manager = key_manager
        self.wifi_manager = wifi_manager
    
    def ReadValue(self, options):
        """
        Returns a JSON of the following format:
        {
            "Serial": "Serial number",
            "PubKey": PEM PKGI public key
        }
        """
        # Prohibit reads when the camera is trying to connect
        # Reads generate new keys and persist them, which is *bad* when trying to connect
        if self.wifi_manager.get_state[0] == DeviceState.CONNECTING:
            raise NotPermittedException()
        
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
        return out_str.encode("ascii")