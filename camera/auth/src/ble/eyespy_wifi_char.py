"""
EyeSpy Connect to Wifi Characteristic
"""

import json
from networking.key_manager import KeyManager
from networking.wifi_manager import SecType, WifiManager
from .dbus_interface.dbus_bluez_errors import InvalidArgsException
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
        self.wifi_manager: WifiManager = kwargs["wifi_manager"]
        self.key_manager: KeyManager = kwargs["key_manager"]

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
            raise InvalidArgsException

        self._connect_to_wifi(net_details)

        # Save off the UUID so detector can connect to backend
        self.key_manager.keys.uuid = net_details["UUID"]
        self.key_manager.keys.persist()

    def _connect_to_wifi(self, net_details):
        ssid = net_details["SSID"]

        (access_point, sec_type) = self.wifi_manager.get_wifi_security(ssid)

        if sec_type == SecType.UNSUPPORTED or access_point is None:
            raise InvalidArgsException

        # Open Networks w/ no security
        if sec_type == SecType.KEY_OPEN:
            self.wifi_manager.connect_open(ssid)
        # WPA2-Personal Networks
        elif sec_type == SecType.KEY_PSK:
            try:
                username = net_details["User"]
            except KeyError as exc:
                raise InvalidArgsException from exc

            password = net_details["Pass"]
            self.wifi_manager.connect_psk(ssid, password)
        # Enterprise WPA2 networks
        elif sec_type == SecType.KEY_802_1X:
            try:
                username = net_details["User"]
                password = net_details["Pass"]
            except KeyError as exc:
                raise InvalidArgsException from exc

            self.wifi_manager.connect_enterprise(ssid, username, password)
