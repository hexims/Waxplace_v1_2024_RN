import React, {useEffect, useRef, useState} from 'react';
import {useContext} from 'react';
import {
  View,
  Dimensions,
  NativeModules,
  Text,
  StyleSheet,
  Button,
  PermissionsAndroid,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  Platform,
  FlatList,
} from 'react-native';

import RBSheet from 'react-native-raw-bottom-sheet';
import {getFilterName} from '../actions/HelperFunctions';

import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import textContent from '../utils/textContent';
import {DarkModeContext} from './DarkModeContext';

export const SortView = ({
  marginBottom = 15,
  marginTop = 20,
  setFilterType,
  sortByRef = useRef(null),
  hideDistance = false,
  visible = true,
  initial = false,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [toggle, setToggle] = useState(false);
  const [type, setType] = useState('newest');

  useEffect(() => {
    setFilterType('newest');
  }, [visible]);

  useEffect(() => {
    if (toggle) {
      sortByRef.open();
    } else {
      sortByRef.close();
    }
  }, [toggle]);
  return (
    <>
      {(visible || initial) && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            marginLeft: 15,
            marginTop: marginTop,
            marginBottom: marginBottom,
          }}
          onPress={() => setToggle(true)}>
          <Image
            style={{
              width: 12,
              height: 12,
              alignSelf: 'center',
              tintColor: colors.primaryTextColor,
            }}
            resizeMode={'contain'}
            source={imagepath.arrows}></Image>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              fontWeight: '500',
              letterSpacing: 1,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.components.sort_by}
          </Text>
          <Text
            style={{
              marginLeft: 5,
              color: colors.waxplaceColor,
              fontWeight: '400',
              fontSize: 14,
              fontFamily: fontFamily.MontserratRegular,
              letterSpacing: 1,
            }}>
            {getFilterName(type)}
          </Text>
        </TouchableOpacity>
      )}
      <RBSheet
        onClose={() => {
          setToggle(false);
        }}
        ref={ref => (sortByRef = ref)}
        closeOnSwipeDown={true}
        height={350}
        customStyles={{
          container: {
            backgroundColor: colors.primaryBackground,
            alignItems: 'center',
            width: '100%',
            paddingBottom: 30,
          },
        }}>
        <View style={{width: '100%', height: '100%'}}>
          <View
            style={{
              flex: 1.2,
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                marginLeft: 25,
                marginTop: 20,
                fontWeight: '400',
                fontSize: 18,
                letterSpacing: 1,
                color: colors.grayShadeTwo,
              }}>
              {textContent.components.sort_by}
            </Text>

            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 20,
              }}
              onPress={() => {
                setType('newest');
                setFilterType('newest');
                setToggle(false);
              }}>
              <Text
                style={{
                  marginLeft: 25,
                  marginTop: 20,
                  fontWeight: '400',

                  fontSize: 18,
                  letterSpacing: 1,
                  color: colors.grayShadeTwo,
                }}>
                {textContent.components.reset_filter}
              </Text>
            </TouchableOpacity>
          </View>
          {!hideDistance && (
            <TouchableOpacity
              style={{
                flex: 1,
                width: '100%',

                borderTopWidth: StyleSheet.hairlineWidth,
                borderColor: colors.premiumGray,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => {
                setType('distance');
                setFilterType('distance');
                setToggle(false);
              }}>
              <View
                style={{
                  flex: 1,

                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: colors.primaryTextColor,
                  }}
                  resizeMode="contain"
                  source={imagepath.distancemarker}></Image>
              </View>
              <View style={{flex: 3.5, justifyContent: 'center'}}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratRegular,
                    letterSpacing: 1,
                    color: colors.primaryTextColor,
                  }}>
                  {textContent.components.distance}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              flex: 1,
              width: '100%',

              borderTopWidth: StyleSheet.hairlineWidth,
              borderColor: colors.premiumGray,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => {
              setType('lowTohigh');
              setFilterType('lowTohigh');
              setToggle(false);
            }}>
            <View
              style={{
                flex: 1,

                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 22,
                  height: 22,
                  tintColor: colors.primaryTextColor,
                }}
                resizeMode="contain"
                source={imagepath.priceup}></Image>
            </View>
            <View style={{flex: 3.5, justifyContent: 'center'}}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fontFamily.MontserratRegular,
                  letterSpacing: 1,
                  color: colors.primaryTextColor,
                }}>
                {textContent.components.price_low_high}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              width: '100%',

              borderTopWidth: StyleSheet.hairlineWidth,
              borderColor: colors.premiumGray,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => {
              setType('highTolow');
              setFilterType('highTolow');
              setToggle(false);
            }}>
            <View
              style={{
                flex: 1,

                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 22,
                  height: 22,
                  tintColor: colors.primaryTextColor,
                }}
                resizeMode="contain"
                source={imagepath.pricelow}></Image>
            </View>
            <View style={{flex: 3.5, justifyContent: 'center'}}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fontFamily.MontserratRegular,
                  letterSpacing: 1,
                  color: colors.primaryTextColor,
                }}>
                {textContent.components.price_high_low}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              width: '100%',

              borderTopWidth: StyleSheet.hairlineWidth,
              borderColor: colors.premiumGray,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => {
              setType('newest');
              setFilterType('newest');
              setToggle(false);
            }}>
            <View
              style={{
                flex: 1,

                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 22,
                  height: 22,
                  tintColor: colors.primaryTextColor,
                }}
                resizeMode="contain"
                source={imagepath.calender}></Image>
            </View>
            <View style={{flex: 3.5, justifyContent: 'center'}}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fontFamily.MontserratRegular,
                  letterSpacing: 1,
                  color: colors.primaryTextColor,
                }}>
                {textContent.components.newest_first}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </>
  );
};
