from enum import Enum, auto
from networking.wifi_manager import SecType, WifiManager
from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_errors import *
import json

class ReadState(Enum):
    VALUE_READ = auto()
    NEW_VALUE = auto()

class EyeSpyWifiTypeCharacteristic(Characteristic):
    """
    Allows phone to discover wifi security type
    """
    EYESPY_WIFI_UUID = "b0ae3b34-5428-4d16-8654-515f41dff777"

    def __init__(self, bus, index, service, wifi_manager: WifiManager):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_WIFI_UUID,
            ['read', 'write'],
            service, index
        )
        self.wifi_manager = wifi_manager
        self.state = ReadState.VALUE_READ
        self.json = None
    
    def WriteValue(self, value, options):
        """
        Expects a JSON of the following format
        {
            "SSID": "<Network SSID>"
        }
        """
        str_val = bytes(value).decode("ascii")
        if self.state == ReadState.VALUE_READ:
            self.state = ReadState.NEW_VALUE
            self.json = str_val
        else:
            self.json += str_val
    
    def ReadValue(self, options):
        """
        Returns a JSON of the following format
        {
            "Type": "KEY_PSK" or "KEY_802_1X"
        }
        """
        self.state = ReadState.VALUE_READ

        try:
            dict = json.loads(self.json)
        except json.JSONDecodeError:
            raise InvalidArgsException()
        
        if "SSID" not in dict:
            raise InvalidArgsException()
        
        (ap, type)  = self.wifi_manager.get_wifi_security(dict["SSID"])

        if ap is None:
            self.type = SecType.UNSUPPORTED
            raise FailedException()

        self.type = type
        return json.dumps({
            "Type": self.type.name
        }).encode("ascii")