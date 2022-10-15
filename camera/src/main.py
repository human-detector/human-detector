from networking import Heartbeat
from image_sources import CameraSource
from networking.net_requests import NetRequests
from transforms import MobilenetV2Transform
from detectors import TensorflowDetector
from taggers import ObjectDetecterTagger
from outputs import FFMPEGOutput, NotificationOutput
from pipeline import DetectorPipeline
from time import sleep
import argparse
import signal
import os

TENSOR_RESOLUTION = (640, 640)

cwd = os.getcwd()
parser = argparse.ArgumentParser(description="Detect the humans")
parser.add_argument('--resolution', help="Capture resolution", default="1920x1080")
parser.add_argument('--fps', type=int, help="Capture fps", default=5)
parser.add_argument('--model', help="Tensorflow lite model directory", default=os.path.join(cwd, "model"))

parser.add_argument('--stream_ip', help="IP to stream too [default='']", default='')
parser.add_argument('--stream_port', help="Port to stream too [default='']", default='')
parser.add_argument('--net-enabled', help="Enable networking", action='store_true')
parser.add_argument('--no-net-enabled', dest='net-enabled', action='store_false')
parser.set_defaults(net_enabled=True)

args = parser.parse_args()
model_path = os.path.join(args.model, "model.tflite")
labels_path = os.path.join(args.model, "model/tflite_label_map.txt")
input_resolution = tuple(args.resolution.split('x')[:])
fps = args.fps

outputs = []

if args.stream_ip != '':
    if args.stream_port == '':
        print("No port given for streaming output")
        exit(-1)
    
    outputs.append(FFMPEGOutput(input_resolution, fps, args.stream_ip, args.stream_port))

if args.net_enabled:
    network = NetRequests()
    outputs.append(NotificationOutput(network))
    heartbeat = Heartbeat(network)

pipeline = DetectorPipeline(
    CameraSource(input_resolution, fps),
    MobilenetV2Transform(TENSOR_RESOLUTION),
    TensorflowDetector(model_path, labels_path),
    ObjectDetecterTagger(input_resolution),
    outputs
)

running = True

def ctrl_c_handler(sig, frame):
    global running
    running = False

signal.signal(signal.SIGINT, ctrl_c_handler)

while running:
    sleep(1)
    running = pipeline.check_alive() and heartbeat.is_connected()

pipeline.stop()
