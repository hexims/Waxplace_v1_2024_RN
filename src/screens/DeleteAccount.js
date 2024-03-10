import React, {useState, useEffect} from 'react';

import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as StackNavigation from '../router/_StackNavigation';

import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {purge} from '../redux/reducers/PersistReducer';

import {WebView} from 'react-native-webview';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {SafeAreaView} from 'react-native-safe-area-context';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {Dialog} from 'react-native-simple-dialogs';
import ProgressLoader from '../components/ProgressLoader';

const {width, height} = Dimensions.get('window');
import {connect} from 'react-redux';
import persistStorage from '../redux/store/persistStore';
import OneSignal from 'react-native-onesignal';
import {updateUserDetails} from '../redux/actions/UserAction';
import {
  termsAndConditions,
  userGenerateOtp,
  deleteAccount,
} from '../actions/LoginAPI';
import {normalize} from '../components/NormalizeFonts';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';

const DeleteAccount = ({navigation, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const getTermsAndConditions = () => {
    termsAndConditions()
      .then(response => {
        setUserTerms(isUser ? response.userContent : response.vendorContent);
       // setSpinner(false);
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const sendOtpToEmail = () => {
    userGenerateOtp()
      .then(response => {
        if (response.status == 'success') {
          Alert.alert('', response?.message);

          setSendEmailLoader(false);
        } else {
          Alert.alert('', response.error);
          setSendEmailLoader(false);
        }
      })
      .catch(error => {
        Alert.alert('', textContent.general.general_error);
        setSendEmailLoader(false);
      });
  };

  const confirmDelete = () => {
    if (otp.length == 6) {
      deleteAccount(otp)
        .then(response => {
          if (response.status == 'Success') {
            setDeleteAccountPopup(false);
            toast.show(textContent.DeleteAccount.delete_success);

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
          } else {
            Alert.alert('', response.error);
          }
        })
        .catch(error => {
          Alert.alert('', textContent.general.general_error);
        });
    } else {
      Alert.alert('', textContent.DeleteAccount.enter_otp);
    }
  };

  const [userTerms, setUserTerms] = useState('');
  const [isUser, setIsUser] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [deleteAccountPopup, setDeleteAccountPopup] = useState(false);
  const [sendEmailLoader, setSendEmailLoader] = useState(false);
  const [otp, setOtp] = useState('');
  useEffect(() => {
    let params = navigation?.state?.params;
    setIsUser(params?.isUser ? params.isuser : true);
    setSpinner(true);
    getTermsAndConditions();

    return () => {};
  }, []);

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={deleteAccountPopup}
        onTouchOutside={() => setDeleteAccountPopup(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          width: '105%',
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: colors.secondaryBackground,
         
        }}>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            padding: 10,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              alignSelf: 'center',
              fontSize: 20,
              textAlign: 'center',
              fontFamily: fontFamily.MontserratBold,
              letter: 1,
            }}>
            {textContent.DeleteAccount.wish_continue}
          </Text>
          <Text
            style={{
              marginTop: 10,
              color: colors.primaryTextColor,
              fontSize: 14,
              textAlign: 'center',
              letterSpacing: 1,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.DeleteAccount.otp_message}
          </Text>

          <TouchableOpacity
            disabled={sendEmailLoader}
            style={{
              marginTop: 20,
              height: 45,
              width: 250,
              //  borderColor: colors.primaryButtonColor,
              flexDirection: 'row',
              justifyContent: 'center',
              // borderWidth: 1,
              overflow: 'hidden',
              borderRadius: 8,
            }}
            onPress={() => {
              setSendEmailLoader(true);
              sendOtpToEmail();
            }}>
            {sendEmailLoader ? (
              <ActivityIndicator
                color={colors.primaryTextColor}
                size={'small'}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                  }}>
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      tintColor: colors.primaryTextColor,

                      marginTop: 1,
                    }}
                    source={imagepath.resend}
                  />
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 16,
                      letterSpacing: 1,
                      fontFamily: fontFamily.MontserratRegular,
                      alignSelf: 'center',
                    }}>
                    {textContent.DeleteAccount.resend_otp}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
            }}>
            <OTPInputView
              style={{
                width: '80%',
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              pinCount={6}
              code={otp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
              onCodeChanged={code => {
                setOtp(code);
              }}
              autoFocusOnLoad={false}
              codeInputFieldStyle={styles.underlineStyleBase(colors)}
              codeInputHighlightStyle={styles.underlineStyleHighLighted}
              onCodeFilled={code => {}}
            />
          </View>

          <TouchableOpacity
            style={{
              minWidth: '50%',
              alignSelf: 'center',
              marginTop: 15,
              height: 40,
              justifyContent: 'center',
              borderRadius: 20,
              backgroundColor: colors.notificationColor,
              paddingHorizontal: 15,
            }}
            onPress={() => confirmDelete()}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 14,
                letterSpacing: 1,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
              }}>
              {textContent.DeleteAccount.button_text_one}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
      <View
        style={{
          width: '100%',
          flex: 1,

          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            paddingVertical: 15,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,

              fontSize: 22,
              fontFamily: fontFamily.MontserratMedium,
              letterSpacing: 1,
              fontWeight: 'bold',
              marginLeft: 15,
            }}>
            {textContent.DeleteAccount.delete}
          </Text>
          <View
            style={{
              width: '95%',
              marginTop: 10,
              borderBottomWidth: 0.4,
              borderColor: colors.premiumGray + '90',
              alignSelf: 'center',
            }}
          />
        </View>

        <View
          style={{
            flex: 9,
            width: '100%',
            paddingHorizontal: 5,
            backgroundColor: fontFamily.bgColor,
          }}>
          <WebView
            onLoadEnd={() => {
              setSpinner(false);
            }}
            source={{
              html:
                `<div style="color: ${colors.primaryTextColor}">` +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                userTerms +
                '</div>',
            }}
            containerStyle={{backgroundColor: fontFamily.bgColor}}
            scrollEnabled={true}
            style={{
              height: '100%',
              width: '100%',
              borderRadius: 15,
              backgroundColor: 'transparent',
              paddingTop: 40,
            }}
            domStorageEnabled={true}
            javaScriptCanOpenWindowsAutomatically={true}
            decelerationRate="normal"
            javaScriptEnabledAndroid={true}></WebView>
        </View>

        <ProgressLoader
          visible={spinner}
          isHUD={true}
          isModal={true}
          color={colors.spinner}
        />

        <View
          style={{
            width: '95%',
            marginTop: 10,
            borderBottomWidth: 0.4,
            borderColor: colors.premiumGray + '90',
            marginHorizontal: 15,
          }}
        />

        <View
          style={{
            flex: 1,
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
            <TouchableOpacity
              style={{
                height: 40,
                width: '90%',
                borderRadius: 8,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                backgroundColor: colors.primaryBackground,
                borderWidth: 1,
                borderColor: colors.notificationColor,
              }}
              onPress={() => ProfileNavigation.pop()}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: normalize(18),
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1,
                }}>
                {textContent.DeleteAccount.cancel}
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
                width: '90%',
                borderRadius: 8,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                backgroundColor: colors.notificationColor,
              }}
              onPress={() => {
                setDeleteAccountPopup(true);
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: normalize(18),
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1,
                }}>
                {textContent.DeleteAccount.iagree}
              </Text>
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
    paddingBottom: 60,
  }),
  borderStyleBase: colors => ({
    width: 30,
    height: 45,
    backgroundColor: colors.red,
  }),

  borderStyleHighLighted: {},

  underlineStyleBase: colors => ({
    width: 42,
    height: 42,
    borderWidth: 0,
    color: colors.primaryTextColor,
    fontSize: 20,
    backgroundColor: colors.searchBarColor,
    marginHorizontal: 5,
    justifyContent:'center'
  }),

  underlineStyleHighLighted: {},
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(DeleteAccount);
