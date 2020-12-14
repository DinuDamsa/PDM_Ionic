export interface FlightProps{
    _id?: string;
    noPassengers: number;
    name: string;
    dateOfFlight: string;
    isFull: boolean;
    isOffline?: boolean;
    status? : StatusType
}

export enum StatusType {
    SAVED,
    UPDATED,
    DELETED,
}
