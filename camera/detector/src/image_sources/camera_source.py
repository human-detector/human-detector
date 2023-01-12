from distutils.log import error
import cv2
import time

class NoCameraException(Exception):
    """Raised when a camera could not be opened"""

class RuntimeCameraException(Exception):
    """Raised when the camera returns a failure trying to capture a frame"""

class CameraSource:
    def __init__(self, resolution=(1920, 1080), fps=30):
        self.camera = self.open_camera(resolution, fps)
        self.resolution = resolution
        self.fps = fps
    
    def __del__(self):
        self.running = False

    def open_camera(self, resolution, fps):
        width, height = resolution

        # Open the default webcam (Raspberry Pi should only have one)
        camera = cv2.VideoCapture(0)
        while(not camera.isOpened()):
            time.sleep(5) 
            camera = cv2.VideoCapture(0)

        # Webcams usually give higher framerate options using MJPG vs other standards
        camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc("M", "J", "P", "G"))

        # Set webcam resolution and fps
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        camera.set(cv2.CAP_PROP_FPS, fps)

        return camera

    def get_frame(self):
        success, frame = self.camera.read()

        while not success:
            self.camera.release()
            self.camera = self.open_camera(self.resolution, self.fps)
            success, frame = self.camera.read()
        
        return frame
