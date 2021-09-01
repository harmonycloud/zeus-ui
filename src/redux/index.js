import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import user from './user';
import globalVar from './globalVar/varReducer';
import log from './log/logReducer';

const store = createStore(
	combineReducers({ user, globalVar, log }),
	compose(applyMiddleware(thunk))
);

export default store;
