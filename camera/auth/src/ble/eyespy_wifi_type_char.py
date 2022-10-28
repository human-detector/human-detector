"""
EyeSpy Wifi Security Type Characteristics
"""

import json
from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_errors import FailedException

class EyeSpyWifiTypeCharacteristic(Characteristic):
    """
    Allows phone to discover wifi security type
    """

    EYESPY_WIFI_UUID = "b0ae3b34-5428-4d16-8654-515f41dff777"

    def __init__(self, **kwargs):
        Characteristic.__init__(
            self,
            service = kwargs["service"],
            bus     = kwargs["bus"],
            uuid    = self.EYESPY_WIFI_UUID,
            flags   = ['read', 'write'],
            index   = kwargs["index"]
        )

        self.wifi_manager = kwargs["wifi_manager"]
        self.json = ""

    def WriteValue(self, value, options):
        """
        Expects a JSON of the following format
        {
            "SSID": "<Network SSID>"
        }
        """
        str_val = bytes(value).decode("ascii")
        if str_val.startswith("{\""):
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

        try:
            ssid_dict = json.loads(self.json)
        except json.JSONDecodeError as exc:
            raise FailedException() from exc

        if "SSID" not in ssid_dict:
            raise FailedException()

        (access_point, sec_type)  = self.wifi_manager.get_wifi_security(ssid_dict["SSID"])

        if access_point is None:
            return json.dumps({
                "Type": "No Network Found"
            }).encode("ascii")

        return json.dumps({
            "Type": sec_type.name
        }).encode("ascii")
