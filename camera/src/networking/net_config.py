class NetConfig:
    URL_API="http://api.averycb.net"

    @staticmethod
    def get_notif_url(id):
        return NetConfig.URL_API + f"/cameras/{id}/notifications"

    @staticmethod
    def get_heartbeat_url(id):
        return NetConfig.URL_API + f"/cameras/{id}/heartbeat"