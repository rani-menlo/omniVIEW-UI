import React from 'react';
import ReactDOM from 'react-dom';
// import logo from '/images/logo.svg';
// import Login from './features/login/login.component';
import './stylesheets/main.scss';
import Routes from './routes';
import * as serviceWorker from './serviceWorker';

const App = () => <Routes />;

ReactDOM.render(<App />, document.getElementById('app'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

