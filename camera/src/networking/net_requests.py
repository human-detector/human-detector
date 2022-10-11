import math
import base64
import requests
from .net_config import NetConfig
from .key_management import KeyManager

class NetRequests:
    def __init__(self, key=KeyManager()):
        self.key = key

    def send_notification(self, frame):
        url = NetConfig.get_notif_url(self.key.get_serial())

        headers = {
            "Accept": "application/json",
            "Authorization": self.key.get_auth_token()
        }
    
        data = {
            "Frame": base64.b64encode(frame).decode()
        }

        response = requests.put(url=url, headers=headers, json=data)
        return response.status_code == 200, response


    @staticmethod
    def seconds_to_milliseconds(seconds):
        if math.isnan(seconds) or math.isinf(seconds):
            return -1
        
        return round(seconds * 1000)

    def send_heartbeat(self, time):
        url = NetConfig.get_heartbeat_url(self.key.get_serial())

        headers = {
            "Accept": "application/json",
            "Authorization": self.key.get_auth_token()
        }

        data = {
            "Timestamp": NetRequests.seconds_to_milliseconds(time)
        }

        response = requests.put(url=url, headers=headers, json=data)
        return response.status_code == 200, response
    