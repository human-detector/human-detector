"""
Connection state manager
Allows multiple sources to provide and consume a connection state
"""

from enum import Enum
from threading import Condition, Thread

class DeviceState(Enum):
    """Internal network state"""
    INTERNAL_ERROR = 0
    DISCONNECTED = 1
    CONNECTING = 2
    SUCCESS = 3
    FAIL = 4
    ATTEMPTING_PING = 5

class FailReason(Enum):
    """Failure reason for connecting"""
    SSID_NOT_FOUND = 0
    INCORRECT_SECRETS = 1
    FORBIDDEN = 2
    BACKEND_DOWN = 3

__callbacks = []
__condition_lock = Condition()
__ping = False

network_state = {
    "State": DeviceState.DISCONNECTED,
    "Reason": 0
}

def register_net_state_callback(callback):
    """
    Register callback to consume network state
    """
    __callbacks.append(callback)

def provide_net_state(new_state, new_reason):
    """
    Provide new state to advertise to consumers
    """

    old_state = network_state["State"]

    # Make sure we're still connected to wifi before reporting success
    if (old_state != DeviceState.ATTEMPTING_PING and
        new_state == DeviceState.SUCCESS):
        return

    network_state["State"] = new_state
    network_state["Reason"] = new_reason

    for callback in __callbacks:
        callback(network_state)

def _attempt_heartbeat_thread():
    while True:
        with __condition_lock:
            __condition_lock.wait_for(lambda : __ping)


Thread(target=_attempt_heartbeat_thread, daemon=True)
