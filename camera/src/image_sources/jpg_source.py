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
        image = cv2.imread(full_path)

        if image.ndim != 3:
            # This should basically never happen, but should be
            # checked before trying to grab the shape below
            raise PictureFormatException("Invalid picture format")
        
        width, height, _ = image.shape
        if width != 1920 or height != 1080:
            raise PictureFormatException("Invalid input resolution")

        self.image = image

    def get_frame(self):
        return self.image