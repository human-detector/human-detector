import requests

class ServerConnection:
    def __init__(self, token, eyespy_api):
        self.token = token
        self.api = eyespy_api
    
    def send_notification(self, frame):
        pass

    def send_snapshot(self, frame):
        pass

    def get_settings(self):
        pass
    
