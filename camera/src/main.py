from image_sources.camera_source import CameraSource
from transforms.mobilenet_v2_transform import MobilenetV2Transform
from detectors.tensorflow_lite_detector import TensorflowDetector
from taggers.object_detecter_tagger import ObjectDetecterTagger
from outputs.imshow_output import ImshowOutput
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

camera = CameraSource(INPUT_RESOLUTION, FPS)
mobilenet_transform = MobilenetV2Transform(TENSOR_RESOLUTION)
detector = TensorflowDetector(MODEL_PATH, LABELS_PATH, min_score=0.3)
tagger = ObjectDetecterTagger(INPUT_RESOLUTION)
output = ImshowOutput()

pipeline = DetectorPipeline(
    camera,
    mobilenet_transform,
    detector,
    tagger,
    output
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
