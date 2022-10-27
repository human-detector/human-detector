from enum import Enum, auto
import NetworkManager
import uuid

class DeviceState(Enum):
    InternalError = 0
    Disconnected = 1
    Connecting = 2
    Success = 3
    Fail = 4

class SecType(Enum):
    KEY_802_1X = auto()
    KEY_PSK = auto()
    UNSUPPORTED = auto()

class WifiManager:
    def __init__(self):
        self.dev = self._get_wifi_adapter()
        if self.dev is None:
            print("No wifi devices found!")
            exit(-1)
        
        self.state = (DeviceState.Disconnected, 0)
        self.status_callbacks = []
        self.dev.OnStateChanged(self.state_changed_callback)

    # Update device state on callback
    def state_changed_callback(self, nm, interface, **kwargs):
        new_state = kwargs['new_state']
        reason = kwargs['reason']
        self.state = (self._get_state_val(new_state), reason)

        print("State change!\n{}\n", self.state[0].name, self.state[1])

        for callback in self.status_callbacks:
            callback(self.state)
    
    # Register callbacks for when state changes
    def register_state_callback(self, callback):
        self.status_callbacks.append(callback)

    def get_state(self):
        return self.state

    # Convert internal NetworkManager state into an output state for the phone
    def _get_state_val(self, state):
        if (state == NetworkManager.NM_DEVICE_STATE_UNAVAILABLE or
            state == NetworkManager.NM_DEVICE_STATE_UNMANAGED or
            state == NetworkManager.NM_DEVICE_STATE_UNAVAILABLE):
            return DeviceState.InternalError
        
        if state == NetworkManager.NM_DEVICE_STATE_DISCONNECTED:
            return DeviceState.Disconnected
        
        if state == NetworkManager.NM_DEVICE_STATE_FAILED:
            return DeviceState.Fail
        
        return DeviceState.Connecting

    # Get wifi adapter from NetworkManager 
    def _get_wifi_adapter(self):
        for dev in NetworkManager.Device.all():
            if dev.DeviceType == NetworkManager.NM_DEVICE_TYPE_WIFI:
                return dev
        return None    

    # Supports 802_1X (Enterprise) and WPA2_PSK (Personal WPA2)
    def get_wifi_security(self, ssid):
        for ap in self.dev.GetAllAccessPoints():
            if ap.Ssid != ssid:
                continue

            if ap.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_802_1X:
                return (ap, SecType.KEY_802_1X) # Enterprise/Edu networks

            if ap.RsnFlags & NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_PSK:
                return (ap, SecType.KEY_PSK) # WPA2 user+passkey

            return (ap, SecType.UNSUPPORTED)
        
        return (None, SecType.UNSUPPORTED)

    def is_connected(self):
        return self.dev.state == NetworkManager.NM_DEVICE_STATE_ACTIVATED

    # Delete all old wifi connections so they do not interefere
    def _delete_old_config(self):
        connections = NetworkManager.Settings.ListConnections()
        for conn in connections:
            if conn.GetSettings()['connection']['type'] == '802-11-wireless':
                conn.Delete()

    def connect_enterprise(self, ssid, user, passkey):
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

        (path, conn) = NetworkManager.NetworkManager.AddAndActivateConnection(
            new_connection, self.dev, "/"
        )
    
    def connect_psk(self, ssid, passkey):
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
        
        (path, conn) = NetworkManager.NetworkManager.AddAndActivateConnection(
            new_connection, self.dev, "/"
        )
