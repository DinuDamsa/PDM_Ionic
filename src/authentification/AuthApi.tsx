import {baseUrl, config, resolvePromiseWithLogs} from "../core";
import axios from 'axios';


const authUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
    return resolvePromiseWithLogs(axios.post(authUrl, { username, password }, config), 'login');
}
