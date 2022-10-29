import nock from 'nock';
import Camera, { deleteCamera, addCameraToGroup } from '../classes/Camera';
import Group from '../classes/Group';
import { apiLink, getUsersCamerasUrlExtension } from '../config/ServerConfig';

// renameCamera test values
// Critical values: Empty name as input, name over character limit as input, invalid character values.
it('renameCamera() Test 1: return same class with unchanged name', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  expect(cameraObj.renameCamera('')).toBe(cameraObj);
});

it('renameCamera() Test 2: return camera with unchanged name (empty input)', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  expect(cameraObj.renameCamera('Test camera name that will be over the limit').cameraName).toBe(
    cameraObj.cameraName
  );
});

it('renameCamera() Test 3: return camera with unchanged name (over the character limit input)', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  expect(cameraObj.renameCamera('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa').cameraName).toBe(
    cameraObj.cameraName
  );
});

it('renameCamera() Test 4: return camera with changed name', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  const newName: string = 'Living room';
  expect(cameraObj.renameCamera(newName).cameraName).toBe(newName);
});

it('renameCamera() Test 5: return camera with changed name', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  const newName: string = 'Theater room';
  expect(cameraObj.renameCamera(newName).cameraName).toBe(newName);
});

it('renameCamera() Test 6: return camera with changed name at exact character limit', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  const newName: string = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  expect(cameraObj.renameCamera(newName).cameraName).toBe(newName);
});

it('renameCamera() Test 7: return camera with changed name at 1 character', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  const newName: string = 'a';
  expect(cameraObj.renameCamera(newName).cameraName).toBe(newName);
});
it('renameCamera() Test 8: return camera with unchanged name (invalid character)', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  const newName: string = '😮‍💨';
  expect(cameraObj.renameCamera(newName).cameraName).toBe(newName);
});

it('renameCamera() Test 9: return camera with unchanged name (invalid character)', () => {
  // character limit 30
  const cameraObj: Camera = new Camera('0', 'Camera 1', 'ID');
  const newName: string = 'dfsfss😮‍💨dawdawd';
  expect(cameraObj.renameCamera(newName).cameraName).toBe(newName);
});

// searchForCameras()
// Critical values: there are cameras searching, no cameras searching, 1 camera searching

// isCameraOnline()
// Critical values: camera is online, camera is offline, camera doesn't exist
it('isCameraOnline() Test 1: camera is online', () => {
  const cam: Camera = new Camera('0', 'name', 'ID2');

  nock(apiLink).get(getUsersCamerasUrlExtension(cam.userId)).reply(200, 'false');

  expect(cam.isCameraOnline()).toBe(true);
});

it('isCameraOnline() Test 2: camera is offline', () => {
  const cam: Camera = new Camera('0', 'name', 'ID2');

  nock(apiLink).get(getUsersCamerasUrlExtension(cam.userId)).reply(200, 'true');

  expect(cam.isCameraOnline()).toBe(false);
});

// initializeCamera()
// Critical values: camera already initialized in the server

// deleteCamera()
// Critical values: camera doesnt exist

it("deleteCamera() Test 1: Don't delete camera, doesn't exist", () => {
  const cameraArr: Camera[] = new Array(5);
  cameraArr[0] = new Camera('0', 'name', 'ID1');
  cameraArr[1] = new Camera('0', 'name', 'ID2');
  cameraArr[2] = new Camera('0', 'name', 'ID3');
  expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr);
});

it('deleteCamera Test 2: Delete camera from Camera List', () => {
  const cameraArr: Camera[] = new Array(5);
  cameraArr[0] = new Camera('0', 'name', 'ID1');
  cameraArr[1] = new Camera('0', 'delete this cam', 'DeletedID');
  cameraArr[2] = new Camera('0', 'name', 'ID2');
  expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr);
});

it('deleteCamera Test 3: Delete camera from Camera List', () => {
  const cameraArr: Camera[] = new Array(5);
  cameraArr[0] = new Camera('0', 'name', 'ID1');
  cameraArr[1] = new Camera('0', 'name', 'ID2');
  cameraArr[2] = new Camera('0', 'delete this cam', 'DeletedID');
  expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr);
});

it('deleteCamera Test 4: Delete camera from Camera List', () => {
  const cameraArr: Camera[] = new Array(5);
  cameraArr[0] = new Camera('0', 'delete this cam', 'DeletedID');
  cameraArr[1] = new Camera('0', 'name', 'ID1');
  cameraArr[2] = new Camera('0', 'name', 'ID2');
  expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr);
});

// addCameraToGroup()
// Critical values: Group has max number of cameras, adding to empty group, camera is already assigned a group.

it("addCameraToGroup() Test 1: Group is full, don't update group list", () => {
  const group: Group = new Group('testname', 'testID');
  const cam: Camera = new Camera('0', 'name', 'ID');
  addCameraToGroup(new Camera('0', 'name', 'ID2'), group);
  addCameraToGroup(new Camera('0', 'name', 'ID3'), group);
  addCameraToGroup(new Camera('0', 'name', 'ID4'), group);
  // max limit
  expect(addCameraToGroup(cam, group)).toBe(group);
});

it('addCameraToGroup() Test 2: Adding to empty group', () => {
  const group = new Group('name', 'ID');
  const cam = new Camera('0', 'name', 'ID');
  expect(addCameraToGroup(cam, group)).toBe(group);
});
