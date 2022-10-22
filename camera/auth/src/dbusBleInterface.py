import dbus
import dbus.service

BLUEZ_SERVICE = "org.bluez"

BLUEZ_ADAPTER = "org.bluez.Adapter1"

BLUEZ_LE_AD_MANAGER = "org.bluez.LEAdvertisingManager1"
BLUEZ_GATT_MANAGER = "org.bluez.GattManager1"

BLUEZ_LE_AD = "org.bluez.LEAdvertisement1"

BLUEZ_GATT_SERVCE = "org.bluez.GattService1"
BLUEZ_GATT_CHARACTERISTIC = "org.bluez.Characteristic1"
BLUEZ_GATT_DESCRIPTOR = "org.bluez.GattDescriptor1"

DBUS_OBJ_MAN = "org.freedesktop.DBus.ObjectManager"
DBUS_PROPS = "org.freedesktop.DBus.Properties"
EYESPY_PATH = "/eyespy/auth/"


class Advertisement(dbus.service.Object):
    def __init__(self, bus):
        self.path = EYESPY_PATH + "advertisement0"
        self.bus = bus
        self.service_uuids = []
        self.manufacturer_data = dict()
        self.local_name = None
        dbus.service.Object.__init__(self, bus, self.path)

    def get_properties(self):
        properties = dict()
        properties["Type"] = "peripheral"
        properties["ServiceUUIDs"] = dbus.Array(self.service_uuids, signature="s")
        properties["LocalName"] = dbus.String(self.local_name)
        properties["ManufacturerData"] = dbus.Dictionary(self.manufacturer_data, signature="qv")
        properties["IncludeTxPower"] = dbus.Boolean(True)
        return { BLUEZ_LE_AD: properties }

    def get_path(self):
        return dbus.ObjectPath(self.path)

    def add_service_uuid(self, uuid):
        self.service_uuids.append(uuid)

    def set_manufacturer_data(self, manufacturer, data):
        self.manufacturer_data[manufacturer] = data

    def set_local_name(self, name):
        self.local_name = dbus.String(name)

    @dbus.service.method(DBUS_PROPS, in_signature="s", out_signature="a{sv}")
    def GetAll(self, interface):
        if interface != BLUEZ_LE_AD:
            raise TypeError()
        return self.get_properties()[BLUEZ_LE_AD]

    @dbus.service.method(BLUEZ_LE_AD, in_signature="", out_signature="")
    def Release(self):
        pass
