import axios from 'axios';
import { baseUrl, config, resolvePromiseWithLogs } from '../core';

const authUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
    return resolvePromiseWithLogs(axios.post(authUrl, { username, password }, config), 'login');
}
