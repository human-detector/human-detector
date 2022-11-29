"""
Eyespy Advertisements
"""

from .dbus_interface.dbus_bluez_interface import Advertisement
from .eyespy_service import EyeSpyService

class EyeSpyAdvertisement(Advertisement):
    """
    BLE Eye Spy Advertisement for the EyeSpy Service
    """
    def __init__(self, bus, index, keys):
        Advertisement.__init__(self, bus, index, "EyeSpy Camera")
        self.add_service_uuid(EyeSpyService.EYESPY_SERVICE_UUID)

        # Publish serial number of pi
        serial = int(keys.serial, 16) if keys.serial is not None else 0x1234567876543210
        serial_bytes = list((serial >> i) & 0xFF for i in range(0,64,8))
        self.add_manufacturer_data(0xFFFF, serial_bytes)
