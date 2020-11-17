import React, {useContext, useEffect, useState} from "react";
import {
    IonContent,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonFab,
    IonFabButton,
    IonIcon, IonLoading, IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar
} from "@ionic/react";
import {FlightContext} from "./FlightsProvider"
import Flight from "./Flight";
import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {add} from "ionicons/icons";
import {FlightProps} from "./FlightProps";

const log = getLogger('FlightList');

const FlightsList: React.FC<RouteComponentProps> = ({history}) => {
    const {flights, fetching, fetchingError} = useContext(FlightContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [pos, setPos] = useState(20);
    const [flightsShowed, setFlightsShowed] = useState<FlightProps[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (flights?.length) {
            setFlightsShowed(flights.slice(0, 20));
        }
    }, [flights]);

    function searchNext($event: CustomEvent<void>) {
        log('More flights are displayed');
        if (flights && pos < flights.length) {
            setFlightsShowed([...flightsShowed, ...flights.slice(pos, pos + 20)]);
            setPos(pos + 20);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
        if (flights) {
            setFlightsShowed(flights.filter(flight => {
                    if (searchText) {
                        return flight.name.startsWith(searchText);
                    } else {
                        return true;
                    }
                }))}},[flights, searchText] );

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flight App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonSearchbar value={searchText} onIonChange={e => setSearchText(e.detail.value!)} animated/>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching flights" />
                {flights && (
                    <IonList>
                        {flightsShowed.map(({_id,name:text,noPassengers ,dateOfFlight,isFull}) =>
                        {
                                return(<Flight key={_id} _id={_id} name={text} noPassengers={noPassengers} dateOfFlight={dateOfFlight} isFull={isFull} onEdit={ _id =>history.push(`/flight/${_id}`)
                                } />)} )}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="150px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingSpinner="bubbles"
                        loadingText="Loading more flights...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch flights'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/flight')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
}

export default FlightsList;
