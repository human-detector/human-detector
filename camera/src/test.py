from platform import platform
import cv2
import tflite_runtime.interpreter as tflite
import numpy as np
from threading import Thread
import os
import time
import subprocess

CWD = os.getcwd()
CheckpointPath = os.path.join(CWD, "model/model.tflite")
LabelMapPath = os.path.join(CWD, "model/tflite_label_map.txt")

class FFMPEGOutputStream:
    def __init__(self, resolution=(1920, 1080), fps=30, destination_ip="192.168.1.4", destination_port="2046"):
        command = ["../rpi-ffmpeg/out/arm64-jammy-4.3.4-static-rel/ffmpeg",
                   "-re", # Real time
                   "-hwaccel", "drm", # Use hwaccel if you don't want to suffer
                   "-f", "rawvideo",
                   "-vcodec", "rawvideo",
                   "-pix_fmt", "bgr24",
                   "-s", "1920x1080",
                   "-r", "30",
                   "-i", "-", # Use pipe for input
                   "-an", # No audio
                   "-vcodec", "h264_v4l2m2m",
                   "-f", "YU12",
                   "udp://" + destination_ip + ":" + destination_port + "?pkt_size=1316"
                   ]

        self.proc = subprocess.Popen(command, stdin=subprocess.PIPE)

    def __del__(self):
        self.proc.stdin.close()
        self.proc.terminate()

    def submit(self, frame, labels):
        timer_start = time.perf_counter()
        for result in labels:
            (lower_left, upper_right) = result["box"]
            (box_x_min, box_y_min) = lower_left
            name = result["name"]
            score = result["score"]

            cv2.rectangle(frame, lower_left, upper_right, (10, 255, 0), 2)

            # Draw label
            label = '%s: %d%%' % (name, score)
            labelSize, baseLine = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2) # Get font size
            label_ymin = max(box_y_min, labelSize[1] + 10)
            cv2.rectangle(frame, (box_x_min, label_ymin-labelSize[1]-10), (box_x_min+labelSize[0], label_ymin+baseLine-10), (255, 255, 255), cv2.FILLED) # Draw white box to put label text in
            cv2.putText(frame, label, (box_x_min, label_ymin-7), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2) # Draw label text
        
        self.proc.stdin.write(frame.tobytes())

class WebcamStream:
    udpStreamEnabled = False
    running = True
    frame = None
    output_stream = None
    frame_data = []

    def __init__(self, output_stream=None, resolution=(1920, 1080), fps=30):
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("Error opening camera")
            exit(-1)

        (width, height) = resolution
        camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc("M", "J", "P", "G"))
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        camera.set(cv2.CAP_PROP_FPS, fps)
        self.camera = camera
        output_stream = None
        (_, self.frame) = self.camera.read()
        
        Thread(target=self.update, args=()).start()
    
    def __del__(self):
        self.running = False

    def update(self):
        while self.running:
            # stream if wanted
            (_, self.frame) = self.camera.read()

            if self.udpStreamEnabled:
                pass

            output_stream.submit(self.frame, self.frame_data)

    def stop(self):
        self.running = False

    def getFrame(self):
        return self.frame

    def updateFrameData(self, frame_data):
        self.frame_data = frame_data

    def openStream(self):
        pass

    def closeStream(self):
        pass

output_stream = FFMPEGOutputStream()
input_stream = WebcamStream(output_stream)

# Load map between model output and labels
with open(LabelMapPath, 'r') as map:
    labels = [line.strip() for line in map.readlines()]

print (labels)

# Load mod2l
tflite_interpreter = tflite.Interpreter(CheckpointPath, num_threads=2)
tflite_interpreter.allocate_tensors()

input_details = tflite_interpreter.get_input_details()
output_details = tflite_interpreter.get_output_details()

input_data_idx = input_details[0]["index"]
output_boxes_idx = output_details[1]["index"]
output_classes_idx = output_details[3]["index"]
output_scores_idx = output_details[0]["index"]

input_mean = 127.5
input_std = 127.5

results = []

while True:
    frame = input_stream.getFrame().copy()
    
    # lower resolution
    # resized_frame = cv2.resize(frame, (1138, 640), interpolation = cv2.INTER_AREA)
    # crop to 640x640 size to input to model
    # cropped_frame = resized_frame[0:640, 249:889]

    start_time = time.perf_counter()
    cropped_frame = cv2.resize(frame, (640, 640), interpolation = cv2.INTER_AREA)
    rgb_frame = cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2RGB)
    # 1xHxWx3 (3 color channels)
    input_data = np.expand_dims(rgb_frame, axis=0)
    print(input_data.shape)
    # Model is not quantazied, turn input values into floats
    #input_data = (np.float32(input_data) - input_mean) / input_std
    print("cv2: " + str(time.perf_counter() - start_time))
    start_time = time.perf_counter()

    tflite_interpreter.set_tensor(input_data_idx, input_data)
    print("tflitea: " + str(time.perf_counter() - start_time))
    tflite_interpreter.invoke()

    print("tflite: " + str(time.perf_counter() - start_time))

    results = []
    output_boxes = tflite_interpreter.get_tensor(output_boxes_idx)[0]
    output_classes = tflite_interpreter.get_tensor(output_classes_idx)[0]
    output_scores = tflite_interpreter.get_tensor(output_scores_idx)[0]

    for i in range(len(output_scores)):
        box = output_boxes[i]
        score = output_scores[i]
        clasz = output_classes[i]

        if score < 0.3: continue

        box_y_min = int(max(1, box[0] * 1080))
        box_x_min = int(max(1, box[1] * 1920))
        box_y_max = int(min(1080,(box[2] * 1080)))
        box_x_max = int(min(1920,(box[3] * 1920)))

        lower_left = (box_x_min, box_y_min)
        upper_right = (box_x_max, box_y_max)

        results.append({
            "box": (lower_left, upper_right),
            "score": int(score * 100),
            "name": labels[int(clasz)]
        })

    input_stream.updateFrameData(results)

    if cv2.waitKey(1) == ord('q'):
        break

stream.stop()
