import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {FlightList, FlightEdit} from './flight'
import {FlightProvider} from "./flight/FlightsProvider";

const App: React.FC = () => (
  <IonApp>
      <FlightProvider>
          <IonReactRouter>
              <IonRouterOutlet>
                  <Route path="/flights" component={FlightList} exact={true} />
                  <Route path="/flight" component={FlightEdit} exact={true} />
                  <Route path="/flight/:id" component={FlightEdit} exact={true} />
                  <Route exact path="/" render={() => <Redirect to="/flights" />} />
              </IonRouterOutlet>
          </IonReactRouter>
      </FlightProvider>

  </IonApp>
);

export default App;
