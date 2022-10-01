import cv2
import os
import unittest
from image_sources.jpg_source import JpgSource
from src.detector import Detector

class TestDetector(unittest.TestCase):
    def setUp(self):
        self.detector = Detector()

    def test_detector_blind(self):
        source = JpgSource("tests/images/flashlight.jpg")
        output = self.detector.detect(source.get_frame())
        self.assertTrue(len(output) == 0)

    def test_detector_darkness(self):
        source = JpgSource("tests/images/darkness_my_old_friend.jpg")
        output = self.detector.detect(source.get_frame())
        self.assertTrue(len(output) == 0)

    def test_detector_no_human(self):
        source = JpgSource("tests/images/no_human.jpg")
        output = self.detector.detect(source.get_frame())
        self.assertTrue(len(output) == 0)
        
    def test_detector_human(self):
        source = JpgSource("tests/images/human.jpg")
        output = self.detector.detect(source.get_frame())
        self.assertTrue(len(output) == 1)
