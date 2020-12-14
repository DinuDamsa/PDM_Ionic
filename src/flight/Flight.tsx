import React from "react";
import { FlightProps } from "./FlightProps"
import {IonItem, IonLabel} from "@ionic/react";

interface FlightPropsWrapper extends FlightProps{
    onEdit: (_id?: string) =>void;
}

const Flight: React.FC<FlightPropsWrapper> = ({_id,noPassengers,name,dateOfFlight,isFull, onEdit})=>{
    return (
        <IonItem onClick={() => {onEdit(_id)}}>
            <IonLabel>
                {name}
            </IonLabel>
        </IonItem>
    );
};

export default Flight;
