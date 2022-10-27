"""
BluezManager manages all BLE aspects of the Eyespy camera
Before importing this module, make sure NetworkManager is started!
"""

import sys
import dbus
import dbus.mainloop.glib
import ble.dbus_interface.dbus_bluez_names as BluezNames
from ble import EyeSpyAdvertisement, EyeSpyService
from ble.dbus_interface.dbus_bluez_interface import Application
from networking.key_manager import KeyManager
from networking.wifi_manager import WifiManager

def register_gatt_cb():
    """Service registration success callback"""
    print("Service registered")

def register_gatt_cb_error(error):
    """Service registration error callback"""
    print("Error registering service")
    print(error)
    sys.exit(-1)

def register_ad_cb():
    """Advertisement registration success callback"""
    print("Advertisement registered")

def register_ad_cb_error(error):
    """Advertisement registration error callback"""
    print("Error registering ad")
    print(error)
    sys.exit(-1)

class BluezManager():
    """
    BluezManager contains all EyeSpy Bluetooth LE services and characteristics.
    It additionally manages whether the bluetooth adapter is powered or not'
    """

    @staticmethod
    def create_manager():
        """Returns a new BluezManager with keys and wifi managers passed in"""
        return BluezManager(WifiManager(), KeyManager())

    def __init__(self, wifi_manager, key_manager):
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
        self.app.add_service(EyeSpyService(self.bus, 0, wifi_manager, key_manager))

    def start_ble(self):
        """
        Turn on Bluetooth adapter and register ads/service
        """
        self.adapter_props.Set(BluezNames.BLUEZ_ADAPTER, "Powered", dbus.Boolean(1))
        self.gatt_manager.RegisterApplication(
            self.app.get_path(), {},
            byte_arrays=True,
            reply_handler = register_gatt_cb,
            error_handler = register_gatt_cb_error,
        )

        self.ad_manager.RegisterAdvertisement(
            self.eyespy_ad.get_path(), {},
            reply_handler = register_ad_cb,
            error_handler = register_ad_cb_error,
        )

    def stop_blue(self):
        """
        Unregister BLE services and turn off bluetooth adapter
        """
        try:
            self.ad_manager.UnregisterAdvertisement(self.eyespy_ad.get_path(), {})
            self.gatt_manager.UnregisterApplication(self.app.get_path(), {})
        except dbus.DBusException:
            # Do nothing. Exception either means it's an invalid object or already stopped
            pass

        self.adapter_props.Set(BluezNames.BLUEZ_ADAPTER, "Powered", dbus.Boolean(0))

    def get_ble_adapter_path(self):
        """
        Get the path for the first bluetooth adapter with the GATT services needed for BLE
        """
        service = self.bus.get_object(BluezNames.BLUEZ_SERVICE, "/")
        obj_manager = dbus.Interface(service, BluezNames.DBUS_OBJ_MAN)
        objects = obj_manager.GetManagedObjects()

        for obj, props in objects.items():
            if BluezNames.BLUEZ_GATT_MANAGER in props.keys():
                return obj

        return None
