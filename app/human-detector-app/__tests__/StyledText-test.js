import * as React from 'react';
import renderer from 'react-test-renderer';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import App from '../App';

//Group Button
it(`renders button correctly`, () => {
  let test = 3
  expect(test == 4);
});

it(`group button clicks correctly`, () => {
  expect(14 == 3);
});

it(`test button`, () => {
  const component = renderer.create(<DisplayCameraButton></DisplayCameraButton>)
  expect(component.toJSON()).toMatchSnapshot();
});
