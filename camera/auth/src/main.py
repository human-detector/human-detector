"""
Bootstrap script which makes sure NetworkManager is started before instantiating BluezManager
"""

import logging
import sys
import os
import subprocess
import dbus
import dbus.mainloop.glib
from gi.repository import GLib
from networking import KeyManager, Heartbeat, NetRequests
from networking.wifi_manager import WifiManager

from eyespy_service import EyeSpyService

logger = logging.getLogger(__name__)

MainLoop = GLib.MainLoop

# pylint: disable=missing-function-docstring
def main():
    # This needs to be run before WifiManager is imported by BluezManager!
    ret = subprocess.run(["systemctl", "start", "NetworkManager.service"],
                        capture_output=True, check=False)

    if ret.returncode != 0:
        logger.error("Failed to enable NetworkManager!")
        logger.error("stderr: %s", ret.stderr)
        sys.exit(-1)

    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)

    if ret.returncode != 0:
        logger.error("Failed to enable NetworkManager!")
        logger.error("stderr: %s", ret.stderr)
        sys.exit(-1)

    main_loop = MainLoop()

    if os.geteuid() != 0:
        logger.error ("Must be ran as root!")
        sys.exit(-1)

    keys = KeyManager.create_key_manager_from_disk()
    heartbeat = Heartbeat(NetRequests(keys))
    wifi = WifiManager(heartbeat)
    EyeSpyService(keys, heartbeat, wifi)

    main_loop.run()

if __name__ == "__main__":
    main()
