import React, {useEffect, useState, useCallback, useContext} from 'react';
import * as ProfileNavigation from '../router/_ProfileNavigation';

import Share from 'react-native-share';
import * as StackNavigation from '../router/_StackNavigation';
import fontFamily from '../utils/FontFamily';
import {normalize} from '../components/NormalizeFonts';
import imagepath from '../utils/Images';
import {getPrice} from '../actions/HelperFunctions';

import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  ImageBackground,
  Linking,
  Clipboard,
  Platform,
} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';

const numColumns = 2;

const size = Dimensions.get('window').width / numColumns - 30;

import _ from 'lodash';
import ImagePicker from 'react-native-image-crop-picker';
import {Dialog} from 'react-native-simple-dialogs';
import HTMLView from 'react-native-htmlview';

import OneSignal from 'react-native-onesignal';
import {MainButton} from '../components/MainButton';

import {WebView} from 'react-native-webview';

import {SafeAreaView} from 'react-native-safe-area-context';
import persistStorage from '../redux/store/persistStore';

import {purge} from '../redux/reducers/PersistReducer';
import ProgressLoader from '../components/ProgressLoader';
import {connect} from 'react-redux';

import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage} from '../actions/GenericAPI';
import {
  addAmountToUser,
  addTokensToUser,
  editUserProfile,
  getNotificationsOfUser,
  getPickupDataofUser,
  getUserOrders,
  getWishListofUser,
  profileDetails,
  recentProfileWeeklyDrops,
  withdrawUserBalance,
  getUserSaleProducts,
  getCollectionValue,
  cancelUserSubscription,
  updateProfileImage,
  getUserFriendsList,
  decodeCvv,
  updateUserImage,
  getMangoPayAuthToken,
} from '../actions/UserAPI';
import {
  getAllAppContents,
  saleProductByCategories,
} from '../actions/HomePageAPI';
import {getSalesList} from '../actions/SaleFlowAPI';

import mime from 'mime';

import {DarkModeContext} from '../components/DarkModeContext';

import {useToast} from 'react-native-toast-notifications';

import textContent from '../utils/textContent';

import {CardBottomSheet} from '../components/CardBottomSheet';
import {useSocket} from '../actions/Socket';
import {
  checkKycDocument,
  checkPayInStatus,
  createRecurringData,
  directPayment,
  handleSecureModeRedirectUrl,
  recurringDirectPaymentCIT,
  registerCard,
} from '../actions/_MangoPay';
import {ActivityIndicator} from 'react-native';
import {BASEURL} from '../actions/_apiUrls';

const ProfilScreen = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const socket = useSocket();
  const toast = useToast();
  const [initialData, setInitialData] = useState({
    friends: [],
    cust_id: '',
    shareCode: '',
    withdrawAmount: 0,
    weeklyCount: 0,
    notificationCount: 0,
  });

  const settingInitialData = data => {
    setInitialData(prevState => ({...prevState, ...data}));
  };

  //Address Data
  const [addressData, setAddressData] = useState({
    collectionValue: '',
    updatedProfileinfo: '',
    addressUpdatePopUp: false,
    countryList: [],
    citiesList: [],
    citiesListPagination: [],
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    mobileNumber: '',
    city: '',
  });

  const settingAddressData = data => {
    setAddressData(prevState => ({...prevState, ...data}));
  };

  //Address Data
  const [tempAddressData, setTempAddressData] = useState({
    profile: '',
    collectionValue: '',
    updatedProfileinfo: '',
    addressUpdatePopUp: false,
    countryList: [],
    citiesList: [],
    citiesListPagination: [],
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    mobileNumber: '',

    city: '',
  });

  const settingTempAddressData = data => {
    setTempAddressData(prevState => ({...prevState, ...data}));
  };

  const [showCitiesList, setShowCitiesList] = useState(false);
  const [isSubscriptionData, setIsSubScriptionData] = useState(false);

  //Token Data
  const [token, setToken] = useState({
    token10: false,
    token20: false,
    token30: true,
  });
  const [tokensDialog, setTokensDialog] = useState(false);

  const settingToken = data => {
    setToken(prevState => ({...prevState, ...data}));
  };

  //TopUp Data
  const [topUp, setTopUp] = useState({
    topUp20: false,
    topUp50: false,
    topUp100: false,
    topUpCustom: 0,
    topupPrice: '',
  });
  const [topupDialog, setTopUpDialog] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const settingTopUp = data => {
    setTopUp(prevState => ({...prevState, ...data}));
  };

  //PopUp Data
  const [popUp, setPopUp] = useState({
    popUpAppContents: {},
    popUpImagesArray: [],
  });
  const settingPopUp = data => {
    setPopUp(prevState => ({...prevState, ...data}));
  };

  //Profile Picture
  const [profileImage, setProfileImage] = useState({
    pictureCover: null,
    pictureUser: null,
  });
  const settingProfileImage = data => {
    setProfileImage(prevState => ({...prevState, ...data}));
  };

  //card Details
  const [cardParams, setCardParams] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const [editBio, setEditBio] = useState(false);
  const [noInternet, setNoInternet] = useState(false);
  const [buyPremium, setBuyPremium] = useState(false);

  const [profilePopup, setProfilePopup] = useState(false);
  const [profilOnboardDialog, setProfilOnboardDialog] = useState(false);

  const [cameraPickDialog, setCameraPickDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [editClicked, setEditClicked] = useState(false);

  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const [notificationsView, setNotificationsView] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const isFocused = useIsFocused();

  const {debounce} = _;
  const changeTextDebouncer = useCallback(
    debounce(text => editBioProfile(text), 300),
    [addressData],
  );

  useEffect(() => {
    return () => {
      if (socket) {
        socket.off(`user_purchase_token_${userReducer?.profileDetails?._id}`);
        socket.off(`user_subscription_${userReducer?.profileDetails?._id}`);
      }
    };
  }, [socket, userReducer?.profileDetails?._id]);

  useEffect(() => {
    if (!isFocused) {
      updateUserDetails({prop: 'spinner', value: false});
      updateUserDetails({
        prop: 'selectedCardDetails',
        value: null,
      });
      updateUserDetails({
        prop: 'transactionId',
        value: null,
      });
      updateUserDetails({prop: 'cardDetails', value: null});
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      mountFunction();

      return () => {};
    }, []),
  );







  

  const _renderHtmlView = htmlContent => {
    return <HTMLView value={htmlContent} />;
  };

  const updatePopup = () => {
    // it should be ideally false but sending as true for easiness in serverside
    let jsonData = {profilePopup: true, popupValue: 3};

    editUserProfile(jsonData)
      .then(response => {
        if (response.status === 'success') {
          setProfilePopup(false);
        }
      })
      .catch(error => {});
  };

  const getPurchases = () => {
    getUserOrders()
      .then(response => {
        let purchaseList = [];

        if (response?.orders?.length > 0) {
          ProfileNavigation.navigate('MyPurchases');
        } else {
          toast.show(textContent.Profile.empty_purchase);
        }
      })
      .catch(error => {});
  };

  const getuserPickups = () => {
    getPickupDataofUser()
      .then(response => {
        let pickupList = response.data;

        if (pickupList.length > 0) {
          ProfileNavigation.navigate('PickUpForUser');
        } else {
          toast.show(textContent.Profile.no_pickups);
        }
      })
      .catch(error => {});
  };

  const getWishlistArray = () => {
    getWishListofUser()
      .then(response => {
        if (Array.isArray(response)) {
          if (response.length > 0 && response[0] != null) {
            ProfileNavigation.navigate('Wishlist');
          } else {
            toast.show(textContent.Profile.empty_wishlist);
          }
        }
      })
      .catch(error => {});
  };

  const userCollections = () => {
    getUserSaleProducts()
      .then(response => {
        if (response.saleProducts.length > 0) {
          ProfileNavigation.navigate('Collections');
        } else {
          toast.show(textContent.Profile.empty_collections);
        }
      })
      .catch(error => {});
  };

  const userSales = () => {
    getSalesList()
      .then(response => {
        if (response?.status == 'success') {
          if (response?.result?.length > 0) {
            ProfileNavigation.navigate('MySales');
          } else {
            toast.show(textContent.Profile.empty_sales);
          }
        } else {
          toast.show(textContent.general.general_error);
        }
      })
      .catch(err => {});
  };

  const withDrawAndPaypal = () => {
    let jsonData = {amount: initialData.withdrawAmount};
    withdrawUserBalance(jsonData)
      .then(response => {
        if (response.status == 'success') {
          setTopUpDialog(false);
          settingInitialData({withdrawAmount: 0});
          toast.show(response.message);
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {
        toast.show(textContent.general.general_error);
      });
  };

  const getSaleProductsBycategories = categories => {
    let categories_Array = [];
    categories.map(value => {
      if (value._id !== '') {
        categories_Array.push(value._id);
      }
    });

    let jsonData = {
      categories: JSON.stringify(categories_Array),
      size: 3,
      page: 1,
      searchText: '',
    };

    saleProductByCategories(jsonData)
      .then(response => {
        if (Array.isArray(response.array)) {
          if (response.array.length > 0) {
            let popUpImagesArray = [];

            response.array.map(res => {
              let val = res;
              let image = res?.albumImage;

              popUpImagesArray.push({
                ...res,
                releaseDetails: val,
                id: val.id,

                image,
              });
            });

            settingPopUp({popUpImagesArray});
          }
        }
      })
      .catch(error => {});
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      cropping: true,
    }).then(image => {
      setCameraPickDialog(false);
      let imageFileName = image.path.split(
        'react-native-image-crop-picker/',
      )[1];

      let imageFile = {
        uri: image.path,
        type: mime.getType(image.path),
        name: imageFileName,
        // size: image.size,
      };
      const source = {uri: image.path};
      if (profileImage.picType == 'cover') {
        settingProfileImage({picture: '', pictureCover: source});
        uploadImage(imageFile, 'cover');
      } else {
        settingProfileImage({picture: '', pictureUser: source});
        uploadImage(imageFile, 'user');
      }
    });
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
    }).then(image => {
      setCameraPickDialog(false);

      let imageFileName = image.path.split(
        'react-native-image-crop-picker/',
      )[1];
      let imageFile = {
        uri: image.path,
        type: mime.getType(image.path),
        name: imageFileName,
        // size: image.size,
      };
      const source = {uri: image.path};
      if (profileImage.picType == 'cover') {
        settingProfileImage({picture: '', pictureCover: source});
        uploadImage(imageFile, 'cover');
      } else {
        settingProfileImage({picture: '', pictureUser: source});
        uploadImage(imageFile, 'user');
      }
    });
  };

  const uploadImage = (imageFile, type) => {
    let jsonData = {};
    if (type == 'cover') {
      jsonData = {
        type,
        bgImage: imageFile,
        bgImageName: imageFile.name,
      };
    } else {
      jsonData = {
        type,
        profileImage: imageFile,
        image: imageFile.name,
      };
    }

    updateUserImage(jsonData)
      .then(response => {
        if (response.status === 'success') {
        }
      })
      .catch(error => {});
  };

  const handleEditProfile = (jsonData, showAlert) => {
    editUserProfile(jsonData)
      .then(response => {
        if (response.status === 'success') {
          updateUserDetails({
            prop: 'profileDetails',
            value: response?.user,
          });

          settingAddressData({
            city: response.user.city,
            country: response.user.country,
            addressLine1: response.user.addressLine1,
            addressLine2: response.user.addressLine2,
            mobileNumber: response?.user?.mobileNumber?.toString(),
            zipCode: response.user.zipcode.toString(),
            addressUpdatePopUp: false,
          });
          if (showAlert) {
            toast.show(textContent.Profile.profile_success);
          }
        } else {
          toast.show(response.message);
        }
        updateUserDetails({prop: 'spinner', value: false});
      })
      .catch(error => {
        updateUserDetails({prop: 'spinner', value: false});

        toast.show(textContent.general.general_error);
      });
  };

  const logout = () => {
    Alert.alert(
      textContent.Profile.logout_text,
      textContent.Profile.logout,
      [
        {
          text: 'NO',
          onPress: () => {},
          style: textContent.Profile.cancel,
        },
        {
          text: textContent.Profile.confirm,
          onPress: () => {
            OneSignal.removeExternalUserId(results => {
              // The results will contain push and email success statuses

              // Push can be expected in almost every situation with a success status, but
              // as a pre-caution its good to verify it exists
              if (results.push && results.push.success) {
              }

              // Verify the email is set or check that the results have an email success status
              if (results.email && results.email.success) {
              }
            });
            persistStorage.dispatch(purge({}));
            let delay = 1000; // milliseconds
            let before = Date.now();
            while (Date.now() < before + delay) {}

            StackNavigation.reset('Authscreens');
          },
        },
      ],
      {cancelable: false},
    );
  };

  const mountFunction = async () => {
    updateUserDetails({prop: 'spinner', value: false});
    getCollectionValue()
      .then(response => {
        settingAddressData({collectionValue: response?.result});
      })
      .catch(err => {});

    profileDetails()
      .then(response => {
        if (response.status == 'success') {
          setProfilePopup(response.user.profilePopup);

          if (response.user.country != '') {
            // getCities(response.user.country);
          }
          settingAddressData({
            updatedProfileinfo: response.user.profileInfo,

            city: response.user.city,
            country: response.user.country,
            addressLine1: response.user.addressLine1,
            addressLine2: response.user.addressLine2,
            mobileNumber: response?.user?.mobileNumber?.toString(),
            zipCode: response.user.zipcode.toString(),
          });
          updateUserDetails({
            prop: 'profileDetails',
            value: response?.user,
          });

          settingInitialData({
            shareCode: response.user.shareCode,
          });

          settingProfileImage({
            pictureCover: getImage(response.user.background_image),
            pictureUser:
              response.user.profile_image !== ''
                ? getImage(response.user.profile_image)
                : '',
          });
          let categories = response.user.categories;
          getSaleProductsBycategories(categories);
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {});

    getAllAppContents()
      .then(response => {
        settingPopUp({popUpAppContents: response.appContent});
        setTimeout(() => {
          setProfilOnboardDialog(true);
        }, 500);
      })
      .catch(error => {});

    getRecentProfileWeeklyDrops();
    getNotifications(false);
  };

  const getRecentProfileWeeklyDrops = () => {
    recentProfileWeeklyDrops()
      .then(response => {
        let filterItems = response.weeklyDropArr.filter(item => {
          return item.isWeekly;
        });

        settingInitialData({weeklyCount: filterItems.length});
      })
      .catch(error => {});
  };

  const addAmountUser = amount => {
    let jsonData = {amount: amount};
    addAmountToUser(jsonData)
      .then(response => {
        updateUserDetails({
          prop: 'profileDetails',
          value: response?.user,
        });
      })
      .catch(error => {});
  };

  const tokenUpdation = async (tokens, type, transactionId) => {
    if (token.token10 == true) {
      tokens = 10;
    } else if (token.token20 == true) {
      tokens = 20;
    } else if (token.token30 == true) {
      tokens = 30;
    }

    if (tokens !== 0) {
      updateUserDetails({prop: 'spinner', value: true});
      let jsonData = {
        tokens: tokens,
        type,
      };

      addTokensToUser(jsonData)
        .then(response => {
          if (response.status == 'success') {
            setIsSubScriptionData(false);
            updateUserDetails({prop: 'profileDetails', value: response.user});
            updateUserDetails({
              prop: 'profileDetails',
              value: response?.user,
            });
            settingToken({token10: false, token20: false, token30: true});
            setTokensDialog(false);
            updateUserDetails({prop: 'selectedCardDetails', value: null});
            updateUserDetails({prop: 'cardDetails', value: null});
            updateUserDetails({prop: 'transactionId', value: null});
            toast.show(
              response?.message
                ? response?.message
                : textContent.general.general_error,
            );
          } else {
            toast.show(
              response?.message
                ? response?.message
                : textContent.general.general_error,
            );
          }

          updateUserDetails({prop: 'spinner', value: false});
        })
        .catch(error => {
          updateUserDetails({prop: 'spinner', value: false});
        });
    } else {
      toast.show(textContent.Profile.select_tokens);
    }
  };

  const addTokensUser = async tokens => {
    if (userReducer?.profileDetails?.balance >= tokens) {
      tokenUpdation(tokens, 'wallet', null);
    } else {
      updateUserDetails({
        prop: 'paymentBottomSheet',
        value: {amount: tokens, visible: true, type: 'purchaseToken'},
      });
    }
  };

  const editBioProfile = text => {
    let jsonData = {profileInfo: text};
    handleEditProfile(jsonData, false);
  };

  const getFriendsList = () => {
    getUserFriendsList()
      .then(response => {
        let friends = response?.friends;

        if (friends.length > 0) {
          ProfileNavigation.navigate('FriendsListing');
        } else {
          toast.show(textContent.Profile.no_friends);
        }
      })
      .catch(error => {});
  };

  const getNotifications = navigate => {
    getNotificationsOfUser()
      .then(response => {
        if (response.result.length > 0) {
          settingInitialData({notificationCount: response?.result?.length});
          if (navigate) {
            ProfileNavigation.navigate('Notifications');
          }
        } else {
          if (navigate) {
            Alert.alert('', textContent.Profile.empty_notifications);
          }
        }
      })
      .catch(error => {});
  };

  const cancelYourSubscription = () => {
    let jsonData = {
      subscriptionId: userReducer?.profileDetails?.subscriptionId,
    };
    cancelUserSubscription(jsonData)
      .then(result => {
        if (result.status == 'success') {
          toast.show(textContent.Profile.subscription_updated);

          setAlreadySubscribed(false);

          updateUserDetails({
            prop: 'profileDetails',
            value: result.user,
          });
        } else {
          toast.show(response.message);
        }
      })
      .catch(err => {});
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={alreadySubscribed}
        onTouchOutside={() => setAlreadySubscribed(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          padding: 0,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            width: '100%',
            height: 155,
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: '100%',

              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(24),
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratBold,
                letterSpacing: 0.5,
                fontWeight: 'bold',
              }}>
              {textContent.Profile.subscription_status}
            </Text>
          </View>
          <View
            style={{
              marginTop: 12,
              marginBottom: 20,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(22),
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.Profile.already_subscribed}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 20,
            }}>
            <TouchableOpacity
              style={{
                height: 40,
                width: '75%',
                borderRadius: 8,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                backgroundColor: colors.gray + '90',
              }}
              onPress={() => {
                setAlreadySubscribed(false);
                Alert.alert('', textContent.Profile.subscription_cancel, [
                  {
                    text: textContent.Profile.cancel,
                    onPress: () => {},
                    style: 'cancel',
                  },
                  {
                    text: textContent.Profile.confirm,
                    onPress: () => {
                      cancelYourSubscription();
                    },
                  },
                ]);
              }}>
              <Text
                style={{
                  color: colors.primaryTextColorShadeOne,
                  fontSize: normalize(18),
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1,
                }}>
                {textContent.Profile.button_text_one}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={cameraPickDialog}
        onTouchOutside={() => setCameraPickDialog(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          width: '90%',
          backgroundColor: colors.secondaryBackground,

          alignSelf: 'center',
        }}>
        <View
          style={{
            borderRadius: 10,

            alignItems: 'center',

            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              // width: '100%',
              justifyContent: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  openCamera();
                }, 1000);
              } else {
                openCamera();
              }
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.Profile.camera}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              // width: '100%',
              justifyContent: 'center',
              marginTop: normalize(15),
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  pickImage();
                }, 1000);
              } else {
                pickImage();
              }
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.Profile.gallery}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>

      <Dialog
        visible={shareDialog}
        onTouchOutside={() => setShareDialog(false)}
        contentStyle={{
          borderRadius: 15,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          paddingBottom: normalize(10),

          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            borderRadius: 10,

            marginTop: normalize(10),
          }}>
          <View style={{width: '100%', flexDirection: 'row'}}>
            <View style={{flex: 1}}></View>
            <View
              style={{
                flex: 1,

                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: normalize(26),
                  alignSelf: 'center',
                  fontFamily: fontFamily.MontserratBold,
                  letterSpacing: 0.5,
                  fontWeight: 'bold',
                }}>
                {textContent.Profile.share}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flex: 1,

                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                <Image
                  style={{
                    width: normalize(25),
                    height: normalize(25),

                    tintColor: colors.baseYellow,
                    marginRight: normalize(20),
                  }}
                  source={imagepath.stars}></Image>
              </View>
              <View
                style={{
                  flex: 1,

                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                }}></View>
            </View>
          </View>

          <Text
            style={{
              alignSelf: 'center',
              textAlign: 'center',
              color: colors.primaryTextColor,
              width: '90%',
              fontSize: normalize(18),
              marginTop: normalize(15),
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Profile.token_message}
          </Text>

          <View
            style={{
              width: '70%',
              marginTop: normalize(20),
              alignSelf: 'center',
              flexDirection: 'row',
            }}>
            <Image
              style={{
                width: normalize(32),
                height: normalize(32),
                alignSelf: 'center',
                tintColor: colors.primaryTextColor,
              }}
              source={imagepath.token1}></Image>

            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(25),
                marginLeft: normalize(15),
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.Profile.free_token}
            </Text>
          </View>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: normalize(16),
              fontFamily: fontFamily.MontserratMedium,
              letterSpacing: 1,
              alignSelf: 'center',
              marginTop: normalize(15),
            }}>
            {textContent.Profile.your_share_code}
          </Text>

          <Text
            style={{
              color: colors.primaryTextColor,
              alignSelf: 'center',
              fontSize: normalize(22),
              marginTop: normalize(10),
              fontFamily: fontFamily.MontserratBold,
            }}>
            {initialData.shareCode}
          </Text>

          <TouchableOpacity
            style={{
              height: normalize(35),
              alignSelf: 'center',
              marginTop: normalize(15),
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              borderRadius: normalize(10),
              backgroundColor: darkMode
                ? colors.blackShadeOne
                : colors.secondaryBackground,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              shadowOffset: {width: 0, height: 2},
              shadowColor: colors.shadowColor,
              shadowOpacity: 0.2,
            }}
            onPress={() => {
              if (initialData.shareCode == '') {
                toast.show(textContent.Profile.share_code_not_added);
                return;
              }
              Clipboard.setString(initialData.shareCode);
              toast.show(textContent.Profile.share_code_copied);
            }}>
            <Text
              style={{
                marginHorizontal: normalize(10),
                color: colors.primaryTextColor,
                fontSize: normalize(15),
                alignSelf: 'center',

                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.Profile.button_text_two}
            </Text>
          </TouchableOpacity>

          <MainButton
            style={{
              marginTop: 25,
              marginBottom: 4,
              height: 35,
              width: 200,
              paddingHorizontal: 5,
              borderRadius: 15,
              backgroundColor: colors.primaryButtonColor,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              alignSelf: 'center',
            }}
            fontSize={15}
            title={textContent.Profile.button_text_three}
            onPress={() => {
              if (initialData.shareCode == '') {
                toast.show(textContent.Profile.share_code_not_added);
                return;
              }
              Share.open({
                title: textContent.Profile.share_code_title,
                fullName: '',
                subject: textContent.Profile.share_code_subject,
                message:
                  textContent.Profile.share_code_message +
                  initialData.shareCode,
              });
            }}
          />
        </View>
      </Dialog>

      <Dialog
        visible={profilePopup}
        onTouchOutside={() => setProfilePopup(false)}
        contentStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
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
          borderRadius: 12,
          height: '76%',

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
              {textContent.Profile.profile}
            </Text>
          </View>
          <View
            style={{
              height: '65%',
              width: '100%',
              justifyContent: 'center',
              paddingVertical: 10,
            }}>
            {popUp?.popUpAppContents?.profilePopup ? (
              <WebView
                source={{
                  html:
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    `<div style="color: ${colors.primaryTextColor}">` +
                    popUp?.popUpAppContents?.profilePopup +
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
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                }}
                onPress={() => updatePopup()}>
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
                    {textContent.Profile.button_text_four}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{flex: 1, width: '100%', justifyContent: 'flex-start'}}>
              <TouchableOpacity
                style={{alignSelf: 'center', marginTop: 5}}
                onPress={() => setProfilePopup(false)}>
                <Text
                  style={{
                    color: colors.primaryTextColor,

                    letterSpacing: 0.5,
                    paddingVertical: 2,
                    fontFamily: fontFamily.MontserratRegular,
                    fontSize: normalize(15),
                  }}>
                  {textContent.Profile.skip}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={topupDialog}
        onTouchOutside={() => setTopUpDialog(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 12,
          padding: 0,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            height: 290,
            width: '100%',
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            marginTop: normalize(10),
            paddingHorizontal: normalize(20),
          }}>
          <View
            style={{
              flex: 1,
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(22),
                fontWeight: 'bold',
                alignSelf: 'center',
                letterSpacing: 1,
              }}>
              {textContent.Profile.withdraw}
            </Text>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(17),
                letterSpacing: 1,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratRegular,
                paddingHorizontal: normalize(20),
                marginTop: normalize(12),
              }}>
              {textContent.Profile.withdraw_message}
            </Text>
          </View>
          <View
            style={{
              flex: 1.5,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 12,
                fontFamily: fontFamily.MontserratMedium,
                alignSelf: 'flex-start',
              }}>
              {textContent.Profile.amount}
            </Text>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                borderRadius: 8,
                marginTop: 7,

                height: 50,
                borderWidth: 1,
                borderColor: colors.premiumGray + '80',
                backgroundColor: colors.searchBarColor,
              }}>
              <TextInput
                value={initialData.withdrawAmount}
                onChangeText={text => {
                  settingInitialData({withdrawAmount: text});
                }}
                placeholderTextColor={colors.primaryTextColor}
                style={{
                  width: '100%',
                  height: '100%',
                  color: colors.primaryTextColor,
                  paddingLeft: 10,
                  fontFamily: fontFamily.MontserratRegular,
                  fontSize: 16,
                  letterSpacing: 0.5,
                  backgroundColor: colors.transparent,
                }}></TextInput>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MainButton
              style={{
                width: '90%',
                alignSelf: 'center',
                height: normalize(40),
                borderRadius: 10,
                justifyContent: 'center',
                backgroundColor: colors.primaryButtonColor,
                alignItems: 'center',
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}
              textStyle={{
                color: colors.black,
                paddingVertical: 2,
                fontFamily: fontFamily.MontserratBold,
              }}
              onPress={() => {
                if (
                  initialData?.withdrawAmount <=
                    userReducer?.profileDetails?.balance &&
                  initialData?.withdrawAmount > 0
                ) {
                  withDrawAndPaypal();
                } else {
                  toast.show(textContent.Profile.invalid_withdrawal);
                }
              }}
              fontSize={14.5}
              title={textContent.Profile.button_text_five}
            />
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={tokensDialog}
        onTouchOutside={() => {
          settingToken({
            token10: false,
            token20: false,
            token30: true,
          });
          setTokensDialog(false);
          setBuyPremium(false);
        }}
        contentStyle={{borderRadius: 15, padding: 0, paddingVertical: 5}}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          paddingBottom: normalize(20),

          width: '105%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            width: '100%',

            flexDirection: 'row',
          }}>
          <View
            style={{flex: 5, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(24),
                alignSelf: 'center',
                letterSpacing: 0.5,
                marginLeft: normalize(5),
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.Profile.purchase_tokens}
            </Text>
          </View>
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 20,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: normalize(30),
                height: normalize(30),
                tintColor: colors.baseYellow,
              }}
              source={imagepath.stars}></Image>
          </View>
        </View>
        <View
          style={{
            marginVertical: normalize(7),
            width: '100%',

            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              alignSelf: 'center',
              textAlign: 'center',
              color: colors.grayShadeThree,
              fontFamily: fontFamily.MontserratRegular,
              fontSize: normalize(18),
              letterSpacing: normalize(1.2),
              marginBottom: normalize(10),
            }}>
            {textContent.Profile.appear_featured}
          </Text>
        </View>
        <View
          style={{
            marginVertical: normalize(2),
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: normalize(20),
          }}>
          <Text
            style={{
              alignSelf: 'center',
              textAlign: 'center',
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratMedium,
              fontSize: normalize(18),
            }}>
            {textContent.Profile.featured_message}
          </Text>
        </View>
        <View
          style={{
            marginVertical: normalize(20),
            width: '100%',
            justifyContent: 'center',
            paddingHorizontal: normalize(10),
          }}>
          <Text
            numberOfLines={1}
            style={{
              alignSelf: 'flex-start',
              fontFamily: fontFamily.MontserratBold,
              color: colors.primaryTextColor + 'cc',
              fontSize: normalize(15),
              marginLeft: normalize(8),
              marginBottom: normalize(20),
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
                  width: normalize(112),
                  height: normalize(112),
                  borderRadius: 10,
                  backgroundColor: colors.bgGray,
                }}
                resizeMode={'cover'}
                onError={() => loadImagesOnError(0)}
                source={
                  popUp.popUpImagesArray[0] !== undefined &&
                  popUp.popUpImagesArray[0].image
                    ? {uri: popUp.popUpImagesArray[0].image}
                    : imagepath.album
                }></Image>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontSize: normalize(14),
                  alignSelf: 'flex-start',
                  fontFamily: fontFamily.MontserratMedium,
                  color: colors.primaryTextColor,
                  marginLeft: normalize(4),
                  width: normalize(110),
                }}>
                {popUp.popUpImagesArray[0] !== undefined &&
                popUp.popUpImagesArray[0].album &&
                popUp.popUpImagesArray[0].album !== ''
                  ? popUp.popUpImagesArray[0].album
                  : textContent.Profile.your_track}
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
                  width: normalize(112),
                  height: normalize(112),
                  borderRadius: 10,
                  backgroundColor: colors.bgGray,
                }}
                resizeMode={'cover'}
                onError={() => loadImagesOnError(1)}
                source={
                  popUp.popUpImagesArray[1] !== undefined &&
                  popUp.popUpImagesArray[1].image
                    ? {uri: popUp.popUpImagesArray[1].image}
                    : imagepath.album
                }></Image>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontSize: normalize(14),
                  alignSelf: 'flex-start',
                  fontFamily: fontFamily.MontserratMedium,
                  color: colors.primaryTextColor,
                  marginLeft: normalize(4),
                  width: normalize(110),
                }}>
                {popUp.popUpImagesArray[1] !== undefined &&
                popUp.popUpImagesArray[1].album &&
                popUp.popUpImagesArray[1].album !== ''
                  ? popUp.popUpImagesArray[1].album
                  : textContent.Profile.your_track}
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
                  width: normalize(112),
                  height: normalize(112),
                  borderRadius: 10,
                  backgroundColor: colors.bgGray,
                }}
                resizeMode={'cover'}
                onError={() => loadImagesOnError(2)}
                source={
                  popUp.popUpImagesArray[2] !== undefined &&
                  popUp.popUpImagesArray[2].image
                    ? {uri: popUp.popUpImagesArray[2].image}
                    : imagepath.album
                }></Image>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontSize: normalize(14),
                  alignSelf: 'flex-start',
                  fontFamily: fontFamily.MontserratMedium,
                  color: colors.primaryTextColor,
                  marginLeft: normalize(4),
                  width: normalize(110),
                }}>
                {popUp.popUpImagesArray[2] !== undefined &&
                popUp.popUpImagesArray[2].album &&
                popUp.popUpImagesArray[2].album !== ''
                  ? popUp.popUpImagesArray[2].album
                  : textContent.Profile.your_track}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: normalize(15),
            width: '100%',
            flexDirection: 'row',
            paddingHorizontal: normalize(10),
          }}>
          <View style={{flex: 1, alignContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              style={{
                backgroundColor:
                  token.token10 == true
                    ? darkMode
                      ? colors.gray + '90'
                      : colors.lightGreen
                    : darkMode
                    ? colors.blackShadeOne
                    : colors.secondaryBackground,
                alignSelf: 'center',
                borderRadius: 14,
                width: '90%',
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                height: normalize(35),
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 5,
              }}
              onPress={() => {
                settingToken({
                  token10: true,
                  token20: false,
                  token30: false,
                });
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  fontSize: normalize(15),
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1.2,
                }}>
                {textContent.Profile.ten_tokens}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: normalize(14),
                alignSelf: 'center',
                fontWeight: '400',
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                marginVertical: normalize(5),
              }}>
              {''}
            </Text>
          </View>
          <View style={{flex: 1, alignContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              style={{
                backgroundColor:
                  token.token20 == true
                    ? darkMode
                      ? colors.gray + '90'
                      : colors.lightGreen
                    : darkMode
                    ? colors.blackShadeOne
                    : colors.secondaryBackground,
                alignSelf: 'center',
                borderRadius: 14,
                width: '90%',
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                height: normalize(35),
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 5,
              }}
              onPress={() => {
                settingToken({
                  token10: false,
                  token20: true,
                  token30: false,
                });
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  fontSize: normalize(15),
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1.2,
                }}>
                {textContent.Profile.twenty_tokens}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: normalize(14),
                alignSelf: 'flex-end',
                fontFamily: fontFamily.MontserratMedium,
                color: colors.gray,
                marginVertical: normalize(8),
                marginRight: 15,
              }}>
              {textContent.Profile.save28}
            </Text>
          </View>
          <View style={{flex: 1, alignContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              style={{
                backgroundColor:
                  token.token30 == true
                    ? darkMode
                      ? colors.gray + '90'
                      : colors.lightGreen
                    : darkMode
                    ? colors.blackShadeOne
                    : colors.secondaryBackground,
                alignSelf: 'center',
                borderRadius: 14,
                width: '90%',
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                height: normalize(35),
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 5,
              }}
              onPress={() => {
                settingToken({
                  token10: false,
                  token20: false,
                  token30: true,
                });
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  fontSize: normalize(15),
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1.2,
                }}>
                {textContent.Profile.thirty_tokens}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: normalize(14),
                alignSelf: 'flex-end',
                fontFamily: fontFamily.MontserratMedium,
                color: colors.gray,
                marginVertical: normalize(8),
                marginRight: 15,
              }}>
              {textContent.Profile.save39}
            </Text>
          </View>
        </View>
        <View
          style={{
            marginVertical: normalize(5),
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '50%',

              paddingVertical: normalize(3),
              alignContent: 'center',
              alignItems: 'center',

              borderRadius: 15,

              backgroundColor: colors.primaryBackground,

              elevation: 2,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: colors.premiumGrayOne + '20',
                borderColor: colors.premiumGrayOne + 'aa',
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  fontSize: normalize(18),
                  fontFamily: fontFamily.MontserratBold,

                  marginTop: normalize(7),
                  marginBottom: normalize(7),
                }}>
                {textContent.Profile.wallet}
              </Text>
              <View
                style={{
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderColor: darkMode
                    ? colors.primaryTextColor
                    : colors.premiumGrayOne,
                  width: '88%',
                }}
              />
              <Text
                adjustsFontSizeToFit={true}
                style={{
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  marginTop: normalize(6),
                  marginBottom: normalize(6),
                  fontSize: normalize(28),
                  fontFamily: fontFamily.MontserratBold,
                  letterSpacing: 1,
                }}>
                {userReducer?.profileDetails?.balance
                  ? `\u20AC${getPrice(
                      parseFloat(userReducer?.profileDetails?.balance),
                    )}`
                  : `\u20AC0`}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginVertical: normalize(20),
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MainButton
            style={{
              width: '80%',
              alignSelf: 'center',
              height: normalize(40),
              borderRadius: 10,
              justifyContent: 'center',
              backgroundColor: colors.primaryButtonColor,
              alignItems: 'center',
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
            textStyle={{
              color: colors.black,
              paddingVertical: 2,
              fontFamily: fontFamily.MontserratBold,
            }}
            onPress={() => {
              if (buyPremium == true) {
              } else {
                let tokens = 0;
                if (token.token10 == true) {
                  tokens = 10;
                } else if (token.token20 == true) {
                  tokens = 20;
                } else if (token.token30 == true) {
                  tokens = 30;
                }

                if (token.token30 || token.token20 || token.token10) {
                  settingTopUp({
                    topupPrice: tokens,
                  });

                  addTokensUser(tokens);

                  setTokensDialog(false);
                } else {
                  toast.show(textContent.Profile.select_tokens);
                }
              }
            }}
            fontSize={14.5}
            title={
              token.token10
                ? textContent.Profile.button_text_six + ' \u20AC10'
                : token.token20
                ? textContent.Profile.button_text_six + ' \u20AC20'
                : textContent.Profile.button_text_six + ' \u20AC30'
            }
          />
        </View>
      </Dialog>

      <Dialog
        visible={subscriptionDialog}
        onTouchOutside={() => {
          settingToken({
            token10: false,
            token20: false,
            token30: true,
          });
          setBuyPremium(false);
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
                  onError={() => loadImagesOnError(0)}
                  source={
                    popUp.popUpImagesArray[0] !== undefined &&
                    popUp.popUpImagesArray[0].image
                      ? {uri: popUp.popUpImagesArray[0].image}
                      : imagepath.album
                  }></Image>
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
                  {popUp.popUpImagesArray[0] !== undefined &&
                  popUp.popUpImagesArray[0].album &&
                  popUp.popUpImagesArray[0].album !== ''
                    ? popUp.popUpImagesArray[0].album
                    : textContent.Profile.your_track}
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
                  onError={() => loadImagesOnError(1)}
                  source={
                    popUp.popUpImagesArray[1] !== undefined &&
                    popUp.popUpImagesArray[1].image
                      ? {uri: popUp.popUpImagesArray[1].image}
                      : imagepath.album
                  }></Image>
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
                  {popUp.popUpImagesArray[1] !== undefined &&
                  popUp.popUpImagesArray[1].album &&
                  popUp.popUpImagesArray[1].album !== ''
                    ? popUp.popUpImagesArray[1].album
                    : textContent.Profile.your_track}
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
                  source={
                    popUp.popUpImagesArray[2] !== undefined &&
                    popUp.popUpImagesArray[2].image
                      ? {uri: popUp.popUpImagesArray[2].image}
                      : imagepath.album
                  }></Image>
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
                  {popUp.popUpImagesArray[2] !== undefined &&
                  popUp.popUpImagesArray[2].album &&
                  popUp.popUpImagesArray[2].album !== ''
                    ? popUp.popUpImagesArray[2].album
                    : textContent.Profile.your_track}
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
                value: {amount: 5, visible: true, type: 'subscription'},
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{width: '100%', height: '100%', paddingBottom: 50}}>
          <TouchableOpacity disabled={true}>
            <ImageBackground
              style={{
                width: '100%',
                height: 200,
                backgroundColor: colors.bgGray,
              }}
              source={profileImage.pictureCover}>
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
                source={
                  profileImage.pictureUser
                    ? profileImage.pictureUser
                    : profileImage?.pictureUser == ''
                    ? imagepath.profilephoto
                    : ''
                }></Image>
            </View>
          </TouchableOpacity>
          <View style={{width: '90%', alignSelf: 'center', marginVertical: 15}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                letterSpacing: 1,
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 21,
                marginTop: 15,
                // marginBottom:
                // addressData?.updatedProfileinfo && addressData?.updatedProfileinfo != '' && editBio == false
                //     ? 0
                //     : 12,
              }}>
              {userReducer?.profileDetails?.firstName
                ? userReducer?.profileDetails?.firstName +
                  (userReducer?.profileDetails?.lastName
                    ? ' ' + userReducer?.profileDetails?.lastName
                    : '')
                : ''}
            </Text>
            {editBio == true ? (
              <View
                style={{
                  width: '98%',
                  height: 80,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',

                  alignSelf: 'flex-start',
                  marginVertical: 5,
                  overflow: 'hidden',
                  padding: 5,
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                }}>
                <TextInput
                  multiline={true}
                  value={addressData?.updatedProfileinfo}
                  onChangeText={text => {
                    settingAddressData({updatedProfileinfo: text});
                    changeTextDebouncer(text);
                  }}
                  style={{
                    alignSelf: 'center',
                    textAlignVertical: 'top',
                    width: '100%',
                    height: '100%',
                    color: colors.primaryTextColor,
                    letterSpacing: 2,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    paddingHorizontal: 5,
                  }}
                  placeholder={addressData?.updatedProfileinfo}
                  placeholderTextColor={colors.primaryTextColor}></TextInput>
              </View>
            ) : userReducer?.profileDetails?.profileInfo &&
              userReducer?.profileDetails?.profileInfo !== '' ? (
              <View
                style={{
                  width: '98%',
                  marginTop: 5,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',

                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}>
                <Text
                  numberOfLines={4}
                  style={{
                    color: colors.primaryTextColor,
                    width: '98%',
                    alignSelf: 'center',
                    letterSpacing: 1,
                    fontSize: 15,
                    textAlign: 'center',

                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {userReducer?.profileDetails?.profileInfo}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 20,
                marginBottom: 8,
                backgroundColor: darkMode
                  ? colors.waxplaceYellow
                  : colors.waxplaceYellow,
                height: 90,
                borderRadius: 12,
                shadowOffset: {width: 0, height: 2},
                shadowColor: colors.shadowColor,
                shadowOpacity: 0.2,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 4,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{flex: 1, height: '100%'}}
                onPress={() => userCollections()}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: 11,
                      fontFamily: fontFamily.MontserratRegular,
                      alignSelf: 'center',
                      letterSpacing: 1,
                    }}>
                    {textContent.Profile.collection_value}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 2,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    adjustsFontSizeToFit={true}
                    style={{
                      color: colors.black,
                      fontSize: 22,
                      fontFamily: fontFamily.MontserratBold,
                      letterSpacing: 1,
                    }}>
                    {addressData?.collectionValue
                      ? `\u20AC${getPrice(
                          parseFloat(addressData?.collectionValue),
                        )}`
                      : `\u20AC0`}
                  </Text>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  borderLeftWidth: 0.8,
                  alignSelf: 'center',
                  height: '85%',
                  borderColor: darkMode ? colors.black : colors.black + '50',
                }}></View>

              <TouchableOpacity
                style={{flex: 1, height: '100%'}}
                onPress={() => {
                  // setTopUpDialog(true);
                  ProfileNavigation?.navigate('WalletHistory');
                }}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      flex: 3,
                      height: '100%',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: colors.black,
                        fontSize: 11,
                        alignSelf: 'center',
                        letterSpacing: 1,
                        fontFamily: fontFamily.MontserratRegular,
                      }}>
                      {textContent.Profile.wallet}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 2,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    adjustsFontSizeToFit={true}
                    style={{
                      color: colors.black,
                      fontSize: 22,
                      fontFamily: fontFamily.MontserratBold,
                      letterSpacing: 1,
                    }}>
                    {userReducer?.profileDetails?.balance
                      ? `\u20AC${getPrice(
                          parseFloat(userReducer?.profileDetails?.balance),
                        )}`
                      : `\u20AC0`}
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  height: '100%',
                  alignItems: 'center',
                  position: 'absolute',
                  top: 2,
                  right: 15,
                  justifyContent: 'flex-start',
                }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.black,
                  }}>
                  {'+'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                flexDirection: 'row',
              }}
              onPress={() => {
                if (isSubscriptionData) {
                  Alert.alert('', textContent.general.retry_text, [
                    {
                      text: 'Cancel',
                      onPress: () => {},
                      style: 'cancel',
                    },
                    {
                      text: 'Confirm',
                      onPress: () => {
                        let tokens = 0;
                        if (token.token10 == true) {
                          tokens = 10;
                        } else if (token.token20 == true) {
                          tokens = 20;
                        } else if (token.token30 == true) {
                          tokens = 30;
                        }
                        updateUserDetails({prop: 'spinner', value: true});
                        let jsonData = {
                          tokens: tokens,
                          type: 'mangopay',
                        };

                        addTokensToUser(jsonData)
                          .then(response => {
                            if (response.status == 'success') {
                              setIsSubScriptionData(false);

                              updateUserDetails({
                                prop: 'profileDetails',
                                value: response?.user,
                              });
                              settingToken({
                                token10: false,
                                token20: false,
                                token30: true,
                              });
                              setTokensDialog(false);
                            }
                            updateUserDetails({prop: 'spinner', value: false});
                            toast.show(response.message);
                          })
                          .catch(error => {
                            updateUserDetails({prop: 'spinner', value: false});
                          });
                      },
                    },
                  ]);
                } else {
                  setTokensDialog(true);
                }
              }}>
              <View style={{flex: 3, height: '100%', flexDirection: 'row'}}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      alignSelf: 'center',
                      marginLeft: 10,
                      tintColor: colors.waxplaceTextColor,
                    }}
                    source={imagepath.premium}></Image>
                </View>

                <View
                  style={{
                    flex: 4,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      color: colors.waxplaceTextColor,
                      fontSize: 20,
                      fontFamily: fontFamily.MontserratBold,
                      marginLeft: -2,
                    }}>
                    {userReducer?.profileDetails?.purchaseTokens}
                  </Text>
                  <Text
                    style={{
                      color: colors.waxplaceTextColor,
                      fontSize: 16,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {' '}
                    {textContent.Profile.tokens}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 0.5,
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: fontFamily.MontserratBold,
                    color: colors.waxplaceTextColor,
                  }}>
                  {'+'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                userCollections();
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.collections}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                getWishlistArray();
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.wishlist}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                getuserPickups();
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.pickups}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                userSales('MySales');
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.my_sales}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                getPurchases();
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.my_purchases}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                getFriendsList();
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.friends}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => ProfileNavigation.navigate('ProfileWeeklyDrops')}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.waxdrop_create}
              </Text>

              {initialData.weeklyCount > 0 ? (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.waxplaceTextColor,
                    position: 'absolute',
                    top: 15,
                    right: 20,
                  }}>
                  <Text
                    style={{
                      color: colors.secondaryBackground,
                      fontSize: normalize(15),
                      fontFamily: fontFamily.MontserratRegular,
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      marginBottom: 2,
                    }}>
                    {initialData.weeklyCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                if (userReducer?.profileDetails?.isSubscribed) {
                  setAlreadySubscribed(true);
                } else {
                  setSubscriptionDialog(true);
                }
              }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  alignSelf: 'center',
                  marginLeft: 20,
                  tintColor: userReducer?.profileDetails?.isSubscribed
                    ? colors.successGreen
                    : colors.waxplaceTextColor,
                }}
                source={imagepath.premium}></Image>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  alignSelf: 'center',
                  letterSpacing: 1,
                  marginLeft: 8,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {/* {userReducer?.profileDetails?.isSubscribed
                  ? textContent.Profile.already_subscribed_message
                  : textContent.Profile.become_premium} */}
                {textContent.Profile.become_premium}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => getNotifications(true)}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.notifications}
              </Text>
              {initialData.notificationCount > 0 ? (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 22,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: darkMode
                      ? colors.waxplaceTextColor
                      : colors.waxplaceYellow,
                    position: 'absolute',
                    top: 15,
                    right: 20,
                  }}>
                  <Text
                    style={{
                      color: darkMode
                        ? colors.secondaryBackground
                        : colors.primaryTextColor,
                      fontSize: normalize(16),
                      fontFamily: fontFamily.MontserratRegular,
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      marginBottom: 2,
                    }}>
                    {initialData.notificationCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() =>
                ProfileNavigation.navigate('Categoriesscreen', {
                  from: 'Profile',
                })
              }>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.categories}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                if (
                  userReducer?.profileDetails?.kycIdentityInfo[0]?.kycDocumentId
                ) {
                  checkKycDocument(
                    userReducer?.profileDetails?.kycIdentityInfo[0]
                      ?.kycDocumentId,
                    userReducer,
                  )
                    .then(res => {
                      if (res?.data?.Type) {
                        ProfileNavigation.navigate('PaymentSettings', {
                          validationAsked:
                            res?.data?.Status == 'VALIDATION_ASKED'
                              ? true
                              : false,
                          kycApproved:
                            res?.data?.Status == 'VALIDATED' ? true : false,
                        });
                      } else {
                        toast.show(textContent.general.general_error);
                      }
                    })
                    .catch(err => {
                      ProfileNavigation.navigate('PaymentSettings', {
                        kycApproved: false,
                      });
                    });
                } else {
                  ProfileNavigation.navigate('PaymentSettings', {
                    kycApproved: false,
                  });
                }
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.payment_settings}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => {
                ProfileNavigation.navigate('Address');
              }}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.edit_profile}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '98%',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}
              onPress={() => setShareDialog(true)}>
              <Text
                style={{
                  color: colors.waxplaceTextColor,
                  fontSize: 17,
                  letterSpacing: 1,
                  marginLeft: 20,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent.Profile.share_earn}
              </Text>

              <Image
                style={{
                  width: 30,
                  height: 30,
                  tintColor: darkMode
                    ? colors.waxplaceTextColor
                    : colors.waxplaceYellow,
                  position: 'absolute',
                  right: 10,
                  alignSelf: 'center',
                }}
                source={imagepath.stars}></Image>
            </TouchableOpacity>

            <View style={{marginTop: 25, marginLeft: 20, marginBottom: 20}}>
              <TouchableOpacity
                style={{marginBottom: 12}}
                onPress={() => ProfileNavigation.navigate('Settings')}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Profile.settings}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginBottom: 12}}
                onPress={() => {
                  ProfileNavigation.navigate('Terms', {type: 'faq'})
                }}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Profile.help_faq}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginBottom: 12}}
                onPress={() => {
                  Linking.openURL('mailto:contact@waxplace.co').catch(error => {
                    // Handle error if the mail client cannot be opened
                    toast.show(textContent.general.general_error);
                  });
                }}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Profile.contact_us}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginBottom: 12}}
                onPress={() => {
                  // ProfileNavigation.navigate('Terms', {type: 'MnC'})
                  getAllAppContents()
                    .then(response => {
                      if (
                        response?.appContent?.MandT &&
                        response?.appContent?.MandT !== ''
                      ) {
                        Linking.canOpenURL(BASEURL + response?.appContent?.MandT).then(value=>{
                          if(value)
                          {
                            Linking.openURL(BASEURL + response?.appContent?.MandT);
                          }else{
                            toast.show(textContent.general.general_error)
                          }
                        })
                    
                      }
                    })
                    .catch(error => {});
                }}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Profile.mnc}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{marginBottom: 12}}
                onPress={() =>
                  ProfileNavigation.navigate('Terms', {type: 'TandC'})
                }>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Profile.tnc}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{marginBottom: 12}}
                onPress={() => logout()}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Profile.logout_text}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {!editClicked && (
        <TouchableOpacity
          style={{position: 'absolute', right: 0, top: '11%'}}
          onPress={() => setEditClicked(true)}>
          <Image
            style={{width: 55, height: 95}}
            source={imagepath.edit_button}></Image>
        </TouchableOpacity>
      )}

      {editClicked ? (
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: '14%',
            padding: 3,
          }}>
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
            }}
            onPress={() => {
              setEditClicked(false);
              setEditBio(false);
            }}>
            <Image
              style={{width: '100%', height: '100%'}}
              source={imagepath.close}></Image>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              marginTop: -3,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
            }}
            onPress={() => {
              setCameraPickDialog(true);
              settingProfileImage({picType: 'cover'});
            }}>
            <Image
              style={{width: '100%', height: '100%'}}
              source={imagepath.header}></Image>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
            }}
            onPress={() => {
              setCameraPickDialog(true);
              settingProfileImage({picType: 'user'});
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
              }}
              source={imagepath.user}></Image>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: -1,
              width: 55,
              height: 55,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              paddingRight: 5,
            }}
            onPress={() => {
              setEditBio(!editBio);
            }}>
            <Image
              style={{width: '100%', height: '100%'}}
              source={imagepath.bio}></Image>
          </TouchableOpacity>
        </View>
      ) : null}
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
    marginTop: 15,
    marginBottom: 5,
    alignSelf: 'center',
  },
  categoryitemContainer: {
    width: size,
    height: 160,
    borderWidth: 0,
    backgroundColor: colors.gray,
    borderRadius: 10,

    marginRight: 7,
    marginLeft: 7,
    marginBottom: 7,
    marginTop: 7,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(ProfilScreen);
