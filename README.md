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

## Deploying to Raspberry Pi

Create an SD card with Raspian Lite 64-bit. Then run the below on the Pi:

```
# Update everything on the pi to latest
sudo apt update && sudo apt upgrade
# Install required packages
sudo apt install git ffmpeg

# Optionally install virtualenv if the Pi is used for other projects
sudo apt install virtualenv

# Download project
git clone https://github.com/tucker-moore/human-detector.git
cd human-detector/camera

# Optionally use virtualenv to not mix Python dependencies with other projects
virtualenv .env
source .env/bin/activate # This needs to be ran everytime you login to the Pi!

# Install python requirements
make pi-install

# Run detector
python src/main.py
```

### Requirements

The below are installed when running `make install`:

* Opencv-Python: OpenCV can read images and camera streams. Contains lots of computer vision functionality
* Requests: HTTPS request library
* Behave: Behavior tests

## Mobile Application Tests

To test the mobile application, you must have `node` and `npm` installed.

To run the mobile application tests, when in the directory `/human-detector/app/human-detector-app/`, you can run `npm test`.  This command will both run unit tests, and behavior tests through jest and jest-cucumber.

```
cd app/human-detector-app

npm install

npm test

npm run testBDD
```

To run the tests, make sure to install the dependencies of the project using `npm install`.

To run only behavior tests through jest-cucumber, you can use the command `npm run testBDD` which will run all the cucumber tests with corresponding `.feature` files.

## Running the Mobile Application

To run the app, you must have the expo cli installed on your machine. You also must set the Keycloak environment variable for authentication. 

```
npm install -g expo-cli // install the expo-cli if you haven't already for glpbal expo cli
// You can also install as a dev dependency with npm install expo-cli --save-dev and use npx with expo for local expo cli

cd app/human-detector-app // enter the mobile app directry

npm install //install dependencies

KEYCLOAK_URL=<keycloakUrl> expo start //start the mobile application
```


## Testing the Backend

Running tests for the backend requires installing `node` and `npm`.
It may work with older versions, but it is confirmed working on NodeJS 16.5.1 LTS.
Once you have `node` and `npm` installed, navigate to `server/backend` and follow
the instructions in the README for testing.
