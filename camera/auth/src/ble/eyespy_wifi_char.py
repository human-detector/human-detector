"""
EyeSpy Connect to Wifi Characteristic
"""

import json
from networking.wifi_manager import SecType, WifiManager
from .dbus_interface.dbus_bluez_errors import InvalidArgsException
from .dbus_interface.dbus_bluez_interface import Characteristic

class EyeSpyWifiCharacteristic(Characteristic):
    """
    Characteristics used to connect the camera to Wifi
    """

    EYESPY_WIFI_UUID = "7a1673f9-55cb-4f40-b624-561ad8afb8e2"

    def __init__(self, bus, index, service, wifi_manager: WifiManager):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_WIFI_UUID,
            ['write'],
            service, index
        )
        self.json = ""
        self.wifi_manager = wifi_manager

    def WriteValue(self, value, options):
        """
        Expects a JSON with the following format:
        {
            "SSID": "<SSID>",
            "User": "<Username>", (Optional, only needed for 802-1x Enterprise)
            "Pass": "<Network Password>",
            "UUID": "Camera UUID from backend"
        }
        """

        str_val = bytes(value).decode("ascii")
        if str_val.startswith("{\""):
            self.json = str_val
        else:
            self.json += str_val

        try:
            net_details = json.loads(self.json)
        except ValueError:
            # Not a full JSON yet
            return

        # Needs SSID, UUID, Passkey, and User if applicable
        if "SSID" not in net_details or "UUID" not in net_details or "Pass" not in net_details:
            raise InvalidArgsException

        (access_point, sec_type) = self.wifi_manager.get_wifi_security(net_details["SSID"])

        if sec_type == SecType.UNSUPPORTED or access_point is None:
            raise InvalidArgsException

        if sec_type == SecType.KEY_802_1X:
            if "User" not in net_details:
                raise InvalidArgsException

            self.wifi_manager.connect_enterprise(
                net_details["SSID"],
                net_details["User"],
                net_details["Pass"]
            )

        elif sec_type == SecType.KEY_PSK:
            self.wifi_manager.connect_psk(
                net_details["SSID"],
                net_details["Pass"]
            )
