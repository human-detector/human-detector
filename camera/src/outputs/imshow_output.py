import cv2

class ImshowOutput:
    """Show output in an Opencv window on the host machine"""
    def __del__(self):
        cv2.destroyAllWindows()
    
    def __call__(self, frame):
        cv2.imshow("Detector output", frame)
