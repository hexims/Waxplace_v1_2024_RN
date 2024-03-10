import React, {useEffect, useState} from 'react';
import * as AuthNavigation from '../router/_AuthNavigation';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as StackNavigation from '../router/_StackNavigation';

import colors from '../utils/Colors';
import {View, Dimensions, StyleSheet} from 'react-native';
const {width, height} = Dimensions.get('window');

// Use iPhone6 as base size which is 375 x 667
const baseWidth = width;
const baseHeight = height;
import OneSignal from 'react-native-onesignal';
import {ONESIGNALAPPID} from '../utils/keys';

import {SafeAreaView} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {purge} from '../redux/reducers/PersistReducer';
import {connect, useSelector} from 'react-redux';
import persistStorage from '../redux/store/persistStore';
import {updateUserDetails} from '../redux/actions/UserAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {profileDetails} from '../actions/UserAPI';
import {useToast} from 'react-native-toast-notifications';

const SplashScreen = ({userReducer, updateUserDetails}) => {
  const [showVideo, setShowVideo] = useState(true);
  const toast = useToast();
  const [privacyButtonTitle, setPrivacyButtonTitle] = useState(
    'Privacy Consent: Not Granted',
  );
  const data = useSelector(state => state);
  useEffect(() => {
    updateUserDetails({prop: 'initial', value: false});

    //  StatusBar.setHidden(true);

    OneSignal.setAppId(ONESIGNALAPPID);
  }, []);

  const mountFunction = () => {
    AsyncStorage.setItem('value', 'value').then(value => {
      if (persistStorage.getState().userDetails == null) {
        setShowVideo(false);
        AuthNavigation.reset('Login');
      } else {
        profileDetails()
          .then(response => {
            setShowVideo(false);
            if (response?.status == 'success') {
              if (
                response.message &&
                response.message == 'token is not valid'
              ) {
                if (persistStorage.getState().userDetails == null) {
                  AuthNavigation.reset('Login');
                } else {
                  persistStorage.dispatch(purge({}));
                  AuthNavigation.navigate('Login');
                }
              } else {
                updateUserDetails({
                  prop: 'cartLength',
                  value: response?.user?.cart?.length,
                });
                if (
                  response.user &&
                  response.user.categories &&
                  response.user.categories.length > 0
                ) {
                  let externalUserId = response.user._id;
                  OneSignal.setExternalUserId(externalUserId);

                  if (persistStorage.getState().userDetails == null) {
                    AuthNavigation.reset('Login');
                  } else {
                    HomeNavigation.reset('HomeScreen');
                    StackNavigation.reset('Userscreens');
                  }
                } else {
                  let externalUserId = response.user._id;
                  OneSignal.setExternalUserId(externalUserId);

                  if (persistStorage.getState().userDetails == null) {
                    AuthNavigation.reset('Login');
                  } else {
                    HomeNavigation.reset('Categoriesscreen');
                    StackNavigation.reset('Userscreens');
                  }
                }
              }
            } else {
              toast.show(response?.message);
              persistStorage.dispatch(purge({}));
              AuthNavigation.navigate('Login');
            }
          })
          .catch(error => {
            AuthNavigation.navigate('Login');
          });
      }
    });
  };

  return (
    <SafeAreaView style={styles.maincontainer}>
      {showVideo && (
        <Video
          source={require('../video/splash.mp4')}
          onEnd={() => {
            mountFunction();
          }}
          style={{
            backgroundColor: '#000000',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          muted={true}
          repeat={false}
          resizeMode={'contain'}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(SplashScreen);
