"""
Wifi Manager
"""

import uuid
import sys
from enum import Enum, auto
from threading import Condition, Thread
from time import sleep, time
import NetworkManager
from .net_requests import NetRequests
from .key_manager import KeyManager
from .connection_status import DeviceState, FailReason, provide_net_state

class SecType(Enum):
    """Wifi Security Type"""
    KEY_802_1X = auto()
    KEY_PSK = auto()
    KEY_OPEN = auto()
    UNSUPPORTED = auto()

class WifiManager:
    """Monitors connection status and connects to Enterprise and WPA2-PSK networks"""
    condition_lock = Condition()
    ping = False

    def __init__(self, keys: KeyManager):
        self.dev = self._get_wifi_adapter()
        if self.dev is None:
            print("No wifi devices found!")
            sys.exit(-1)

        self.seconds_between_pings = 5
        self.keys = keys
        self.net_requests = NetRequests(keys)
        self.dev.OnStateChanged(self.state_changed_callback)
        self.thread = Thread(target=self._attempt_heartbeat_thread, daemon=True)
        self.thread.start()

    # pylint: disable=unused-argument
    def state_changed_callback(self, net_manager, interface, **kwargs):
        """Network Manager callback when network state changes"""
        new_state = kwargs['new_state']
        reason = kwargs['reason']
        adapted_state = self._get_state_val(new_state)
        adapted_reason = self._get_reason_val(reason)

        print("State change! ", adapted_state.name, reason)
        provide_net_state(adapted_state, adapted_reason)

        if adapted_state == DeviceState.FAIL:
            self._fail_connect()
        elif adapted_state == DeviceState.ATTEMPTING_PING:
            self.attempt_heartbeat(5)

    def _get_reason_val(self, reason):
        if reason == NetworkManager.NM_DEVICE_STATE_REASON_SSID_NOT_FOUND:
            return FailReason.SSID_NOT_FOUND

        return FailReason.INCORRECT_SECRETS

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
            return DeviceState.ATTEMPTING_PING

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

            if access_point.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_SAE:
                return (access_point, SecType.UNSUPPORTED) # WPA 3

            if access_point.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_802_1X:
                return (access_point, SecType.KEY_802_1X) # WPA 2 Enterprise/Edu networks

            if access_point.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_PSK:
                return (access_point, SecType.KEY_PSK) # WPA2 user+passkey

            # This misses OWE and OWE_TM networks but I have no clue
            # what these look like, or what open networks look like (are they just flags == 0?)
            return (access_point, SecType.KEY_OPEN)

        return (None, SecType.UNSUPPORTED)

    def is_connected(self):
        """Returns whether device is connected to a network or not"""
        return self.dev.state == NetworkManager.NM_DEVICE_STATE_ACTIVATED

    def delete_old_config(self):
        """Delete all old wifi connections so they do not interefere"""

        #pylint: disable=no-member
        connections = NetworkManager.Settings.ListConnections()
        for conn in connections:
            if conn.GetSettings()['connection']['type'] == '802-11-wireless':
                conn.Delete()

    def connect_open(self, ssid):
        """Connect to an open 80211 network with no security"""
        self.delete_old_config()

        new_connection = {
            '802-11-wireless': {
                'mode': 'infrastructure',
                'security': '802-11-wireless-security',
                'ssid': ssid
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

    def connect_enterprise(self, ssid, user, passkey):
        """Connect to an Enterprise 802-1X network with ssid, username, and password"""
        self.delete_old_config()

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
        self.delete_old_config()

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
