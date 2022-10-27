DBUS_OBJ_MAN = "org.freedesktop.DBus.ObjectManager" # DBus Object Manager Interface
DBUS_PROPS = "org.freedesktop.DBus.Properties"      # DBus Properties interface

BLUEZ_SERVICE = "org.bluez"             # Bluez Service name
BLUEZ_ADAPTER = "org.bluez.Adapter1"    # Bluez Adapter
BLUEZ_ADAPTER_PATH = "/org/bluez/hci0"  # Adapter path for first bluetooth controller

BLUEZ_LE_AD_MANAGER = "org.bluez.LEAdvertisingManager1" # LE Ad Manager
BLUEZ_LE_AD = "org.bluez.LEAdvertisement1"              # Advertisement interface

# GATT/BLE Characteristic Manager
BLUEZ_GATT_MANAGER = "org.bluez.GattManager1"
# GATT Service interface - Holds characteristics
BLUEZ_GATT_SERVICE = "org.bluez.GattService1"
# GATT Characteristic interface - GATT endpoint which phone reads/writes to
BLUEZ_GATT_CHARACTERISTIC = "org.bluez.GattCharacteristic1"
# GATT Characteristic Descriptor interface (Not currently used)
BLUEZ_GATT_DESCRIPTOR = "org.bluez.GattDescriptor1"

EYESPY_PATH = "/eyespy/auth/"   # EyeSpy user path