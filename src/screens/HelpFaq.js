import React, {useEffect, useRef, useState} from 'react';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {
  View,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import HTMLView from 'react-native-htmlview';

import {SafeAreaView} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getAllAppContents} from '../actions/HomePageAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';

const HelpFaq = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [faq, setFaq] = useState('');

  useEffect(() => {
    mountFunction();
  }, []);

  const _renderHtmlView = htmlContent => {
    return (
      <HTMLView
        value={
          '<meta name="viewport" content="width=device-width, initial-scale=1">' +
          `<div style="color: ${colors.primaryTextColor}">` +
          htmlContent +
          '</div>'
        }
      />
    );
  };

  const mountFunction = () => {
    getAllAppContents()
      .then(response => {
        setFaq(response.appContent.faq);
      })
      .catch(error => {});
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <TouchableOpacity
        style={{position: 'absolute', left: -30, top: '11%'}}
        onPress={() => ProfileNavigation.pop()}>
        <Image
          resizeMode="contain"
          style={{width: 100, height: 100}}
          source={imagepath.back_button}></Image>
      </TouchableOpacity>

      <View style={{marginTop: 0, width: '80%', marginLeft: 60}}>
        <ScrollView contentContainerStyle={{paddingTop: 30}}>
          {_renderHtmlView(faq)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(HelpFaq);
