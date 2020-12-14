import React, {useCallback, useContext, useEffect, useReducer} from "react";
import {FlightProps, StatusType} from "./FlightProps";
import PropTypes from 'prop-types'
import {getLogger} from "../core";
import {createFlight, getFlights, newWebSocket, updateFlight} from "./FlightApi";
import {AuthContext} from "../authentification";
import {Plugins} from "@capacitor/core";

const { Storage } = Plugins;

type SaveFlightFunction = (flight: FlightProps) => Promise<any>;
type UploadOnServerFunction = () => Promise<any>;

const log = getLogger('FlightProvider');

export interface FlightsState {
    flights?: FlightProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveFlight?: SaveFlightFunction,
    uploadOnServer?: UploadOnServerFunction,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: FlightsState = {
    fetching: false,
    saving: false,
};

const FETCH_FLIGHTS_STARTED = 'FETCH_FLIGHTS_STARTED';
const FETCH_FLIGHTS_SUCCEEDED = 'FETCH_FLIGHTS_SUCCEEDED';
const FETCH_FLIGHTS_FAILED = 'FETCH_FLIGHTS_FAILED';
const SAVE_FLIGHT_STARTED = 'SAVE_FLIGHT_STARTED';
const SAVE_FLIGHT_SUCCEEDED = 'SAVE_FLIGHT_SUCCEEDED';
const SAVE_FLIGHT_FAILED = 'SAVE_FLIGHT_FAILED';
const SAVE_FLIGHT_LOCAL = 'SAVE_FLIGHT_LOCAL';


const reducer: (state: FlightsState, action: ActionProps) => FlightsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_FLIGHTS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_FLIGHTS_SUCCEEDED:
                return { ...state, flights: payload.flights, fetching: false };
            case FETCH_FLIGHTS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_FLIGHT_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_FLIGHT_SUCCEEDED:
                const flights = [...(state.flights || [])];
                const flight = payload.flight;
                const index = flights.findIndex(fl => fl._id === flight._id);
                if (index === -1) {
                    flights.splice(0, 0, flight);
                } else {
                    flights[index] = flight;
                }
                return { ...state, flights, saving: false, savedLocal: false };

            case SAVE_FLIGHT_LOCAL:
                const flights1 = [...(state.flights || [])]; //TODO: RENAME THIS
                const flight1 = payload.flight;
                // console.log('flight1')
                // console.log(flight1)
                const index1 = flights1.findIndex(fl => fl._id === flight1._id);
                if (index1 === -1) {
                    flights1.splice(0, 0, flight1);
                } else {
                    flights1[index1] = flight1;
                }
                return { ...state, flights: flights1, saving: false, savedLocal: true };
            case SAVE_FLIGHT_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

interface FlightProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const FlightContext = React.createContext<FlightsState>(initialState);

export const FlightProvider: React.FC<FlightProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { flights, fetching, fetchingError, saving, savingError} = state;
    useEffect(getFlightsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveFlight = useCallback<SaveFlightFunction>(saveFlightCallback, [token]);
    const uploadOnServer = useCallback<UploadOnServerFunction>(uploadOnServerCallback, [token]);
    const value = { flights, fetching, fetchingError, saving, savingError, saveFlight, uploadOnServer};
    log('returns');
    return (
        <FlightContext.Provider value={value}>
            {children}
        </FlightContext.Provider>
    );

    function getFlightsEffect() {
        let canceled = false;
        fetchFlights();
        return () => {
            canceled = true;
        }

        async function fetchFlights() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchFlights started');
                dispatch({ type: FETCH_FLIGHTS_STARTED });
                const flights = await getFlights(token);
                log('fetchFlights succeeded');
                await Storage.set({key: 'flights', value: JSON.stringify(flights) });
                if (!canceled) {
                    dispatch({ type: FETCH_FLIGHTS_SUCCEEDED, payload: { flights } });
                }
            } catch (error) {
                log('fetchFlights failed');
                const flightsStore = await Storage.get({ key: 'flights'})
                if (flightsStore) {
                    let flights: FlightProps[] = JSON.parse(flightsStore.value!);
                    dispatch( {type: FETCH_FLIGHTS_SUCCEEDED, payload: { flights } });
                }
                else {
                    dispatch({ type: FETCH_FLIGHTS_FAILED, payload: { error } });
                }
            }
        }
    }

    function randomString(length = 8) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return str;
    }

    async function saveFlightCallback(flight: FlightProps) {
        try {
            log('saveFlight started');
            dispatch({ type: SAVE_FLIGHT_STARTED });
            const savedFlight = await (flight._id ? updateFlight(token, flight) : createFlight(token, flight));
            log('saveFlight succeeded');
            dispatch({ type: SAVE_FLIGHT_SUCCEEDED, payload: { flight: savedFlight } });
        } catch (error) {
            log('saveFlight failed');
            log('trying to save on local storage');
            const flightsStore = await Storage.get({ key: 'flights'})
            if (flightsStore) {
                flight.isOffline = true;
                let flights: FlightProps[] = JSON.parse(flightsStore.value!);
                let tmpFlight = flights.filter( fl => fl._id === flight._id);
                console.log('tmp flight: ');
                console.log(tmpFlight);
                let savedFlight;
                if (tmpFlight.length > 0) {
                    //update
                    flights = flights.filter(fl => fl._id !== flight._id);
                    flight.status = StatusType.UPDATED;
                } else {
                    //save
                    flight.status = StatusType.SAVED;
                    flight._id = randomString(Math.random() * 50);
                }
                flights.push(flight);
                await Storage.set({ key: 'flights', value: JSON.stringify(flights)});
                savedFlight = flight;
                alert('Zbot salvat local');
                dispatch({ type: SAVE_FLIGHT_LOCAL, payload: { flight: savedFlight}});

            }
            else {
                dispatch({ type: SAVE_FLIGHT_FAILED, payload: { error } });
            }
        }
    }

    async function uploadOnServerCallback() {
        let storageFlights = await Storage.get( { key:'flights'} );
        let flights:FlightProps[] = JSON.parse(storageFlights.value!);
        if (flights) {
            let updatedFlights = flights.filter(fl => fl.isOffline);
            updatedFlights.forEach(flight => {
                let savedFlight;
                const flightStatus = flight.status;
                flight.status = undefined;
                flight.isOffline = undefined;
                switch (flightStatus) {
                    case StatusType.SAVED:
                        savedFlight = createFlight(token, flight);
                        break;
                    case StatusType.DELETED:
                        //
                        break;
                    case StatusType.UPDATED:
                        savedFlight = updateFlight(token, flight);
                        break;
                    default:
                        //
                        break;
                }
                savedFlight?.then(fl => {
                    dispatch({ type:SAVE_FLIGHT_SUCCEEDED, payload: {flight} })
                    })
                    .catch(err => console.log(err));
            })
            console.log(updatedFlights);
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()){
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: flight} = message;
                log(`ws message, flight ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch( {type: SAVE_FLIGHT_SUCCEEDED, payload: { flight }});
                }
            });
        }
        return () => {
          log('wsEffect- disconnecting');
          canceled = true;
          closeWebSocket?.();
        };
    }
}
