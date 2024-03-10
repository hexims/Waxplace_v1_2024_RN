import React, {useEffect, useState, useContext} from 'react';

import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  FlatList,
  Text,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';

import {Dialog} from 'react-native-simple-dialogs';

import Geolocation from 'react-native-geolocation-service';

import {getDistance} from 'geolib';
import _ from 'lodash';
import {openSettings} from 'react-native-permissions';

import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage} from '../actions/GenericAPI';
import {
  addFriendToUser,
  getUserCart,
  getUserFriendsList,
  getVendorProductSales,
  removeFriendForUser,
} from '../actions/UserAPI';
import {addProductToUserCart} from '../actions/PurchaseFlowAPI';

import {SortView} from '../components/SortView';
import {isMatch} from '../actions/HelperFunctions';
import ProgressLoader from '../components/ProgressLoader';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const StoreDetails = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [shareDialog, setShareDialog] = useState(false);
  const [vendorDetails, setVendorDetails] = useState('');
  const [distance, setDistance] = useState('');
  const [vendorSales, setVendorSales] = useState([]);
  const [showDatesDialog, setShowDatesDialog] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [extra, setExtra] = useState(0);
  const [sortValue, setSortValue] = useState('newest');
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    updateUserDetails({
      prop: 'showStoreDetails',
      value: {toggle: false, params: {}},
    });

    setVendorSales([]);
    mountFunction();
  }, [sortValue]);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const getTimesasPerDay = data => {
    let day = new Date().getDay();

    let timing = '';

    if (day == 0) {
      if (data.sundayIsOpen) {
        return data.sundayFromTime && data.sundayToTime
          ? data.sundayFromTime + ' - ' + data.sundayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 1) {
      if (data.mondayIsOpen) {
        return data.mondayFromTime && data.mondayToTime
          ? data.mondayFromTime + ' - ' + data.mondayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 2) {
      if (data.tuesdayIsOpen) {
        return data.tuesdayFromTime && data.tuesdayToTime
          ? data.tuesdayFromTime + ' - ' + data.tuesdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 3) {
      if (data.wednesdayIsOpen) {
        return data.wednesdayFromTime && data.wednesdayToTime
          ? data.wednesdayFromTime + ' - ' + data.wednesdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 4) {
      if (data.thursdayIsOpen) {
        return data.thursdayFromTime && data.thursdayToTime
          ? data.thursdayFromTime + ' - ' + data.thursdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 5) {
      if (data.fridayIsOpen) {
        return data.fridayFromTime && data.fridayToTime
          ? data.fridayFromTime + ' - ' + data.fridayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 6) {
      if (data.satdayIsOpen) {
        return data.satdayFromTime && data.satdayToTime
          ? data.satdayFromTime + ' - ' + data.satdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    }
  };

  const getTimesasPerAPI = (data, day) => {
    if (day == 0) {
      if (data.sundayIsOpen) {
        return data.sundayFromTime && data.sundayToTime
          ? data.sundayFromTime + ' - ' + data.sundayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 1) {
      if (data.mondayIsOpen) {
        return data.mondayFromTime && data.mondayToTime
          ? data.mondayFromTime + ' - ' + data.mondayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 2) {
      if (data.tuesdayIsOpen) {
        return data.tuesdayFromTime && data.tuesdayToTime
          ? data.tuesdayFromTime + ' - ' + data.tuesdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 3) {
      if (data.wednesdayIsOpen) {
        return data.wednesdayFromTime && data.wednesdayToTime
          ? data.wednesdayFromTime + ' - ' + data.wednesdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 4) {
      if (data.thursdayIsOpen) {
        return data.thursdayFromTime && data.thursdayToTime
          ? data.thursdayFromTime + ' - ' + data.thursdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 5) {
      if (data.fridayIsOpen) {
        return data.fridayFromTime && data.fridayToTime
          ? data.fridayFromTime + ' - ' + data.fridayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    } else if (day == 6) {
      if (data.satdayIsOpen) {
        return data.satdayFromTime && data.satdayToTime
          ? data.satdayFromTime + ' - ' + data.satdayToTime
          : textContent.StoreDetails.open_today;
      } else {
        return textContent.StoreDetails.closed;
      }
    }
  };

  const mountFunction = () => {
    setInitial(true);
    setVendorDetails(route?.params?.vendorData);
    getDistanceValue(
      route?.params?.vendorData?.latitude,
      route?.params?.vendorData?.longitude,
    );

    getUserFriendsList()
      .then(response => {
        getUserCart()
          .then(response => {
            getVendorSaleProductList(response?.findOne?.cart);
          })
          .catch(err => {
            setInitial(false);
          });

        let friends = response.friends;

        friends.some(value => {
          if (value._id == route?.params?.vendorData?._id) {
            setIsFriend(true);
            return;
          }
        });
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const getVendorSaleProductList = cart => {
    let jsonData = {email: route?.params?.vendorData?.email};

    getVendorProductSales(jsonData, sortValue)
      .then(data => {
        let response = data.saleProducts;

        let vendorSales = [];

        response.forEach((element, index) => {
          vendorSales.push({
            ...element,

            type: 'vendorsales',

            inCart: cart.some(item => item._id === element?._id),
          });
        });

        setVendorSales(vendorSales);
        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const addToCart = saleProductId => {
    let jsonData = {
      saleProductId,
    };

    addProductToUserCart(jsonData)
      .then(response => {
        if (response.message) {
          toast.show(response.message);
        }
      })
      .catch(error => {
        toast.show(textContent.general.general_error);
      });
  };

  const rendersalesItem = (item, index) => {
    let price = item.cost.toString();

    if (
      !isMatch(
        item,
        ['albumName', 'artist', 'mediaCondition', 'sleveCondition'],
        searchText,
      ) &&
      !price.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return null;
    }

    return (
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 2,

          borderRadius: 10,
          backgroundColor: colors.cardColor,
          elevation: 4,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          marginTop: 10,
          flexDirection: 'row',
        }}>
        <View
          style={{
            padding: 10,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            style={{
              width: 105,
              height: 105,
              borderRadius: 10,
              alignSelf: 'center',
              backgroundColor: colors.secondaryBackground,
            }}
            source={{
              ...getImage(item.thumbnailImage ?? item.images[0]),
              priority: FastImage.priority.normal, // Set the priority if needed
            }}
          />
        </View>
        <View style={{flex: 4}}>
          <View
            style={{
              flex: 3,
              width: '100%',
              flexDirection: 'row',
            }}>
            <View
              style={{
                flex: 3.8,
                height: '90%',
                overflow: 'hidden',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeThree,
                  fontSize: 18,
                  marginTop: 3,
                  fontFamily: fontFamily.MontserratRegular,
                  marginLeft: 8,
                }}>
                {item.artist}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeTwo,

                  fontSize: 13,
                  fontFamily: fontFamily.MontserratRegular,

                  marginLeft: 8,
                  letterSpacing: 0.5,
                }}>
                {item.albumName}
              </Text>

              <View style={{}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    color: colors.grayShadeTwo,
                    fontSize: 13,
                    marginLeft: 8,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item.label ? item.label + ',' : ''}
                  {item.year ? item.year : '2020'}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 2,
                height: '100%',
                paddingRight: 12,
                paddingTop: 10,
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                overflow: 'hidden',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: darkMode
                    ? colors.grayShadeThree
                    : colors.blackShadeOne,
                  fontSize: 16,
                  fontFamily: fontFamily.MontserratMedium,
                  marginTop: 2,
                }}>
                {`\u20AC${getPrice(parseFloat(item.cost))}`}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 1.7,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View style={{flex: 1, height: '100%'}}>
              {item.mediaCondition ? (
                <View style={{}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 8,
                      color: colors.grayShadeOne,
                    }}>
                    {textContent.StoreDetails.media_condition}:{' '}
                    {item.mediaCondition}
                  </Text>
                </View>
              ) : null}
              {item.sleveCondition ? (
                <View style={{}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 8,
                      color: colors.grayShadeOne,
                    }}>
                    {textContent.StoreDetails.sleeve_condition}:{' '}
                    {item.sleveCondition}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{flex: 1, height: '100%'}}>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  backgroundColor:
                    // item?.inCart
                    //   ? colors.red + 'aa'
                    //   :
                    colors.primaryButtonColor,
                  height: '75%',
                  minWidth: '45%',
                  paddingHorizontal: 7,
                  borderRadius: 10,
                  marginRight: 8,
                  marginBottom: 3,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                }}
                onPress={() => {
                  addToCart(item._id);
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: colors.black,
                    fontSize: 11.5,
                    fontFamily: fontFamily.MontserratMedium,
                    textAlign: 'center',
                  }}>
                  {textContent.StoreDetails.add_to_cart}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const addtoFriends = () => {
    if (!isFriend) {
      let jsonData = {
        sellerId: route?.params?.vendorData._id,
      };

      addFriendToUser(jsonData)
        .then(response => {
          if (response.status === 'success') {
            setIsFriend(true);
          } else {
            toast.show(response.message);
          }
        })
        .catch(error => {});
    } else {
      let jsonData = {sellerId: route?.params?.vendorData._id};

      removeFriendForUser(jsonData)
        .then(response => {
          if (response.status === 'success') {
            setIsFriend(false);
          } else {
            toast.show(response.message);
          }
        })
        .catch(error => {});
    }
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
        title: textContent.StoreDetails.waxplace,
        message: textContent.StoreDetails.location_permission,
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
        Alert.alert(textContent.general.general_error);
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert(textContent.StoreDetails.permission_enable, [
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
      Alert.alert(textContent.StoreDetails.permission_enable_one, '', [
        {text: 'Go to Settings', onPress: openSetting},
        {text: "Don't Use Location", onPress: () => {}},
      ]);
    }

    return false;
  };

  const getDistanceValue = async (latitude, longitude) => {
    if (!(await hasLocationPermission())) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = parseFloat(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = parseFloat(position.coords.latitude);

        const opts = {
          yName: 'latitude',
          xName: 'longitude',
        };
        const origin = {
          longitude: currentLongitude,
          latitude: currentLatitude,
        };

        let distance =
          getDistance(
            {
              latitude: latitude,
              longitude: longitude,
            },
            {
              latitude: currentLatitude,
              longitude: currentLongitude,
            },
          ) / 1000;
        let distanceFromCurrentLocation;
        if (distance > 100) {
          distanceFromCurrentLocation = distance.toFixed(0);
        } else if (distance > 10) {
          distanceFromCurrentLocation = distance.toFixed(2);
        } else {
          distanceFromCurrentLocation = distance.toFixed(3);
        }

        setDistance(distanceFromCurrentLocation);
      },
      error => {},
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

  const renderPage = () => {
    return (
      <View
        ediges={['top']}
        style={{width: '100%', height: '100%', position: 'relative'}}>
        <SearchBar
          backgroundColor={colors.searchBarColor + 'cc'}
          cartValue={userReducer.cartLength}
          searchEnabled={true}
          conditions={true}
          searchText={searchText}
          searchFunction={text => {
            setSearchText(text);
          }}
          placeHolderCondition={
            searchText !== '' ? '' : textContent.StoreDetails.search_text
          }
        />

        <FlatList
          initialNumToRender={5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {initial && (
                <ActivityIndicator
                  size={'small'}
                  style={{marginTop: '15%'}}
                  color={colors.spinner}
                />
              )}
            </>
          }
          ListHeaderComponent={
            <>
              <View>
                <ImageBackground
                  style={{
                    width: '100%',
                    height: 200,
                    backgroundColor: colors.bgGray,
                  }}
                  source={
                    vendorDetails?.backgroundImage
                      ? getImage(vendorDetails?.backgroundImage)
                      : null
                  }>
                  <Image
                    style={{
                      width: '100%',
                      height: 62,
                      position: 'absolute',
                      bottom: 0,
                      tintColor: colors.primaryBackground,
                    }}
                    source={imagepath.bg_curve}></Image>
                </ImageBackground>

                <View
                  style={{
                    width: 110,
                    height: 110,
                    position: 'absolute',
                    bottom: 10,
                    marginBottom: -50,
                    alignSelf: 'center',
                  }}>
                  <Image
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 5,
                      borderColor: colors.secondaryBackground,
                      backgroundColor: darkMode
                        ? colors.primaryBackground
                        : colors.bgGray,
                    }}
                    source={getImage(vendorDetails?.image)}></Image>
                </View>
              </View>

              <View
                style={{
                  width: '100%',
                  alignSelf: 'center',
                }}>
                <View
                  style={{
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 30,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 18,
                      letterSpacing: 1,

                      fontFamily: fontFamily.MontserratRegular,

                      maxWidth: 500,
                    }}>
                    {vendorDetails?.storeName}
                  </Text>
                  <View
                    style={{
                      marginTop: 2,
                      flexDirection: 'row',
                      alignContent: 'center',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      style={{flexDirection: 'row'}}
                      onPress={() => {
                        setShowDatesDialog(true);
                      }}>
                      <Text
                        style={{
                          color: colors.primaryTextColor,
                          fontSize: 15,
                          letterSpacing: 0.5,
                          fontFamily: fontFamily.MontserratRegular,
                        }}>
                        {vendorDetails ? getTimesasPerDay(vendorDetails) : ''}
                      </Text>
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 10,
                        alignContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          color: colors.primaryTextColor,
                          fontSize: 15,
                          letterSpacing: 0.5,
                          fontFamily: fontFamily.MontserratRegular,
                        }}>
                        {distance + 'km'}
                      </Text>
                      <Image
                        style={{width: 10, height: 10, alignSelf: 'center'}}
                        resizeMode={'contain'}
                        source={imagepath.smallpin}></Image>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      addtoFriends();
                    }}>
                    <Image
                      style={{
                        width: isFriend ? 35 : 45,
                        height: isFriend ? 35 : 45,
                        marginRight: 5,
                        marginTop: 10,
                        borderRadius: 20,
                        alignSelf: 'flex-end',
                      }}
                      source={
                        isFriend ? imagepath.wishlistimage : imagepath.heart
                      }></Image>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{width: '95%', alignItems: 'center', marginTop: 5}}>
                <Text
                  numberOfLines={3}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 14,
                    letterSpacing: 1,
                    fontFamily: fontFamily.MontserratRegular,
                    textAlign: 'center',
                    width: 250,
                  }}>
                  {vendorDetails?.storeInfo}
                </Text>
              </View>

              <SortView
                hideDistance={true}
                marginBottom={10}
                //visible={vendorSales.length > 0}
                setFilterType={type => {
                  setSortValue(type);
                }}
              />
            </>
          }
          data={vendorSales}
          extraData={extra}
          style={{
            marginTop: 10,
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: -1,
          }}
          contentContainerStyle={{paddingBottom: 100}}
          renderItem={({item, index}) =>
            rendersalesItem(item, index)
          }></FlatList>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={showDatesDialog}
        onTouchOutside={() => setShowDatesDialog(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            marginTop: 25,
          }}>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.sunday}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 0) : ''}
            </Text>
          </View>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.monday}
            </Text>

            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 1) : ''}
            </Text>
          </View>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.tuesday}
            </Text>

            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 2) : ''}
            </Text>
          </View>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.wednesday}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 3) : ''}
            </Text>
          </View>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.thursday}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 4) : ''}
            </Text>
          </View>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.friday}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 5) : ''}
            </Text>
          </View>
          <View
            style={{
              height: '14.28%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.StoreDetails.saturday}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                marginBottom: 15,
              }}>
              {vendorDetails ? getTimesasPerAPI(vendorDetails, 6) : ''}
            </Text>
          </View>
        </View>
      </Dialog>

      {renderPage()}
      <ProgressLoader
        visible={userReducer.spinner}
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
    backgroundColor: colors.primaryBackground,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(StoreDetails);
