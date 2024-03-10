import { Alert } from 'react-native';
import axios from 'axios';
import persistStorage from '../redux/store/persistStore';
import { BASEURL, GETVENDORNOTIFICATION } from './_apiUrls';
import OneSignal from 'react-native-onesignal';
import { purge } from '../redux/reducers/PersistReducer';
import * as StackNavigation from '../router/_StackNavigation';
import store from '../redux/store';

const getImage = path => {
  return { uri: BASEURL + path };
};

const getImageFullPath = path => {
  return BASEURL + path;
};

const instance = axios.create({
  baseURL: BASEURL,
  timeout: 6000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async config => {

    console.log(store.getState().userReducer?.ProfileRegistration?.bearer,store.getState())
    if (persistStorage.getState()?.userDetails?.bearer) {
      const token = persistStorage.getState().userDetails.bearer;

      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
    } else {
      config.headers.Authorization = 'Bearer ' + store.getState().userReducer?.ProfileRegistration?.bearer;
    }
    console.log(config);
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  response => {
    if (response.status > 400) {
      Alert.alert('', response?.message);
    }
    console.log(response?.request?.responseURL, response);
    return response;
  },
  error => {

    if (
      error?.response?.data?.message == 'token is not valid' &&
      StackNavigation?.stackNavigationRef?.getCurrentRoute()?.name !=
      'Authscreens'
    ) {
      OneSignal.removeExternalUserId(results => {
        // The results will contain push and email success statuses

        // Push can be expected in almost every situation with a success status, but
        // as a pre-caution its good to verify it exists
        if (results.push && results.push.success) {
        }

        // Verify the email is set or check that the results have an email success status
        if (results.email && results.email.success) {
        }
      });
      persistStorage.dispatch(purge({}));
      let delay = 1000; // milliseconds
      let before = Date.now();
      while (Date.now() < before + delay) { }

      StackNavigation.reset('Authscreens');
    } else {
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject(error);
    }
  },
);

export { instance, getImage, getImageFullPath };
