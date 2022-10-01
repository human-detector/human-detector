from behave import *
from transforms import MobilenetV2Transform
from detectors import TensorflowDetector
from eyeSocket import ServerConnection
from image_sources import JpgSource
import os

cwd = os.getcwd()
MODEL_PATH = os.path.join(cwd, "model/model.tflite")
LABELS_PATH = os.path.join(cwd, "model/tflite_label_map.txt")

@given('a human walks into frame')
def step_impl(ctx):
    dirname = os.path.realpath('.')
    source = JpgSource(os.path.join(dirname, "tests/images/human.jpg"))
    ctx.frame = source.get_frame()
    
@given('a human is not in frame')
def step_impl(ctx):
    dirname = os.path.realpath('.')
    source = JpgSource(os.path.join(dirname, "tests/images/no_human.jpg"))
    ctx.frame = source.get_frame()

@when('a human is detected')
def step_impl(ctx):
    transform = MobilenetV2Transform()
    detector = TensorflowDetector(MODEL_PATH, LABELS_PATH)
    result = detector(transform(ctx.frame))
    assert len(result) >= 1

@when('a human is not detected')
def step_impl(ctx):
    transform = MobilenetV2Transform()
    detector = TensorflowDetector(MODEL_PATH, LABELS_PATH)
    result = detector(transform(ctx.frame))
    assert len(result) == 0

@then('a notification will be sent')
def step_impl(ctx):
    socket = ServerConnection("ABCD", "https://api.eyespy.com")
    result = socket.send_notification(ctx.frame)
    assert result.status_code == 200

@then('a notification will not be sent')
def step_impl(ctx):
    pass

@then('a notification fails to send')
def step_impl(ctx):
    socket = ServerConnection("AKJFD:LSJF", "https://api.eyespy.com")
    result = socket.send_notification(ctx.frame)
    assert result.status_code != 200
