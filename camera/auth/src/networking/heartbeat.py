"""
Heartbeat
"""
from threading import Thread, Event
from time import time

class Heartbeat:
    """
    Sends a heartbeat every "heartbeat_delay" seconds to check
    if still connected to the backend
    """
    def __init__(self, net_requests):
        self.net_requests = net_requests
        self.exit = Event()
        self.last_heartbeat = time()
        self.heartbeat_delay = 0
        self.thread = None

        self.callbacks = []

    def register_heartbeat_callback(self, callback):
        """Register heartbeat callback"""
        self.callbacks.append(callback)

    def stop(self):
        """Stop heartbeat thread"""
        if hasattr(self, 'thread'):
            self.exit.set()
            self.thread.join()

    def start(self, heartbeat_delay=5):
        """Start heartbeat thread with timeout"""
        self.heartbeat_delay = heartbeat_delay
        self.exit.clear()
        self.thread = Thread(target=self.update, args=())
        self.thread.start()

    def update(self):
        """Thread method which sends heartbeat messages"""
        while not self.exit.is_set():
            cur_time = time()
            success, req = self.net_requests.send_heartbeat(cur_time)
            if success:
                self.last_heartbeat = cur_time

            for callback in self.callbacks:
                callback(success, req.status_code == 403)
            self.exit.wait(self.heartbeat_delay)

    def is_connected(self):
        """Returns whether recent heartbeats have been succesfull"""
        time_diff = time() - self.last_heartbeat
        return time_diff < (self.heartbeat_delay * 5)
