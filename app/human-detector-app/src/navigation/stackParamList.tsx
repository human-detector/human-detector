import { NavigatorScreenParams } from '@react-navigation/native';
import { BLEParamList } from './bleParamList';
import { GroupRegParamList } from './groupRegParamList';

export type RootStackParamList = {
  Login: undefined;
  Groups: undefined;
  Cameras: { groupId: string };
  Notifications: { cams: string[] };
  Snapshot: { snapshotId: string };
  CameraRegistration: { groupId: string; paramList: NavigatorScreenParams<BLEParamList> };
  GroupRegistration: NavigatorScreenParams<GroupRegParamList>;
};
