"""
EyeSpy Service which handles all state changes and can start up the detector service
"""

from time import time
from enum import Enum, auto
from networking import KeyManager, Heartbeat
from networking.wifi_manager import WifiManager, WifiState
from systemd.detector_unit import DetectorSystemdUnit

SECONDS_PER_MINUTE = 60
START_TIMEOUT = 10 * SECONDS_PER_MINUTE

INSTANCE = None

class CameraState(Enum):
    """Represents the state of all services on the camera"""
    BOOT = auto
    BLE_UP = auto
    DETECTOR_UP = auto

class EyeSpyService:
    """
    Controls the state of the camera and whether the BLE and Detector should be running
    """
    bluez_manager = None
    wifi_manager = None
    state = CameraState.BOOT

    # heartbeat helpers
    _pingcount = 0

    def __init__(self, keys: KeyManager, heartbeat: Heartbeat, wifi_manager: WifiManager):
        # NetworkManager must be started before importing
        # Otherwise the NetworkManager dbus package dies trying to talk to NetworkManager
        # pylint: disable=import-outside-toplevel,no-name-in-module
        from bluez_manager import BluezManager

        self.detector = DetectorSystemdUnit()
        self.keys = keys
        self.wifi = wifi_manager
        self.heartbeat = heartbeat
        self.boot_time = time()
        self.bluez_manager = BluezManager.create_manager(self.wifi, keys)

        self.wifi.register_wifi_state_callback(self.on_wifi_state_change)

        # No keys exist, revert to OOTB state
        if keys.keys is None:
            self.on_camera_state_change(CameraState.BLE_UP)
        else:
            self.on_camera_state_change(CameraState.BOOT)

    # pylint: disable=unused-argument
    def on_wifi_state_change(self, new_state, new_reason):
        """Called when wifi state changes - this includes heartbeats"""
        if new_state == WifiState.FAIL:
            self.keys.clear_keys()
            # We wait a bit during boot before allowing a failure to cause a state change
            # in case the PI is booting from a power outage (and the wifi router is slow)
            # or some other weird state

        elif new_state == WifiState.ATTEMPTING_PING:
            self.heartbeat.stop()
            self.heartbeat.start(5)
        elif new_state == WifiState.SUCCESS:
            self.heartbeat.stop()
            self.heartbeat.start(60)
            self.on_camera_state_change(CameraState.DETECTOR_UP)

    def on_camera_state_change(self, new_state):
        """Called to change detector and BLE state"""
        if self.state == new_state:
            return

        self.state = new_state
        if self.state == CameraState.BLE_UP:
            self.bluez_manager.start_ble()
            self.detector.stop()
        elif self.state == CameraState.DETECTOR_UP:
            self.bluez_manager.stop_ble()
            self.detector.start()
