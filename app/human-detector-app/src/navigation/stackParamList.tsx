import { NavigatorScreenParams } from '@react-navigation/native';
import { BLEParamList } from './bleParamList';
import Notification from '../../classes/Notification';

export type RootStackParamList = {
  Login: undefined;
  Groups: undefined;
  Cameras: undefined;
  Notifications: { notifications: Notification[] };
  Snapshot: { snapshotId: string };
  CameraRegistration: NavigatorScreenParams<BLEParamList>;
};
