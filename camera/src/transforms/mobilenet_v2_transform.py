import cv2

class MobilenetV2Transform:
    """
    The MobilenetV2 net expects 640x640 inputs in RGB formatting.
    This takes any resolution BGR images and returns 640x640 images in RGB.
    Transforms should return images that can still be displayed with imread or streamed
    """

    def __init__(self, resolution=(640, 640)):
        self.output_resolution = resolution

    def __call__(self, frame):
        self.transform(frame)
    
    def transform(self, frame):
        cropped_frame = cv2.resize(frame, self.output_resolution, interpolation = cv2.INTER_AREA)
        rgb_frame = cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2RGB)
        return rgb_frame