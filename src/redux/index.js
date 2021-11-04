import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import user from './user';
import globalVar from './globalVar/varReducer';
import log from './log/logReducer';
import menu from './menu/menuReducer';

const store = createStore(
	combineReducers({ user, globalVar, log, menu }),
	compose(applyMiddleware(thunk))
);

export default store;
