"""
Interface for Bluez services and DBus applications
Classes should inherit from these to use DBus
"""
#pylint: disable=invalid-name,unused-argument

import dbus
import dbus.service
from .dbus_bluez_errors import NotSupportedException, InvalidArgsException
from .dbus_bluez_names import DBUS_OBJ_MAN, DBUS_PROPS, EYESPY_PATH,\
 BLUEZ_GATT_SERVICE, BLUEZ_LE_AD, BLUEZ_GATT_CHARACTERISTIC

# Errors and interfaces from
# https://github.com/RadiusNetworks/bluez/blob/master/test/example-gatt-server#L231

#
# Object Manager Application
#
class Application(dbus.service.Object):
    """
    DBus application which contains services
    """

    def __init__(self, bus):
        self.path = "/"
        self.services = []
        dbus.service.Object.__init__(self, bus, self.path)

    def get_path(self):
        """Get path of service"""
        return dbus.ObjectPath(self.path)

    def add_service(self, service):
        """Add service for application to manage"""
        self.services.append(service)

    @dbus.service.method(DBUS_OBJ_MAN, out_signature='a{oa{sa{sv}}}')
    def GetManagedObjects(self):
        """Get all objects stored by this application"""
        response = {}

        for service in self.services:
            response[service.get_path()] = service.get_properties()
            chrcs = service.get_characteristics()
            for chrc in chrcs:
                response[chrc.get_path()] = chrc.get_properties()

        return response

#
# BlueZ GATT service
#

class Service(dbus.service.Object):
    """BlueZ service which contains characteristics"""

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
        """Get BlueZ service properties, including contained characteristics"""
        return { BLUEZ_GATT_SERVICE: self.props }

    def get_characteristics(self):
        """Return characteristics part of this service"""
        return self.characteristics

    def get_path(self):
        """Get DBus path of Service"""
        return dbus.ObjectPath(self.path)

    def add_characteristic(self, char):
        """Add characteristic to service"""
        self.characteristics.append(char)
        self.props["Characteristics"].append(char.get_path())

    @dbus.service.method(DBUS_PROPS, in_signature='s', out_signature='a{sv}')
    def GetAll(self, interface):
        """Get all characteristics and descriptors part of this service"""
        if interface != BLUEZ_GATT_SERVICE:
            raise InvalidArgsException()
        return self.props

class Characteristic(dbus.service.Object):
    """BlueZ Characteristic which acts as an endpoint another BLE devices can access"""

    def __init__(self, service, **kwargs):
        self.path = service.get_path() + "/char" + str(kwargs["index"])
        self.props = {
            "UUID": kwargs["uuid"],
            "Service": service.get_path(),
            "Notifying": False,
            "Flags": kwargs["flags"],
            "Descriptors": dbus.Array([], signature='o')
        }
        dbus.service.Object.__init__(self, kwargs["bus"], self.path)

    def get_properties(self):
        """Get BlueZ characteristic properties"""
        return { BLUEZ_GATT_CHARACTERISTIC: self.props }

    def get_path(self):
        """Return DBus path for Characteristic"""
        return dbus.ObjectPath(self.path)

    @dbus.service.method(DBUS_PROPS, in_signature='s', out_signature='a{sv}')
    def GetAll(self, interface):
        """Get all properties of characteristic"""
        if interface != BLUEZ_GATT_CHARACTERISTIC:
            raise InvalidArgsException()
        return self.props

    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC,
                         in_signature="a{sv}",
                         out_signature='ay')
    def ReadValue(self, options):
        """BLE Read. Returns a byte array of values to other BLE device"""
        print('Default ReadValue called')
        raise NotSupportedException()

    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC,
                         in_signature='aya{sv}')
    def WriteValue(self, value, options):
        """BLE Write. Is given a byte array of values"""
        print('Default WriteValue called')
        raise NotSupportedException()

    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC)
    def StartNotify(self):
        """Signal characteristic to start sending notifications on value changes"""
        print('Default StartNotify called')
        raise NotSupportedException()

    @dbus.service.method(BLUEZ_GATT_CHARACTERISTIC)
    def StopNotify(self):
        """Signal characteristic to stop sending notifications"""
        print('Default StopNotify called')
        raise NotSupportedException

    @dbus.service.signal(DBUS_PROPS,
                         signature='sa{sv}as')
    def PropertiesChanged(self, interface, changed, invalidated):
        """Properties changed signal"""

#
# BlueZ Advertisement Service
#

class Advertisement(dbus.service.Object):
    """
    BLE Advertisement which broadcasts a Service UUID and name
    """

    def __init__(self, bus, index, name, ad_type = "peripheral"):
        self.path = EYESPY_PATH + "advertisement" + str(index)
        self.props = {
            "Type": ad_type,
            "ServiceUUIDs": dbus.Array([], signature="s"),
            "Includes": dbus.Array(["tx-power"], signature='s'),
            "LocalName": name,
        }
        self.local_name = None
        dbus.service.Object.__init__(self, bus, self.path)

    def get_properties(self):
        """Get BLE Advertisement properties"""
        return { BLUEZ_LE_AD: self.props }

    def get_path(self):
        """Get DBus path for Advertisement"""
        return dbus.ObjectPath(self.path)

    def add_service_uuid(self, uuid):
        """Add Service UUID to advertise"""
        self.props["ServiceUUIDs"].append(dbus.String(uuid))

    @dbus.service.method(DBUS_PROPS, in_signature="s", out_signature="a{sv}")
    def GetAll(self, interface):
        """Get all Advertisement properties"""
        if interface != BLUEZ_LE_AD:
            raise InvalidArgsException()
        return self.get_properties()[BLUEZ_LE_AD]

    @dbus.service.method(BLUEZ_LE_AD, in_signature="", out_signature="")
    def Release(self):
        """Advertisement is being released from memory"""
