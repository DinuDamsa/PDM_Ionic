import React from "react";
import { FlightProps } from "./FlightProps"
import {IonItem, IonLabel} from "@ionic/react";

interface FlightPropsWrapper extends FlightProps{
    onEdit: (id?: string) =>void;
}

const Flight: React.FC<FlightPropsWrapper> = ({id,noPassengers,name,dateOfFlight,isFull, onEdit})=>{
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>
                {name}
            </IonLabel>
        </IonItem>
    );
};

export default Flight;
