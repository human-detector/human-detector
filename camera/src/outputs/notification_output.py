from exit_codes import NETWORK_ERROR
from net_requests import NetConfig
import cv2
import numpy as np
import time

class NotificationNetworkException(Exception):
    """This is raised if there was an error sending a poll"""

class NotificationOutput:
    """
    Output notifications to the app. Too make sure we aren't spamming the user, there is a cooldown after sending a notification
    """

    def __init__(self, cooldown_seconds={5*60}, person_lost_frames=5):
        # Seconds between notifications if person stays in frames
        self.cooldown_seconds = cooldown_seconds
        # Number of frames without a person detected before person is considered gone
        self.person_lost_frames = person_lost_frames
        self.frames_countdown = 0

        self.last_notif = time.time()

    def __call__(self, frame, results):
        cur_time = time.time()

        # Refresh frames countdown if people detected, otherwise decrement counter
        if len(results) == 0:
            self.frames_since_person -= 1
        else:
            self.frames_countdown = self.person_lost_frames

        # Hysteresis, allow some empty frames in case detector is dumb
        if self.frames_since_person < 0:
            return

        # If people are continuously detected, delay notifications so user is not spammed
        if cur_time - self.last_notif < self.cooldown_seconds:
            return
        
        # encode image as JPG and send it
        retval,img_encode = cv2.imencode(".jpg", frame)

        # Error occured...somehow?
        if retval != 0:
            return
        
        jpg_arr = np.array(img_encode)
        success, _ = NetConfig.send_notification(jpg_arr)

        if not success:
            raise (NETWORK_ERROR)