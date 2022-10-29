"""
EyeSpy Service
"""

from ble.eyespy_wifi_type_char import EyeSpyWifiTypeCharacteristic
from .dbus_interface.dbus_bluez_interface import Service
from .eyespy_wifi_char import EyeSpyWifiCharacteristic
from .eyespy_conn_status_char import EyeSpyConnStatusCharacteristic
from .eyespy_serial_char import EyeSpySerialCharacteristic

class EyeSpyService(Service):
    """
    Advertised Service which contains all the EyeSpy characteristics
    """
    EYESPY_SERVICE_UUID = "4539d44c-75bb-4fbd-9d95-6cdf49d4ef2b"

    def __init__(self, bus, index, wifi, key):
        Service.__init__(
            self, bus, self.EYESPY_SERVICE_UUID, index, True)
        self.add_characteristic(
            EyeSpyWifiCharacteristic(bus=bus, index=0, service=self,
                                     key_manager=key, wifi_manager=wifi))
        self.add_characteristic(
            EyeSpyConnStatusCharacteristic(bus=bus, index=1, service=self, wifi_manager=wifi))
        self.add_characteristic(
            EyeSpySerialCharacteristic(bus=bus, index=2, service=self,
                                       key_manager=key, wifi_manager=wifi))
        self.add_characteristic(
            EyeSpyWifiTypeCharacteristic(bus=bus, index=3, service=self, wifi_manager=wifi))
