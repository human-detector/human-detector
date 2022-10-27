from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_names import BLUEZ_GATT_CHARACTERISTIC
import json

class EyeSpyConnStatusCharacteristic(Characteristic):
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
        if not self.is_notifying:
            return
        
        dict = json.dumps({
            "State": new_state[0],
            "Reason": new_state[1]
        }).encode("ascii")

        self.PropertiesChanged(BLUEZ_GATT_CHARACTERISTIC, { 'Value': dict }, [])
    
    def StartNotify(self):
        print("Start notification")
        self.is_notifying = True
    
    def StopNotify(self):
        print("Stop notification")
        self.is_notifying = False