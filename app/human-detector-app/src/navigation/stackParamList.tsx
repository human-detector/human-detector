import { NavigatorScreenParams } from "@react-navigation/native";
import { BLEParamList } from "./BLEParamList"

export type RootStackParamList = {
    Login: undefined
    Groups: undefined;
    Cameras: undefined;
    CameraRegistration: NavigatorScreenParams<BLEParamList>;
};