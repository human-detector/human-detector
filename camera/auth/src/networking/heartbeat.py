"""
Heartbeat
"""
from threading import Thread, Event
from time import time
from .connection_status import provide_ping_state

class Heartbeat:
    """
    Sends a heartbeat every "heartbeat_delay" seconds to check
    if still connected to the backend
    """
    def __init__(self, net_requests, heartbeat_delay=5):
        self.net_requests = net_requests
        self.heartbeat_delay = heartbeat_delay
        self.exit = Event()
        self.thread = Thread(target=self.update, args=())
        self.thread.start()
        self.last_heartbeat = time()

    def stop(self):
        """Stop and deconstruct heartbeat thread"""
        if hasattr(self, 'thread'):
            self.exit.set()
            self.thread.join()

    def update(self):
        """Thread method which sends heartbeat messages"""
        while not self.exit.is_set():
            cur_time = time()
            success, req = self.net_requests.send_heartbeat(cur_time)
            if success:
                self.last_heartbeat = cur_time

            provide_ping_state(success, req.status_code == 403)
            self.exit.wait(self.heartbeat_delay)

    def is_connected(self):
        """Returns whether recent heartbeats have been succesfull"""
        time_diff = time() - self.last_heartbeat
        return time_diff < (self.heartbeat_delay * 5)
