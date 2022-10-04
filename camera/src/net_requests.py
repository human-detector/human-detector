import math
import base64
from threading import Thread
from time import sleep, time
import requests

class NetConfig:
    URL_API="http://api.averycb.net"

    @staticmethod
    def get_notif_url(id):
        return NetConfig.URL_API + f"/cameras/{id}/notifications"

    @staticmethod
    def get_heartbeat_url(id):
        return NetConfig.URL_API + f"/cameras/{id}/heartbeat"

class NetRequests:
    @staticmethod
    def send_notification(frame):
        url = NetConfig.get_notif_url("111")

        headers = {
            "Accept": "application/json",
            "Authorization": "aaaa"
        }
    
        data = {
            "Frame": base64.b64encode(frame).decode()
        }

        response = requests.put(url=url, headers=headers, json=data)
        return response.status_code == 200, response


    @staticmethod
    def seconds_to_milliseconds(seconds):
        if math.isnan(seconds) or math.isinf(seconds):
            return -1
        
        return round(seconds * 1000)

    @staticmethod
    def send_heartbeat(time):
        url = NetConfig.get_heartbeat_url("111")

        headers = {
            "Accept": "application/json",
            "Authorization": "aaaa"
        }

        data = {
            "Timestamp": NetRequests.seconds_to_milliseconds(time)
        }

        response = requests.put(url=url, headers=headers, json=data)
        return response.status_code == 200, response

class Heartbeat:
    def __init__(self, heartbeat_delay=5):
        self.running = True
        self.heartbeat_delay = heartbeat_delay
        self.thread = Thread(target=self.update, args=())
        self.thread.start()
        self.last_heartbeat = time()
    
    def stop(self):
        if hasattr(self, 'thread'):
            self.running = False
            self.thread.join()

    def update(self):
        while self.running:
            cur_time = time()
            success, _ = NetRequests.send_heartbeat(cur_time)
            if success:
                self.last_heartbeat = cur_time

            sleep(self.heartbeat_delay)   
    
    def is_connected(self):
        time_diff = time() - self.last_heartbeat
        return time_diff < (self.heartbeat_delay * 5)
    