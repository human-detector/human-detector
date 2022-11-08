"""
Connection state manager
Allows multiple sources to provide and consume a connection state
"""

from enum import Enum

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
    NONE = 0
    SSID_NOT_FOUND = 1
    INCORRECT_SECRETS = 2
    FORBIDDEN = 3
    BACKEND_DOWN = 4


__callbacks = []

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
