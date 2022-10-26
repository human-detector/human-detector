from enum import Enum, auto
import subprocess
import NetworkManager
import uuid

class SecType(Enum):
    KEY_802_1X = auto()
    KEY_PSK = auto()
    UNSUPPORTED = auto()

class WifiManager:
    def __init__(self):
        # The manager relies on NetworkManager, make sure it is running!
        self._run_proc("systemctl start NetworkManager.service")
        self.dev = self._get_wifi_adapter()
        if self.dev is None:
            print("No wifi devices found!")
            exit(-1)

    def _get_wifi_adapter(self):
        for dev in NetworkManager.Device.all():
            if dev.DeviceType == NetworkManager.NM_DEVICE_TYPE_WIFI:
                return dev
        return None

    def _run_proc(self, command: str):
        proc = subprocess.run(command.split(), capture_output=True)
        if proc.returncode != 0:
            # TODO: Better error behavior
            print("Failed to run {}", command)
            print(proc.stderr)
            exit(-1)
        return proc    

    def get_wifi_security(self, ssid):
        for ap in self.dev.GetAllAccessPoints():
            if ap.Ssid != ssid:
                continue

            if ap.RsnFlags | NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_802_1X:
                return (ap, SecType.KEY_802_1X) # Enterprise/Edu networks

            if ap.RsnFlags | NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_PSK:
                return (ap, SecType.KEY_PSK) # WPA2 user+passkey

            return (ap, SecType.UNSUPPORTED)
        
        return (ap, None)

    def is_connected(self):
        return self.dev.state == NetworkManager.NM_DEVICE_STATE_ACTIVATED

    def _delete_old_config(self, ssid):
         # Delete old connection
        connections = NetworkManager.Settings.ListConnections()
        connections = dict([(conn.GetSettings()['connection']['id'], conn) for conn in connections])
        if ssid in connections:
            connections[ssid].Delete()

    def connect_enterprise(self, ssid, user, passkey):
        self._delete_old_config(ssid)

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

        (path, conn) = NetworkManager.AddAndActivateConnection(
            new_connection, self.dev, "/"
        )
    
    def connect_psk(self, ssid, passkey):
        self._delete_old_config(ssid)

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
        
        (path, conn) = NetworkManager.AddAndActivateConnection(
            new_connection, self.dev, "/"
        )
