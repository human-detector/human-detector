import * as React from 'react';
import renderer from 'react-test-renderer';
import { Alert, Button } from 'react-native';
import { renameGroup, addToGroup  } from '../classes/Group';
import Camera from '../classes/Camera';
import Group from '../classes/Group';


//renameGroup test values
//Critical values: Empty name as input, name over character limit as input, invalid character values.
it('renameGroup() Test 1: return same group with unchanged name', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    expect(renameGroup('', groupObj)).toBe(groupObj);
})

it('renameGroup() Test 2: return group with unchanged name (empty input)', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    expect(renameGroup('Test group name that will be over the limit', groupObj).groupName).toBe(groupObj.groupName);
})

it('renameGroup() Test 3: return group with unchanged name (over the character limit input)', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    expect(renameGroup('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', groupObj).groupName).toBe(groupObj.groupObj);
})

it('renameGroup() Test 4: return group with changed name', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    newName = 'Living room';
    expect(renameGroup(newName, groupObj).groupName).toBe(newName);
})

it('renameGroup() Test 5: return group with changed name', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    newName = 'Theater room';
    expect(renameGroup(newName, groupObj).groupName).toBe(newName);
})

it('renameGroup() Test 6: return group with changed name at exact character limit', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    newName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(renameGroup(newName, groupObj).groupName).toBe(newName);
})

it('renameGroup() Test 7: return group with changed name at 1 character', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    newName = 'a';
    expect(renameGroup(newName, groupObj).groupName).toBe(newName);
})
it('renameGroup() Test 8: return group with unchanged name (invalid character)', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    newName = '😮‍💨';
    expect(renameGroup(newName, groupObj).groupName).toBe("Group 1");
})

it('renameGroup() Test 9: return group with unchanged name (invalid character)', () => {
    //character limit 30
    const groupObj = new Group("Group 1", "ID");
    newName = 'dfsfss😮‍💨dawdawd';
    expect(renameGroup(newName, groupObj).groupName).toBe("Group 1");
})

//addToGroup()
//critical values: empty group(new group), there is no upper limit

it('addToGroup Test 1: empty group returns group with 1 camera', () => {
    const groupObj = new Group("Group 1", "ID")
    const addCamera = new Camera("Test camera", "ID")
    expect(addToGroup(addCamera, groupObj).cameras.length).toBe(1)
})

it('addToGroup Test 2: empty group returns group with 1 camera', () => {
    const groupObj = new Group("Group 1", "ID")
    const addCamera = new Camera("Test camera", "ID")
    expect(addToGroup(addCamera, groupObj).cameras[0]).toBe(addCamera)
})

it('addToGroup() Test 3: Group with cameras added camera', () => {
    const groupObj = new Group("Group 1", "ID")
    groupObj.cameras[0] = new Camera("Camera 1", "ID");
    groupObj.cameras[1] = new Camera("Camera 2", "ID2");
    const addCamera = new Camera("Test Camera", "ID3");
    expect(addToGroup(addCamera, groupObj).cameras[2]).toBe(addCamera)
})

it('addToGroup() Test 4: Group with cameras added camera', () => {
    const groupObj = new Group("Group 1", "ID")
    groupObj.cameras[0] = new Camera("Camera 1", "ID");
    groupObj.cameras[1] = new Camera("Camera 2", "ID2");
    groupObj.cameras[2] = new Camera("Camera 3", "ID3");
    groupObj.cameras[3] = new Camera("Camera 4", "ID4");
    groupObj.cameras[4] = new Camera("Camera 5", "ID5");
    groupObj.cameras[5] = new Camera("Camera 6", "ID6");
    groupObj.cameras[6] = new Camera("Camera 7", "ID7");
    groupObj.cameras[7] = new Camera("Camera 8", "ID8");
    const addCamera = new Camera("Test Camera", "ID9");
    expect(addToGroup(addCamera, groupObj).cameras[8]).toBe(addCamera)
})

