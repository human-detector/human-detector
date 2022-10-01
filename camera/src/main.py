from image_sources import CameraSource
from transforms import MobilenetV2Transform
from detectors import TensorflowDetector
from taggers import ObjectDetecterTagger
from outputs import FFMPEGOutput
from pipeline import DetectorPipeline
import os
import signal
import sys

INPUT_RESOLUTION = (1920, 1080)
TENSOR_RESOLUTION = (640, 640)
FPS = 30

cwd = os.getcwd()
MODEL_PATH = os.path.join(cwd, "model/model.tflite")
LABELS_PATH = os.path.join(cwd, "model/tflite_label_map.txt")

pipeline = DetectorPipeline(
    CameraSource(INPUT_RESOLUTION, FPS),
    MobilenetV2Transform(TENSOR_RESOLUTION),
    TensorflowDetector(MODEL_PATH, LABELS_PATH),
    ObjectDetecterTagger(INPUT_RESOLUTION),
    FFMPEGOutput(INPUT_RESOLUTION, FPS, "192.168.1.4", "2046")
)

running = True

def ctrl_c_handler(sig, frame):
    global running
    running = False

signal.signal(signal.SIGINT, ctrl_c_handler)

while running:
    char = sys.stdin.read(1)
    if char == 'q':
        running = False

pipeline.stop()
