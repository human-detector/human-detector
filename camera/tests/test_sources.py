from src.image_sources import NullSource
from src.image_sources import JpgSource
import os
import unittest

class TestSources(unittest.TestCase):
    def setUp(self):
        self.dirname = os.path.realpath('.')

    # Null Source tests
    def test_null_source(self):
        null_source = NullSource()
        self.assertIsNone(null_source.get_frame())

    # JPG Source tests
    def test_jpg_source(self):
        jpg_source = JpgSource(os.path.join(self.dirname, "tests/images/resolution_check.png"))
        frame = jpg_source.get_frame()
        self.assertIsNotNone(frame)
        self.assertTrue(frame.ndim == 3)
        self.assertTupleEqual((1440, 2578, 3), frame.shape)
    
    # Test taht an exception is raised on non existant image
    def test_no_jpg(self):
        self.assertRaises(Exception, JpgSource("does_not_exist.jpg"))