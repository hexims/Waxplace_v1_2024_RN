import React, {useContext, useEffect, useState} from 'react';
import * as HomeNavigation from '../../router/_HomeNavigation';
import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';

import {
  View,
  Dimensions,
  FlatList,
  Text,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Platform,
  StatusBar,
  BackHandler,
  ActivityIndicator,
} from 'react-native';

const {width} = Dimensions.get('window');
import Geolocation from 'react-native-geolocation-service';
import _, {debounce} from 'lodash';
import {openSettings} from 'react-native-permissions';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../../components/SearchBar';
import persistStorage from '../../redux/store/persistStore';
import {updateUserData} from '../../redux/reducers/PersistReducer';
import {connect} from 'react-redux';
import {updateUserDetails} from '../../redux/actions/UserAction';
import {
  getAllActiveWeeklyDrops,
  getAllAppContents,
  getVendorNotification,
} from '../../actions/HomePageAPI';
import {Dialog} from 'react-native-simple-dialogs';
import {
  decodeCvv,
  editUserProfile,
  getUserCart,
  profileDetails,
} from '../../actions/UserAPI';

import {CategoryPage} from './Category';
import {DarkModeContext} from '../../components/DarkModeContext';
import {normalize} from '../../components/NormalizeFonts';
import {WebView} from 'react-native-webview';
import {hasLocationPermission} from '../../actions/HelperFunctions';
import {CategoriesMenu} from './CategoriesMenu';
import textContent from '../../utils/textContent';
import {useToast} from 'react-native-toast-notifications';
import {useSocket} from '../../actions/Socket';
import {useIsFocused} from '@react-navigation/native';
import {CardBottomSheet} from '../../components/CardBottomSheet';
import {
  createRecurringData,
  handleSecureModeRedirectUrl,
  recurringDirectPaymentCIT,
  registerCard,
} from '../../actions/_MangoPay';
import ProgressLoader from '../../components/ProgressLoader';

const HomeScreen = ({navigation, route, userReducer, updateUserDetails}) => {
  const socket = useSocket();
  const toast = useToast();
  const isFocused = useIsFocused();
  const {darkMode, colors} = useContext(DarkModeContext);
  //Categories Data

  const [isHome, setIsHome] = useState(true);
  const [userCategories, setUserCategories] = useState([]);
  const [userMainCategories, setUserMainCategories] = useState([]);

  const [profile, setProfile] = useState(null);
  const [emptyLoader, setEmptyLoader] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [placeHolder, setPlaceHolder] = useState(
    textContent.homePage.search_waxplace,
  );
  const [location, setLocation] = useState(null);
  const [cooridinates, setCoordinates] = useState({});
  const [reload, setReload] = useState(false);
  const [reloadValue, setReloadValue] = useState(0);
  const [homePopup, setHomePopup] = useState(false);
  const [popUpAppContents, setPopUpAppContents] = useState('');
  const [hideComponent, setHideComponent] = useState(false);
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    // Add the event listener for the back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    getAppContent();
    getProfileDetails();
    getLocation();
    updateUserDetails({
      prop: 'categoryData',
      value: [
        [
          {type: 'banner', data: 'emptyLoader'},
          {type: 'banner', data: 'emptyLoader'},
        ],
        [
          {type: 'releases', data: 'emptyLoader'},
          {type: 'releases', data: 'emptyLoader'},
        ],
        [
          {type: 'releases', data: 'emptyLoader'},
          {type: 'releases', data: 'emptyLoader'},
        ],
      ],
    });

    updateUserDetails({
      prop: 'selectedAlbumDetails',
      value: null,
    });
    updateUserDetails({
      prop: 'selectedAlbumRelatedDetails',
      value: null,
    });

    return () => {
      updateUserDetails({prop: 'spinner', value: false});
      updateUserDetails({
        prop: 'homeCategoriesData',
        value: [
          {data: 'emptyLoader', width: 100},
          {data: 'emptyLoader', width: 110},
          {data: 'emptyLoader', width: 100},
          {data: 'emptyLoader', width: 80},
          {data: 'emptyLoader', width: 100},
        ],
      });
    };
  }, []);

  useEffect(() => {
    if (reload) {
      setIsHome(true);
      setReload(false);
    }
  }, [reload]);

  const getAppContent = () => {
    getAllAppContents()
      .then(response => {
        setPopUpAppContents(response.appContent);
      })
      .catch(error => {});
  };
  const updatePopup = () => {
    // it should be ideally false but sending as true for easiness in serverside
    let jsonData = {homePopup: true, popupValue: 1};
    editUserProfile(jsonData)
      .then(response => {
        if (response.status === 'success') {
          setHomePopup(false);
        }
      })
      .catch(error => {});
  };

  const getProfileDetails = () => {
    getUserCart()
      .then(response => {
        updateUserDetails({
          prop: 'cartLength',
          value: response?.findOne?.cart?.length,
        });
      })
      .catch(err => {});
    profileDetails()
      .then(response => {
        if (response && response.user) {
          updateUserDetails({
            prop: 'profileDetails',
            value: response?.user,
          });
          const {
            PROFIT_WAXPLACE_ID,
            PROFIT_WAXPLACE_WALLET_ID,
            WAXPLACE_AUTHOR_ID,
            WAXPLACE_WALLET_ID,
            CLIENT_ID,
            MANGOPAY_APIKEY,
            API_BASE_URL,
          } = response;

          updateUserDetails({
            prop: 'mangoPayDetails',
            value: {
              PROFIT_WAXPLACE_ID: PROFIT_WAXPLACE_ID,
              PROFIT_WAXPLACE_WALLET_ID: PROFIT_WAXPLACE_WALLET_ID,
              WAXPLACE_AUTHOR_ID: WAXPLACE_AUTHOR_ID,
              WAXPLACE_WALLET_ID: WAXPLACE_WALLET_ID,
              CLIENT_ID: CLIENT_ID,
              MANGOPAY_APIKEY: MANGOPAY_APIKEY,
              API_BASE_URL: API_BASE_URL,
            },
          });

          setHomePopup(response.user.homePopup);
          let categoriesArr = [];

          if (
            response.user.isSubscribed ||
            (response.user.subscriptionPlanExpiry &&
              new Date(response.user.subscriptionPlanExpiry).getTime() >
                new Date().getTime())
          ) {
            categoriesArr = [
              {
                createdAt: '',
                image: '',
                name: 'WaxDrops',
                __v: 0,
                _id: '',
              },
              {
                createdAt: '',
                image: '',
                name: '24hr Access',
                __v: 0,
                _id: '',
              },
            ].concat(Array.from(response.user.categories));
          } else {
            categoriesArr = [
              {
                createdAt: '',
                image: '',
                name: 'WaxDrops',
                __v: 0,
                _id: '',
              },
              {
                createdAt: '',
                image: '',
                name: '24hr Access',
                __v: 0,
                _id: '',
              },
            ].concat(Array.from(response.user.categories));
          }

          categoriesArr.push({
            createdAt: '',
            image: '',
            name: 'addcat',
            __v: 0,
            _id: '',
          });

          setProfile(response.user);
          let userCategories = response.user.categories.map(val => val._id);
          setUserMainCategories(userCategories);
          setUserCategories(userCategories);
          updateUserDetails({prop: 'homeCategoriesData', value: categoriesArr});
          setEmptyLoader(false);
        }
      })
      .catch(error => {});
  };

  const getLocation = async () => {
    const hasLocation_permission = await hasLocationPermission();

    if (!hasLocation_permission) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation(position);

        const currentLongitude = parseFloat(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = parseFloat(position.coords.latitude);
        let NY = {
          lat: currentLatitude,
          lng: currentLongitude,
        };

        let jsonData = {
          latitude: currentLongitude + '',
          longitude: currentLatitude + '',
        };

        getVendorNotification(jsonData)
          .then(response => {})
          .catch(error => {});

        persistStorage.dispatch(
          updateUserData({
            prop: 'locationDetails',
            value: {currentLongitude, currentLatitude},
          }),
        );
        updateUserDetails({
          prop: 'locationDetails',
          value: {currentLongitude, currentLatitude},
        });
        setCoordinates({
          currentLongitude: currentLongitude,
          currentLatitude: currentLatitude,
        });
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
        showLocationDialog: true,
      },
    );
  };

  const getActiveWeeklyDrops = () => {
    getAllActiveWeeklyDrops()
      .then(response => {
        if (
          response.weeklyDrop &&
          response.weeklyDrop !== null &&
          response.weeklyDrop !== ''
        ) {
          let categories = [];
          userReducer?.homeCategoriesData.map((value, index) => {
            if (index !== 0) {
              categories.push(value._id);
            }
          });
          HomeNavigation.reset('WeeklyDrops', {
            data: response.weeklyDrop,
            categories,
          });
        }
      })
      .catch(error => {});
  };

  const homeReload = () => {
    setUserCategories(userMainCategories);
    setSearchText('');
    updateUserDetails({
      prop: 'categoryData',
      value: [
        [
          {type: 'banner', data: 'emptyLoader'},
          {type: 'banner', data: 'emptyLoader'},
        ],
        [
          {type: 'releases', data: 'emptyLoader'},
          {type: 'releases', data: 'emptyLoader'},
        ],
        [
          {type: 'releases', data: 'emptyLoader'},
          {type: 'releases', data: 'emptyLoader'},
        ],
      ],
    });
    updateUserDetails({
      prop: 'featuredData',
      value: [
        {data: 'emptyLoader'},
        {data: 'emptyLoader'},
        {data: 'emptyLoader'},
      ],
    });
    setIsHome(false);
    setReload(true);
    setReloadValue(reloadValue + 1);
  };

  const categoryMenuOnPress = item => {
    if (emptyLoader == false) {
      if (item?.name == 'WaxDrops') {
        getActiveWeeklyDrops();
        return;
      } else if (item?.name == 'addcat') {
        HomeNavigation.reset('Categoriesscreen', {
          from: 'Home',
        });
      } else {
        if (
          !(
            userReducer?.profileDetails?.isSubscribed ||
            (userReducer?.profileDetails?.subscriptionPlanExpiry &&
              new Date(
                userReducer?.profileDetails?.subscriptionPlanExpiry,
              ).getTime() > new Date().getTime())
          ) &&
          item?.name == '24hr Access'
        ) {
          setSubscriptionDialog(true);
          return;
        }
        setReloadValue(reloadValue + 1);
        setIsHome(false);
        setUserCategories([item?._id]);
        setSearchText('');

        updateUserDetails({
          prop: 'categoryData',
          value: [
            [
              {type: 'banner', data: 'emptyLoader'},
              {type: 'banner', data: 'emptyLoader'},
            ],
            [
              {type: 'releases', data: 'emptyLoader'},
              {type: 'releases', data: 'emptyLoader'},
            ],
            [
              {type: 'releases', data: 'emptyLoader'},
              {type: 'releases', data: 'emptyLoader'},
            ],
          ],
        });

        setPlaceHolder(item?.name.toLocaleUpperCase());
      }
    }
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={subscriptionDialog}
        onTouchOutside={() => {
          setSubscriptionDialog(false);
        }}
        contentStyle={{
          borderRadius: normalize(15),
          padding: 0,
          paddingVertical: 5,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,

          paddingBottom: normalize(20),
          width: '105%',
          alignSelf: 'center',
        }}>
        <View style={{}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              width: '80%',
              alignSelf: 'center',
              textAlign: 'center',
              fontSize: normalize(25),
              fontFamily: fontFamily.MontserratBold,
              marginTop: normalize(10),
            }}>
            {textContent.Profile.subscription_title}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              width: '80%',
              alignSelf: 'center',
              textAlign: 'center',
              fontSize: normalize(25),
              fontFamily: fontFamily.MontserratBold,
            }}>
            {'&'}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              width: '80%',
              alignSelf: 'center',
              textAlign: 'center',
              fontSize: normalize(25),
              fontFamily: fontFamily.MontserratBold,
            }}>
            {textContent.Profile.recieve}
          </Text>

          <View
            style={{
              width: '80%',
              alignSelf: 'center',
              marginTop: normalize(12),
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <Image
              style={{
                width: normalize(33),
                height: normalize(33),
                alignSelf: 'center',
                tintColor: colors.primaryTextColor,
              }}
              source={imagepath.premiumtoken}></Image>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratMedium,
                marginLeft: normalize(8),
                fontSize: normalize(17),
                textAlign: 'center',
              }}>
              {textContent.Profile.subscription_message_one}
            </Text>
          </View>

          <View
            style={{
              marginTop: normalize(18),
              width: '100%',
              justifyContent: 'center',
              paddingHorizontal: normalize(8),
            }}>
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'flex-start',
                fontFamily: fontFamily.MontserratMedium,
                color: colors.primaryTextColor,
                fontSize: normalize(14),
                marginLeft: normalize(10),
                marginBottom: normalize(13),
              }}>
              {textContent.Profile.featured_items}
            </Text>
            <View
              style={{
                height: normalize(110),
                width: '100%',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    width: normalize(115),
                    height: normalize(115),
                    borderRadius: 12,
                    backgroundColor: colors.bgGray,
                  }}
                  resizeMode={'cover'}
                  source={imagepath.album}></Image>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: normalize(13),
                    alignSelf: 'flex-start',
                    fontFamily: fontFamily.MontserratMedium,
                    color: colors.primaryTextColor,
                    marginLeft: normalize(10),
                    width: normalize(110),
                  }}>
                  {textContent.Profile.your_track}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    width: normalize(115),
                    height: normalize(115),
                    borderRadius: normalize(15),
                    backgroundColor: colors.bgGray,
                  }}
                  resizeMode={'cover'}
                  source={imagepath.album}></Image>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: normalize(13),
                    alignSelf: 'flex-start',
                    fontFamily: fontFamily.MontserratMedium,
                    color: colors.primaryTextColor,
                    marginLeft: normalize(10),
                    width: normalize(110),
                  }}>
                  {textContent.Profile.your_track}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    width: normalize(115),
                    height: normalize(115),
                    borderRadius: 12,
                    backgroundColor: colors.bgGray,
                  }}
                  resizeMode={'cover'}
                  onError={() => loadImagesOnError(2)}
                  source={imagepath.album}></Image>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: normalize(13),
                    alignSelf: 'flex-start',
                    fontFamily: fontFamily.MontserratMedium,
                    color: colors.primaryTextColor,
                    marginLeft: normalize(10),
                    width: normalize(110),
                  }}>
                  {textContent.Profile.your_track}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              color: colors.primaryTextColor,
              marginTop: normalize(30),
              fontSize: normalize(25),
              alignSelf: 'center',
              fontFamily: fontFamily.MontserratBold,
            }}>
            {textContent.Profile.twentyfour_access}
          </Text>
          <Text
            style={{
              width: '80%',
              marginTop: normalize(10),
              alignSelf: 'center',
              textAlign: 'center',
              color: colors.primaryTextColor,
              fontSize: normalize(20),
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Profile.subscription_message_two}
          </Text>
        </View>
        <View style={{}}>
          <TouchableOpacity
            style={{
              marginTop: normalize(30),
              width: '80%',
              alignSelf: 'center',
              height: normalize(40),
              borderRadius: 10,
              justifyContent: 'center',
              backgroundColor: colors.primaryButtonColor,
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
              updateUserDetails({
                prop: 'paymentBottomSheet',
                value: {
                  visible: true,
                  type: 'subscription',
                  amount: 5,
                },
              });
              setSubscriptionDialog(false);
            }}>
            <Text
              style={{
                color: colors.black,
                fontSize: normalize(16),
                fontFamily: fontFamily.MontserratBold,
                alignSelf: 'center',
              }}>
              {textContent.Profile.button_text_seven}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
      <SearchBar
        homeReload={homeReload}
        cartValue={userReducer.cartLength}
        conditions={!isHome && !reload}
        searchEnabled={true}
        cartPress={() => {
          setIsHome(true);

          HomeNavigation.navigate('CartStack');
        }}
        onBackPress={homeReload}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text.toString());
        }}
        placeHolderCondition={
          isHome || reload
            ? textContent.homePage.search_waxplace
            : placeHolder.length < 9
            ? `${textContent.homePage.search_in} ${
                placeHolder.toLocaleUpperCase() == '24HR ACCESS'
                  ? 'PREMIUM'
                  : placeHolder.toLocaleUpperCase()
              }`
            : `${placeHolder}`
        }
      />

      <CategoriesMenu
        colors={colors}
        userReducer={userReducer}
        styles={styles}
        darkMode={darkMode}
        width={width}
        placeHolder={placeHolder}
        isHome={isHome}
        reload={reload}
        onPress={item => categoryMenuOnPress(item)}
      />

      <CategoryPage
        isHome={isHome}
        setHideComponent={value => {
          setHideComponent(value);
        }}
        hideComponent={hideComponent}
        updateUserDetails={updateUserDetails}
        userReducer={userReducer}
        searchText={searchText}
        premium={placeHolder == '24HR ACCESS' && !isHome}
        HomeNavigation={HomeNavigation}
        userCategories={userCategories}
        reloadValue={reloadValue}
        exploreMore={homeReload}
      />

      {isHome  && (
        <TouchableOpacity
          style={{position: 'absolute', right: 0, bottom: '11%'}}
          onPress={() => {
            updateUserDetails({
              prop: 'selectedAlbumDetails',
              value: null,
            });
            HomeNavigation.navigate('CreateSaleProduct');
          }}>
          <Image
            style={{width: 55, height: 95}}
            source={imagepath.weeklyadd}></Image>
        </TouchableOpacity>
      )}

      <Dialog
        visible={homePopup}
        onTouchOutside={() => setHomePopup(false)}
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
          borderRadius: 15,
          height: '76%',
          backgroundColor: colors.cardColor,
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
              {textContent.homePage.home}
            </Text>
          </View>
          <View
            style={{
              height: '65%',
              width: '100%',
              justifyContent: 'center',
              paddingVertical: 10,
            }}>
            {popUpAppContents?.homePopup ? (
              <WebView
                source={{
                  html:
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    `<div style="color: ${colors.primaryTextColor}">` +
                    popUpAppContents?.homePopup +
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
            style={{height: '23%', width: '100%', justifyContent: 'center'}}>
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
                  shadowColor: colors.black,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                }}
                onPress={updatePopup}>
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
                    {textContent.homePage.button_text}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{flex: 1, width: '100%', justifyContent: 'flex-start'}}>
              <TouchableOpacity
                style={{alignSelf: 'center', marginTop: 5}}
                onPress={() => setHomePopup(false)}>
                <Text
                  style={{
                    color: colors.primaryTextColor,

                    letterSpacing: 0.5,
                    paddingVertical: 2,
                    fontFamily: fontFamily.MontserratRegular,
                    fontSize: normalize(15),
                  }}>
                  {textContent.homePage.skip}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Dialog>
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
  categoryflatlist: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'center',
    paddingBottom: 60,
  },

  shadowBox: colors => ({
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,

    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(HomeScreen);
