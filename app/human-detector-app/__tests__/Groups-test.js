import * as React from 'react';
import renderer from 'react-test-renderer';
import { Alert, Button } from 'react-native';
import { GroupOnPress, GroupDisplayButton } from '../screens/GroupScreen';
import Group from '../screens/GroupScreen';


//Method tests
it('GroupScreen Test 1: GroupOnPress() no cameras', () => {
    const component = renderer.create(GroupOnPress());
    expect(component.toJSON()).toMatchSnapshot();
})


it('GroupButton Test 2: GroupOnPress() 1 Camera', () => {
    const component = renderer.create(GroupOnPress());
    expect(component.toJSON()).toMatchSnapshot();
})

it('GroupButton Test 3: GroupOnPress() 5 Cameras', () => {
    const component = renderer.create(GroupOnPress());
    expect(component.toJSON()).toMatchSnapshot();
})

it('GroupButton Test 4: GroupDisplayButton() empty group', () => {
    const component = renderer.create(GroupOnPress());
    expect(component.toJSON()).toMatchSnapshot();
})

it('GroupScreen Test 5: GroupDisplayButton regular group', () => {
    const component = renderer.create(GroupOnPress());
    expect(component.toJSON()).toMatchSnapshot();
})