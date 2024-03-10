import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice} from '@reduxjs/toolkit';
import {persistStore} from 'redux-persist';
export const appReducer = createSlice({
  name: 'users',
  initialState: {
    userDetails: null,
    systemTheme: 'Dark Mode',
  },
  reducers: {
    updateUserData: (state, action) => {
      return {...state, [action.payload.prop]: action.payload.value};
    },
    purge: state => {
      var systemTheme = state.systemTheme;
      AsyncStorage.removeItem('persist:root');
      return {
        userDetails: null,
        systemTheme,
      };
    },
  },
});

export const {updateUserData, purge} = appReducer.actions;

export const getPersistValues = state => state.users;

export default appReducer.reducer;
