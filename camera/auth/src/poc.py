# This is a proof of concept - this should not appear in main!

import dbus
import dbus.mainloop.glib
import dbusBleInterface
from gi.repository import GLib
MainLoop = GLib.MainLoop


mainloop = None

DBUS_OBJ_MAN = "org.freedesktop.DBus.ObjectManager"
DBUS_PROPS = "org.freedesktop.DBus.Properties"
BLUEZ_SERVICE = "org.bluez"
BLUEZ_ADAPTER = "org.bluez.Adapter1"
BLUEZ_LE_AD_MANAGER = "org.bluez.LEAdvertisingManager1"
BLUEZ_GATT_MANAGER = "org.bluez.GattManager1"

def register_service_callback():
    print("Service registered")

def register_service_error(error):
    print("Service register error: " + str(error))

def register_ad_callback():
    print("Advertisement registered")

def register_ad_error(error):
    print("Failed to register advertisement: " + str(error))

class EyeSpyService(dbusBleInterface.Service):
    EYESPY_SERVICE_UUID = "4539d44c-75bb-4fbd-9d95-6cdf49d4ef2b"
    
    def __init__(self, bus, index):
        dbusBleInterface.Service.__init__(
            self, bus, self.EYESPY_SERVICE_UUID, index, True)
        self.add_characteristic(EyeSpyWifiCharacteristic(bus, 0, self))
        self.add_characteristic(EyeSpyConnStatusCharacteristic(bus, 1, self))
        self.add_characteristic(EyeSpySerialCharacteristic(bus, 2, self))

class EyeSpyWifiCharacteristic(dbusBleInterface.Characteristic):
    EYESPY_WIFI_UUID = "7a1673f9-55cb-4f40-b624-561ad8afb8e2"

    def __init__(self, bus, index, service):
        dbusBleInterface.Characteristic.__init__(
            self, bus,
            self.EYESPY_WIFI_UUID,
            ['encrypt-write'],
            service, index
        )
    
    def WriteValue(self, value):
        print("Writing val!")
        print(value)

class EyeSpyConnStatusCharacteristic(dbusBleInterface.Characteristic):
    EYESPY_CONN_UUID = "136670fb-f95b-4ee8-bc3b-81eadb234268"
    
    def __init__(self, bus, index, service):
        dbusBleInterface.Characteristic.__init__(
            self, bus,
            self.EYESPY_CONN_UUID,
            ['notify'],
            service, index
        )
    
    def StartNotify(self):
        print("Start notification")
    
    def StopNotify(self):
        print("Stop notification")

class EyeSpySerialCharacteristic(dbusBleInterface.Characteristic):
    EYESPY_SERIAL_UUID = "8b83fee2-373c-46a5-a782-1db9118431d9"
    def __init__(self, bus, index, service):
        dbusBleInterface.Characteristic.__init__(
            self, bus,
            self.EYESPY_SERIAL_UUID,
            ['encrypt-read'],
            service, index
        )
    
    def ReadValue(self):
        print("reading value")
        string = "This is totally a serial"
        return dbus.types.ByteArray(string)

class EyeSpyAdvertisement(dbusBleInterface.Advertisement):
    def __init__(self, bus, index):
        dbusBleInterface.Advertisement.__init__(self, bus, index)
        self.set_manufacturer_data(
            { 0xFFFF: [0x20, 0x46] },
        )

        self.add_service_uuid(EyeSpyService.EYESPY_SERVICE_UUID)

def main():
    global mainloop
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)

    bus = dbus.SystemBus()

    bluez_adapter = None
    obj_manager = dbus.Interface(bus.get_object(BLUEZ_SERVICE, "/"), DBUS_OBJ_MAN)
    objects = obj_manager.GetManagedObjects()

    for obj, props in objects.items():
        if BLUEZ_GATT_MANAGER in props.keys():
            bluez_adapter = obj

    bluez_service = bus.get_object(BLUEZ_SERVICE, bluez_adapter)
    bluez_props = dbus.Interface(bluez_service, DBUS_PROPS)
    gatt_manager = dbus.Interface(bluez_service, BLUEZ_GATT_MANAGER)
    ad_manager = dbus.Interface(bluez_service, BLUEZ_LE_AD_MANAGER)

    mainloop = MainLoop()

    # Make sure bluetooth is powered up
    bluez_props.Set(BLUEZ_ADAPTER, "Powered", dbus.Boolean(1))

    eyespy_ad = EyeSpyAdvertisement(bus, 0)
    app = dbusBleInterface.Application(bus)
    app.add_service(EyeSpyService(bus, 0))

    gatt_manager.RegisterApplication(
        app.get_path(), {},
        reply_handler= register_service_callback,
        error_handler= register_service_error,
    )

    ad_manager.RegisterAdvertisement(
        eyespy_ad.get_path(), {},
        reply_handler = register_ad_callback,
        error_handler = register_ad_error,
    )

    mainloop.run()

if __name__ == "__main__":
    main()