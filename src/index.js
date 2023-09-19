import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Helmet} from "react-helmet";
import { AuthProvider } from 'oidc-react';

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyDTr0t1pqHwjXrF1s-Mn4zeyznMwdKDwQg&v" />
    </Helmet>
    <AuthProvider
        authority="https://sso.tuiasi.ro/auth/realms/TUIASI"
        clientId="support.campus.tuiasi.ro"
        redirectUri={window.location.origin + window.location.pathname}
        onSignIn={(user) => {
          // the `user` prop is actually the data the app received from `/userinfo` endpoint.
          // history.go('/dashboard', user);
        }}
      >
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
