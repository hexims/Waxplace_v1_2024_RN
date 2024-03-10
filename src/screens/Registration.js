import React, {useContext, useEffect, useRef, useState} from 'react';
import * as AuthNavigation from '../router/_AuthNavigation';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as StackNavigation from '../router/_StackNavigation';
import ModalSelector from '../components/ModalSelectorInput';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import fontFamily from '../utils/FontFamily';
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
  TextInput,
  Image,
  StatusBar,
  Alert,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
const {TouchableOpacity} =
  Platform.OS == 'ios'
    ? require('react-native-gesture-handler')
    : require('react-native');
import persistStorage from '../redux/store/persistStore';
const {width, height} = Dimensions.get('window');
// Use iPhone6 as base size which is 375 x 667
const baseWidth = width;
const baseHeight = height;
const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);
import {Dialog} from 'react-native-simple-dialogs';
import NetInfo from '@react-native-community/netinfo';
import base64 from 'react-native-base64';
import Spinner from 'react-native-loading-spinner-overlay';
import OneSignal from 'react-native-onesignal';
import {ONESIGNALAPPID} from '../utils/keys';
import {openSettings} from 'react-native-permissions';
import WebView from 'react-native-webview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {changeToNumber, ValidateSpanishID} from '../actions/HelperFunctions';
import {
  editUserProfile,
  shareCodeCheckFunction,
  userFieldCheck,
} from '../actions/UserAPI';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {DarkModeContext} from '../components/DarkModeContext';
import {updateUserData} from '../redux/reducers/PersistReducer';
import {
  compareTwilloOTP,
  generateUserRegistrationOTP,
  registrationOTPValidation,
  termsAndConditions,
  userRegister,
  userRegistrationWhatsAppOTP,
} from '../actions/LoginAPI';
import {ImageBackground} from 'react-native';
import {SearchBar} from '../components/SearchBar';
import AutoFillInput from '../components/AutocompleteTextInput';
import {
  getCitiesOfSelectedCountry,
  getCountriesList,
} from '../actions/SaleFlowAPI';
import {useKeyboard} from '../utils/UseKeyBoard';
import {useToast} from 'react-native-toast-notifications';
import PhoneInput, {
  isValidNumber,
  getCountryCode,
} from 'react-native-phone-number-input';

import textContent from '../utils/textContent';
import ProgressLoader from '../components/ProgressLoader';
import {createNaturalUser} from '../actions/_MangoPay';
import {getCode} from 'iso-3166-1-alpha-2';
import DOBPicker from '../components/DobPicker';
import OTPButton from '../components/OtpButton';

let {getHash, startOtpListener, removeListener} = {};

if (Platform.OS === 'android') {
  ({
    getHash,
    startOtpListener,
    removeListener,
  } = require('../actions/_OtpVerify/otpVerify.android'));
} else {
  ({
    getHash,
    startOtpListener,
    removeListener,
  } = require('../actions/_OtpVerify/otpVerify.ios'));
}

const Registration = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [alternativeAddress, setAlternativeAddress] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifiedMobile, setVerifiedMobile] = useState('');
  const [verified, setVerified] = useState(false);
  const [verify, setVerify] = useState(false);
  const [userId, setUserId] = useState('');
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('Spain');

  const [nationality, setNationality] = useState('');
  const [citiesList, setCitiesList] = useState([]);
  const [city, setCity] = useState('');
  const [emailVerification, setEmailVerification] = useState(false);
  const [emailFound, setEmailFound] = useState(false);
  const [otpSent, setOtpSent] = useState('');
  const [shareCodeError, setShareCodeError] = useState(false);

  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [dobPicker, setDobPicker] = useState(false);
  const [dob, setDob] = useState('');
  const [emailReset, setEmailReset] = useState(false);
  const phoneInput = useRef(null);

  const mobileNumberRef = useRef('');

  useEffect(() => {
    mobileNumberRef.current = mobileNumber;
  }, [mobileNumber]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      startOtpListener(message => {
        const otpPattern = /\b\d{6}\b/;
        const match = message.match(otpPattern);
        const otp = match ? match[0] : null;

        if (otp) {
          setMobileOtp(otp);
          confirmMobileOtpValidation(otp);
        } else {
          toast.show(textContent.general.general_error);
        }
      });

      return () => {
        removeListener();
      };
    }
  }, []);

  useEffect(() => {
    const backAction = () => {
      AuthNavigation.reset('Login');
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
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    getCountriesList(userReducer?.ProfileRegistration?.bearer, false)
      .then(response => {
        setCountries(
          response.map(value => {
            return {label: value._id};
          }),
        );
      })
      .catch(error => {});

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    setUserId(userReducer?.ProfileRegistration?.userId);
    setEmail(
      userReducer?.ProfileRegistration?.email?.includes('@heximstemporary.com')
        ? ''
        : userReducer?.ProfileRegistration?.email,
    );

    setFirstName(userReducer?.ProfileRegistration?.firstName);
    setLastName(userReducer?.ProfileRegistration?.lastName);
    setEmailVerification(
      userReducer?.ProfileRegistration?.email?.includes(
        '@heximstemporary.com',
      ) ||
        userReducer?.ProfileRegistration?.email?.includes(
          '@privaterelay.appleid.com',
        ),
    );
  }, []);

  useEffect(() => {
    if (country !== '') {
      getCitiesOfSelectedCountry(
        country,
        userReducer?.ProfileRegistration?.bearer,
      )
        .then(response => {
          setCitiesList(
            response
              .map(value => ({label: value.name})) // map to new array of objects with label property
              .filter((value, index, self) => {
                return (
                  index === self.findIndex(obj => obj.label === value.label)
                ); // keep only the first occurrence of each label
              }),
          );
        })
        .catch(error => {});
    }
  }, [country]);

  useEffect(() => {
    OneSignal.setAppId(ONESIGNALAPPID);
  }, []);

  const validateIsEmail = email => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const checkUserData = async jsonData => {
    if (jsonData.email == userReducer?.ProfileRegistration?.email) {
      return {status: 'success'};
    }
    return userFieldCheck(jsonData, userReducer?.ProfileRegistration?.bearer)
      .then(response => {
        return response;
      })
      .catch(error => {});
  };

  const handleEditProfile = async mangoPayUserId => {
    if (shareCode !== '') {
      try {
        let jsonData = {
          shareCode,
          bearer: userReducer?.ProfileRegistration?.bearer,
        };
        let data = await shareCodeCheckFunction(jsonData);
        setShareCodeError(data);
        if (data) {
          toast.show(textContent.Registration.alert_share_code);
          return;
        }
      } catch (err) {
        setShareCodeError(true);
        toast.show(textContent.Registration.alert_share_code);
        return;
      }
    }

    let jsonData = {
      firstName,
      lastName,
      email,
      mobileNumber: value,
      countryCodeNumber: mobileNumber.split(value)[0],
      countryCode: phoneInput?.current?.getCountryCode(mobileNumber),
      deliveryAddress,
      addressLine1: deliveryAddress,
      city,
      country,
      nationality,
      dob,
      province,
      postalCode,
      taxNumber,
      shareCode,
      userId,
      bearer: userReducer?.ProfileRegistration?.bearer,
      isRegistration: true,
      mangoPayUserId,
      MangoPayUserInformation: {
        firstName,
        lastName,
        email,
        TermsAndConditionsAccepted: true,
        UserCategory: 'PAYER',
      },
    };

    updateUserDetails({prop: 'spinner', value: true});
    editUserProfile(jsonData)
      .then(response => {
        if (response?.status == 'success') {
          updateUserDetails({prop: 'spinner', value: false});
          // updateUserDetails({
          //   prop: 'cartLength',
          //   value: response?.user?.cart?.length,
          // });
          persistStorage.dispatch(
            updateUserData({
              prop: 'userDetails',
              value: {
                firstname: response.user.firstName,
                lastname: response.user.lastName,
                email: response.user.email,
                username: response.user.userName,
                userId: response.user._id,
                Userlog: true,
                bearer: response.user.token,
              },
            }),
          );
          let externalUserId = response.user._id;
          OneSignal.setExternalUserId(externalUserId);

          if (
            'categories' in response?.user &&
            response?.user?.categories?.length > 0
          ) {
            HomeNavigation.reset('HomeScreen');
            StackNavigation.reset('Userscreens');
          } else {
            updateUserDetails({
              prop: 'showCategories',
              value: true,
            });
            StackNavigation.reset('Userscreens');
          }
        }
        updateUserDetails({prop: 'spinner', value: false});
      })
      .catch(err => {
        updateUserDetails({prop: 'spinner', value: false});
      });
  };

  const confirmOtpValidation = otp => {
    if (otp?.length == 6) {
      updateUserDetails({prop: 'spinner', value: true});
      registrationOTPValidation({
        email,
        otp,
      })
        .then(result => {
          if (result.status == 'success') {
            toast.show(result.message);
            setVerifiedEmail(email);
          } else {
            toast.show(result.message);
          }
          updateUserDetails({prop: 'spinner', value: false});
        })
        .catch(err => {
          updateUserDetails({prop: 'spinner', value: false});
        });
    } else {
      toast.show(textContent.Registration.otp_continue);
    }
  };

  const confirmMobileOtpValidation = mobileOtp => {
    const currentMobileNumber = mobileNumberRef.current;

    if (mobileOtp?.length === 6 && currentMobileNumber?.length > 8) {
      updateUserDetails({prop: 'spinner', value: true});
      compareTwilloOTP({
        mobileNumber: currentMobileNumber,
        otp: mobileOtp,
        bearer: userReducer?.ProfileRegistration?.bearer,
      })
        .then(result => {
          if (result.status == 'success') {
            toast.show(result.message);
            setVerifiedMobile(currentMobileNumber?.toString());
          } else {
            toast.show(result.message);
            setMobileOtp('');
          }
          updateUserDetails({prop: 'spinner', value: false});
        })
        .catch(err => {
          updateUserDetails({prop: 'spinner', value: false});
          setMobileOtp('');
          toast.show(textContent.Registration.invalid_otp);
        });
    } else {
      toast.show(textContent.Registration.otp_continue);
    }
  };

  const handleRegistration = async () => {
    if (firstName == '') {
      toast.show(textContent.Registration.alert_firstname);
      return;
    }

    if (lastName == '') {
      toast.show(textContent.Registration.alert_lastname);
      return;
    }

    if (email == '' && (email !== verifiedEmail || emailVerification)) {
      toast.show(textContent.Registration.alert_email);
      return;
    }

    let emailFound = await checkUserData({email});
    if (emailFound?.status == 'failed' && emailVerification) {
      setEmailFound(true);
      toast.show(textContent.Registration.alert_email);
      return;
    } else {
      setEmailFound(false);
    }

    if (phoneInput?.current?.getCountryCode(mobileNumber) !== 'ES') {
      toast.show(textContent.Registration.currently_spain);
      return;
    }
    if (
      mobileNumber == '' ||
      mobileNumber.toString() !== verifiedMobile.toString()
    ) {
      toast.show(textContent.Registration.alert_mobile_number);
      return;
    }

    try {
      let jsonData = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        TermsAndConditionsAccepted: true,
        UserCategory: 'PAYER',
      };
      let response = await createNaturalUser(jsonData);
      if (response.data) {
        handleEditProfile(response.data.Id);
      }
    } catch (error) {
      toast.show(textContent.general.general_error);
    }
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <View
        style={{
          marginTop: 15,
          width: '100%',
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity
          style={{padding: 5}}
          onPress={() => {
            updateUserDetails({
              prop: 'ProfileRegistration',
              value: null,
            });
            AuthNavigation.reset('Login');
          }}>
          <Image
            source={imagepath.cross}
            style={{height: 22, width: 22, tintColor: colors.primaryTextColor}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 10,
        }}>
        <Text
          style={{
            fontSize: 22,
            fontFamily: fontFamily.MontserratRegular,
            color: colors.primaryTextColor,
            //  marginLeft: 35,
            letterSpacing: 2,
          }}>
          {'Tell us about yourself'}
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: useKeyboard() - 50,
        }}
        style={{
          height: '100%',
          width: '100%',
        }}>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',

            //  height: height - height * 0.28 - 25,
            paddingHorizontal: 20,
          }}>
          <View style={{width: '100%', flexDirection: 'row', marginTop: 25}}>
            <View style={{width: '50%'}}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  // marginTop: 12,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.Registration.first_name}
              </Text>
              <View
                style={{
                  width: '98%',
                  marginTop: 7,
                  height: 45,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: '#c0c0c890',
                }}>
                <TextInput
                  style={{
                    width: '92%',
                    height: '100%',
                    fontSize: 18,
                    paddingLeft: 12,
                    letterSpacing: 1,
                    color: colors.primaryTextColor,
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    backgroundColor: colors.transparent,
                  }}
                  value={firstName}
                  //  placeholder={'First Name'}
                  onChangeText={value => setFirstName(value)}
                  placeholderTextColor={colors.primaryTextColor}></TextInput>
              </View>
            </View>
            <View style={{width: '50%', alignItems: 'center'}}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 14,
                  // marginTop: 12,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.Registration.last_name}
              </Text>
              <View
                style={{
                  width: '92%',
                  marginTop: 7,
                  // marginLeft: 10,
                  height: 45,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: '#c0c0c890',
                }}>
                <TextInput
                  style={{
                    width: '95%',
                    height: '100%',
                    fontSize: 18,
                    paddingLeft: 12,
                    letterSpacing: 1,
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    alignSelf: 'center',
                    backgroundColor: colors.transparent,
                  }}
                  value={lastName}
                  //  placeholder={'Last Name'}
                  onChangeText={value => setLastName(value)}
                  placeholderTextColor={colors.primaryTextColor}></TextInput>
              </View>
            </View>
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Registration.email}
          </Text>
          <View
            style={{
              width: '100%',
              height: 45,
              marginTop: 7,
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: '#c0c0c890',
              backgroundColor: colors.searchBarColor,
              flexDirection: 'row',
            }}>
            <View style={{flex: 6, height: '100%'}}>
              <TextInput
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: 16,
                  paddingLeft: 12,
                  letterSpacing: 1,

                  color: colors.primaryTextColor,
                  fontFamily: fontFamily.MontserratRegular,
                  alignSelf: 'center',
                  backgroundColor: colors.transparent,
                }}
                value={email}
                onChangeText={value => {
                  setVerifiedEmail('');
                  setOtp('');
                  setOtpSent('');
                  setEmail(value);
                }}
                editable={emailVerification}
                onFocus={() => {
                  setEmailFound(false);
                }}
                onBlur={() => {
                  let delay = 100; // milliseconds
                  let before = Date.now();
                  while (Date.now() < before + delay) {}
                  checkUserData({email}).then(result => {
                    if (result.status == 'failed') {
                      setEmailFound(true);
                    } else {
                      setEmailFound(false);
                    }
                  });
                }}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
            {(!emailVerification || verifiedEmail !== '') && (
              <View
                style={{
                  width: 45,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={imagepath.check}
                  resizeMode={'contain'}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: colors.successGreen,
                  }}
                />
              </View>
            )}
          </View>
          {emailFound ? (
            <Text
              style={{
                marginLeft: 10,
                marginTop: 5,
                width: '100%',
                fontFamily: fontFamily.MontserratRegular,
                color: colors.red,
                fontSize: 12,
              }}>
              {textContent.Registration.email_exists}
            </Text>
          ) : null}
          {emailVerification && (
            <View
              style={{
                height: 40,
                width: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
                //marginRight: 10,
                marginTop: 25,
              }}>
              <OTPButton
                emailReset={emailReset}
                disable={verifiedEmail !== ''}
                isValid={!emailFound && validateIsEmail(email)}
                onPress={() => {
                  if (!emailFound && validateIsEmail(email)) {
                    checkUserData({email}).then(result => {
                      if (result.status == 'failed') {
                        setEmailReset(true);
                        setTimeout(() => {
                          setEmailReset(false);
                        }, 100);
                        setEmailFound(true);
                      } else {
                        setEmailFound(false);
                        generateUserRegistrationOTP(email)
                          .then(result => {
                            if (result.status == 'success') {
                              setOtpSent(email);
                              toast.show(result.message);
                            } else {
                              toast.show(textContent.general.general_error);
                            }
                          })
                          .catch(error => {});
                      }
                    });
                  } else {
                    toast.show(textContent.Registration.invalid_email);
                  }
                }}
              />
            </View>
          )}

          {emailVerification && (
            <View
              style={{
                //height: 150,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 0.6,
                marginTop: 10,
                marginBottom: 30,
                borderBottomColor: '#fafafa50',
              }}>
              <View
                style={{
                  marginVertical: 15,

                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 18,
                    lineHeight: 25,
                    fontFamily: fontFamily.MontserratMedium,
                    color: colors.primaryTextColor,
                  }}>
                  {textContent.Registration.otp_verify}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: 20,
                }}>
                <OTPInputView
                  editable={verifiedEmail == ''}
                  style={{
                    width: '100%',
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  pinCount={6}
                  code={otp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                  onCodeChanged={code => {
                    setOtp(code);
                    if (code.length == 6) {
                      confirmOtpValidation(code);
                    }
                  }}
                  autoFocusOnLoad={false}
                  codeInputFieldStyle={styles.underlineStyleBase(colors)}
                  codeInputHighlightStyle={styles.underlineStyleHighLighted}
                  onCodeFilled={code => {}}
                />
              </View>
            </View>
          )}

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: emailVerification ? 0 : 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Registration.phone}
          </Text>
          <View
            style={{
              width: '100%',
              height: 45,
              marginTop: 7,
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: '#c0c0c890',
              flexDirection: 'row',
            }}>
            <View style={{flex: 6, height: '100%', justifyContent: 'center'}}>
              <PhoneInput
                countryPickerProps={{
                  countryCodes: ['ES'],
                }}
                ref={phoneInput}
                defaultValue={value}
                defaultCode="ES"
                layout="second"
                onChangeText={text => {
                  setValue(text);
                }}
                onChangeFormattedText={text => {
                  setMobileOtp('');
                  setVerifiedMobile('');

                  setMobileNumber(text.replace(/[^\d+]/g, '').trim());
                }}
                containerStyle={{
                  backgroundColor: colors.transparent,
                  paddingVertical: -10,
                  width: '100%',
                  paddingLeft: -10,
                }}
                textContainerStyle={{
                  backgroundColor: colors.transparent,
                  paddingVertical: -10,
                  width: '100%',
                  marginLeft: -25,
                  color: colors.primaryTextColor,
                }}
                placeholder={' '}
                codeTextStyle={{color: colors.primaryTextColor}}
                withDarkTheme={darkMode}
                textInputStyle={{color: colors.primaryTextColor}}
                selectionColor={'white'}
              />
            </View>
            {verifiedMobile !== '' && (
              <View
                style={{
                  width: 45,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={imagepath.check}
                  resizeMode={'contain'}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: colors.successGreen,
                  }}
                />
              </View>
            )}
          </View>
          <View
            style={{
              marginTop: 25,

              width: '100%',
              justifyContent: 'center',
              alignSelf: 'center',
              // marginRight: 10,
            }}>
            <OTPButton
              disable={verifiedMobile !== ''}
              isValid={mobileNumber.length > 8}
              onPress={() => {
                if (mobileNumber.length > 8) {
                  setMobileOtp('');
                  userRegistrationWhatsAppOTP({
                    mobileNumber,
                    bearer: userReducer?.ProfileRegistration?.bearer,
                  })
                    .then(result => {
                     
                      if (result.status == 'success') {
                        toast.show(result.message);
                      } else {
                        let message =
                          result?.message ?? textContent.general.general_error;

                        toast.show(message);
                      }
                    })
                    .catch(err => {});
                } else {
                  toast.show(textContent.Registration.alert_mobile_number);
                }
              }}
            />
          </View>
          {true && (
            <View
              style={{
                //height: 150,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',

                marginTop: 20,
              }}>
              <View style={{}}>
                <Text
                  style={{
                    marginVertical: 15,
                    textAlign: 'center',
                    fontSize: 18,
                    lineHeight: 25,
                    fontFamily: fontFamily.MontserratMedium,
                    color: colors.primaryTextColor,
                  }}>
                  {textContent.Registration.otp_verify}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  width: '100%',
                }}>
                <OTPInputView
                  editable={verifiedMobile == ''}
                  style={{
                    width: '100%',
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'space-around',
                  }}
                  pinCount={6}
                  code={mobileOtp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                  onCodeChanged={code => {
                    setMobileOtp(code);
                    if (code.length == 6) {
                      confirmMobileOtpValidation(code);
                    }
                  }}
                  autoFocusOnLoad={false}
                  codeInputFieldStyle={styles.underlineStyleBase(colors)}
                  codeInputHighlightStyle={styles.underlineStyleHighLighted}
                  onCodeFilled={code => {}}
                />
                <TextInput
                  style={{height: 0}}
                  editable={false}
                  textContentType={'oneTimeCode'}
                  onChangeText={otp => {
                    setMobileOtp(otp);
                    confirmMobileOtpValidation(otp);
                  }}
                />
              </View>
              {/* <View style={{marginVertical: 10}}>
                <TouchableOpacity
                  disabled={verifiedMobile !== ''}
                  style={{
                    height: 30,
                    width: 120,
                    backgroundColor: colors.primaryButtonColor,
                    borderRadius: 15,
                    justifyContent: 'center',
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
                  onPress={() => confirmMobileOtpValidation(mobileOtp)}>
                  <Text
                    style={{
                      color: colors.black,
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 14,
                    }}>
                    {verifiedMobile == ''
                      ? textContent.Registration.verify
                      : textContent.Registration.verified}
                  </Text>
                </TouchableOpacity>
              </View> */}
            </View>
          )}

          <View
            style={{
              height: 70,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                minWidth: '65%',
                height: 40,
                backgroundColor: colors.primaryButtonColor,
                borderRadius: 15,
                justifyContent: 'center',

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
              onPress={() => handleRegistration()}>
              <Text
                style={{
                  color: colors.black,
                  fontSize: 18,
                  letterSpacing: 1,
                  fontFamily: fontFamily.MontserratMedium,
                  alignSelf: 'center',
                }}>
                {textContent.Registration.button_text}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
    justifyContent: 'center',
  }),
  textAreaContainer: colors => ({
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c0c0c890',
    marginTop: 7,
    marginBottom: 0,
    borderRadius: 8,
    backgroundColor: colors.searchBarColor,
  }),
  borderStyleBase: colors => ({
    width: 30,
    height: 45,
    backgroundColor: colors.red,
  }),

  borderStyleHighLighted: {},

  underlineStyleBase: colors => ({
    width: 45,
    height: 45,
    borderWidth: 0,
    color: colors.primaryTextColor,
    fontSize: 18,
    backgroundColor: colors.searchBarColor,
    borderWidth: 1,
    borderColor: '#c0c0c890',
    marginHorizontal: 3,
  }),
  textArea: colors => ({
    height: 150,
    width: '75%',
    fontFamily: fontFamily.MontserratRegular,
    fontSize: 16,
    letterSpacing: 0.5,
    backgroundColor: colors.transparent,
    textAlignVertical: 'top',
    color: colors.primaryTextColor,
    paddingLeft: 10,
    justifyContent: 'flex-start',
  }),
  underlineStyleHighLighted: {},
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Registration);
