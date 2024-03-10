import React, { useContext, useEffect, useRef, useState } from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import * as CartNavigation from '../router/_CartNavigation';
import * as MapNavigation from '../router/_MapNavigation';
import fontFamily from '../utils/FontFamily';
import { normalize } from '../components/NormalizeFonts';
import imagepath from '../utils/Images';

import {
  View,
  Dimensions,
  NativeModules,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  PermissionsAndroid,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

import { Marker } from 'react-native-maps';

import { Dialog } from 'react-native-simple-dialogs';

import HTMLView from 'react-native-htmlview';
import { SearchBar } from '../components/SearchBar';
import Geolocation from 'react-native-geolocation-service';
import sortByDistance from 'sort-by-distance';
import { getDistance } from 'geolib';

import { FlatList } from 'react-native-gesture-handler';

import { WebView } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { openSettings } from 'react-native-permissions';
import { BottomBar } from '../components/BottomBar';
import { connect } from 'react-redux';
import { updateUserDetails } from '../redux/actions/UserAction';
import { getAllAppContents, getVendorNotification } from '../actions/HomePageAPI';
import { editUserProfile, getUserCart, profileDetails } from '../actions/UserAPI';
import { getVendorList, getVendorsByFilter } from '../actions/PurchaseFlowAPI';
import { getImage } from '../actions/GenericAPI';
import { MainButton } from '../components/MainButton';
import { DarkModeContext } from '../components/DarkModeContext';
import { useToast } from 'react-native-toast-notifications';
import textContent from '../utils/textContent';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
let LATITUDE_DELTA = 0.0922;
let LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = ({ props, route, userReducer, updateUserDetails }) => {
  const { darkMode, colors } = useContext(DarkModeContext);
  const toast = useToast();
  const [MapOnboardDialog, setMapOnboardDialog] = useState(false);
  const [noInternet, setNoInternet] = useState(false);
  const [popUpAppContents, setPopUpAppContents] = useState({});
  const [vendorData, setVendorData] = useState(null);
  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [vendorMarkers, setVendorMarkers] = useState([]);
  const [focusedLocation, setFocusedLocation] = useState('');
  const [shopPickup, setShopPickup] = useState(false);
  const [cartLength, setCartLength] = useState(0);
  const [vendorfilterData, setVendorfilterData] = useState([]);
  const [vendorfilterd, setVendorfilterd] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [mapPopup, setMapPopup] = useState(false);
  const [optionSelection, setOptionSelection] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    mountFunction();
    //getLocation();
  }, []);

  const upadatePopup = () => {
    // it should be ideally false but sending as true for easiness in serverside
    let jsonData = { mapPopup: true, popupValue: 2 };

    editUserProfile(jsonData)
      .then(response => {
        if (response.status === 'success') {
          setMapPopup(false);
        }
      })
      .catch(error => { });
  };

  const getVendorFilterList = char => {
    if (char.length > 0) {
      getVendorsByFilter(char)
        .then(value => {
          let response = value;

          if (CartNavigation?.cartNavigationRef?.isReady()) {
            response = matching(response, userReducer?.cartDetails?.data);
            response = response.filter(item => item.isSubscribed === true);
          }

          setVendorfilterData(response);
        })
        .catch(error => { });
    } else {
      setVendorfilterData([]);
    }
  };

  const getTimesasPerDay = data => {
    let day = new Date().getDay();

    let timing = '';

    if (day == 0) {
      if (data.sundayIsOpen) {
        return data.sundayFromTime && data.sundayToTime
          ? 'Open Today ' + data.sundayFromTime + ' - ' + data.sundayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    } else if (day == 1) {
      if (data.mondayIsOpen) {
        return data.mondayFromTime && data.mondayToTime
          ? 'Open Today ' + data.mondayFromTime + ' - ' + data.mondayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    } else if (day == 2) {
      if (data.tuesdayIsOpen) {
        return data.tuesdayFromTime && data.tuesdayToTime
          ? 'Open Today ' + data.tuesdayFromTime + ' - ' + data.tuesdayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    } else if (day == 3) {
      if (data.wednesdayIsOpen) {
        return data.wednesdayFromTime && data.wednesdayToTime
          ? 'Open Today ' +
          data.wednesdayFromTime +
          ' - ' +
          data.wednesdayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    } else if (day == 4) {
      if (data.thursdayIsOpen) {
        return data.thursdayFromTime && data.thursdayToTime
          ? 'Open Today ' + data.thursdayFromTime + ' - ' + data.thursdayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    } else if (day == 5) {
      if (data.fridayIsOpen) {
        return data.fridayFromTime && data.fridayToTime
          ? 'Open Today ' + data.fridayFromTime + ' - ' + data.fridayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    } else if (day == 6) {
      if (data.satdayIsOpen) {
        return data.satdayFromTime && data.satdayToTime
          ? 'Open Today ' + data.satdayFromTime + ' - ' + data.satdayToTime
          : 'Open Today';
      } else {
        return 'Closed';
      }
    }
  };

  const matching = (left, right) => {
    const right_indices = right.map(r => r?.otherData?.vendorId?._id);
    return left.filter(l => !right_indices.includes(l._id));
  };

  const _renderHtmlView = htmlContent => {
    return <HTMLView value={htmlContent} />;
  };

  const mountFunction = () => {
    profileDetails().then(response => {
      setMapPopup(response.user.mapPopup);
    });

    getAllAppContents()
      .then(response => {
        setPopUpAppContents(response.appContent);

        setTimeout(() => {
          setMapOnboardDialog(true);
        }, 500);
      })
      .catch(error => { });

    calltoGetLocation();
  };

  const calltoGetLocation = () => {
    getLocation()
      .then(result => { })
      .catch(err => {
        CartNavigation.pop();
        toast.show(textContent.general.general_error);
      });
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await hasLocationPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'WAXPLACE',
        message: textContent.Maps.location_permission,
      },
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    }

    return false;
  };

  const hasLocationPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        toast.show(alertHardcodeContent.alertUnableToOpenSettings);
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert(textContent.Maps.permission_enable, [
        {
          text: 'OK',
          onPress: () => {
            openSettings().catch(() => {
              Alert.alert(textContent.general.general_error);
            });
          },
        },
      ]);
    }

    if (status === 'disabled') {
      Alert.alert(textContent.Maps.permission_enable_one, '', [
        { text: 'Go to Settings', onPress: openSetting },
        { text: "Don't Use Location", onPress: () => { } },
      ]);
    }

    return false;
  };

  const getLocation = async () => {
    if (!(await hasLocationPermission())) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation(position);
        setLoading(false);

        const currentLongitude = parseFloat(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = parseFloat(position.coords.latitude);
        let NY = {
          lat: currentLatitude,
          lng: currentLongitude,
        };

        let jsonData = {
          latitude: currentLatitude + '',
          longitude: currentLongitude + '',
        };

        getVendorNotification(jsonData)
          .then(response => { })
          .catch(error => { });

        setCurrentLatitude(currentLatitude);
        setCurrentLongitude(currentLongitude);

        const opts = {
          yName: 'latitude',
          xName: 'longitude',
        };
        const origin = {
          longitude: currentLongitude,
          latitude: currentLatitude,
        };

        getUserCart()
          .then(result => {
            if (result.status == 'success') {
              getVendorList()
                .then(datas => {
                  let list = null;
                  let value = [];

                  datas.array.map(val => {
                    if (
                      !result?.findOne?.cart.some(
                        data => data?.sellerId?._id == val?.vendorlist?._id,
                      ) ||
                      !CartNavigation?.cartNavigationRef?.isReady()
                    ) {
                      value.push({ ...val.vendorlist, isSelling: val.isSelling });
                    }
                  });

                  if (
                    value.length == 0 &&
                    CartNavigation?.cartNavigationRef?.isReady()
                  ) {
                    CartNavigation?.pop();
                    toast.show(textContent.Maps.no_vendors);
                  }

                  if (CartNavigation?.cartNavigationRef?.isReady()) {
                    list = matching(value, userReducer?.cartDetails?.data);
                  } else {
                    list = value;
                  }

                  if (list.length > 0) {
                    let result = sortByDistance(origin, list, opts);
                    let data = [];
                    let distanceFromCurrentLocation = 0;

                    result.map(val => {
                      let distance =
                        getDistance(
                          { latitude: val.latitude, longitude: val.longitude },
                          {
                            latitude: currentLatitude,
                            longitude: currentLongitude,
                          },
                        ) / 1000;

                      if (distance > 100) {
                        distanceFromCurrentLocation = distance.toFixed(0);
                      } else if (distance > 10) {
                        distanceFromCurrentLocation = distance.toFixed(2);
                      } else {
                        distanceFromCurrentLocation = distance.toFixed(3);
                      }
                      data.push({ ...val, distanceFromCurrentLocation });
                    });
                    if (CartNavigation?.cartNavigationRef?.isReady()) {
                      data = data.filter(item => item.isSubscribed === true);
                    }

                    if (
                      data.length == 0 &&
                      CartNavigation?.cartNavigationRef?.isReady()
                    ) {
                      CartNavigation?.pop();
                      toast.show(textContent.Maps.no_vendors);
                    }
                    if ('latitude' in data[0] && data[0].latitude) {
                      setVendorData(data[0]);
                      setVendorMarkers(data);
                      setFocusedLocation({
                        latitude: data[0].latitude,
                        longitude: data[0].longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                      });
                    } else {
                      setVendorData(data[0]);
                      setVendorMarkers(data);
                      setFocusedLocation({
                        latitude: currentLatitude,
                        longitude: currentLongitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                      });
                    }
                    if (CartNavigation?.cartNavigationRef?.isReady()) {
                      setOptionSelection(true);
                    }
                  }
                })
                .catch(error => { });
            } else {
              toast.show(textContent.general.general_error);
              CartNavigation.pop();
            }
          })
          .catch(err => { });
      },

      error => {
        getUserCart()
          .then(result => {
            if (result.status == 'success') {
              getVendorList()
                .then(datas => {
                  let list = null;
                  let value = [];

                  datas.array.map(val => {
                    if (
                      !result?.findOne?.cart.some(
                        data => data?.sellerId?._id == val?.vendorlist?._id,
                      ) ||
                      !CartNavigation?.cartNavigationRef?.isReady()
                    ) {
                      value.push({ ...val.vendorlist, isSelling: val.isSelling });
                    }
                  });

                  if (
                    value.length == 0 &&
                    CartNavigation?.cartNavigationRef?.isReady()
                  ) {
                    CartNavigation?.pop();
                    toast.show(textContent.Maps.no_vendors);
                  }

                  if (CartNavigation?.cartNavigationRef?.isReady()) {
                    list = matching(value, userReducer?.cartDetails?.data);
                  } else {
                    list = value;
                  }
                  setVendorData({ ...list[0], distanceFromCurrentLocation: 0 });
                })
                .catch(error => { });
            } else {
              toast.show(textContent.general.general_error);
              CartNavigation.pop();
            }
          })
          .catch(err => { });
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        showLocationDialog: false,
      },
    );
  };

  const markerClicked = (marker, index) => {
    //Map Marker click

    setVendorData(marker);
    setFocusedLocation({
      latitude: marker.latitude,
      longitude: marker.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={mapPopup}
        onTouchOutside={() => setMapPopup(false)}
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
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          height: '76%',
          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
          overflow: 'hidden',
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
              height: '12%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'flex-end',
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
              {textContent.Maps.waxmap}
            </Text>
          </View>
          <View
            style={{
              height: '65%',
              width: '100%',
              justifyContent: 'center',
              paddingVertical: 10,
            }}>
            {popUpAppContents?.mapPopup ? (
              <WebView
                source={{
                  html:
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    `<div style="color: ${colors.primaryTextColor}">` +

                    popUpAppContents?.mapPopup +
                    '</div>',
                }}
                scrollEnabled={false}
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: colors.transparent,
                }}
                domStorageEnabled={true}
                javaScriptCanOpenWindowsAutomatically={true}
                decelerationRate="normal"
                javaScriptEnabledAndroid={true}></WebView>
            ) : (
              <ActivityIndicator
                size={'small'}
                style={{}}
                color={colors.spinner}
              />
            )}
          </View>
          <View
            style={{ height: '23%', width: '100%', justifyContent: 'center' }}>
            <View
              style={{
                flex: 1,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  height: '65%',
                  width: '62%',
                  borderRadius: 20,
                  backgroundColor: colors.baseYellow,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  elevation: 2,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                }}
                onPress={upadatePopup}>
                <View
                  style={{
                    flexDirection: 'row',

                    alignSelf: 'center',
                  }}>
                  <Image
                    style={{
                      width: normalize(22),
                      height: normalize(22),
                      marginTop: 1,
                      tintColor: colors.black,
                    }}
                    source={imagepath.stars}></Image>
                  <Text
                    style={{
                      fontSize: normalize(16.5),
                      color: colors.black,

                      letterSpacing: 0.5,
                      paddingVertical: 2,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 5,
                    }}>
                    {textContent.Maps.get_started}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{ flex: 1, width: '100%', justifyContent: 'flex-start' }}>
              <TouchableOpacity
                style={{ alignSelf: 'center', marginTop: 5 }}
                onPress={() => setMapPopup(false)}>
                <Text
                  style={{
                    color: colors.primaryTextColor,

                    letterSpacing: 0.5,
                    paddingVertical: 2,
                    fontFamily: fontFamily.MontserratRegular,
                    fontSize: normalize(15),
                  }}>
                  {textContent.Maps.skip}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Dialog>

      <View
        style={{
          width: '100%',
          height: Dimensions.get('window').height,
          paddingBottom: Platform.OS == 'ios' ? 70 + insets.bottom : 50,
          zIndex: -1,
        }}>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <SearchBar
            cartValue={userReducer.cartLength}
            searchEnabled={true}
            mainStyle={(colors, darkMode) => ({
              width: '95%',
              marginTop: 15,
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: vendorfilterData.length > 0 ? 0 : 20,
              borderBottomRightRadius: vendorfilterData.length > 0 ? 0 : 20,
              borderTopRightRadius: 20,
              alignSelf: 'center',
              height: 42,
              elevation: 8,
              shadowColor: colors.shadowColor,

              shadowOffset: { width: 0, height: 2 },
              shadowColor: '#000',
              shadowOpacity: 0.2,
              backgroundColor: colors.secondaryBackground,
            })}
            conditions={CartNavigation?.cartNavigationRef?.isReady()}
            onBackPress={() => {
              setVendorfilterd(false);

              if (
                HomeNavigation?.homeNavigationRef?.getCurrentRoute()?.name ==
                'CartStack' ||
                ProfileNavigation?.profileNavigationRef?.getCurrentRoute()
                  ?.name == 'CartStack' ||
                MapNavigation?.mapNavigationRef?.getCurrentRoute()?.name ==
                'CartStack'
              ) {
                CartNavigation.pop();
              } else {
                MapNavigation.pop();
              }

              calltoGetLocation();
            }}
            searchText={searchText}
            searchFunction={text => {
              setSearchText(text);
              getVendorFilterList(text);
            }}
            placeHolderCondition={
              searchText !== '' ? '' : textContent.Maps.search_text
            }
          />
          {vendorfilterData.length > 0 ? (
            <View
              style={{
                width: '95%',
                height: 250,
                backgroundColor: colors.secondaryBackground,
                alignSelf: 'center',
                elevation: 7,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.29,
                shadowRadius: 4.65,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                position: 'absolute',
                top: 60,
                zIndex: 1,
              }}>
              <FlatList
                listKey={(item, index) => `_key${index.toString()}`}
                data={vendorfilterData}
                contentContainerStyle={{ paddingTop: 8 }}
                style={{
                  width: '90%',
                  alignSelf: 'center',
                  marginTop: 7,
                  zIndex: 1,
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      height: 40,
                      justifyContent: 'center',
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.premiumGrayOne,
                    }}
                    onPress={() => {
                      let distanceFromCurrentLocation;
                      let distance =
                        getDistance(
                          { latitude: item.latitude, longitude: item.longitude },
                          {
                            latitude: currentLatitude,
                            longitude: currentLongitude,
                          },
                        ) / 1000;

                      if (distance > 100) {
                        distanceFromCurrentLocation = distance.toFixed(0);
                      } else if (distance > 10) {
                        distanceFromCurrentLocation = distance.toFixed(2);
                      } else {
                        distanceFromCurrentLocation = distance.toFixed(3);
                      }

                      item.distanceFromCurrentLocation =
                        distanceFromCurrentLocation;

                      setVendorData(item);
                      setVendorMarkers([item]);
                      setFocusedLocation({
                        latitude: item.latitude,
                        longitude: item.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                      });
                      setVendorfilterData([]);
                      setSearchText('');
                      setVendorfilterd(true);
                    }}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 16,
                        fontFamily: fontFamily.MontserratMedium,
                      }}>
                      {item.storeName}
                    </Text>
                  </TouchableOpacity>
                )}></FlatList>
            </View>
          ) : null}
        </View>

        <View
          style={{
            flex: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 30,
            zIndex: -1,
          }}>
          <View
            style={{
              flex: 3,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 25,
            }}>
            <View
              style={{
                width: '93%',
                height: '100%',
                backgroundColor: colors.bgGray,
                alignSelf: 'center',

                overflow: 'hidden',
                borderRadius: 10,
                elevation: 4,
                shadowColor: colors.shadowColor,

                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}>
              {focusedLocation ? (
                <MapView
                  provider={
                    Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE
                  }
                  style={{ width: '100%', height: '100%', zIndex: -1 }}
                  region={focusedLocation}
                  showsUserLocation={true}
                  zoomEnabled={true}
                  showsCompass={true}
                  zoomControlEnabled={true}
                  mapRef={ref => {
                    mapview = ref;
                  }}>
                  {vendorMarkers.length > 0 &&
                    vendorMarkers.map((marker, index) => (
                      <Marker
                        coordinate={{
                          latitude: marker.latitude,
                          longitude: marker.longitude,
                        }}
                        onPress={() => {
                          markerClicked(marker, index);
                        }}
                        title={marker.storeName}
                        description={marker.address}>
                        {!marker?.subscriptionPlanExpiry ||
                          new Date(marker?.subscriptionPlanExpiry)?.getTime() <
                          new Date().getTime() ? (
                          <Image
                            source={imagepath.unsubscribed}
                            resizeMode={'contain'}
                            style={{ width: 50, height: 50 }}></Image>
                        ) : (
                          <View
                            style={{
                              width: 50,
                              height: 50,
                              justifyContent: 'center',
                            }}>
                            <Image
                              source={imagepath.subscribed}
                              resizeMode={'contain'}
                              style={{ width: 50, height: 50 }}></Image>
                          </View>
                        )}
                      </Marker>
                    ))}
                </MapView>
              ) : null}
            </View>
          </View>
          <View
            style={{
              marginVertical: 25,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              disabled={vendorData == null}
              style={{
                width: '93%',
                height: 120,
                backgroundColor: colors.cardColor,
                borderRadius: 15,
                elevation: 4,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                alignItems: 'center',
                alignContent: 'center',
              }}
              onPress={() => {
                if (
                  CartNavigation?.cartNavigationRef?.getCurrentRoute()?.name ==
                  'Mapscreen'
                ) {
                  CartNavigation.navigate('StoreDetails', {
                    vendorData: vendorData,
                    distance: vendorData?.distanceFromCurrentLocation,
                  });
                } else {
                  MapNavigation.navigate('StoreDetails', {
                    vendorData: vendorData,
                    distance: vendorData?.distanceFromCurrentLocation,
                  });
                }
              }}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    height: '100%',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 10,
                  }}>
                  <Image
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      alignSelf: 'center',

                      backgroundColor: colors.bgGray,
                    }}
                    source={getImage(vendorData?.image)}></Image>
                </View>
                <View style={{ flex: 1.8, height: '100%' }}>
                  <View
                    style={{
                      width: '100%',
                      paddingLeft: 10,
                      paddingTop: 10,
                    }}>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                      <View style={{ flex: 3, justifyContent: 'flex-end' }}>
                        <Text
                          numberOfLines={2}
                          style={{
                            color: colors.grayShadeThree,
                            fontFamily: fontFamily.MontserratMedium,
                            letterSpacing: 0.5,
                            fontSize: normalize(17.5),
                          }}>
                          {vendorData?.storeName ? vendorData?.storeName : ''}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexGrow: 1,
                          alignItems: 'flex-end',
                          marginRight: 10,
                          marginBottom: 5,
                          maxWidth: '30%',
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                          <Image
                            style={{ width: 23, height: 23 }}
                            resizeMode={'contain'}
                            source={imagepath.pin}></Image>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: normalize(15.2),
                              marginTop: 6,
                              color: colors.grayShadeOne,
                              marginLeft: -1,
                              fontFamily: fontFamily.MontserratMedium,
                            }}>
                            {vendorData?.distanceFromCurrentLocation}km
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text
                      numberOfLines={2}
                      style={{
                        color: colors.grayShadeTwo,
                        fontSize: 15,
                        fontFamily: fontFamily.MontserratRegular,
                        paddingRight: 10,
                      }}>
                      {vendorData?.address}
                    </Text>
                    {vendorData && (
                      <Text
                        style={{
                          marginTop: 3,
                          marginLeft: 0,
                          color: colors.grayShadeOne,
                          fontSize: 13.1,
                          fontFamily: fontFamily.MontserratMedium,
                        }}>
                        {getTimesasPerDay(vendorData)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View
                style={{
                  height: '10%',
                  // width: '65%',
                  position: 'absolute',
                  bottom: '17.7%',
                  left: '22%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {optionSelection ? (
                  <MainButton
                    style={{
                      height: 30,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      elevation: 2,
                      shadowColor: colors.shadowColor,
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      width: '100%',
                    }}
                    fontSize={16}
                    onPress={() => {
                      if (vendorData?.isSubscribed) {
                        updateUserDetails({
                          prop: 'cartDetails',
                          value: {
                            ...userReducer?.cartDetails,
                            vendorData,
                          },
                        });
                        CartNavigation.navigate('Checkout');
                      } else {
                        toast.show(textContent.Maps.vendor_unavailable);
                      }
                    }}
                    title={textContent.Maps.button_text}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>
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

export default connect(mapStateToProps, { updateUserDetails })(MapScreen);
