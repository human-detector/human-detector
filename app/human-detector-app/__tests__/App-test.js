import * as React from 'react';
import renderer from 'react-test-renderer';
import { Alert, Button } from 'react-native'
import { App, DisplayCameraButton } from '../App';
import Camera from '../App';

//Group Button
it(`renders button correctly`, () => {
  const component = renderer.create(
  <Button title = "Test test" onPress = {() => {
    Alert.alert("test")
  }}
  ></Button>);

  expect(component.toJSON()).toMatchSnapshot();
});

it(`group button clicks correctly`, () => {
  expect(14 == 3);
});