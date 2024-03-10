import React, {useContext, useEffect, useRef, useState} from 'react';
import * as CartNavigation from '../router/_CartNavigation';
import fontFamily from '../utils/FontFamily';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import ModalSelector from '../components/ModalSelectorInput';

import OneSignal from 'react-native-onesignal';
import {ONESIGNALAPPID} from '../utils/keys';

import {SafeAreaView} from 'react-native-safe-area-context';
import ProgressLoader from '../components/ProgressLoader';
import {editUserProfile, shareCodeCheckFunction} from '../actions/UserAPI';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {DarkModeContext} from '../components/DarkModeContext';
import {updateUserData} from '../redux/reducers/PersistReducer';
import {
  compareTwilloOTP,
  userRegistrationWhatsAppOTP,
} from '../actions/LoginAPI';

import {SearchBar} from '../components/SearchBar';

import {
  getCitiesOfSelectedCountry,
  getCountriesList,
} from '../actions/SaleFlowAPI';
import {useKeyboard} from '../utils/UseKeyBoard';
import {
  changeToNumber,
  checkPostalCodeInSpain,
  ValidateSpanishID,
} from '../actions/HelperFunctions';
import {useToast} from 'react-native-toast-notifications';
import PhoneInput from 'react-native-phone-number-input';
import imagepath from '../utils/Images';
import textContent from '../utils/textContent';
import {updateNaturalUser} from '../actions/_MangoPay';
import DOBPicker from '../components/DobPicker';
import {getCode} from 'iso-3166-1-alpha-2';

import OTPButton from '../components/OtpButton';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {checkPostalCodeCorreosDelivarable} from '../actions/_correosCalculations';
import { checkNearbyPostalCodes } from '../actions/_CorreosAPI';

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

const DeliveryDetails = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [firstName, setFirstName] = useState(
    userReducer?.profileDetails?.firstName,
  );
  const [lastName, setLastName] = useState(
    userReducer?.profileDetails?.lastName,
  );
  const [email, setEmail] = useState(userReducer?.profileDetails?.email);
  const [mobileNumber, setMobileNumber] = useState(
    userReducer?.profileDetails?.mobileNumber?.toString(),
  );

  const [province, setProvince] = useState(
    userReducer?.profileDetails?.province?.toString(),
  );

  const [postalCode, setPostalCode] = useState(
    userReducer?.profileDetails?.postalCode,
  );

  const [taxNumber, setTaxNumber] = useState(
    userReducer?.profileDetails?.taxNumber,
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    userReducer?.profileDetails?.deliveryAddress,
  );
  const [alternativeAddress, setAlternativeAddress] = useState(
    userReducer?.profileDetails?.alternativeAddress,
  );
  const [shareCode, setShareCode] = useState(
    userReducer?.profileDetails?.shareCode,
  );
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(true);
  const [verify, setVerify] = useState(false);
  const [userId, setUserId] = useState(userReducer?.profileDetails?._id);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(userReducer?.profileDetails?.country);

  const [nationality, setNationality] = useState(
    userReducer?.profileDetails?.nationality,
  );
  const [citiesList, setCitiesList] = useState([]);
  const [city, setCity] = useState(userReducer?.profileDetails?.city);
  const [shareCodeError, setShareCodeError] = useState(false);

  const [countryCodeNumber, setCountryCodeNumber] = useState(
    userReducer?.profileDetails?.countryCodeNumber,
  );
  const [verifiedMobile, setVerifiedMobile] = useState(
    userReducer?.profileDetails?.mobileNumber?.toString(),
  );
  const [mobileOtp, setMobileOtp] = useState('');
  const [value, setValue] = useState(
    userReducer?.profileDetails?.mobileNumber?.toString(),
  );
  const [formattedValue, setFormattedValue] = useState('');
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [dobPicker, setDobPicker] = useState(false);
  const [dob, setDob] = useState(userReducer?.profileDetails?.dob);
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

    getCountriesList(null, false)
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
    if (country !== '') {
      getCitiesOfSelectedCountry(country)
        .then(response => {
          setCitiesList(
            [{label: 'Unselect City'}].concat(
              response
                .map(value => ({label: value?.name})) // map to new array of objects with label property
                .filter((value, index, self) => {
                  return (
                    index === self.findIndex(obj => obj?.label === value?.label)
                  ); // keep only the first occurrence of each label
                }),
            ),
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

  const proceedToCheckout = async () => {
    updateUserDetails({prop: 'spinner', value: true});
    if (firstName == '') {
      toast.show(textContent.EditProfile.alert_firstname);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }
    if (lastName == '') {
      toast.show(textContent.EditProfile.alert_lastname);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }

    if (deliveryAddress == '') {
      toast.show(textContent.EditProfile.alert_address);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }

    if (city == '') {
      toast.show(textContent.EditProfile.alert_city);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }

    let postalCodeCheck = checkPostalCodeInSpain(postalCode);

    if (postalCode == '' || !postalCodeCheck) {
      toast.show(textContent.EditProfile.alert_postalcode);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }

    const islandsPattern = /^(07|35|38|51|52)\d{3}$/;
    if (postalCode == '' || islandsPattern.test(postalCode)) {
      toast.show(textContent.Registration.alert_postalcode_islands);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }

    let correosDelivarable = await checkNearbyPostalCodes(postalCode);
    if (postalCode == '' || correosDelivarable.length == 0) {
      toast.show(textContent.CreateSaleProduct.alert_correos_postalCode);
      updateUserDetails({prop: 'spinner', value: false});
      return;
    }

    updateUserDetails({
      prop: 'DeliveryDetails',
      value: {
        firstName,
        lastName,
        email,
        deliveryAddress,
        country,
        city,
        postalCode,
        mobileNumber,
      },
    });
    updateUserDetails({prop: 'spinner', value: false});
    CartNavigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        cartValue={userReducer?.cartLength}
        searchEnabled={false}
        searchText={''}
        searchFunction={text => {}}
        placeHolderCondition={'Delivery Information'}
        showCart={false}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: useKeyboard()}}
        style={{
          height: '100%',
          width: '100%',
        }}>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            // height: height - height * 0.28 - 25,
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
                {textContent.EditProfile.first_name}
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
                  borderColor: colors.borderColor + '90',
                }}>
                <TextInput
                  style={{
                    width: '95%',
                    height: '100%',
                    fontSize: 18,
                    //   paddingLeft: 12,
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
                  marginLeft: 10,
                  // marginTop: 12,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.last_name}
              </Text>
              <View
                style={{
                  width: '95%',
                  marginTop: 7,
                  // marginLeft: 10,
                  height: 45,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                }}>
                <TextInput
                  style={{
                    width: '95%',
                    height: '100%',
                    fontSize: 18,
                    // paddingLeft: 12,
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
            {textContent.EditProfile.email}
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
              borderColor: colors.borderColor + '90',
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
                editable={false}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
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
            {textContent.EditProfile.phone}
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
              borderColor: colors.borderColor + '90',
              flexDirection: 'row',
            }}>
            <View style={{flex: 6, height: '100%', justifyContent: 'center'}}>
              <PhoneInput
                disabled={true}
                countryPickerProps={{
                  countryCodes: ['ES'],
                }}
                ref={phoneInput}
                defaultValue={value}
                defaultCode={userReducer?.profileDetails?.countryCode}
                layout="second"
                onChangeText={text => {
                  setVerified(false);
                  setValue(text.toString());
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
                }}
                placeholder={' '}
                codeTextStyle={{color: colors.primaryTextColor}}
                withDarkTheme={darkMode}
                textInputStyle={{color: colors.primaryTextColor}}
              />
            </View>
            {verifiedMobile !== '' && verified && (
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
          {!verified && (
            <View
              style={{
                marginTop: 25,
                height: 40,
                justifyContent: 'center',
                //  marginRight: 10,
                width: '80%',
                alignSelf: 'center',
              }}>
              <OTPButton
                disable={verifiedMobile !== ''}
                isValid={mobileNumber.length > 8}
                onPress={() => {
                  if (mobileNumber.length > 8) {
                    setMobileOtp('');
                    userRegistrationWhatsAppOTP({
                      mobileNumber,
                      bearer: userReducer?.userDetails?.bearer,
                    })
                      .then(result => {
                        if (result.status == 'success') {
                          toast.show(result.message);
                        } else {
                          let message = response?.message
                            ? response?.message
                            : textContent.general.general_error;
                          toast.show(message);
                        }
                      })
                      .catch(err => {});
                  } else {
                    toast.show(textContent.EditProfile.alert_mobile_number);
                  }
                }}
              />
            </View>
          )}
          {!verified && (
            <View
              style={{
                //height: 150,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
                marginBottom: 10,
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
                  {textContent.EditProfile.mobile_otp_verify}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  width: '100%',
                  paddingHorizontal: 20,
                }}>
                <OTPInputView
                  editable={verifiedMobile == ''}
                  style={{
                    width: '100%',
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
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
            </View>
          )}
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.EditProfile.address}
          </Text>
          <View style={styles.textAreaContainer(colors)}>
            <TextInput
              value={deliveryAddress}
              style={styles.textArea(colors)}
              underlineColorAndroid="transparent"
              onChangeText={value => setDeliveryAddress(value)}
              placeholderTextColor={colors.primaryTextColor}
              numberOfLines={10}
              multiline={true}
            />
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
            {textContent.EditProfile.country}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
            }}>
            {(countries?.length > 0 || country !== '') && (
              <ModalSelector
                disabled={true}
                colors={colors}
                listType={Platform.OS == 'android' ? 'FLATLIST' : ''}
                initialNumToRender={10}
                data={countries}
                style={{width: '100%'}}
                initValue={textContent.EditProfile.select_country}
                searchText={textContent.general.search}
                supportedOrientations={['landscape']}
                accessible={true}
                scrollViewAccessibilityLabel={'Scrollable options'}
                cancelButtonAccessibilityLabel={'Cancel Button'}
                onChange={item => {
                  setCountry(item.label);
                  setCity('');
                }}>
                <TextInput
                  style={{
                    width: '100%',
                    height: '100%',
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    paddingLeft: 10,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    backgroundColor: colors.transparent,
                    paddingLeft: 10,
                  }}
                  editable={false}
                  placeholder={country !== '' ? country : ''}
                  placeholderTextColor={colors.primaryTextColor}
                  value={country}
                />
              </ModalSelector>
            )}
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
            {textContent.EditProfile.city}
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
              borderColor: colors.borderColor + '90',
              flexDirection: 'row',
            }}>
            {(citiesList?.length > 0 || city !== '') && (
              <ModalSelector
                colors={colors}
                listType={'FLATLIST'}
                initialNumToRender={10}
                data={citiesList}
                style={{width: '100%'}}
                initValue={textContent.EditProfile.select_city}
                searchText={textContent.general.search}
                supportedOrientations={['landscape']}
                accessible={true}
                scrollViewAccessibilityLabel={'Scrollable options'}
                cancelButtonAccessibilityLabel={'Cancel Button'}
                onChange={item => {
                  if (item.label == 'Unselect City') {
                    setCity('');
                  } else {
                    setCity(item.label);
                  }
                }}>
                <TextInput
                  style={{
                    width: '100%',
                    height: '100%',
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    paddingLeft: 10,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    backgroundColor: colors.transparent,
                    paddingLeft: 10,
                  }}
                  editable={false}
                  placeholder={city !== '' ? city : ''}
                  placeholderTextColor={colors.primaryTextColor}
                  value={city}
                />
              </ModalSelector>
            )}
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
            {textContent.EditProfile.postalcode}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
            }}>
            <TextInput
              style={{
                width: '95%',
                height: '100%',
                fontSize: 18,
                //  paddingLeft: 12,
                letterSpacing: 1,
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
                backgroundColor: colors.transparent,
              }}
              keyboardType={'number-pad'}
              value={postalCode}
              //  placeholder={'Last Name'}
              onChangeText={value => setPostalCode(changeToNumber(value))}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>

          <View
            style={{
              marginTop: 30,
              height: 70,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                width: '100%',
                height: 50,
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
              onPress={() => {
                proceedToCheckout();
              }}>
              <Text
                style={{
                  color: colors.black,
                  fontSize: 18,
                  letterSpacing: 1,
                  fontFamily: fontFamily.MontserratMedium,
                  alignSelf: 'center',
                }}>
                {'Proceed to Checkout'}
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
    borderRadius: 16,
    marginTop: 7,
    marginBottom: 0,
    borderRadius: 8,
    backgroundColor: colors.searchBarColor,
    borderWidth: 1,
    borderColor: colors.borderColor + '90',
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

    backgroundColor: colors.searchBarColor,
    borderWidth: 1,
    borderColor: colors.borderColor + '90',
    color: colors.primaryTextColor,
    fontSize: 18,
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

export default connect(mapStateToProps, {updateUserDetails})(DeliveryDetails);
