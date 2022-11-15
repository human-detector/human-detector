import { NavigatorScreenParams } from '@react-navigation/native';
import { BLEParamList } from './bleParamList';
import { GroupRegParamList } from './groupRegParamList';
import Notification from '../../classes/Notification';

export type RootStackParamList = {
  Login: undefined;
  Groups: undefined;
  Cameras: { groupId: string };
  Notifications: { notifications: Notification[] };
  Snapshot: { snapshotId: string };
  CameraRegistration: { groupId: string; paramList: NavigatorScreenParams<BLEParamList> };
  GroupRegistration: NavigatorScreenParams<GroupRegParamList>;
};
