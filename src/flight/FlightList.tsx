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
    IonIcon,
    IonLoading,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
    IonButton,
    IonSelect,
    IonSelectOption
} from "@ionic/react";
import {FlightContext} from "./FlightsProvider"
import Flight from "./Flight";
import {getLogger} from "../core";
import {Redirect, RouteComponentProps} from "react-router";
import {add} from "ionicons/icons";
import {FlightProps} from "./FlightProps";
import {AuthContext} from "../authentification";

const log = getLogger('FlightList');

const FlightsList: React.FC<RouteComponentProps> = ({history}) => {
    const {flights, fetching, fetchingError} = useContext(FlightContext);
    const { logout } = useContext(AuthContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [pos, setPos] = useState(20);
    const [flightsShowed, setFlightsShowed] = useState<FlightProps[]>([]);
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (flights?.length) {
            setFlightsShowed(flights.slice(0, 20));
        }

    }, [flights]);

    function searchNext($event: CustomEvent<void>) {
        log('More flights are displayed');
        console.log(flightsShowed);
        if (flights && pos < flights.length) {
            setFlightsShowed([...flightsShowed, ...flights.slice(pos, pos + 20)]);
            setPos(pos + 20);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{ pathname: '/login'}}/>;
    }

    useEffect(() => {
        if (filter && flights) {
            log("Filter value:", filter);
            setFlightsShowed(flights.filter((flight) => flight.isFull ===  (filter === "true")).slice(0,20));
        }
        else if (flights){
            setFlightsShowed(flights.slice(0,20));
        }
    }, [flights, filter]);

    useEffect(() => {
        if (flights && searchText) {
            setFlightsShowed(flights.filter(flight => {
                return flight.name.startsWith(searchText);
            }).slice(0,20)
        )}
        else if (flights){
            setFlightsShowed(flights.slice(0,20));
        }},[flights, searchText] );

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flight App</IonTitle>
                    {/*<IonFab vertical="top" horizontal="end" slot="fixed">*/}
                        <IonButton onClick={handleLogout}  >Logout</IonButton>
                    {/*</IonFab>*/}
                </IonToolbar>
            </IonHeader>
            <IonSearchbar value={searchText} onIonChange={e => setSearchText(e.detail.value!)} animated/>
            <IonSelect value={filter} placeholder="Select isFull" onIonChange={e => setFilter(e.detail.value)}>
                <IonSelectOption key="true" value="true">true</IonSelectOption>
                <IonSelectOption key="false" value="false">false</IonSelectOption>
                <IonSelectOption key="none" value="">all</IonSelectOption>
            </IonSelect>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching flights" />
                {flightsShowed && (
                    <IonList>
                        {flightsShowed.map(({_id,name:text,noPassengers ,dateOfFlight,isFull}) =>
                        {
                                return(<Flight key={_id} _id={_id} name={text} noPassengers={noPassengers} dateOfFlight={dateOfFlight} isFull={isFull} onEdit={ _id =>history.push(`/flight/${_id}`)
                                } />)} )}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="50px" disabled={disableInfiniteScroll}
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
