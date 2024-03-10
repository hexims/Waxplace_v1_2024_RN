import {applyMiddleware, createStore} from 'redux';

import logger from 'redux-logger';
import thunk from 'redux-thunk';
import reducers from '../reducers';

const middleware = [];
middleware.push(thunk);
if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
}

const store = createStore(reducers, {}, applyMiddleware(...middleware));

export default store;
