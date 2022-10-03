from threading import Thread
from time import sleep
import requests

URL_API="api.averycb.net"

def get_notif_url(id):
    return f"/cameras/{id}/notifications"

def get_heartbeat_url(id):
    return f"/cameras/{id}/heartbeat"

def send_heartbeat():
    pass

class Heartbeat:
    def __init__(self, heartbeat_delay=5):
        self.running = True
        self.heartbeat_delay = heartbeat_delay
        self.thread = Thread(self.update, args=())
    
    def stop(self):
        if hasattr(self, 'thread'):
            self.running = False
            self.thread.join()

    def update(self):
        while self.running:
            send_heartbeat()
            sleep(self.heartbeat_delay)    
    