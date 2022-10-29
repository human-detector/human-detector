"""
BlueZ Exceptions
"""
#pylint: disable=missing-class-docstring

import dbus.exceptions

#
# DBus/BlueZ exceptions
#

class InProgressException(dbus.exceptions.DBusException):
    _dbus_error_name = 'org.bluez.Error.InProgress'

class NotSupportedException(dbus.exceptions.DBusException):
    _dbus_error_name = 'org.bluez.Error.NotSupported'

class NotPermittedException(dbus.exceptions.DBusException):
    _dbus_error_name = 'org.bluez.Error.NotPermitted'

class NotAuthorizedException(dbus.exceptions.DBusException):
    _dbus_error_Name = 'org.bluez.Error.NotAuthorized'

class InvalidValueLengthException(dbus.exceptions.DBusException):
    _dbus_error_name = 'org.bluez.Error.InvalidValueLength'

class FailedException(dbus.exceptions.DBusException):
    _dbus_error_name = 'org.bluez.Error.Failed'

#
# DBus Properties Exceptions
#

class InvalidArgsException(dbus.exceptions.DBusException):
    _dbus_error_name = 'org.freedesktop.DBus.Error.InvalidArgs'
