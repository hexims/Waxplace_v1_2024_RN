import React, {useEffect, useState} from 'react';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import {updateUserData} from '../redux/reducers/PersistReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToggleSwitch from 'toggle-switch-react-native';

import {WebView} from 'react-native-webview';

import {Dialog} from 'react-native-simple-dialogs';

import {SafeAreaView} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {
  changePasswordOfUser,
  deletUserAccountOfUser,
  editUserProfile,
  profileDetails,
} from '../actions/UserAPI';
import {MainButton} from '../components/MainButton';
import {normalize} from '../components/NormalizeFonts';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import ThreeWaySwitch from '../components/ThreeWaySwitch';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';

const Settings = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [noInternet, setNoInternet] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pushOn, setPushOn] = useState(false);
  const [emailOn, setEmailOn] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reenterNewPass, setReenterNewPass] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showReenterNewPass, setshowReenterNewPass] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [bankDetailsDialog, setBankDetailsDialog] = useState(false);
  const [accountno, setAccountNo] = useState('');
  const [reAccountnumber, setReAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [favouriteOn, setFavouriteOn] = useState(false);
  const [newFollower, setNewFollower] = useState(false);
  const [wishListOn, setWishListOn] = useState(false);
  const [newItem, setNewItem] = useState(false);
  const [remainders, setRemainders] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [informative, setInformative] = useState(false);
  const [gps, setGps] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [deleteAcccountPopup, setDeleteAcccountPopup] = useState(false);
  const [userTerms, setUserTerms] = useState('');
  const [isUser, setIsUser] = useState(true);

  useEffect(() => {
    mountFunction();
  }, []);

  const deleteAccount = () => {
    deletUserAccountOfUser()
      .then(response => {})
      .catch(error => {});
  };

  const changePassword = () => {
    AsyncStorage.getItem('bearer').then(token => {
      AsyncStorage.getItem('userId').then(value => {
        if (!oldPassword) {
          toast.show(textContent.Settings.alert_old_password);
          return;
        }

        if (!newPassword) {
          toast.show(textContent.Settings.alert_new_password);

          return;
        }

        if (!reenterNewPass) {
          toast.show(textContent.Settings.alert_re_new_password);

          return;
        }

        if (newPassword != reenterNewPass) {
          toast.show(textContent.Settings.password_mismatch);
          return;
        }

        let jsonData = {
          password: newPassword,
          oldPassword: oldPassword,
        };

        changePasswordOfUser(jsonData)
          .then(response => {
            if (response.status === 'success') {
              toast.show(response.message);

              setChangePasswordDialog(false);
            } else {
              toast.show(response.message);
            }
          })
          .catch(error => {});
      });
    });
  };

  const handleEditProfile = (type, value) => {
    let jsonData = {};

    if (type === 'push') {
      jsonData = {...jsonData, pushsubscription: value};

      setPushOn(value);
    } else if (type === 'newFollower') {
      jsonData = {...jsonData, newFollowerPushSub: value};

      setNewFollower(value);
    } else if (type === 'wishList') {
      jsonData = {...jsonData, wishlistPushSub: value};

      setWishListOn(value);
    } else if (type === 'newItems') {
      jsonData = {...jsonData, newItemPushSub: value};

      setNewItem(value);
    } else if (type === 'remainder') {
      jsonData = {...jsonData, reminderPushSub: value};

      setRemainders(value);
    } else if (type === 'marketing') {
      jsonData = {...jsonData, marketingPushSub: value};

      setMarketing(value);
    } else if (type === 'informative') {
      jsonData = {...jsonData, informativePushSub: value};

      setInformative(value);
    } else if (type === 'gps') {
      jsonData = {...jsonData, gpsPushSub: value};

      setGps(value);
    } else {
      jsonData = {
        ...jsonData,
        newFollowerEmailSub: value,
        wishlistEmailSub: value,
        newItemEmailSub: value,
        reminderEmailSub: value,
        marketingEmailSub: value,
        informativeEmailSub: value,
        mandatoryEmailSub: value,
        gpsEmailSub: value,
      };
      setEmailOn(value);
    }

    editUserProfile(jsonData)
      .then(response => {
        if (response.status === 'success') {
        }
      })
      .catch(error => {});
  };

  const mountFunction = () => {
    profileDetails()
      .then(response => {
        if (response.status === 'success') {
          if (response.user) {
            setIsUser(response.user.firstName ? true : false);
          }
          if ('pushsubscription' in response.user) {
            setPushOn(response.user.pushsubscription);
          }

          if (
            'newFollowerEmailSub' in response.user ||
            'wishlistEmailSub' in response.user ||
            'newItemEmailSub' in response.user ||
            'reminderEmailSub' in response.user ||
            'marketingEmailSub' in response.user ||
            'informativeEmailSub' in response.user ||
            'gpsEmailSub' in response.user
          ) {
            if (
              response.user.newFollowerEmailSub &&
              response.user.wishlistEmailSub &&
              response.user.newItemEmailSub &&
              response.user.reminderEmailSub &&
              response.user.marketingEmailSub &&
              response.user.gpsEmailSub
            ) {
              setEmailOn(true);
            } else {
              setEmailOn(false);
            }
          }

          if ('favpush' in response.user) {
            setFavouriteOn(response.user.favpush);
          }
          if ('newFollowerPushSub' in response.user) {
            setNewFollower(response.user.newFollowerPushSub);
          }
          if ('wishlistPushSub' in response.user) {
            setWishListOn(response.user.wishlistPushSub);
          }

          if ('newItemPushSub' in response.user) {
            setNewItem(response.user.newItemPushSub);
          }

          if ('reminderPushSub' in response.user) {
            setRemainders(response.user.reminderPushSub);
          }

          if ('marketingPushSub' in response.user) {
            setMarketing(response.user.marketingPushSub);
          }

          if ('informativePushSub' in response.user) {
            setInformative(response.user.informativePushSub);
          }

          if ('gpsPushSub' in response.user) {
            setGps(response.user.gpsPushSub);
          }
        }

        setSettingsLoaded(true);
      })
      .catch(error => {});
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={bankDetailsDialog}
        onTouchOutside={() => setBankDetailsDialog(false)}
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
        <View style={{width: '100%', height: '100%'}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 18,
              alignSelf: 'center',
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Settings.bank_details}
          </Text>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            textContent.Settings.account_number
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
              flexDirection: 'row',
            }}>
            <TextInput
              style={{
                width: '100%',
                height: '100%',
                color: colors.primaryTextColor,
                paddingLeft: 10,
                fontSize: 14,
                letterSpacing: 0.5,
                fontFamily: fontFamily.MontserratRegular,
                backgroundColor: colors.transparent,
              }}
              secureTextEntry={true}
              blurOnSubmit={false}
              placeholder={''}
              onChangeText={text => {
                setAccountNo(text);
              }}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Settings.re_account_number}
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
              flexDirection: 'row',
            }}>
            <TextInput
              style={{
                width: '100%',
                height: '100%',
                color: colors.primaryTextColor,
                paddingLeft: 10,
                fontSize: 14,
                letterSpacing: 0.5,
                fontFamily: fontFamily.MontserratRegular,
                backgroundColor: colors.transparent,
              }}
              secureTextEntry={true}
              blurOnSubmit={false}
              placeholder={''}
              onChangeText={text => {
                setReAccountNumber(text);
              }}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Settings.iban}
          </Text>

          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              borderRadius: 8,
              marginTop: 7,
              marginBottom: 30,
              height: 50,
              borderWidth: 1,
              borderColor: colors.premiumGray + '80',
              backgroundColor: colors.searchBarColor,
              flexDirection: 'row',
            }}>
            <TextInput
              style={{
                width: '100%',
                height: '100%',
                color: colors.primaryTextColor,
                paddingLeft: 10,
                fontSize: 14,
                letterSpacing: 0.5,
                fontFamily: fontFamily.MontserratRegular,
                backgroundColor: colors.transparent,
              }}
              secureTextEntry={true}
              blurOnSubmit={false}
              placeholder={''}
              onChangeText={text => {
                setIban(text);
              }}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>

          <MainButton
            style={{
              width: '80%',
              alignSelf: 'center',
              height: normalize(40),
              borderRadius: 10,
              justifyContent: 'center',
              backgroundColor: colors.primaryButtonColor,
              alignItems: 'center',
              marginBottom: 20,
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
              // addBankDetails()
            }}
            fontSize={14.5}
            title={textContent.Settings.button_text_one}
          />
        </View>
      </Dialog>

      <Dialog
        visible={changePasswordDialog}
        onTouchOutside={() => setChangePasswordDialog(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          height: 420,
          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View style={{width: '100%', height: '100%', paddingTop: 5}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,
              alignSelf: 'center',
              fontFamily: fontFamily.MontserratMedium,
              marginVertical: 5,
            }}>
            {textContent.Settings.change_password}
          </Text>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Settings.old_password}
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
              flexDirection: 'row',
            }}>
            <View style={{flex: 4, height: '100%'}}>
              <TextInput
                style={{
                  width: '100%',
                  height: '100%',
                  color: colors.primaryTextColor,
                  paddingLeft: 10,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                }}
                secureTextEntry={!showOldPassword}
                blurOnSubmit={false}
                placeholder={''}
                onChangeText={text => {
                  setOldPassword(text);
                }}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowOldPassword(!showOldPassword);
                }}>
                <Image
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: colors.grayShadeOne,
                  }}
                  source={
                    showOldPassword ? imagepath.hide : imagepath.show
                  }></Image>
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Settings.new_password}
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
              flexDirection: 'row',
            }}>
            <View style={{flex: 4, height: '100%'}}>
              <TextInput
                style={{
                  width: '100%',
                  height: '100%',
                  color: colors.primaryTextColor,
                  paddingLeft: 10,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                }}
                secureTextEntry={!showNewPassword}
                blurOnSubmit={false}
                placeholder={''}
                onChangeText={text => {
                  setNewPassword(text);
                }}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowNewPassword(!showNewPassword);
                }}>
                <Image
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: colors.grayShadeOne,
                  }}
                  source={
                    showNewPassword ? imagepath.hide : imagepath.show
                  }></Image>
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              marginTop: 12,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Settings.re_new_password}
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
              flexDirection: 'row',
            }}>
            <View style={{flex: 4, height: '100%'}}>
              <TextInput
                style={{
                  width: '100%',
                  height: '100%',
                  color: colors.primaryTextColor,
                  paddingLeft: 10,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                }}
                secureTextEntry={!showReenterNewPass}
                blurOnSubmit={false}
                placeholder={''}
                onChangeText={text => {
                  setReenterNewPass(text);
                }}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setshowReenterNewPass(!showReenterNewPass);
                }}>
                <Image
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: colors.grayShadeOne,
                  }}
                  source={
                    showReenterNewPass ? imagepath.hide : imagepath.show
                  }></Image>
              </TouchableOpacity>
            </View>
          </View>

          <MainButton
            style={{
              width: '80%',
              alignSelf: 'center',
              height: normalize(40),
              borderRadius: 10,
              justifyContent: 'center',
              backgroundColor: colors.primaryButtonColor,
              alignItems: 'center',
              marginBottom: 20,
              marginTop: 30,
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
            onPress={() => changePassword()}
            fontSize={14.5}
            title={textContent.Settings.button_text_two}
          />
        </View>
      </Dialog>

      <ScrollView
        style={{width: '100%'}}
        contentContainerStyle={{paddingBottom: 100}}>
        <View
          style={{
            width: '85%',
            height: 100,
            marginTop: 50,
            flexDirection: 'row',
            alignSelf: 'center',
          }}>
          <View
            style={{
              width: '60%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'flex-start',
              alignContent: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 28,
                marginLeft: 35,
                marginTop: 25,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.Settings.go_premium}
            </Text>
          </View>
          <View
            style={{
              width: '40%',
              height: '100%',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: '95%',
                height: 110,
                borderRadius: 15,
                backgroundColor: colors.gray,
              }}
              source={imagepath.gopremium}></Image>
          </View>
        </View>

        <View
          style={{width: '85%', marginLeft: 50, height: 100, marginTop: 30}}>
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
              marginBottom: 3,
              marginTop: 3,
            }}>
            <Image
              style={{
                width: 6,
                height: 6,
                borderRadius: 5,
                backgroundColor: colors.primaryTextColor,
              }}></Image>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 13,
                letterSpacing: 1,
                marginLeft: 3,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.Settings.label_one}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
              marginBottom: 3,
            }}>
            <Image
              style={{
                width: 6,
                height: 6,
                borderRadius: 5,
                backgroundColor: colors.primaryTextColor,
              }}></Image>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 13,
                letterSpacing: 1,
                marginLeft: 3,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.Settings.label_two}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
              marginBottom: 3,
            }}>
            <Image
              style={{
                width: 6,
                height: 6,
                borderRadius: 5,
                backgroundColor: colors.primaryTextColor,
              }}></Image>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 13,
                letterSpacing: 1,
                marginLeft: 3,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.Settings.label_three}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
              marginBottom: 3,
            }}>
            <Image
              style={{
                width: 6,
                height: 6,
                borderRadius: 5,
                backgroundColor: colors.primaryTextColor,
              }}></Image>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 13,
                letterSpacing: 1,
                marginLeft: 3,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.Settings.label_four}
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 60,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}>
          <ThreeWaySwitch
            persistStorage={persistStorage}
            updateUserData={updateUserData}
            updateUserDetails={updateUserDetails}
            colors={colors}
          />
        </View>
        <View style={{alignSelf: 'center', width: '90%', marginTop: 2}}>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 15,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.email_notifications}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={emailOn}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('email', isOn)}
                />
              )}
            </View>
          </View>
          {/* <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              marginTop: 15,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              flexDirection: 'row',
            }}
            onPress={() => setChangePasswordDialog(true)}>
            <Text
              style={{
                width: '87%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.change_password}
            </Text>

            <View
              style={{
                width: '13%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Image
                style={[
                  {width: 25, height: 25, alignSelf: 'center'},
                  darkMode && {tintColor: colors.primaryTextColor},
                ]}
                source={imagepath.edit}></Image>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              marginTop: 15,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
              elevation: 4,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              flexDirection: 'row',
            }}
            onPress={() => setBankDetailsDialog(true)}>
            <Text
              style={{
                width: '87%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.bank_details}
            </Text>

            <View
              style={{
                width: '13%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Image
                style={[
                  {width: 25, height: 25, alignSelf: 'center'},
                  darkMode && {tintColor: colors.primaryTextColor},
                ]}
                source={imagepath.edit}></Image>
            </View>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              marginTop: 15,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
              elevation: 4,
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
              ProfileNavigation.navigate('DeleteAccount', {
                isUser: isUser,
              });
            }}>
            <Text
              style={{
                width: '87%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.delete_account_message}
            </Text>

            <View
              style={{
                width: '13%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Image
                style={[
                  {width: 25, height: 25, alignSelf: 'center'},
                  darkMode && {tintColor: colors.primaryTextColor},
                ]}
                source={imagepath.edit}></Image>
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.grayShadeOne,
              fontSize: 14,
              marginTop: 13,
              marginLeft: 10,
              letterSpacing: 1,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.Settings.other_notifications}
          </Text>

          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.new_followers}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={newFollower}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('newFollower', isOn)}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.wishlist}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={wishListOn}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('wishList', isOn)}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.new_items}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={newItem}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('newItems', isOn)}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.remainders}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={remainders}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('remainder', isOn)}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.marketing}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={marketing}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('marketing', isOn)}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.informative}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={informative}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('informative', isOn)}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 50,
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: colors.secondaryBackground,
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
            <Text
              style={{
                width: '85%',
                color: colors.primaryTextColor,
                paddingLeft: 20,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 14,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                alignSelf: 'center',
              }}>
              {textContent.Settings.gps}
            </Text>

            <View
              style={{
                width: '15%',
                height: '100%',
                alignContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {settingsLoaded && (
                <ToggleSwitch
                  isOn={gps}
                  onColor="green"
                  offColor="red"
                  labelStyle={{
                    color: colors.primaryTextColor,
                    fontWeight: '900',
                  }}
                  size="medium"
                  onToggle={isOn => handleEditProfile('gps', isOn)}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{position: 'absolute', left: -30, top: '11%'}}
        onPress={() => ProfileNavigation.pop()}>
        <Image
          resizeMode="contain"
          style={{width: 100, height: 100}}
          source={imagepath.back_button}></Image>
      </TouchableOpacity>
      {deleteAcccountPopup ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              backgroundColor: colors.grayShadeTwo,
              opacity: 0.5,
            }}></View>
          <View
            style={{
              borderRadius: 15,
              height: '65%',
              backgroundColor: colors.secondaryBackground,
              width: '90%',

              alignSelf: 'center',
            }}>
            <View
              style={{
                flex: 2,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,

                  fontSize: 22,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.Settings.delete_account}
              </Text>
            </View>
            <View style={{flex: 8, width: '100%', padding: 10}}>
              <WebView
                source={{html: userTerms}}
                scrollEnabled={false}
                style={{height: '40%', width: '100%', borderRadius: 15}}
                domStorageEnabled={true}
                javaScriptCanOpenWindowsAutomatically={true}
                decelerationRate="normal"
                javaScriptEnabledAndroid={true}></WebView>
            </View>
            <View style={{flex: 2, width: '100%', flexDirection: 'row'}}>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 40,
                    width: '85%',
                    borderRadius: 8,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.buttonGreen,
                  }}
                  onPress={() => deleteAccount()}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 17,
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.Settings.iagree}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 40,
                    width: '85%',
                    borderRadius: 8,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.premiumGray + '90',
                  }}
                  onPress={() => setDeleteAcccountPopup(false)}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 17,
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.Settings.cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : null}
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

export default connect(mapStateToProps, {updateUserDetails})(Settings);
