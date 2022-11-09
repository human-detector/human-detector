import { createContext } from 'react';
import User from '../classes/User';

// eslint-disable-next-line import/prefer-default-export
export const UserContext = createContext<User | null>(null);
