import React, {useCallback, useEffect ,useReducer} from "react";
import {FlightProps} from "./FlightProps";
import PropTypes from 'prop-types'
import {getLogger} from "../core";
import {createFlight, getFlights, newWebSocket, updateFlight} from "./FlightApi";

type SaveFlightFunction = (flight: FlightProps) => Promise<any>;

const log = getLogger('FlightProvider');

export interface FlightsState {
    flights?: FlightProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveFlight?: SaveFlightFunction,
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
                const index = flights.findIndex(fl => fl.id === flight.id);
                if (index === -1) {
                    flights.splice(0, 0, flight);
                } else {
                    flights[index] = flight;
                }
                return { ...state, flights, saving: false };
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
    const [state, dispatch] = useReducer(reducer, initialState);
    const { flights, fetching, fetchingError, saving, savingError} = state;
    useEffect(getFlightsEffect, []);
    useEffect(wsEffect, []);
    const saveFlight = useCallback<SaveFlightFunction>(saveFlightCallback, []);
    const value = { flights, fetching, fetchingError, saving, savingError, saveFlight };
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

            try {
                log('fetchFlights started');
                dispatch({ type: FETCH_FLIGHTS_STARTED });
                const flights = await getFlights();
                log('fetchFlights succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_FLIGHTS_SUCCEEDED, payload: { flights } });
                }
            } catch (error) {
                log('fetchFlights failed');
                dispatch({ type: FETCH_FLIGHTS_FAILED, payload: { error } });
            }
        }
    }

    async function saveFlightCallback(flight: FlightProps) {
        try {
            log('saveFlight started');
            dispatch({ type: SAVE_FLIGHT_STARTED });
            const savedFlight = await (flight.id ? updateFlight(flight) : createFlight(flight));
            log('saveFlight succeeded');
            dispatch({ type: SAVE_FLIGHT_SUCCEEDED, payload: { flight: savedFlight } });
        } catch (error) {
            log('saveFlight failed');
            dispatch({ type: SAVE_FLIGHT_FAILED, payload: { error } });
        }
    }
    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { flight }} = message;
            log(`ws message, flight ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_FLIGHT_SUCCEEDED, payload: { flight } });
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
}
