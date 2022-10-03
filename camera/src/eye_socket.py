from threading import Thread
from time import sleep, time
import requests

URL_API="api.averycb.net"

def get_notif_url(id):
    return f"/cameras/{id}/notifications"

def get_heartbeat_url(id):
    return f"/cameras/{id}/heartbeat"

def send_heartbeat(time):
    url = get_heartbeat_url("111")

    headers = {
        "Accept": "application/json",
        "Authorization": "aaaa"
    }

    data = {
        "Timestamp": time
    }

    response = requests.put(url=url, headers=headers, data=data)
    return response.status_code == 200, response
    

class Heartbeat:
    def __init__(self, heartbeat_delay=5):
        self.running = True
        self.heartbeat_delay = heartbeat_delay
        self.thread = Thread(self.update, args=())
        self.last_heartbeat = 0
    
    def stop(self):
        if hasattr(self, 'thread'):
            self.running = False
            self.thread.join()

    def update(self):
        while self.running:
            cur_time = time.time()
            success, _ = send_heartbeat(cur_time)
            if success:
                self.last_heartbeat = cur_time

            sleep(self.heartbeat_delay)   
    
    def connected(self):
        time_diff = time.time() - self.last_heartbeat
        return time.time() - time_diff < (self.heartbeat_delay * 5)
    