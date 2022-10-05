import math
import numpy as np
from src.net_requests import *
import responses
import unittest
import time
import base64

class TestNetRequests(unittest.TestCase):
    def setUp(self) -> None:
        return super().setUp()
    
    @responses.activate
    def test_heartbeat_timer(self):
        id = "111"
        call_count = 3
        heartbeat_delay = 0.1

        resp = responses.put(
            NetConfig.get_heartbeat_url(id),
            headers={
                "Content-Type": "application/json",
                "Authorization": "aaaa"
            }
        )

        heartbeat = Heartbeat(heartbeat_delay=heartbeat_delay)
        sleep(heartbeat_delay * call_count)
        heartbeat.stop()
        self.assertTrue(resp.call_count == call_count)
    
    @responses.activate
    def test_heartbeat_request(self):
        id = "111"

        cur_time = time.time()
        responses.put(
            NetConfig.get_heartbeat_url(id),
            headers={
                "Content-Type": "application/json",
                "Authorization": "aaaa"
            },
            json={
                "Timestamp": NetRequests.seconds_to_milliseconds(cur_time)
            }
        )

        success, response = NetRequests.send_heartbeat(cur_time)
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
        id = "111"

        responses.put(
            NetConfig.get_notif_url(id),
            headers={
                "Content-Type": "application/json",
                "Authorization": "aaaa"
            },
            json={
                "Frame": base64.b64encode(frame).decode()
            }
        )

        success, response = NetRequests.send_notification(frame)
        self.assertTrue(response.status_code == 200)
        self.assertTrue(success)

    @responses.activate
    def test_heartbeat_request_fail(self):
        id = "111"

        cur_time = time.time()
        responses.put(
            NetConfig.get_heartbeat_url(id),
            headers={
                "Content-Type": "application/json",
                "Authorization": "aaaa"
            },
            json={
                "Timestamp": NetRequests.seconds_to_milliseconds(cur_time)
            },
            status=401
        )

        success, response = NetRequests.send_heartbeat(cur_time)
        self.assertTrue(response.status_code == 401)
        self.assertFalse(success)
        
    @responses.activate
    def test_heartbeat_fail(self):
        id = "111"
        call_count = 5
        heartbeat_delay = 0.1

        responses.put(
            NetConfig.get_heartbeat_url(id),
            headers={
                "Content-Type": "application/json",
                "Authorization": "aaaa"
            },
            status=401
        )

        heartbeat = Heartbeat(heartbeat_delay=heartbeat_delay)
        sleep(heartbeat_delay * call_count)
        heartbeat.stop()
        self.assertFalse(heartbeat.is_connected())
