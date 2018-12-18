import React from 'react';
import ReactDOM from 'react-dom';
// import logo from '../assets/images/logo.svg';
// import Login from './features/login/login.component';
import SubmissionView from './features/submission/submissionView.component';
import './stylesheets/main.scss';

const App = () => <SubmissionView />;

ReactDOM.render(<App />, document.getElementById('app'));
