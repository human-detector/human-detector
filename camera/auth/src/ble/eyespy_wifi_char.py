import traceback
from networking.wifi_manager import SecType, WifiManager
from .dbus_interface.dbus_bluez_errors import InvalidArgsException
from .dbus_interface.dbus_bluez_interface import Characteristic
from enum import Enum, auto
import json

class ReadState(Enum):
    VALUE_READ = auto()
    NEW_VALUE = auto()

class EyeSpyWifiCharacteristic(Characteristic):
    EYESPY_WIFI_UUID = "7a1673f9-55cb-4f40-b624-561ad8afb8e2"

    def __init__(self, bus, index, service, wifi_manager: WifiManager):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_WIFI_UUID,
            ['write'],
            service, index
        )
        self.state = ReadState.VALUE_READ
        self.json = ""
        self.wifi_manager = wifi_manager
    
    def WriteValue(self, value, options):
        try:
            str_val = bytes(value).decode("ascii")
            if str_val.startswith("{\""):
                self.state == ReadState.NEW_VALUE
                self.json = str_val
            else:
                self.json += str_val
            
            try:
                dict = json.loads(self.json)
            except ValueError:
                # Not a full JSON yet
                return

            # Needs SSID, UUID, Passkey, and User if applicable
            if "SSID" not in dict or "UUID" not in dict or "Pass" not in dict:
                raise InvalidArgsException
            
            (ap, type) = self.wifi_manager.get_wifi_security(dict["SSID"])

            if type == SecType.UNSUPPORTED or ap is None:
                raise InvalidArgsException
            
            if type == SecType.KEY_802_1X:
                if "User" not in dict:
                    raise InvalidArgsException
                self.wifi_manager.connect_enterprise(dict["SSID"], dict["User"], dict["Pass"])
            elif type == SecType.KEY_PSK:
                self.wifi_manager.connect_psk(dict["SSID"], dict["Pass"])
        except Exception:
            print(traceback.format_exc())

        
    
        