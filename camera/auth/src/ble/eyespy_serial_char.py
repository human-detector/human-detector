"""
EyeSpy serial number and public key Characteristic
"""

import json
import cryptography.hazmat.primitives.serialization as Serialization
from networking.key_manager import KeyManager
from networking.wifi_manager import DeviceState, WifiManager
from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_errors import NotPermittedException

class EyeSpySerialCharacteristic(Characteristic):
    """
    Characteristic which generates a private key and returns it
    """
    EYESPY_SERIAL_UUID = "8b83fee2-373c-46a5-a782-1db9118431d9"

    def __init__(self, **kwargs):
        Characteristic.__init__(
            self,
            service = kwargs["service"],
            bus     = kwargs["bus"],
            uuid    = self.EYESPY_SERIAL_UUID,
            flags   = ['read'],
            index   = kwargs["index"]
        )

        self.key_manager: KeyManager = kwargs["key_manager"]
        self.wifi_manager: WifiManager = kwargs["wifi_manager"]

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
        if self.wifi_manager.get_state()[0] == DeviceState.CONNECTING:
            raise NotPermittedException()

        self.key_manager.gen_keys()
        out_str = json.dumps({
            "Serial": self.key_manager.get_serial(),
            "PubKey": self.key_manager.get_public_key().public_bytes(
                Serialization.Encoding.PEM,
                Serialization.PublicFormat.SubjectPublicKeyInfo
            ).decode()
        })

        return out_str.encode("ascii")
