import {createContext} from 'react';
import { BLEService } from '../src/ble/bleServices';

// eslint-disable-next-line import/prefer-default-export
export const BLEContext = createContext<BLEService>(new BLEService());