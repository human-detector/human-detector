import importlib
import numpy as np

# Try to detect tensorflow package
# Tflite is the reduced form of Tensorflow Lite found on mobile devices
# This can not train models but can run them
# Tensorflow is the full package most likely found on dev machines
tflite_pkg = importlib.util.find_spec('tflite_runtime')
if tflite_pkg:
    import tflite_runtime.interpreter as tflite
else:
    import tensorflow.lite as tflite

class TensorflowFormatException(Exception):
    """Raised when an illformated input is given"""

class TensorflowDetector:
    def __init__(self, checkpoint_path, labels_map_path, threads=2, min_score=0.3):
        # Class/Labels come out as integer indexes from tensorflow. This map is used
        # to convert from those indices to a human readable label.
        with open(labels_map_path, 'r') as map:
            self.labels_map = [line.strip() for line in map.readlines()]

        # Load the weights from the given checkpoint. This represents the network
        # that will be used for detection.
        interpreter = tflite.Interpreter(checkpoint_path, num_threads = threads)
        interpreter.allocate_tensors()
        self.interpreter = interpreter

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # The inputs/outputs will be in different tensors. Use these indices
        # to grab data once detection is done.
        self.input_data_idx = input_details[0]["index"]
        self.output_boxes_idx = output_details[1]["index"]
        self.output_classes_idx = output_details[3]["index"]
        self.output_scores_idx = output_details[0]["index"]
        
        self.expected_input_height = input_details[0]['shape'][1]
        self.expected_input_width = input_details[0]['shape'][2]

        # Model takes 0.0-1.0 float inputs. These values are used to convert UINT8
        # inputs into a float.
        self.input_mean = 127.5
        self.input_std = 127.5

        self.min_score = min_score

    def detect(self, frame):
        if frame == None:
            raise TensorflowFormatException("Null input given")

        if frame.ndim != 3:
            # This should basically never happen, but should be
            # checked before trying to grab the shape below
            raise TensorflowFormatException(f"Expected 3 dimensions, got {frame.ndim}")
        
        width, height, _ = frame.shape
        if width != self.expected_input_width or height != self.expected_input_height:
            # Resolution must match, other Tensorflow will crash on us
            expected_res = f"{self.expected_input_width}x{self.expected_input_height}"
            actual_res = f"{width}x{height}"
            raise TensorflowFormatException(f"Expected a resolution of {expected_res}, got {actual_res}")

        # The model expects an input of 1xHxWx3
        # We get HxWx3, so add an additional dimension to input matrix
        input_data = np.expand_dims(frame, axis=0)

        # Hand off frame to tensorflow
        self.interpreter.set_tensor(self.input_data_idx, input_data)
        # Run net on frame
        self.interpreter.invoke()

        results = []
        output_boxes = self.interpreter.get_tensor(self.output_boxes_idx)[0]
        output_classes = self.interpreter.get_tensor(self.output_classes_idx)[0]
        output_scores = self.interpreter.get_tensor(self.output_scores_idx)[0]

        for i in range(len(output_scores)):
            box = output_boxes[i]
            score = output_scores[i]
            clasz = output_classes[i]

            # Ignore any results which are not very confident
            if score < self.min_score: continue

            y_min = max(0, box[0])
            x_min = max(0, box[1])
            y_max = min(1, box[2])
            x_max = min(1, box[3])

            # Output coordinates are a float 0.0-1.0. This can be multiplied later
            # by the input resolution to get the correct location in pixels
            lower_left = (x_min, y_min)
            upper_right = (x_max, y_max)

            results.append({
                "box": (lower_left, upper_right),
                "score": int(score * 100),
                "name": self.labels_map[int(clasz)]
            })

        return results