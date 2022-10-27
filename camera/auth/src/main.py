"""
Bootstrap script which makes sure NetworkManager is started before instantiating BluezManager
"""

import os
import subprocess
import dbus
from gi.repository import GLib
MainLoop = GLib.MainLoop

# pylint: disable=missing-function-docstring
def main():
    # This needs to be run before WifiManager is imported by BluezManager!
    ret = subprocess.run(["systemctl", "start", "NetworkManager.service"],
                        capture_output=True, check=False)

    if ret.returncode != 0:
        print("Failed to enable NetworkManager!")
        print("stderr: {}", ret.stderr)
        exit(-1)

    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)

    if ret.returncode != 0:
        print("Failed to enable NetworkManager!")
        print("stderr: {}", ret.stderr)
        exit(-1)

    main_loop = MainLoop()

    if os.geteuid() != 0:
        print ("Must be ran as root!")
        exit(-1)

    # NetworkManager must be started before importing
    # Otherwise the NetworkManager dbus package dies trying to talk to NetworkManager
    # pylint: disable=import-outside-toplevel
    from bluez_manager import BluezManager
    manager = BluezManager.create_manager()
    manager.start_ble()

    main_loop.run()

if __name__ == "__main__":
    main()
