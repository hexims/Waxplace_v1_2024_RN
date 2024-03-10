import React, {useRef, useState, useEffect} from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';

import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  NativeModules,
} from 'react-native';

import imagepath from '../utils/Images';
import fontFamily from '../utils/FontFamily';
import {useContext} from 'react';
import {DarkModeContext} from './DarkModeContext';
import textContent from '../utils/textContent';

export const BottomBar = ({
  navigation,
  route,
  homeColor = false,
  mapsColor = false,
  profileColor = false,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  return (
    <View
      style={{
        width: '100%',
        position: 'absolute',

        backgroundColor: colors.transparent,

        bottom: 0,
      }}>
      <Image
        resizeMode="stretch"
        style={{height: 60, width: '100%'}}
        source={imagepath.tab_bg}></Image>

      <View
        style={{
          width: '100%',
          height: 60,
          position: 'absolute',
          bottom: 0,
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,
          }}
          onPress={() => HomeNavigation.reset('HomeScreen')}>
          <Image
            style={{
              width: 25,
              height: 25,
              tintColor: homeColor
                ? colors.waxplaceColor
                : colors.primaryTextColor,
            }}
            source={imagepath.home_tab}
            resizeMode={'contain'}></Image>
          <Text
            style={{
              marginTop: 2.2,
              color: homeColor ? colors.waxplaceColor : colors.primaryTextColor,
              fontSize: 11.5,
              letterSpacing: 0.5,

              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.components.home}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1.5,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,
          }}
          onPress={() => HomeNavigation.reset('Mapscreen')}>
          <Image
            style={{
              width: 25,
              height: 25,
              tintColor: mapsColor
                ? colors.waxplaceColor
                : colors.primaryTextColor,
            }}
            source={imagepath.map_tab}
            resizeMode={'contain'}></Image>
          <Text
            style={{
              marginTop: 2.2,
              color: mapsColor ? colors.waxplaceColor : colors.primaryTextColor,
              fontSize: 11.5,
              letterSpacing: 0.5,

              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.components.waxmap}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,
          }}
          onPress={() => HomeNavigation.reset('Profilescreen')}>
          <Image
            style={{
              width: 25,
              height: 25,
              tintColor: profileColor
                ? colors.waxplaceColor
                : colors.primaryTextColor,
            }}
            source={imagepath.profile_tab}
            resizeMode={'contain'}></Image>
          <Text
            style={{
              marginTop: 2.2,
              color: profileColor
                ? colors.waxplaceColor
                : colors.primaryTextColor,
              fontSize: 11.5,
              letterSpacing: 0.5,

              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.components.profile}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
