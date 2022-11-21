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
__pingcount: int = 0

network_state = {
    "State": DeviceState.DISCONNECTED,
    "Reason": 0
}

def register_net_state_callback(callback):
    """
    Register callback to consume network state
    """
    __callbacks.append(callback)

def provide_ping_state(could_connect, forbidden):
    """
    Helper to create a state from a heartbeat
    """

    # pylint: disable=invalid-name,global-statement
    global __pingcount
    __pingcount += 1

    # Heartbeat is always running and giving us state, so we should
    # only distribute success when changing into a succesful state
    if could_connect:
        if network_state["State"] == DeviceState.ATTEMPTING_PING:
            provide_net_state(DeviceState.SUCCESS, FailReason.NONE)
    elif forbidden and network_state["State"] != DeviceState.FAIL:
        provide_net_state(DeviceState.FAIL, FailReason.FORBIDDEN)
    elif __pingcount >= 5 and network_state["State"] != DeviceState.FAIL:
        provide_net_state(DeviceState.FAIL, FailReason.BACKEND_DOWN)

def provide_net_state(new_state, new_reason):
    """
    Provide new state to advertise to consumers
    """

    old_state = network_state["State"]

    # pylint: disable=invalid-name,global-statement
    global __pingcount
    if new_state == DeviceState.ATTEMPTING_PING:
        __pingcount = 0

    # Make sure we're still connected to wifi before reporting success
    if (old_state != DeviceState.ATTEMPTING_PING and
        new_state == DeviceState.SUCCESS):
        return

    network_state["State"] = new_state
    network_state["Reason"] = new_reason

    for callback in __callbacks:
        callback(network_state)
