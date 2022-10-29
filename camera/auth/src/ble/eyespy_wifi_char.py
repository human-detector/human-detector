"""
EyeSpy Connect to Wifi Characteristic
"""

import json
from networking.wifi_manager import SecType
from .dbus_interface.dbus_bluez_errors import FailedException, NotPermittedException
from .dbus_interface.dbus_bluez_interface import Characteristic

class EyeSpyWifiCharacteristic(Characteristic):
    """
    Characteristics used to connect the camera to Wifi
    """

    EYESPY_WIFI_UUID = "7a1673f9-55cb-4f40-b624-561ad8afb8e2"

    def __init__(self, service, **kwargs):
        Characteristic.__init__(
            self,
            service = service,
            bus     = kwargs["bus"],
            uuid    = self.EYESPY_WIFI_UUID,
            flags   = ['write'],
            index   = kwargs["index"]
        )

        self.json_str = ""
        self.wifi_manager = kwargs["wifi_manager"]

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

        json_val = bytes(value).decode("ascii")
        if json_val.startswith("{\""):
            self.json_str = json_val
        else:
            self.json_str += json_val

        try:
            net_details = json.loads(self.json_str)
        except ValueError:
            # Not a full JSON yet
            return

        # Needs SSID, UUID, Passkey, and User if applicable
        if "SSID" not in net_details or "UUID" not in net_details:
            raise FailedException

        (access_point, sec_type) = self.wifi_manager.get_wifi_security(net_details["SSID"])

        if access_point is None:
            raise FailedException

        if sec_type == SecType.UNSUPPORTED:
            raise NotPermittedException

        if sec_type == SecType.KEY_802_1X:
            if "User" not in net_details:
                raise FailedException

        if "Pass" not in net_details:
            raise FailedException

        if sec_type == SecType.KEY_PSK:
            self.wifi_manager.connect_psk(
                net_details["SSID"],
                net_details["Pass"]
            )

        if "User" not in net_details:
            raise FailedException

        if sec_type == SecType.KEY_802_1X:
            self.wifi_manager.connect_enterprise(
                net_details["SSID"],
                net_details["User"],
                net_details["Pass"]
            )
