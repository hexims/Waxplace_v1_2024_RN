import PropTypes from 'prop-types';
import React, {useRef, useState, useEffect, useContext} from 'react';
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
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as MapNavigation from '../router/_MapNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import * as CartNavigation from '../router/_CartNavigation';
import {StackActions, NavigationActions} from 'react-navigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import textContent from '../utils/textContent';
import {normalize} from './NormalizeFonts';
import store from '../redux/store';
import {DarkModeContext} from './DarkModeContext';
import {Dialog} from 'react-native-simple-dialogs';
import WebView from 'react-native-webview';
import {getAllAppContents} from '../actions/HomePageAPI';
export const SearchBar = ({
  showCart = true,
  userReducer = null,
  searchEnabled = true,
  conditions = true,
  homeReload = null,
  onBackPress = () => {
    if (
      HomeNavigation?.homeNavigationRef?.getCurrentRoute()?.name ==
        'CartStack' ||
      ProfileNavigation?.profileNavigationRef?.getCurrentRoute()?.name ==
        'CartStack' ||
      MapNavigation?.mapNavigationRef?.getCurrentRoute()?.name == 'CartStack'
    ) {
      if (
        CartNavigation.cartNavigationRef.getCurrentRoute().name == 'Cartscreen'
      ) {
        if (
          BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'HOME'
        ) {
          HomeNavigation.pop();
          // HomeNavigation.reset('HomeScreen');
        } else if (
          BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'PROFILE'
        ) {
          ProfileNavigation.pop();
        } else if (
          BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'WAXMAP'
        ) {
          MapNavigation.pop();
        }
      } else {
        CartNavigation.pop();
      }
    } else {
      if (BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'HOME') {
        if (
          HomeNavigation?.homeNavigationRef?.getState()?.routes[0]?.name ==
          'CreateSaleProduct'
        ) {
          HomeNavigation.reset('HomeScreen');
        } else {
          HomeNavigation.pop();
        }
      } else if (
        BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'PROFILE'
      ) {
        ProfileNavigation.pop();
      } else if (
        BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'WAXMAP'
      ) {
        MapNavigation.pop();
      }
    }
  },
  onShare = () => {},
  helpPress = () => {},
  helpEnabled = false,
  cartPress = () => {
    if (
      HomeNavigation?.homeNavigationRef?.getCurrentRoute()?.name ==
        'CartStack' ||
      ProfileNavigation?.profileNavigationRef?.getCurrentRoute()?.name ==
        'CartStack' ||
      MapNavigation?.mapNavigationRef?.getCurrentRoute()?.name == 'CartStack'
    ) {
      if (
        CartNavigation.cartNavigationRef.getCurrentRoute().name !== 'Cartscreen'
      ) {
        CartNavigation.reset('Cartscreen');
      }
    } else {
      if (BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'HOME') {
        HomeNavigation.navigate('CartStack');
      } else if (
        BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'PROFILE'
      ) {
        ProfileNavigation.navigate('CartStack');
      } else if (
        BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'WAXMAP'
      ) {
        MapNavigation.navigate('CartStack');
      }
    }
  },
  searchText = '',
  searchFunction = () => {},
  placeHolderCondition = '',
  cartValue = 0,
  sharingEnabled = false,
  backgroundColor = '',
  mainStyle = (colors, darkMode) => [
    {
      width: '95%',
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      alignContent: 'center',
      borderRadius: 20,
      alignSelf: 'center',
      height: 42,

      backgroundColor: searchEnabled
        ? colors.searchBarColor
        : colors.primaryBackground,
    },
    searchEnabled
      ? {
          borderWidth: darkMode ? 0 : StyleSheet.hairlineWidth,
          borderColor: colors.premiumGrayOne + '50',
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        }
      : null,
  ],
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [helpDialog, setHelpDialog] = useState(false);
  const [popUpAppContents, setPopUpAppContents] = useState('');

  useEffect(() => {
    if (userReducer !== null && helpDialog) {
      getAllAppContents()
        .then(response => {
          setPopUpAppContents(response.appContent);
        })
        .catch(error => {});
    }
  }, [helpDialog]);

// }, [userReducer]);
  return (
    <View
      style={[
        mainStyle(colors, darkMode),
        backgroundColor !== '' ? {backgroundColor} : {},
      ]}>
      <Dialog
        visible={helpDialog}
        onTouchOutside={() => {
          setHelpDialog(false);
        }}
        contentStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          height:
            Platform.OS == 'ios'
              ? Dimensions.get('window').height * 0.74
              : Dimensions.get('window').height * 0.74 -
                StatusBar.currentHeight,
          width: '100%',
          padding: 0,
          paddingTop: 0,
          overflow: 'hidden',
          paddingVertical: 10,
        }}
        dialogStyle={{
          borderRadius: 15,
          height: '76%',
          backgroundColor: colors.cardColor,
          width: '100%',
          alignSelf: 'center',
          overflow: 'hidden',
          paddingTop: 10,
          paddingBottom: 15,
          paddingHorizontal: 5,
        }}>
        <View
          style={{
            height:
              Platform.OS == 'ios'
                ? Dimensions.get('window').height * 0.74
                : Dimensions.get('window').height * 0.74 -
                  StatusBar.currentHeight,
            width: '100%',
            backgroundColor: colors.cardColor,
          }}>
          <View
            style={{
              height: '9%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderColor: colors.premiumGrayOne,
            }}>
            <Text
              style={{
                marginBottom: normalize(12),
                color: colors.primaryTextColor,

                fontSize: normalize(25),
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.general.packaging_info}
            </Text>
          </View>
          <View
            style={{
              height: '100%',
              width: '100%',
              justifyContent: 'center',
            }}>
            <WebView
              source={{
                html:
                  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                  `<div style="color: ${colors.primaryTextColor}">` +
                  popUpAppContents?.packagingInformation +
                  //  popUpAppContents?.homePopup +
                  '</div>',
              }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: colors.transparent,
                padding: 10,
              }}
              domStorageEnabled={true}
              javaScriptCanOpenWindowsAutomatically={true}
              decelerationRate="normal"
              javaScriptEnabledAndroid={true}></WebView>
          </View>
        </View>
      </Dialog>
      {conditions ? (
        <TouchableOpacity
          style={{
            // flex: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
          onPress={onBackPress}>
          <Image
            style={{
              width: 28,
              height: 28,
              alignSelf: 'center',
              marginLeft: 10,
              marginRight: 5,
              tintColor: darkMode ? colors.primaryTextColor : colors.black,
            }}
            resizeMode="contain"
            source={imagepath.backwaxswap}></Image>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={homeReload == null}
          onPress={homeReload}
          style={[
            {
              //  flex: 1,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            },
          ]}>
          <Image
            style={{
              width: 28,
              height: 28,
              alignSelf: 'center',
              marginLeft: 10,
              marginRight: 5,
              tintColor: darkMode ? colors.primaryTextColor : colors.black,
            }}
            resizeMode="contain"
            source={imagepath.waxswaplogo}></Image>
        </TouchableOpacity>
      )}
      <View
        style={{
          width: !showCart ? '100%' : '70%',
          height: '100%',
          justifyContent: 'center',
          alignContent: 'flex-start',
          alignItems: 'baseline',
          paddingLeft: 3,
        }}>
        <TextInput
          numberOfLines={1}
          // multiline={false}
          editable={searchEnabled}
          value={searchText}
          //onEndEditing={(event) => searchFunction(event.nativeEvent.text)}
          onChangeText={text => {
            searchFunction(text);
          }}
          style={{
            width: '100%',
            height: '100%',
            color: colors.primaryTextColor,
            letterSpacing: searchText !== '' ? 1 : 4,
            fontSize: Platform.OS == 'ios' ? 12.1 : 13,
            fontFamily: fontFamily.MontserratMedium,
            backgroundColor: colors.transparent,
            maxHeight: 70,
            // marginLeft: searchEnabled ? (Platform.OS == 'ios' ? 1 : -5) : 5,
          }}
          multiline={false}
          placeholder={placeHolderCondition}
          placeholderTextColor={colors.primaryTextColor}></TextInput>
      </View>

      <View
        style={{
          //  flex: 1.8,
          position: 'absolute',
          right: 0,
          height: '100%',
          flexDirection: 'row',
        }}>
        <View
          style={{
            //flex: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {sharingEnabled && (
            <TouchableOpacity
              style={{
                width: 30,
                height: 30,

                justifyContent: 'center',
              }}
              onPress={onShare}>
              <Image
                style={{
                  width: 25,
                  height: 25,
                  alignSelf: 'center',
                  marginTop: 2.5,
                  tintColor: darkMode ? colors.primaryTextColor : colors.black,
                }}
                source={imagepath.share}></Image>
            </TouchableOpacity>
          )}
          {helpEnabled && (
            <TouchableOpacity
              style={{
                width: 30,
                height: 30,

                justifyContent: 'center',
              }}
              onPress={() => {
                setHelpDialog(true);
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  marginTop: 1.2,
                  tintColor: darkMode
                    ? colors.primaryTextColor + 'cc'
                    : colors.grayShadeThree + 'a0',
                }}
                source={imagepath.questionmark}></Image>
            </TouchableOpacity>
          )}
        </View>

        {showCart && (
          <View
            style={{
              //  flex: 1,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                marginRight: 10,

                justifyContent: 'center',
              }}
              onPress={cartPress}>
              <Image
                style={{
                  width: 25,
                  height: 25,
                  alignSelf: 'center',
                  marginTop: 2.5,
                  tintColor: darkMode ? colors.primaryTextColor : colors.black,
                }}
                source={imagepath.cart}></Image>
              {cartValue > 0 ? (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    position: 'absolute',
                    top: 3,
                    right: 0,
                    justifyContent: 'center',
                    backgroundColor: darkMode
                      ? colors.waxplaceTextColor
                      : colors.waxplaceYellow,
                    marginTop: 2.5,
                  }}>
                  <Text
                    style={{
                      color: darkMode
                        ? colors.cardColor
                        : colors.primaryTextColor+'aa',
                      fontSize: 14,
                      alignSelf: 'center',
                      fontFamily: fontFamily.MontserratRegular,
                      fontWeight: 'bold',
                      marginBottom: 2,
                    }}>
                    {cartValue}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{flex: 0.1}} />
    </View>
  );
};
