from .dbus_interface.dbus_bluez_interface import Advertisement
from .eyespy_service import EyeSpyService

class EyeSpyAdvertisement(Advertisement):
    def __init__(self, bus, index):
        Advertisement.__init__(self, bus, index, "EyeSpy Camera")
        self.add_service_uuid(EyeSpyService.EYESPY_SERVICE_UUID)