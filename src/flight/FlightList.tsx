import React, {useContext} from "react";
import {
    IonContent,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonFab,
    IonFabButton,
    IonIcon, IonLoading
} from "@ionic/react";
import {FlightContext} from "./FlightsProvider"
import Flight from "./Flight";
import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {add} from "ionicons/icons";

const log = getLogger('FlightList');

const FlightsList: React.FC<RouteComponentProps> = ({history}) => {
    const {flights, fetching, fetchingError} = useContext(FlightContext);
    log('render');
    // console.log(flights)
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flight App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching flights" />
                {flights && (
                    <IonList>
                        {flights.map(({id,name:text,noPassengers ,dateOfFlight,isFull}) =>
                        {
                                return(<Flight key={id} id={id} name={text} noPassengers={noPassengers} dateOfFlight={dateOfFlight} isFull={isFull} onEdit={ id =>history.push(`/flight/${id}`)
                                } />)} )}
                    </IonList>
                )}
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
