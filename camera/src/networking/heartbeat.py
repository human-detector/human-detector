from threading import Thread
from time import sleep, time

class Heartbeat:
    def __init__(self, netRequests, heartbeat_delay=5):
        self.running = True
        self.netRequests = netRequests
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
            success, _ = self.netRequests.send_heartbeat(cur_time)
            if success:
                self.last_heartbeat = cur_time

            sleep(self.heartbeat_delay)   
    
    def is_connected(self):
        time_diff = time() - self.last_heartbeat
        return time_diff < (self.heartbeat_delay * 5)