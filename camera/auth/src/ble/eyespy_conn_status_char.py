"""
Wifi Connection Status Characteristic
"""

import json
from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_names import BLUEZ_GATT_CHARACTERISTIC

class EyeSpyConnStatusCharacteristic(Characteristic):
    """
    Sends notifications of the format:
    {
        "State": Value according to networking.wifi_manager.DeviceState
        "Reason": Value from NetworkManager which corresponds to NMDeviceStateReason
    }
    """

    EYESPY_CONN_UUID = "136670fb-f95b-4ee8-bc3b-81eadb234268"

    def __init__(self, bus, index, service, wifi_manager):
        Characteristic.__init__(
            self, bus,
            self.EYESPY_CONN_UUID,
            ['notify'],
            service, index
        )
        self.is_notifying = False
        self.wifi_manager = wifi_manager
        wifi_manager.register_state_callback(self.state_change_callback)

    def state_change_callback(self, new_state):
        """
        This will send notifications to the phone when the NetworkManager state changes
        """

        if not self.is_notifying:
            return

        new_value = json.dumps({
            "State": new_state[0].value,
            "Reason": new_state[1]
        }).encode("ascii")

        self.PropertiesChanged(BLUEZ_GATT_CHARACTERISTIC, { 'Value': new_value }, [])

    def StartNotify(self):
        print("Start notification")
        self.is_notifying = True

    def StopNotify(self):
        print("Stop notification")
        self.is_notifying = False
