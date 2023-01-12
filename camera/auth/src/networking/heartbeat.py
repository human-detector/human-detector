"""
Heartbeat
"""
from threading import Thread, Event
from time import time, sleep

class Heartbeat:
    """
    Sends a heartbeat every "heartbeat_delay" seconds to check
    if still connected to the backend
    """
    def __init__(self, net_requests):
        self.net_requests = net_requests
        self.heartbeat_evt = Event()
        self.last_heartbeat = time()
        self.heartbeat_delay = 0
        self.thread = Thread(target=self.update, args=(), daemon=True)
        self.thread.start()

        self.callbacks = []

    def register_heartbeat_callback(self, callback):
        """Register heartbeat callback"""
        self.callbacks.append(callback)

    def stop(self):
        """Stop heartbeat thread"""
        if self.thread is not None:
            self.heartbeat_evt.clear()

    def start(self, heartbeat_delay=5):
        """Start heartbeat thread with timeout"""
        self.heartbeat_delay = heartbeat_delay
        self.heartbeat_evt.set()

    def update(self):
        """Thread method which sends heartbeat messages"""
        while True:
            self.heartbeat_evt.wait(None)
            cur_time = time()
            success, req = self.net_requests.send_heartbeat(cur_time)
            if success:
                self.last_heartbeat = cur_time

            for callback in self.callbacks:
                callback(success, req.status_code == 403 if req is not None else False)

            sleep(self.heartbeat_delay)

    def is_connected(self):
        """Returns whether recent heartbeats have been succesfull"""
        time_diff = time() - self.last_heartbeat
        return time_diff < (self.heartbeat_delay * 5)
