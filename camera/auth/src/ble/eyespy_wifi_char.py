from .dbus_interface.dbus_bluez_interface import Characteristic

class EyeSpyWifiCharacteristic(Characteristic):
    EYESPY_WIFI_UUID = "7a1673f9-55cb-4f40-b624-561ad8afb8e2"

    def __init__(self, bus, index, service):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_WIFI_UUID,
            ['write'],
            service, index
        )
    
    def WriteValue(self, value, options):
        print("Writing val!")
        print(value)