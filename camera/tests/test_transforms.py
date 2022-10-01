from src.image_sources.jpg_source import JpgSource
from src.transforms.mobilenet_v2_transform import MobilenetV2Transform
import os
import unittest

class TestTransforms(unittest.TestCase):
    def setUp(self):
        self.dirname = os.path.realpath('.')

    # 640x640 output
    def test_mobilenet_v2_transform(self):
        null_source = JpgSource(os.path.join(self.dirname, "tests/images/darkness_my_old_friend.jpg"))
        transform = MobilenetV2Transform((640, 640))
        transformed_output = transform(null_source.get_frame())
        self.assertTupleEqual((640, 640, 3), transformed_output.shape)
