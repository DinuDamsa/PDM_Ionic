import {getLogger} from "../core";
import React, {useContext, useState} from "react";
import {Redirect, RouteComponentProps} from "react-router";
import {AuthContext} from "./AuthProvider";
import {IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle} from "@ionic/react";


const log = getLogger('Login');

interface LoginState {
    username? :string;
    password? :string;
}

export const Login: React.FC<RouteComponentProps> = ({history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;
    const handleLogin = () => {
        log('handleLogin');
        login?.(username, password);
    };
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/'}}/>
    }
    return (
        <IonPage>
            <IonHeader>
                <IonTitle>Login</IonTitle>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={e => setState({
                        ...state,
                        username: e.detail.value || ''
                    })}/>
                <IonInput
                    placeholder="Password"
                    value={password}
                    onIonChange={e => setState({
                        ...state,
                        password: e.detail.value || ''
                    })}/>
                <IonLoading isOpen={isAuthenticated}/>
                {
                    authenticationError && (
                        <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
}
