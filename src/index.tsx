import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import '@alicloud/console-components/dist/wind.css';
import './index.css';
import store from './redux';
import * as serviceWorker from './serviceWorker';
// import reportWebVitals from './reportWebVitals';

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
);

serviceWorker.unregister();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
