"""
Networking Configuration
"""

#pylint: disable=too-few-public-methods
class NetConfig:
    """
    Contains backend configuration
    """
    URL_API="https://api.averycb.net"

    @staticmethod
    def get_heartbeat_url(uuid):
        """Return Heartbeat URL using given UUID"""
        return NetConfig.URL_API + f"/cameras/{uuid}/heartbeat"
