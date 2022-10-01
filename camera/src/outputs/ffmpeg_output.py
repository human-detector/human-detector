import os
import subprocess
import platform

class FFMPEGNotFoundException(Exception):
    """Raised when FFMPEG can not start or is not found"""
    pass

class FFMPEGOutput:
    """
    Stream output to a target machine using FFMPEG. This assumes that ffmpeg is installed and in
    the system's PATH environment variable.
    """

    def __init__(self, resolution, fps, destination_ip, destination_port):
        type = platform.machine()
        is_pi = "aarch64" in type or "arm" in type

        # h264_v4l2m2m is a codec for Arm/Pis which can use hardware acceleration
        output_codec = "h264_v4l2m2m" if is_pi else "mjpeg"
        hwaccel = self.get_hwaccel()

        command = ["ffmpeg",
                   "-re",                   # Real time
                   "-hwaccel", hwaccel,     # Use hwaccel if you don't want to suffer
                   "-f", "rawvideo",        # Raw video format (No container like with mjpeg or h264)
                   "-vcodec", "rawvideo",   # Raw video codec needed for rawvideo format
                   "-pix_fmt", "bgr24",     # Input format is bgr24 (blue green red with 8 bit channels)
                   "-s", f"{resolution[0]}x{resolution[1]}",
                   "-r", f"{fps}",
                   "-i", "-",               # FFMPEG Input from stdin pipe
                   "-an",                   # No audio
                   "-vcodec", output_codec, # Output codec
                   "-f", "mjpeg",           # Motion jpeg output for stream
                   "udp://" + destination_ip + ":" + destination_port + "?pkt_size=1316"
                   ]
        
        self.proc = subprocess.Popen(command, stdin=subprocess.PIPE)

    def get_hwaccel(self):
        os_name = os.name
        if os_name == "Windows":
            return "d3d11va"
        else:
            return "drm"

    def stop(self):
        if hasattr(self, "proc"):
            self.proc.stdin.close()
            self.proc.terminate()

    def __del__(self):
        self.stop()

    def __call__(self, frame):
        self.proc.stdin.write(frame.tobytes())
