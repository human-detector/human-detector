import os
import cv2

class PictureFormatException(Exception):
    """Raised when the format of the input picture is invalid"""
    pass

class JpgSource:
    """JPG Source used to test the detector"""
    
    def __init__(self, image_path):
        dirname = os.path.realpath('.')
        full_path = os.path.join(dirname, image_path)
        self.image = cv2.imread(full_path)

    def get_frame(self):
        return self.image