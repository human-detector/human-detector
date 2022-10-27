import requests
from .net_config import NetConfig
from .key_management import KeyManager

class NetRequests:
    def __init__(self, key=None):
        self.key = KeyManager() if key is None else key

    def send_notification(self, frame):
        url = NetConfig.get_notif_url(self.key.get_serial())

        headers = {
            "Accept": "application/json",
            "Authorization": self.key.get_auth_token()
        }
    
        data = {
            "Frame": frame.decode()
        }

        response = requests.put(url=url, headers=headers, json=data)
        return response.status_code == 200, response
