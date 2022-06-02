import * as React from 'react';
import renderer from 'react-test-renderer';
import { Alert, Button } from 'react-native';
import { searchForCameras, renameCamera, isCameraOnline, initializeCamera, deleteCamera, addCameraToGroup, removeCameraFromGroup, removeCameraFromAccount } from '../camera/Camera';
import Camera from '../camera/Camera';
import Group from '../group/Group';

//renameCamera test values
//Critical values: Empty name as input, name over character limit as input, invalid character values.
it('renameCamera() Test 1: return same class with unchanged name', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    expect(renameCamera('', cameraObj)).toBe(cameraObj);
})

it('renameCamera() Test 2: return camera with unchanged name (empty input)', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    expect(renameCamera('Test camera name that will be over the limit', cameraObj).cameraName).toBe(cameraObj.cameraName);
})

it('renameCamera() Test 3: return camera with unchanged name (over the character limit input)', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    expect(renameCamera('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', cameraObj).cameraName).toBe(cameraObj.cameraName);
})

it('renameCamera() Test 4: return camera with changed name', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    newName = 'Living room';
    expect(renameCamera(newName, cameraObj).cameraName).toBe(newName);
})

it('renameCamera() Test 5: return camera with changed name', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    newName = 'Theater room';
    expect(renameCamera(newName, cameraObj).cameraName).toBe(newName);
})

it('renameCamera() Test 6: return camera with changed name at exact character limit', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    newName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(renameCamera(newName, cameraObj).cameraName).toBe(newName);
})

it('renameCamera() Test 7: return camera with changed name at 1 character', () => {
    //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    newName = 'a';
    expect(renameCamera(newName, cameraObj).cameraName).toBe(newName);
})
it('renameCamera() Test 8: return camera with unchanged name (invalid character)', () => {
        //character limit 30
    const cameraObj = new Camera("Camera 1", "ID");
    newName = '😮‍💨';
    expect(renameCamera(newName, cameraObj).cameraName).toBe(newName);
})

it('renameCamera() Test 9: return camera with unchanged name (invalid character)', () => {
    //character limit 30
const cameraObj = new Camera("Camera 1", "ID");
newName = 'dfsfss😮‍💨dawdawd';
expect(renameCamera(newName, cameraObj).cameraName).toBe(newName);
})

//searchForCameras()
//Critical values: there are cameras searching, no cameras searching, 1 camera searching

//isCameraOnline()
//Critical values: camera is online, camera is offline, camera doesn't exist

//initializeCamera()
//Critical values: camera already initialized in the server


//deleteCamera()
//Critical values: camera doesnt exist

it('deleteCamera() Test 1: Don\'t delete camera, doesn\'t exist', () => {
    const cameraArr = new Array(5);
    cameraArr[0] = new Camera('name', 'ID1')
    cameraArr[1] = new Camera('name', 'ID2')
    cameraArr[2] = new Camera('name', 'ID3')
    expect(deleteCamera(new Camera, 'DeletedID')).toBe(cameraArr)
})

it('deleteCamera Test 2: Delete camera from Camera List', () => {
    const cameraArr = new Array(5);
    cameraArr[0] = new Camera('name', 'ID1')
    cameraArr[1] = new Camera('delete this cam', 'DeletedID')
    cameraArr[2] = new Camera('name', 'ID2')
    expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr)
})

it('deleteCamera Test 3: Delete camera from Camera List', () => {
    const cameraArr = new Array(5);
    cameraArr[0] = new Camera('name', 'ID1')
    cameraArr[1] = new Camera('name', 'ID2')
    cameraArr[2] = new Camera('delete this cam', 'DeletedID')
    expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr)
})

it('deleteCamera Test 4: Delete camera from Camera List', () => {
    const cameraArr = new Array(5);
    cameraArr[0] = new Camera('delete this cam', 'DeletedID')
    cameraArr[1] = new Camera('name', 'ID1')
    cameraArr[2] = new Camera('name', 'ID2')
    expect(deleteCamera(cameraArr, 'DeletedID')).toBe(cameraArr)
})

//addCameraToGroup()
//Critical values: Group has max number of cameras, adding to empty group, camera is already assigned a group.

it('addCameraToGroup() Test 1: Group is full, don\'t update group list', () => {
    const group = new Group('testname', 'testID')
    const cam = new Camera('name', 'ID')
    addCameraToGroup(new Camera('name', 'ID2'), group)
    addCameraToGroup(new Camera('name', 'ID3'), group)
    addCameraToGroup(new Camera('name', 'ID4'), group)
    //max limit
    expect(addCameraToGroup(cam, group)).toBe(group)
})

it('addCameraToGroup() Test 2: Adding to empty group', () => {
    const group = new Group('name', 'ID')
    const cam = new Camera('name', 'ID')
    expect(addCameraToGroup(cam, group)).toBe(group);
})