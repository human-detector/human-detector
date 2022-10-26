from .dbus_interface.dbus_bluez_interface import Characteristic

class EyeSpySerialCharacteristic(Characteristic):
    EYESPY_SERIAL_UUID = "8b83fee2-373c-46a5-a782-1db9118431d9"
    def __init__(self, bus, index, service):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_SERIAL_UUID,
            ['read'],
            service, index
        )
    
    def ReadValue(self, options):
        print("reading value")
        string = "This is totally a serial"
        return string.encode("ASCII")