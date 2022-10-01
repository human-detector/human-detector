class DetectorPipeline:
    """Pipeline which takes an input source and runs the necessary steps for detection"""

    def __init__(self, input_source, transform, detector, output):
        self.input = input_source
        self.transform = transform
        self.detector = detector
        self.output = output