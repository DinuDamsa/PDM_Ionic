import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel, IonCheckbox, IonDatetime
} from '@ionic/react';
import {getLogger} from '../core';
import {FlightContext} from './FlightsProvider';
import {RouteComponentProps} from 'react-router';
import {FlightProps} from './FlightProps';




const log = getLogger('FlightEdit');

interface FlightEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const FlightEdit: React.FC<FlightEditProps> = ({ history, match }) => {
    const { flights, saving, savingError, saveFlight } = useContext(FlightContext);
    const [name, setName] = useState('');
    const [noPassengers, setNoPassengers] = useState(0);
    const [dateOfFlight, setDateOfFlight] = useState('2020-10-10 20:10');
    const [isFull, setIsFull] = useState(false);

    const [flight, setFlight] = useState<FlightProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const flight = flights?.find(fl => fl.id === routeId);
        setFlight(flight);
        if (flight) {
            setName(flight.name);
            setNoPassengers(flight.noPassengers || 0);
            setIsFull(flight.isFull || false);
            // @ts-ignore
            setDateOfFlight(flight.dateOfFlight || '2020-10-10 20:10');
        }
    }, [match.params.id, flights]);
    const handleSave = () => {
        const editedFlight = flight ? { ...flight, name, noPassengers, isFull, dateOfFlight } : { name, noPassengers, isFull, dateOfFlight };
        saveFlight && saveFlight(editedFlight).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel>Nume zbor</IonLabel>
                    <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                </IonItem>

                <IonItem>
                    <IonLabel>Numar pasageri</IonLabel>
                    <IonInput value={noPassengers} onIonChange={e => setNoPassengers( Number.parseInt(e.detail.value || '0'))} />
                </IonItem>

                <IonItem>
                    <IonLabel>Data zborului </IonLabel>
                    <IonDatetime displayFormat="YYYY-MM-DD HH:mm" value={dateOfFlight} onIonChange={e => setDateOfFlight( String(e.detail.value || '0'))} />
                </IonItem>

                <IonItem>
                    <IonLabel>Zbor ocupat complet </IonLabel>
                    <IonCheckbox checked={isFull} onIonChange={e => setIsFull(e.detail.checked)} />
                </IonItem>

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save flight'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default FlightEdit;
