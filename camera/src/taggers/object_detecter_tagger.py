import cv2

class ObjectDetecterTagger:
    def init(self, resolution):
        self.resolution = resolution
        
        self.font_scale = 0.7
        self.font_thickness = 1
        self.rectangle_color = (10, 255, 0)
        self.rectangle_thickness = 1
    
    def __call__(self, frame, results):
        self.label_image(frame, results)
    
    def label_image(self, frame, results):
        for result in results:
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