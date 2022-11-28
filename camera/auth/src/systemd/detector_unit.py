"""
Detector Systemd Unit
"""

import logging
import dbus

DETECTOR_UNIT_NAME = "eyespy.detector.service"

logger = logging.getLogger(__name__)

class DetectorSystemdUnit:
    """Simple wrapper around Systemd to start and stop the Detector servce"""

    def __init__(self):
        bus = dbus.SystemBus()
        systemd = bus.get_object(
            'org.freedesktop.systemd1',
            '/org/freedesktop/systemd1'
        )

        self.manager = dbus.Interface(systemd, 'org.freedesktop.systemd1.Manager')

    def start(self):
        """Start Detector"""
        self.manager.StartUnit(DETECTOR_UNIT_NAME, "replace")
        logger.info("Detector started")

    def stop(self):
        """Stop Detector"""
        self.manager.StopUnit(DETECTOR_UNIT_NAME, "replace")
        logger.info("Detector stopped :(")
