import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';
import reportWebVitals from './reportWebVitals';
import {Helmet} from "react-helmet";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyDTr0t1pqHwjXrF1s-Mn4zeyznMwdKDwQg&v" />
    </Helmet>
    <GoogleReCaptchaProvider reCaptchaKey="6LdiemAiAAAAAM1fsqHTvMISTwDYKrIBgZposo2y">
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
