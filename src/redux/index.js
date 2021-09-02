import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import user from './user';
import globalVar from './globalVar/varReducer';
import log from './log/logReducer';
import instanceList from './instanceList/instanceListReducer';

const store = createStore(
	combineReducers({ user, globalVar, log, instanceList }),
	compose(applyMiddleware(thunk))
);

export default store;
