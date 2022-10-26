from .dbus_interface.dbus_bluez_interface import Characteristic

class EyeSpyConnStatusCharacteristic(Characteristic):
    EYESPY_CONN_UUID = "136670fb-f95b-4ee8-bc3b-81eadb234268"
    
    def __init__(self, bus, index, service):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_CONN_UUID,
            ['notify'],
            service, index
        )
    
    def StartNotify(self):
        print("Start notification")
    
    def StopNotify(self):
        print("Stop notification")