from networking import Heartbeat
from image_sources import CameraSource
from networking.net_requests import NetRequests
from transforms import MobilenetV2Transform
from detectors import TensorflowDetector
from taggers import ObjectDetecterTagger
from outputs import FFMPEGOutput, NotificationOutput
from pipeline import DetectorPipeline
from time import sleep
import os
import signal

INPUT_RESOLUTION = (1920, 1080)
TENSOR_RESOLUTION = (640, 640)
FPS = 30

cwd = os.getcwd()
MODEL_PATH = os.path.join(cwd, "model/model.tflite")
LABELS_PATH = os.path.join(cwd, "model/tflite_label_map.txt")

network = NetRequests()

pipeline = DetectorPipeline(
    CameraSource(INPUT_RESOLUTION, FPS),
    MobilenetV2Transform(TENSOR_RESOLUTION),
    TensorflowDetector(MODEL_PATH, LABELS_PATH),
    ObjectDetecterTagger(INPUT_RESOLUTION),
    [
        FFMPEGOutput(INPUT_RESOLUTION, FPS, "192.168.1.4", "2046"),
        NotificationOutput(network)
    ]
)

heartbeat = Heartbeat(network)

running = True

def ctrl_c_handler(sig, frame):
    global running
    running = False

signal.signal(signal.SIGINT, ctrl_c_handler)

while running:
    sleep(1)
    running = pipeline.check_alive() and heartbeat.is_connected()

pipeline.stop()
