/**
 * @format
 */
import 'react-native-reanimated';
import React, {useEffect, useState} from 'react';
import {
  Appearance,
  AppRegistry,
  Linking,
  LogBox,
  useColorScheme,
} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import {Provider} from 'react-redux';
import store from './src/redux/store';
import pStore from './src/redux/store/persistStore';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import ProgressLoader from './src/components/ProgressLoader';
import {SafeAreaProvider} from 'react-native-safe-area-context';

//import {AppearanceProvider} from 'react-native-appearance';
// sending events to Javascript: https://reactnative.dev/docs/native-modules-android#sending-events-to-javascript

LogBox.ignoreAllLogs(true);

let persistor = persistStore(pStore);
const RootApp = () => {

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* <AppearanceProvider> */}
            <App />
          {/* </AppearanceProvider> */}
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

AppRegistry.registerComponent(appName, () => RootApp);

TrackPlayer.registerPlaybackService(() => require('./service.js'));
