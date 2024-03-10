import React, {useEffect, useState} from 'react';
import * as AuthNavigation from '../router/_AuthNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import imagepath from '../utils/Images';
import {
  View,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getAllAppContents} from '../actions/HomePageAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import WebView from 'react-native-webview';
import ProgressLoader from '../components/ProgressLoader';

import {BASEURL} from '../actions/_apiUrls';

const Terms = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [termsnConditions, setTermsnConditions] = useState('');
  const [spinner, setSpinner] = useState(true);

  useEffect(() => {
    mountFunction();
  }, []);

  const _renderHtmlView = htmlContent => {
    return (
      <View style={{height: '100%'}}>
        <WebView
          source={{
            html:
              '<meta name="viewport" content="width=device-width, initial-scale=1">' +
              `<div style="color: ${colors.primaryTextColor}">` +
              htmlContent +
              '</div>',
          }}
          scrollEnabled={false}
          containerStyle={{paddingBottom: 70}}
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: colors.transparent,
          }}
          domStorageEnabled={true}
          javaScriptCanOpenWindowsAutomatically={true}
          onNavigationStateChange={handleNavigation}
          decelerationRate="normal"
          javaScriptEnabledAndroid={true}></WebView>
      </View>
    );
  };

  const handleNavigation = event => {
    const {url} = event;

    // Check if the URL is a webpage
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Open the URL in the default browser
      Linking.openURL(url);
    }
  };

  const mountFunction = () => {
    getAllAppContents()
      .then(response => {
        if (route?.params?.type == 'TandC') {
          setTermsnConditions(response?.appContent?.TandC);
        } else if (route?.params?.type == 'MnC') {
          setTermsnConditions(response?.appContent?.MandT);
        } else if (route?.params?.type == 'faq') {
          setTermsnConditions(response?.appContent?.faq);
        } else {
          setTermsnConditions(response?.appContent?.privacyPolicy);
        }

        setSpinner(false);
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <TouchableOpacity
        style={{position: 'absolute', left: -30, top: '11%', zIndex: 1500}}
        onPress={() => {
          if (AuthNavigation?.authNavigationRef?.isReady()) {
            AuthNavigation.pop();
          } else {
            ProfileNavigation.pop();
          }
        }}>
        <Image
          resizeMode="contain"
          style={{width: 100, height: 100}}
          source={imagepath.back_button}></Image>
      </TouchableOpacity>

      <View style={{marginTop: 0, flex: 1, width: '100%', paddingLeft: 50}}>
        <ScrollView contentContainerStyle={{paddingTop: 30, height: '100%'}}>
          {_renderHtmlView(termsnConditions)}
        </ScrollView>
      </View>
      <ProgressLoader
        visible={spinner}
        isHUD={true}
        isModal={true}
        color={colors.spinner}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    width: '100%',
    backgroundColor: colors.primaryBackground,
  }),
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Terms);
