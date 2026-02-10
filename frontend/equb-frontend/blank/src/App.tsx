import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Dashboard from './pages/Dashboard';
import MyEqubs from './pages/MyEqubs';
import EqubDetails from './pages/EqubDetails';
import Ledger from './pages/Ledger';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Members from './pages/Members';
import RegisterMember from './pages/RegisterMember';
import RegistrationSuccess from './pages/RegistrationSuccess';
import MemberInsights from './pages/MemberInsights';
import ForgotPassword from './pages/ForgotPassword';
import RegisterAdmin from './pages/RegisterAdmin';

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

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register-admin">
          <RegisterAdmin />
        </Route>
        <Route exact path="/forgot-password">
          <ForgotPassword />
        </Route>
        <Route exact path="/dashboard">
          <Dashboard />
        </Route>
        <Route exact path="/equbs">
          <MyEqubs />
        </Route>
        <Route exact path="/equbs/:id">
          <EqubDetails />
        </Route>
        <Route exact path="/ledger">
          <Ledger />
        </Route>
        <Route exact path="/setup">
          <Profile />
        </Route>
        <Route exact path="/members">
          <Members />
        </Route>
        <Route exact path="/register-member">
          <RegisterMember />
        </Route>
        <Route exact path="/registration-success">
          <RegistrationSuccess />
        </Route>
        <Route exact path="/user-insights/:userId">
          <MemberInsights />
        </Route>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
