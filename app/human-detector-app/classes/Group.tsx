import * as React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Camera from './Camera';


export default class Group{
    groupName:string
    groupID:string
    cameras:Camera[]

    constructor(groupName:string, groupID:string){
        this.groupName = groupName
        this.groupID = groupID
        this.cameras = new Array()
    }
}

export function renameGroup(newName:string, group:Group): Group {
    return new Group('name', 'ID')       
}

export function addToGroup(newCam:Camera, group:Group): Group {
    return new Group('name', 'ID') 
}