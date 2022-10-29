"""
Network Requests
"""

import math
import requests
from .net_config import NetConfig

REQUESTS_TIMEOUT_SECONDS = 10

class NetRequests:
    """
    Sends heartbeats and other network requests
    """

    def __init__(self, key_manager):
        self.key_manager = key_manager

    @staticmethod
    def seconds_to_milliseconds(seconds):
        """
        Converts float seconds to an int milliseconds
        NaN and Infinity return -1
        """
        if math.isnan(seconds) or math.isinf(seconds):
            return -1

        return round(seconds * 1000)

    def send_heartbeat(self, time):
        """Send a heartbeat to the server with current timestamp"""
        url = NetConfig.get_heartbeat_url(self.key_manager.keys.uuid)

        headers = {
            "Accept": "application/json",
            "Authorization": self.key_manager.get_auth_token()
        }

        data = {
            "Timestamp": NetRequests.seconds_to_milliseconds(time)
        }

        response = requests.put(
            url=url,
            headers=headers,
            json=data,
            timeout=REQUESTS_TIMEOUT_SECONDS
        )

        return response.status_code == 200, response
