class NullSource:
    """Null source used to test the pipeline against None frames"""
    def get_frame(self):
        return None