from enum import Enum, auto
import subprocess
import NetworkManager

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

            if ap.WpaFlags | NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_802_1X:
                return (ap, SecType.KEY_802_1X) # Enterprise/Edu networks

            if ap.WpaFlags | NetworkManager.NM_802_11_AP_SEC_KEY_MGMT_PSK:
                return (ap, SecType.KEY_PSK) # WPA2 user+passkey

            return (ap, SecType.UNSUPPORTED)
        
        return (ap, None)

    def is_connected(self):
        return self.dev.state == NetworkManager.NM_DEVICE_STATE_ACTIVATED

    def _connect_enterprise(self, ap, user, passkey):
        pass        

    def connect(self, ssid, passkey):
        (ap, wpa_type) = self._get_wifi_security(ssid, passkey)

        if ap is None:
            raise Exception("Failed to find Network")
        
        if wpa_type == SecType.UNSUPPORTED:
            raise Exception("Unsupported security type!")
        

