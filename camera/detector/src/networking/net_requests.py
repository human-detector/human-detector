"""
Network Requests
"""

import requests
from .net_config import NetConfig

REQUESTS_TIMEOUT_SECONDS = 10

class NetRequests:
    """
    Sends heartbeats and other network requests
    """

    def __init__(self, key_manager):
        self.key_manager = key_manager

    def send_notification(self, frame):
        """Send a notification to the server server with frane data"""
        url = NetConfig.get_notif_url(self.key_manager.keys.uuid)

        headers = {
            "Accept": "application/json",
            "Authorization": self.key_manager.get_auth_token()
        }

        data = {
            "Frame": frame.decode()
        }

        response = requests.put(
            url=url,
            headers=headers,
            json=data,
            timeout=REQUESTS_TIMEOUT_SECONDS
        )

        return response.status_code == 200, response
