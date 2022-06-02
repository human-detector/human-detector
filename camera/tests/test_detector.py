import cv2
import os
import unittest
from src.detector import Detector

class TestDetector(unittest.TestCase):
    def setUp(self):
        self.detector = Detector()

    def test_detector_blind(self):
        dirname = os.path.realpath('.')
        image = cv2.imread(os.path.join(dirname, "tests/images/flashlight.jpg"))
        output = self.detector.detect(image)
        self.assertTrue(len(output) == 0)

    def test_detector_darkness(self):
        dirname = os.path.realpath('.')
        image = cv2.imread(os.path.join(dirname, "tests/images/darkness_my_old_friend.jpg"))
        output = self.detector.detect(image)
        self.assertTrue(len(output) == 0)

    def test_detector_no_human(self):
        dirname = os.path.realpath('.')
        image = cv2.imread(os.path.join(dirname, "tests/images/no_human.jpg"))
        output = self.detector.detect(image)
        self.assertTrue(len(output) == 0)
        
    def test_detector_no_human(self):
        dirname = os.path.realpath('.')
        image = cv2.imread(os.path.join(dirname, "tests/images/human.jpg"))
        output = self.detector.detect(image)
        self.assertTrue(len(output) == 1)
