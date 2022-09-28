from behave import *
import cv2
import os
from src.detector import Detector
from eyeSocket import ServerConnection
from src.camera import Camera

@given('a human walks into frame')
def step_impl(ctx):
    dirname = os.path.realpath('.')
    ctx.frame = cv2.imread(os.path.join(dirname, "tests/images/human.jpg"))
    
@given('a human is not in frame')
def step_impl(ctx):
    dirname = os.path.realpath('.')
    ctx.frame = cv2.imread(os.path.join(dirname, "tests/images/no_human.jpg"))

@when('a human is detected')
def step_impl(ctx):
    detector = Detector()
    result = detector.detect(ctx.frame)
    assert len(result) == 1

@when('a human is not detected')
def step_impl(ctx):
    detector = Detector()
    result = detector.detect(ctx.frame)
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
