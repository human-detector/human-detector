import { NavigatorScreenParams } from '@react-navigation/native';
import { BLEParamList } from './bleParamList';
import { GroupRegParamList } from './groupRegParamList';

export type RootStackParamList = {
  Login: undefined;
  Groups: undefined;
  Cameras: undefined;
  CameraRegistration: NavigatorScreenParams<BLEParamList>;
  GroupRegistration: NavigatorScreenParams<GroupRegParamList>;
};
