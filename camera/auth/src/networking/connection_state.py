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

def provide_net_state(state, reason):
    """
    Provide new state to advertise to consumers
    """
    network_state["State"] = state
    network_state["Reason"] = reason

    for callback in __callbacks:
        callback(network_state)
