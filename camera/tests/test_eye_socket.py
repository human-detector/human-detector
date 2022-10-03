import unittest
from src.eye_socket import *

class TestEyeSocket(unittest.TestCase):
    def setUp(self) -> None:
        return super().setUp()
    
    def test_heartbeat(self):
        heartbeat = Heartbeat(heartbeat_delay=0.5)