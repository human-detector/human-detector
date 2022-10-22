from src.image_sources import JpgSource
from src.transforms import MobilenetV2Transform
from src.detectors import TensorflowDetector
import unittest
import os

class TestDetector(unittest.TestCase):
    def setUp(self):
        cwd = os.getcwd()
        MODEL_PATH = os.path.join(cwd, "model/model.tflite")
        LABELS_PATH = os.path.join(cwd, "model/tflite_label_map.txt")
        self.detector = TensorflowDetector(MODEL_PATH, LABELS_PATH)
        self.transformer = MobilenetV2Transform((640, 640))

    def _run_detector(self, frame):
        transformed_image = self.transformer(frame)
        return self.detector(transformed_image)

    def test_detector_blind(self):
        source = JpgSource("tests/images/flashlight.jpg")
        output = self._run_detector(source.get_frame())
        self.assertTrue(len(output) == 0)

    def test_detector_darkness(self):
        source = JpgSource("tests/images/darkness_my_old_friend.jpg")
        output = self._run_detector(source.get_frame())
        self.assertTrue(len(output) == 0)

    def test_detector_no_human(self):
        source = JpgSource("tests/images/no_human.jpg")
        output = self._run_detector(source.get_frame())
        self.assertTrue(len(output) == 0)
        
    def test_detector_human(self):
        source = JpgSource("tests/images/human.jpg")
        output = self._run_detector(source.get_frame())
        # The detector sometimes creates multiple boxes around the same person
        # This is still a valid detection
        self.assertTrue(len(output) >= 1)
