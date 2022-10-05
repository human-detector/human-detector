import cv2

class ImshowOutput:
    """Show output in an Opencv window on the host machine"""
    def __del__(self):
        cv2.destroyAllWindows()
    
    def __call__(self, frame, results):
        cv2.imshow("Detector output", frame)
        # CV2 expects events to be processed, otherwise imshow does not show images
        _ = cv2.waitKey(1)
