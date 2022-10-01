import cv2

class DetectorPipeline:
    """Pipeline which takes an input source and runs the necessary steps for detection"""

    def __init__(self, input_source, transform, detector, output):
        self.input = input_source
        self.transform = transform
        self.detector = detector
        self.output = output
        
        self.font_scale = 0.7
        self.font_thickness = 1
        self.rectangle_color = (10, 255, 0)
        self.rectangle_thickness = 1

    def run(self):
        labels = []
        frame = None
        for result in labels:
            (lower_left, upper_right) = result["box"]
            (box_x_min, box_y_min) = lower_left
            name = result["name"]
            score = result["score"]

            cv2.rectangle(frame, lower_left, upper_right, self.rectangle_color, self.rectangle_thickness)

            # Draw label
            label = f'{name}: %{int(score)}'
            labelSize, baseLine = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, self.font_scale, self.font_thickness)
            label_ymin = max(box_y_min, labelSize[1] + 10)
            cv2.rectangle(frame, (box_x_min, label_ymin-labelSize[1]-10), (box_x_min+labelSize[0], label_ymin+baseLine-10), (255, 255, 255), cv2.FILLED)
            
            label_text_loc = (box_x_min, label_ymin - 7)
            white = (0, 0, 0)
            cv2.putText(frame, label, label_text_loc, cv2.FONT_HERSHEY_SIMPLEX, self.font_scale, white, self.font_thickness)
