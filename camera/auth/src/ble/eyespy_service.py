from ble.eyespy_wifi_type_char import EyeSpyWifiTypeCharacteristic
from .dbus_interface.dbus_bluez_interface import Service
from .eyespy_wifi_char import EyeSpyWifiCharacteristic
from .eyespy_conn_status_char import EyeSpyConnStatusCharacteristic
from .eyespy_serial_char import EyeSpySerialCharacteristic

class EyeSpyService(Service):
    EYESPY_SERVICE_UUID = "4539d44c-75bb-4fbd-9d95-6cdf49d4ef2b"
    
    def __init__(self, bus, index, wifi_manager, key_manager):
        Service.__init__(
            self, bus, self.EYESPY_SERVICE_UUID, index, True)
        self.add_characteristic(EyeSpyWifiCharacteristic(bus, 0, self, wifi_manager))
        self.add_characteristic(EyeSpyConnStatusCharacteristic(bus, 1, self))
        self.add_characteristic(EyeSpySerialCharacteristic(bus, 2, self, key_manager))
        self.add_characteristic(EyeSpyWifiTypeCharacteristic(bus, 3, self, wifi_manager))