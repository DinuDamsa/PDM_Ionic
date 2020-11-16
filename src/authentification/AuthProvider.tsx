import React, {useCallback, useEffect, useState} from "react";
import {getLogger} from "../core";
import PropTypes from 'prop-types'
import {login as LoginApi }from './AuthApi'

const log = getLogger('AuthProvider');

type loginCallback = (username?: string, password?: string) => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: loginCallback;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>(initialState);
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
    const login = useCallback<loginCallback>(loginCallbackFunction, []);
    useEffect(authenticationEffect, [pendingAuthentication])
    const value = { isAuthenticated, login, isAuthenticating, authenticationError, token };
    log('render')
    return (
      <AuthContext.Provider value={value}>
          {children}
      </AuthContext.Provider>
    );

    function loginCallbackFunction(username?: string, password?: string): void {
        log('login');
        setState({
           ...state,
           pendingAuthentication: true,
           username,
           password
        });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
        return () => {
            canceled= false;
        }

        async function authenticate() {
            if (!pendingAuthentication) {
                log('authenticate, !pendingAuthentication, return');
                return;
            }
            try{
                log('authenticate');
                setState({
                    ...state,
                    isAuthenticating: true,
                });
                const { username, password} = state;
                const { token } = await LoginApi(username, password);
                if (canceled){
                    log('authenticate canceled');
                    return;
                }
                log('authenticate succeeded');
                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (e) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                setState({
                    ...state,
                    authenticationError: e,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }
        }
    }
};
