"""
Bootstrap script which makes sure NetworkManager is started before instantiating BluezManager
"""

from time import time
from enum import Enum, auto
import sys
import os
import subprocess
import dbus
import dbus.mainloop.glib
from gi.repository import GLib

from networking import KeyManager
from systemd.detector_unit import DetectorSystemdUnit
from networking.connection_status import provide_net_state, register_net_state_callback

MainLoop = GLib.MainLoop

SECONDS_PER_MINUTE = 60
START_TIMEOUT = 10 * SECONDS_PER_MINUTE

class State(Enum):
    """Camera State"""
    BOOT = auto()
    BLE = auto()
    DETECTOR_UP = auto()

state = State.BOOT
boot_time = time()
detector = DetectorSystemdUnit()
bluez_manager = None
wifi_manager = None

def net_state_callback(network_state):
    

def on_state_change():
    if state == State.BLE:
        bluez_manager.start_ble()
    elif state == State.DETECTOR_UP:
        bluez_manager.stop_ble()


# pylint: disable=missing-function-docstring
def main():
    # This needs to be run before WifiManager is imported by BluezManager!
    ret = subprocess.run(["systemctl", "start", "NetworkManager.service"],
                        capture_output=True, check=False)

    if ret.returncode != 0:
        print("Failed to enable NetworkManager!")
        print("stderr: {}", ret.stderr)
        sys.exit(-1)

    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)

    if ret.returncode != 0:
        print("Failed to enable NetworkManager!")
        print("stderr: {}", ret.stderr)
        sys.exit(-1)

    main_loop = MainLoop()

    if os.geteuid() != 0:
        print ("Must be ran as root!")
        sys.exit(-1)

    # NetworkManager must be started before importing
    # Otherwise the NetworkManager dbus package dies trying to talk to NetworkManager
    # pylint: disable=import-outside-toplevel,no-name-in-module
    from bluez_manager import BluezManager
    keys = KeyManager.create_key_manager_from_disk()

    global manager
    global wifi_manager
    manager = BluezManager.create_manager()
    
    # No keys exist, revert to OOTB state
    if keys.keys is None:
        state = State.BLE

    main_loop.run()

if __name__ == "__main__":
    main()
