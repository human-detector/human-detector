class NetConfig:
    URL_API="https://api.averycb.net"

    @staticmethod
    def get_heartbeat_url(id):
        return NetConfig.URL_API + f"/cameras/{id}/heartbeat"