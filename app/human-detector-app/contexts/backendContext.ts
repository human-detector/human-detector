import {createContext} from 'react';
import BackendService from '../services/backendService';

// eslint-disable-next-line import/prefer-default-export
export const BackendContext = createContext<BackendService | null>(null);