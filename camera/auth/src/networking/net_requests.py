import math
import requests
from .net_config import NetConfig

class NetRequests:
    def __init__(self, key_manager):
        self.key_manager = key_manager

    @staticmethod
    def seconds_to_milliseconds(seconds):
        if math.isnan(seconds) or math.isinf(seconds):
            return -1
        
        return round(seconds * 1000)

    def send_heartbeat(self, time):
        url = NetConfig.get_heartbeat_url(self.key_manager.get_keys().get_uuid())

        headers = {
            "Accept": "application/json",
            "Authorization": self.key_manager.get_auth_token()
        }

        data = {
            "Timestamp": NetRequests.seconds_to_milliseconds(time)
        }

        response = requests.put(url=url, headers=headers, json=data)
        return response.status_code == 200, response