"""
Wifi Manager
"""

import uuid
import sys
from enum import Enum, auto
import NetworkManager

class DeviceState(Enum):
    """Internal network state"""
    INTERNAL_ERROR = 0
    DISCONNECTED = 1
    CONNECTING = 2
    SUCCESS = 3
    FAIL = 4

class SecType(Enum):
    """Wifi Security Type"""
    KEY_802_1X = auto()
    KEY_PSK = auto()
    UNSUPPORTED = auto()

class WifiManager:
    """Monitors connection status and connects to Enterprise and WPA2-PSK networks"""
    def __init__(self):
        self.dev = self._get_wifi_adapter()
        if self.dev is None:
            print("No wifi devices found!")
            sys.exit(-1)

        self.state = (DeviceState.DISCONNECTED, 0)
        self.status_callbacks = []
        self.dev.OnStateChanged(self.state_changed_callback)

    # pylint: disable=unused-argument
    def state_changed_callback(self, net_manager, interface, **kwargs):
        """Network Manager callback when network state changes"""
        new_state = kwargs['new_state']
        reason = kwargs['reason']
        self.state = (self._get_state_val(new_state), reason)

        print("State change! ", self.state[0].name)

        for callback in self.status_callbacks:
            callback(self.state)

    def register_state_callback(self, callback):
        """Register callbacks which are called when wifi state changes"""
        self.status_callbacks.append(callback)

    def get_state(self):
        """Get current state of wifi adapter"""
        return self.state

    # Convert internal NetworkManager state into an output state for the phone
    def _get_state_val(self, state):
        if state in (NetworkManager.NM_DEVICE_STATE_UNAVAILABLE,
                     NetworkManager.NM_DEVICE_STATE_UNMANAGED,
                     NetworkManager.NM_DEVICE_STATE_UNAVAILABLE):
            return DeviceState.INTERNAL_ERROR

        if state == NetworkManager.NM_DEVICE_STATE_DISCONNECTED:
            return DeviceState.DISCONNECTED

        if state == NetworkManager.NM_DEVICE_STATE_FAILED:
            return DeviceState.FAIL

        if state == NetworkManager.NM_DEVICE_STATE_ACTIVATED:
            return DeviceState.SUCCESS

        return DeviceState.CONNECTING

    def _get_wifi_adapter(self):
        """Get wifi adapter from NetworkManager"""
        for dev in NetworkManager.Device.all():
            if dev.DeviceType == NetworkManager.NM_DEVICE_TYPE_WIFI:
                return dev
        return None

    def get_wifi_security(self, ssid):
        """
        Get the wifi security type and access point for a given SSID
        Currently supports 802_1X (Enterprise) and WPA2_PSK (Personal WPA2)
        If the SSID is not found, the tuple (None, SecType.UNSUPPORTED) is returned
        """
        for access_point in self.dev.GetAllAccessPoints():
            if access_point.Ssid != ssid:
                continue

            if access_point.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_802_1X:
                return (access_point, SecType.KEY_802_1X) # Enterprise/Edu networks

            if access_point.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_PSK:
                return (access_point, SecType.KEY_PSK) # WPA2 user+passkey

            return (access_point, SecType.UNSUPPORTED)

        return (None, SecType.UNSUPPORTED)

    def is_connected(self):
        """Returns whether device is connected to a network or not"""
        return self.dev.state == NetworkManager.NM_DEVICE_STATE_ACTIVATED

    def _delete_old_config(self):
        """Delete all old wifi connections so they do not interefere"""

        #pylint: disable=no-member
        connections = NetworkManager.Settings.ListConnections()
        for conn in connections:
            if conn.GetSettings()['connection']['type'] == '802-11-wireless':
                conn.Delete()

    def connect_enterprise(self, ssid, user, passkey):
        """Connect to an Enterprise 802-1X network with ssid, username, and password"""
        self._delete_old_config()

        new_connection = {
            '802-11-wireless': {
                'mode': 'infrastructure',
                'security': '802-11-wireless-security',
                'ssid': ssid
            },
            '802-11-wireless-security': {
                'key-mgmt': 'wpa-eap'
            },
            '802-1x': {
                'eap': ['peap'],
                'identity': user,
                'password': passkey,
                'phase2-auth': 'mschapv2'
            },
            'connection': {
                'id': ssid,
                'type': '802-11-wireless',
                'uuid': str(uuid.uuid4())
            },
            'ipv4': {'method': 'auto'},
            'ipv6': {'method': 'auto'}
        }

        #pylint: disable=no-member
        NetworkManager.NetworkManager.AddAndActivateConnection(
            new_connection, self.dev, "/"
        )

    def connect_psk(self, ssid, passkey):
        """Connnect to a WPA-PSK network with SSID and password"""
        self._delete_old_config()

        new_connection = {
            '802-11-wireless': {
                'mode': 'infrastructure',
                'security': '802-11-wireless-security',
                'ssid': ssid
            },
            '802-11-wireless-security': {
                'key-mgmt': 'wpa-psk',
                'psk': passkey
            },
            'connection': {
                'id': ssid,
                'type': '802-11-wireless',
                'uuid': str(uuid.uuid4())
            },
            'ipv4': {'method': 'auto'},
            'ipv6': {'method': 'auto'}
        }

        #pylint: disable=no-member
        NetworkManager.NetworkManager.AddAndActivateConnection(
            new_connection, self.dev, "/"
        )