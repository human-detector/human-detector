import unittest

import cv2
import os
from src.socket import ServerConnection

class TestDetector(unittest.TestCase):
    def setUp(self):
        self.dirname = os.path.realpath('.')

    def test_get_settings(self):
        socket = ServerConnection("ABCD", "https://api.eyespy.com")
        result = socket.get_settings()
        self.assertTrue(result.status_code == 200)
        self.assertTrue(isinstance(result.j["boundaries"], list))

    def test_send_bad_snapshot(self):
        socket = ServerConnection("ABCD", "https://api.eyespy.com")
        snapshot = None
        result = socket.send_snapshot(snapshot)
        self.assertFalse(result.status_code == 200)

    def test_send_good_snapshot(self):
        socket = ServerConnection("ABCD", "https://api.eyespy.com")
        snapshot = cv2.imread(os.path.join(self.dirname, "tests/images/human.jpg"))
        result = socket.send_snapshot(snapshot)
        self.assertTrue(result.status_code == 200)

    def test_send_bad_notification(self):
        socket = ServerConnection("ABCD", "https://api.eyespy.com")
        snapshot = None
        result = socket.send_notification(snapshot)
        self.assertFalse(result.status_code == 200)

    def test_send_good_notification(self):
        socket = ServerConnection("ABCD", "https://api.eyespy.com")
        snapshot = cv2.imread(os.path.join(self.dirname, "tests/images/human.jpg"))
        result = socket.send_notification(snapshot)
        self.assertTrue(result.status_code == 200)

    def test_bad_key(self):
        socket = ServerConnection("AAAAAA", "https://api.eyespy.com")
        snapshot = cv2.imread(os.path.join(self.dirname, "tests/images/human.jpg"))
        result = socket.send_snapshot(snapshot)
        self.assertFalse(result.status_code == 200)
