import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import globalVar from './globalVar/varReducer';
import log from './log/logReducer';
import menu from './menu/menuReducer';
import param from './param/paramReducer';

const store = createStore(
	combineReducers({ globalVar, log, menu, param }),
	compose(applyMiddleware(thunk))
);

export default store;
