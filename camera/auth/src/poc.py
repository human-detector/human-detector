# This is a proof of concept - this should not appear in main!

import dbus
import dbusBleInterface

DBUS_OBJ_MAN = "org.freedesktop.DBus.ObjectManager"
DBUS_PROPS = "org.freedesktop.DBus.Properties"
BLUEZ_SERVICE = "org.bluez"
BLUEZ_ADAPTER = "org.bluez.Adapter1"
BLUEZ_LE_AD_MANAGER = "org.bluez.LEAdvertisingManager1"
BLUEZ_GATT_MANAGER = "org.bluez.GattManager1"

EYESPY_SERVICE_UUID = "4539d44c-75bb-4fbd-9d95-6cdf49d4ef2b"

def register_ad_callback():
    print("Advertisement registered")

def register_ad_error(error):
    print("Failed to register advertisement: " + str(error))

class EyeSpyAdvertisement(dbusBleInterface.Advertisement):
    def __init__(self, bus):
        super.__init__(self, bus)
        self.set_manufacturer_data(
            0xFFFF,
            [0x70, 0x74],
        )

        self.add_service_uuid(EYESPY_SERVICE_UUID)
        self.set_local_name("Eyespy Camera")

def main():
    bus = dbus.SystemBus()
    bluez_service = None
    obj_man = dbus.Interface(bus.get_object(BLUEZ_SERVICE, "/"), DBUS_OBJ_MAN)
    objects = obj_man.GetManagedObjects()

    for obj, props in objects.items():
        if dbusBleInterface.BLUEZ_GATT_MANAGER in props.keys():
            bluez_service = obj

    bluez_props = dbus.Interface(bluez_service, DBUS_PROPS)
    gatt_manager = dbus.Interface(bluez_service, BLUEZ_GATT_MANAGER)
    ad_manager = dbus.Interface(bluez_service, BLUEZ_LE_AD_MANAGER)

    bluez_props.Set(BLUEZ_ADAPTER, "Powered", dbus.Boolean(1))

    eyespy_ad = EyeSpyAdvertisement(bus)
    ad_manager.RegisterAdvertisement(
        eyespy_ad.get_path(), {}
        reply_handler = register_ad_callback,
        error_handler = [register_ad_error],
    )