import {combineReducers} from 'redux';
import UserReducer from './UserReducer';
import persistReducer from './PersistReducer'

export default combineReducers({
  userReducer: UserReducer,
  
});
