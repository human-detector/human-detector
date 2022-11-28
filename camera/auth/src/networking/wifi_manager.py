"""
Wifi Manager
"""

import logging
import uuid
import sys
from enum import Enum, auto
import NetworkManager

logger = logging.getLogger(__name__)

class WifiState(Enum):
    """Internal network state"""
    INTERNAL_ERROR = 0
    DISCONNECTED = 1
    CONNECTING = 2
    SUCCESS = 3
    FAIL = 4
    ATTEMPTING_PING = 5

class FailReason(Enum):
    """Failure reason for connecting"""
    NONE = 0
    SSID_NOT_FOUND = 1
    INCORRECT_SECRETS = 2
    FORBIDDEN = 3
    BACKEND_DOWN = 4

class SecType(Enum):
    """Wifi Security Type"""
    KEY_802_1X = auto()
    KEY_PSK = auto()
    KEY_OPEN = auto()
    UNSUPPORTED = auto()

class WifiManager:
    """Monitors connection status and connects to Enterprise and WPA2-PSK networks"""

    def __init__(self, heartbeat):
        self._wifi_adapter = self._get_wifi_adapter()
        if self._wifi_adapter is None:
            logger.error("No wifi devices found!")
            sys.exit(-1)

        if self._wifi_adapter.State == NetworkManager.NM_DEVICE_STATE_ACTIVATED:
            self.wifi_state = WifiState.ATTEMPTING_PING
        else:
            self.wifi_state = WifiState.DISCONNECTED

        self._ping_count = 0

        self._callbacks = []
        self._wifi_adapter.OnStateChanged(self._state_changed_callback)
        heartbeat.register_heartbeat_callback(self._heart_callback)

    def _heart_callback(self, could_connect, forbidden):
        # Heartbeat is always running and giving us state, so we should
        # only distribute success when changing into a succesful state
        # or have failed to connect over a long period of time

        if not could_connect:
            self._ping_count += 1

        if could_connect:
            if self.wifi_state == WifiState.ATTEMPTING_PING:
                self._ping_count = 0
                self._new_wifi_state(WifiState.SUCCESS, FailReason.NONE)
        elif forbidden and self.wifi_state != WifiState.FAIL:
            self._ping_count = 0
            self._new_wifi_state(WifiState.FAIL, FailReason.FORBIDDEN)
        elif self._ping_count >= 5 and self.wifi_state != WifiState.FAIL:
            self._ping_count = 0
            self._new_wifi_state(WifiState.FAIL, FailReason.BACKEND_DOWN)

    def register_wifi_state_callback(self, callback):
        """Register callback for wifi state changes"""
        self._callbacks.append(callback)
        callback(self.wifi_state, FailReason.NONE)

    def _new_wifi_state(self, new_state, new_reason):
        self.wifi_state = new_state

        logger.info("Wifi State change! %s - %s", new_state.name, new_reason.name)

        # The main interested parties should be BLE notifications and Eyespy Service
        for callback in self._callbacks:
            callback(new_reason, new_reason)

    # pylint: disable=unused-argument
    def _state_changed_callback(self, net_manager, interface, **kwargs):
        """Network Manager callback when network state changes"""
        new_state = kwargs['new_state']
        reason = kwargs['reason']
        adapted_state = self._get_state_val(new_state)
        adapted_reason = self._get_reason_val(reason)
        self._new_wifi_state(adapted_state, adapted_reason)

    def _get_reason_val(self, reason):
        if reason == NetworkManager.NM_DEVICE_STATE_REASON_SSID_NOT_FOUND:
            return FailReason.SSID_NOT_FOUND

        return FailReason.INCORRECT_SECRETS

    # Convert internal NetworkManager state into an output state for the phone
    def _get_state_val(self, state):
        if state in (NetworkManager.NM_DEVICE_STATE_UNAVAILABLE,
                     NetworkManager.NM_DEVICE_STATE_UNMANAGED,
                     NetworkManager.NM_DEVICE_STATE_UNAVAILABLE):
            return WifiState.INTERNAL_ERROR

        if state == NetworkManager.NM_DEVICE_STATE_DISCONNECTED:
            return WifiState.DISCONNECTED

        if state == NetworkManager.NM_DEVICE_STATE_FAILED:
            return WifiState.FAIL

        if state == NetworkManager.NM_DEVICE_STATE_ACTIVATED:
            return WifiState.ATTEMPTING_PING

        return WifiState.CONNECTING

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
        for access_point in self._wifi_adapter.GetAllAccessPoints():
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
        return self._wifi_adapter.state == NetworkManager.NM_DEVICE_STATE_ACTIVATED

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
            new_connection, self._wifi_adapter, "/"
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
            new_connection, self._wifi_adapter, "/"
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
            new_connection, self._wifi_adapter, "/"
        )
