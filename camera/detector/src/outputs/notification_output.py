from networking import NetRequests
import cv2
import base64
import numpy as np
import time

class NotificationNetworkException(Exception):
    """This is raised if there was an error sending a poll"""

class NotificationOutput:
    """
    Output notifications to the app. Too make sure we aren't spamming the user, there is a cooldown after sending a notification
    """

    def __init__(self, network, cooldown_seconds=5*60, person_lost_frames=5):
        # Seconds between notifications if person stays in frames
        self.cooldown_seconds = cooldown_seconds
        # Number of frames without a person detected before person is considered gone
        self.person_lost_frames = person_lost_frames
        self.frames_since_person = 0

        self.net = network
        self.last_notif = 0

    def __call__(self, frame, results):
        cur_time = time.time()

        # Refresh frames countdown if people detected, otherwise decrement counter
        if len(results) == 0:
            self.frames_since_person = max(0, self.frames_since_person - 1)
        else:
            self.frames_since_person = self.person_lost_frames

        # Hysteresis, allow some empty frames in case detector is dumb
        if self.frames_since_person <= 0:
            return

        # If people are continuously detected, delay notifications so user is not spammed
        if cur_time - self.last_notif < self.cooldown_seconds:
            return

        self.last_notif = cur_time
        
        # encode image as JPG and send it
        retval,img_encode = cv2.imencode(".jpg", frame)

        # Error occured...somehow?
        if not retval:
            return
        
        jpg = "data:image/jpeg;base64," + base64.b64encode(img_encode).decode()
        success, _ = self.net.send_notification(jpg)

        if not success:
            raise NotificationNetworkException
