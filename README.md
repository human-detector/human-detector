# Human Detector Camera

This project is made up of three projects - Mobile app, Server, and Camera services. Testing instructions for all three are provided below.

## Testing Camera Project

This contains all the services which will run on the Raspberry Pi. This currently just includes the camera service which tries to detect people.

```
cd camera
# install opencv, behave, and requests
make install
# run unit tests
make test
# run behavior tests
make bdd
```

These tests assume that `python3` is installed and that both `python3` and `pip3` both are valid commands.

### Requirements

The below are installed when running `make install`:

* Opencv-Python: OpenCV can read images and camera streams. Contains lots of computer vision functionality
* Requests: HTTPS request library
* Behave: Behavior tests

