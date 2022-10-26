import dbus
import dbus.mainloop.glib
import os
import ble.dbus_interface.dbus_bluez_names as BluezNames
from ble import EyeSpyAdvertisement, EyeSpyService
from ble.dbus_interface.dbus_bluez_interface import Application
from gi.repository import GLib

from networking.wifi_manager import WifiManager
MainLoop = GLib.MainLoop

class BluezManager():

    def __init__(self, wifi_manager):
        self.bus = dbus.SystemBus()
        adapter = self.get_ble_adapter_path()
        
        # Get all the managers so we can register all our ads and services
        bluez_service = self.bus.get_object(BluezNames.BLUEZ_SERVICE, adapter)
        
        self.adapter_props = dbus.Interface(bluez_service, BluezNames.DBUS_PROPS)
        self.gatt_manager = dbus.Interface(bluez_service, BluezNames.BLUEZ_GATT_MANAGER)
        self.ad_manager = dbus.Interface(bluez_service, BluezNames.BLUEZ_LE_AD_MANAGER)

        # Create advertisement and EyeSpy services which phone talks to
        self.eyespy_ad = EyeSpyAdvertisement(self.bus, 0)
        self.app = Application(self.bus) # GATT requires an application to manage the service
        self.app.add_service(EyeSpyService(self.bus, 0, wifi_manager))

    def start_ble(self):
        # Turn on bluetooth adapter
        self.adapter_props.Set(BluezNames.BLUEZ_ADAPTER, "Powered", dbus.Boolean(1))
        self.gatt_manager.RegisterApplication(self.app.get_path(), {}, byte_arrays=True)
        self.ad_manager.RegisterAdvertisement(self.eyespy_ad.get_path(), {})

    def stop_blue(self):
        # Unregister ads and services
        try:
            self.ad_manager.UnregisterAdvertisement(self.eyespy_ad.get_path(), {})
            self.gatt_manager.UnregisterApplication(self.app.get_path(), {})
        except:
            # Do nothing. Exception either means it's an invalid object or already stopped
            pass

        self.adapter_props.Set(BluezNames.BLUEZ_ADAPTER, "Powered", dbus.Boolean(0))

    # Get the path for the first bluetooth adapter with the GATT services needed for BLE
    def get_ble_adapter_path(self):
        service = self.bus.get_object(BluezNames.BLUEZ_SERVICE, "/")
        obj_manager = dbus.Interface(service, BluezNames.DBUS_OBJ_MAN)
        objects = obj_manager.GetManagedObjects()

        for obj, props in objects.items():
            if BluezNames.BLUEZ_GATT_MANAGER in props.keys():
                return obj

def main():
    global mainloop
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)

    mainloop = MainLoop()

    if os.geteuid() != 0:
        print ("Must be ran as root!")
        exit(-1)

    manager = BluezManager(WifiManager())
    manager.start_ble()

    mainloop.run()

if __name__ == "__main__":
    main()