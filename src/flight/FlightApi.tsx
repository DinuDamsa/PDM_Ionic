import axios from 'axios';
import {FlightProps} from "./FlightProps";
import {authConfig, baseUrl, getLogger, resolvePromiseWithLogs} from "../core";

const flightUrl = `http://${baseUrl}/api/flight`;

export const getFlights: (token: string) => Promise<FlightProps[]> = token => {
    return resolvePromiseWithLogs(axios.get(flightUrl, authConfig(token)), 'getFlights');
}

export const createFlight: (token:string, flight: FlightProps) => Promise<FlightProps[]> = (token, flight) => {
    return resolvePromiseWithLogs(axios.post(flightUrl, flight, authConfig(token)), 'createFlight');
}

export const updateFlight: (token:string, flight: FlightProps) => Promise<FlightProps[]> = (token, flight) => {
    return resolvePromiseWithLogs(axios.put(`${flightUrl}/${flight._id}`, flight, authConfig(token)), 'updateFlight');
}

interface MessageData {
    type: string;
    payload: FlightProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: { token }}));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
