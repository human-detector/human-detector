import math
import numpy as np
from src.networking import *
import responses
import unittest
import time
import base64

class TestNetRequests(unittest.TestCase):
    def setUp(self) -> None:
        self.key = KeyManager.create_random_key("111")
        self.net = NetRequests(self.key)
        return super().setUp()
    
    @responses.activate
    def test_notification(self):
        frame = np.random.rand(50)
        base64_frame = base64.b64encode(frame)

        responses.put(
            NetConfig.get_notif_url(self.key.get_serial()),
            headers={
                "Content-Type": "application/json",
                "Authorization": self.key.get_auth_token()
            },
            json={
                "Frame": base64_frame.decode()
            }
        )

        success, response = self.net.send_notification(base64_frame)
        self.assertTrue(response.status_code == 200)
        self.assertTrue(success)
