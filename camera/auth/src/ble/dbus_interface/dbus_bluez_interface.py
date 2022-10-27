import dbus
import dbus.service
from .dbus_bluez_errors import *
from .dbus_bluez_names import *

# Errors and interfaces from
# https://github.com/RadiusNetworks/bluez/blob/master/test/example-gatt-server#L231

#
# Object Manager Application
#
class Application(dbus.service.Object):
    def __init__(self, bus):
        self.path = "/"
        self.services = []
        dbus.service.Object.__init__(self, bus, self.path)
    
    def get_path(self):
        return dbus.ObjectPath(self.path)
    
    def add_service(self, service):
        self.services.append(service)

    @dbus.service.method(DBUS_OBJ_MAN, out_signature='a{oa{sa{sv}}}')
    def GetManagedObjects(self):
        response = {}
        print('GetManagedObjects')
        
        for service in self.services:
            response[service.get_path()] = service.get_properties()
            chrcs = service.get_characteristics()
            for chrc in chrcs:
                response[chrc.get_path()] = chrc.get_properties()
                descs = chrc.get_descriptors()
                for desc in descs:
                    response[desc.get_path()] = desc.get_properties()

        return response

#
# BlueZ GATT service
#

class Service(dbus.service.Object):
    def __init__(self, bus, uuid, index, primary):
        self.path = EYESPY_PATH + "service" + str(index)
        self.characteristics = []
        self.props = {
            "UUID": uuid,
            "Primary": primary,
            "Characteristics": dbus.Array([], signature='o')
        }
        dbus.service.Object.__init__(self, bus, self.path)

    def get_properties(self):
        return { BLUEZ_GATT_SERVICE: self.props }

    def get_characteristics(self):
        return self.characteristics

    def get_path(self):
        return dbus.ObjectPath(self.path)

    def add_characteristic(self, char):
        self.characteristics.append(char)
        self.props["Characteristics"].append(char.get_path())
    
    @dbus.service.method(DBUS_PROPS, in_signature='s', out_signature='a{sv}')
    def GetAll(self, interface):
        if interface != BLUEZ_GATT_SERVICE:
            raise InvalidArgsException()
        return self.props

class Characteristic(dbus.service.Object):
    def __init__(self, bus, uuid, flags, service, index):
        self.path = service.get_path() + "/char" + str(index)
        self.descriptors = []
        self.props = {
            "UUID": uuid,
            "Service": service.get_path(),
            "Notifying": False,
            "Flags": flags,
            "Descriptors": dbus.Array([], signature='o')
        }
        dbus.service.Object.__init__(self, bus, self.path)

    def get_properties(self):
        return { BLUEZ_GATT_CHARACTERISTIC: self.props }

    def get_descriptors(self):
        return self.descriptors

    def get_path(self):
        return dbus.ObjectPath(self.path)

    def add_descriptor(self, descriptor):
        self.descriptors.append(descriptor)
        self.props["Descriptors"].append(descriptor.get_path())

    @dbus.service.method(DBUS_PROPS, in_signature='s', out_signature='a{sv}')
    def GetAll(self, interface):
        if interface != BLUEZ_GATT_CHARACTERISTIC:
            raise InvalidArgsException()
        return self.props
    
    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC,
                         in_signature="a{sv}",
                         out_signature='ay')
    def ReadValue(self, options):
        print('Default ReadValue called')
        raise NotSupportedException()
    
    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC,
                         in_signature='aya{sv}')
    def WriteValue(self, write, options):
        print('Default WriteValue called')
        raise NotSupportedException()
    
    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC)
    def StartNotify(self):
        print('Default StartNotify called')
        raise NotSupportedException()
    
    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC)
    def StopNotify(self):
        print('Default StopNotify called')
        raise NotSupportedException
    
    @dbus.service.signal(DBUS_PROPS,
                         signature='sa{sv}as')
    def PropertiesChanged(self, interface, changed, invalidated):
        print('PropertiesChanged called')
        pass

#
# BlueZ Advertisement Service
#

class Advertisement(dbus.service.Object):
    def __init__(self, bus, index, name, type = "peripheral"):
        self.path = EYESPY_PATH + "advertisement" + str(index)
        self.props = {
            "Type": type,
            "ServiceUUIDs": dbus.Array([], signature="s"),
            "Includes": dbus.Array(["tx-power"], signature='s'),
            "LocalName": name,
        }
        self.local_name = None
        dbus.service.Object.__init__(self, bus, self.path)

    def get_properties(self):
        return { BLUEZ_LE_AD: self.props }

    def get_path(self):
        return dbus.ObjectPath(self.path)

    def add_service_uuid(self, uuid):
        self.props["ServiceUUIDs"].append(dbus.String(uuid))

    @dbus.service.method(DBUS_PROPS, in_signature="s", out_signature="a{sv}")
    def GetAll(self, interface):
        if interface != BLUEZ_LE_AD:
            raise InvalidArgsException()
        return self.get_properties()[BLUEZ_LE_AD]

    @dbus.service.method(BLUEZ_LE_AD, in_signature="", out_signature="")
    def Release(self):
        pass
