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
    def test_heartbeat_timer(self):
        call_count = 3
        heartbeat_delay = 0.1

        resp = responses.put(
            NetConfig.get_heartbeat_url(self.key.get_serial()),
            headers={
                "Content-Type": "application/json",
                "Authorization": self.key.get_auth_token()
            }
        )

        heartbeat = Heartbeat(self.net, heartbeat_delay=heartbeat_delay)
        sleep(heartbeat_delay * call_count)
        heartbeat.stop()
        self.assertTrue(resp.call_count == call_count)
    
    @responses.activate
    def test_heartbeat_request(self):
        cur_time = time.time()

        responses.put(
            NetConfig.get_heartbeat_url(self.key.get_serial()),
            headers={
                "Content-Type": "application/json",
                "Authorization": self.key.get_auth_token()
            },
            json={
                "Timestamp": NetRequests.seconds_to_milliseconds(cur_time)
            }
        )

        success, response = self.net.send_heartbeat(cur_time)
        self.assertTrue(response.status_code == 200)
        self.assertTrue(success)
    
    def test_second_conversion(self):
        milli1 = NetRequests.seconds_to_milliseconds(2.046)
        milli2 = NetRequests.seconds_to_milliseconds(0.254)
        milli3 = NetRequests.seconds_to_milliseconds(0)
        milli4 = NetRequests.seconds_to_milliseconds(math.inf)
        milli5 = NetRequests.seconds_to_milliseconds(math.nan)

        self.assertTrue(milli1 == 2046)
        self.assertTrue(milli2 == 254)
        self.assertTrue(milli3 == 0)
        self.assertTrue(milli4 == -1)
        self.assertTrue(milli5 == -1)
    
    @responses.activate
    def test_notification(self):
        frame = np.random.rand(50)

        responses.put(
            NetConfig.get_notif_url(self.key.get_serial()),
            headers={
                "Content-Type": "application/json",
                "Authorization": self.key.get_auth_token()
            },
            json={
                "Frame": base64.b64encode(frame).decode()
            }
        )

        success, response = self.net.send_notification(frame)
        self.assertTrue(response.status_code == 200)
        self.assertTrue(success)

    @responses.activate
    def test_heartbeat_request_fail(self):
        cur_time = time.time()

        responses.put(
            NetConfig.get_heartbeat_url(self.key.get_serial()),
            headers={
                "Content-Type": "application/json",
                "Authorization": self.key.get_auth_token()
            },
            json={
                "Timestamp": NetRequests.seconds_to_milliseconds(cur_time)
            },
            status=401
        )

        success, response = self.net.send_heartbeat(cur_time)
        self.assertTrue(response.status_code == 401)
        self.assertFalse(success)
        
    @responses.activate
    def test_heartbeat_fail(self):
        call_count = 5
        heartbeat_delay = 0.1

        responses.put(
            NetConfig.get_heartbeat_url(self.key.get_serial()),
            headers={
                "Content-Type": "application/json",
                "Authorization": self.key.get_auth_token()
            },
            status=401
        )

        heartbeat = Heartbeat(self.net, heartbeat_delay=heartbeat_delay)
        sleep(heartbeat_delay * call_count)
        heartbeat.stop()
        self.assertFalse(heartbeat.is_connected())
