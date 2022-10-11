from threading import Thread
import cv2

class DetectorPipeline:
    """Pipeline which takes an input source and runs the necessary steps for detection"""

    def __init__(self, input_source, transform, detector, tagger, outputs):
        self.input = input_source
        self.transform = transform
        self.detector = detector
        self.tagger = tagger
        self.outputs = outputs

        self.running = True
        self.thread = Thread(target=self.run, args=())
        self.thread.start()

    def stop(self):
        self.running = False
        self.thread.join()

    def run(self):
        while self.running:
            frame = self.input.get_frame()
            transformed_frame = self.transform(frame.copy())
            results = self.detector(transformed_frame)
            output_image = self.tagger(frame.copy(), results)
            for output in self.outputs:
                output(output_image, results)
    
    def check_alive(self):
        self.thread.join(timeout=0.0)
        return self.thread.is_alive()
    