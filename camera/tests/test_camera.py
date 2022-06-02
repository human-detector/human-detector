import cv2
import os
import unittest
from src.camera import Camera

class TestDetector(unittest.TestCase):
    def setUp(self):
        self.camera = Camera()

    def test_camera(self):
        frame = self.camera.get_frame()
        self.assertTrue(frame != None)
        self.assertTrue(isinstance(frame, cv2.Mat))