import React, { useEffect, useRef, useState } from 'react';
import * as AuthNavigation from '../router/_AuthNavigation';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as StackNavigation from '../router/_StackNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import jwt_decode from 'jwt-decode';
import { requestTrackingPermission } from 'react-native-tracking-transparency';

import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import InstagramLogin from 'react-native-instagram-login';
import {
  AppleButton,
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import CookieManager from '@react-native-cookies/cookies';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from 'react-native-google-signin';

import {
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';

import OneSignal, { OSNotification } from 'react-native-onesignal';
import { ONESIGNALAPPID } from '../utils/keys';
import { INSTAGRAMAPPID, INSTAAPPSECRET } from '../utils/keys';

import 'react-native-get-random-values';

const { width, height } = Dimensions.get('window');

import { Dialog } from 'react-native-simple-dialogs';

import base64 from 'react-native-base64';

import { SafeAreaView } from 'react-native-safe-area-context';
import { normalize } from '../components/NormalizeFonts';
import { connect } from 'react-redux';
import persistStorage from '../redux/store/persistStore';
import { updateUserData } from '../redux/reducers/PersistReducer';
import { updateUserDetails } from '../redux/actions/UserAction';
import { forgotPassword, userLogin } from '../actions/LoginAPI';
import { userFieldCheck } from '../actions/UserAPI';
import { useContext } from 'react';
import { DarkModeContext } from '../components/DarkModeContext';
import { useToast } from 'react-native-toast-notifications';
import { v4 as uuid } from 'uuid';
import textContent from '../utils/textContent';
import { validateAuthData } from '../actions/AppleHelperFunctions';
import LoginButtonComponent from '../components/LoginButton';

const LoginScreen = ({ userReducer, updateUserDetails }) => {
  const { darkMode, colors } = useContext(DarkModeContext);
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usedPlatform, setUsedPlatform] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordDialog, setForgotPasswordDialog] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [userfound, setUserFound] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const instagramLoginRef = useRef();

  useEffect(() => {
    updateUserDetails({
      prop: 'ProfileRegistration',
      value: null,
    });
    CookieManager.clearAll(true).then(res => { });

    if (Platform.OS === 'ios') {
      setUsedPlatform('ios');
    } else {
      setUsedPlatform('android');
    }
    GoogleSignin.configure({
      //It is mandatory to call this method before attempting to call signIn()
      // scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      // Repleace with your webClientId generated from Firebase console
      webClientId:
        '787173364961-pkmn7941vkat5ls8gqb85naulqjbhg6q.apps.googleusercontent.com',
    });
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId(ONESIGNALAPPID);
    OneSignal.setRequiresUserPrivacyConsent(true);
    OneSignal.provideUserConsent(true);
  }, []);

  const validateIsEmail = email => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const checkUserName = username => {
    let jsonData = {
      userName: username,
    };

    userFieldCheck(jsonData)
      .then(response => {
        if (response.status === 'success') {
          setUserFound(false);
        } else {
          setUserFound(true);
        }
      })
      .catch(error => {
        toast.show(textContent.general.general_error);
        setUserFound(false);
      });
  };

  const fogotPassword = () => {
    if (!validateIsEmail(forgotPasswordEmail)) {
      toast.show(textContent.Login.alert_email);
      return;
    }

    let jsonData = {
      email: forgotPasswordEmail,
    };

    forgotPassword(jsonData)
      .then(response => {
        if (response.status === 'success') {
          toast.show(textContent.Login.password_sent);

          setForgotPasswordDialog(false);
          setForgotPasswordEmail('');
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {
        toast.show(textContent.general.general_error);
      });
  };

  const setOneSignalExternalId = async externalId => {
    OneSignal.setExternalUserId(externalId);
    // const deviceState = await OneSignal.getDeviceState();
    // if (deviceState.isPushNotificationsEnabled) {
    //   await OneSignal.setExternalUserId(externalId);
    // } else {

    // OneSignal.promptForPushNotificationsWithUserResponse();

    // const deviceState = await OneSignal.getDeviceState();

    // if (deviceState.hasNotificationPermission) {
    //   OneSignal.setExternalUserId(externalId);
    // }
    // }
  };

  const loginWithFacebook = () => {
    setSpinner(true);

    LoginManager.logInWithPermissions(['public_profile', 'email']).then(
      function (result) {
        setSpinner(false);
        if (result.isCancelled) {
        } else {
          AccessToken.getCurrentAccessToken().then(data => {
            const accessToken = data.accessToken.toString();
            const PROFILE_REQUEST_PARAMS = {
              fields: {
                string: 'email,id,name,first_name,last_name',
              },
            };
            const profileRequest = new GraphRequest(
              '/me',
              { accessToken, parameters: PROFILE_REQUEST_PARAMS },
              async (error, result) => {
                if (error) {
                } else {
                  const trackingStatus = await requestTrackingPermission();
                  if (
                    trackingStatus === 'authorized' ||
                    trackingStatus === 'unavailable'
                  ) {
                  } else {
                  }
                  let jsonData = {
                    loginBy: 'facebook',
                    email: result.email,
                    userName: result.name
                      .toString()
                      .trim()
                      .replace(' ', '')
                      .concat((Math.random() + 1).toString(36).substring(4)),
                    firstName: result.first_name,
                    lastName: result.last_name,
                  };

                  userLogin(jsonData)
                    .then(response => {
                      const {
                        PROFIT_WAXPLACE_ID,
                        PROFIT_WAXPLACE_WALLET_ID,
                        WAXPLACE_AUTHOR_ID,
                        WAXPLACE_WALLET_ID,
                        CLIENT_ID,
                        MANGOPAY_APIKEY,
                        API_BASE_URL,
                      } = response.info;

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
                      if (response.status == 'success') {
                        if (!response?.user?.isRegistration) {
                          updateUserDetails({
                            prop: 'ProfileRegistration',
                            value: null,
                          });

                          AuthNavigation.reset('Registration');
                        } else {
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
                            'categories' in response.user &&
                            response.user.categories.length > 0
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
                      } else {
                        toast.show(response.message);
                      }
                    })
                    .catch(error => {
                      toast.show(textContent.general.general_error);
                    });
                }
              },
            );
            new GraphRequestManager().addRequest(profileRequest).start();
          });
        }
      },
      function (error) {
        setSpinner(false);
      },
    );
  };

  const loginWithInstagram = async data => {
    const trackingStatus = await requestTrackingPermission();
    if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
    } else {
    }
    let jsonData = {
      loginBy: 'instagram',
      email: `${data.user_id}@heximstemporary.com`,
      userName: '',
      firstName: '',
      lastName: '',
      instagramId: data.user_id,
    };

    userLogin(jsonData)
      .then(response => {
        if (response.status == 'success') {
          const {
            PROFIT_WAXPLACE_ID,
            PROFIT_WAXPLACE_WALLET_ID,
            WAXPLACE_AUTHOR_ID,
            WAXPLACE_WALLET_ID,
            CLIENT_ID,
            MANGOPAY_APIKEY,
            API_BASE_URL,
          } = response.info;

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
          if (!response?.user?.isRegistration) {
            updateUserDetails({
              prop: 'ProfileRegistration',
              value: {
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                email: `${data.user_id}@heximstemporary.com`,
                userId: response.user._id,
                bearer: response.user.token,
              },
            });
            persistStorage.dispatch(
              updateUserData({
                prop: 'userDetails',
                value: null,
              }),
            );
            AuthNavigation.reset('Registration');
          } else {
            let externalUserId = response?.user?._id;

            OneSignal.setExternalUserId(externalUserId);

            setSpinner(false);
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

            if (
              'categories' in response.user &&
              response.user.categories.length > 0
            ) {
              HomeNavigation.reset('HomeScreen');
              StackNavigation.reset('Userscreens');
            } else {
              updateUserDetails({ prop: 'showCategories', value: true });
              StackNavigation.reset('Userscreens');
            }
          }
        } else {
          setSpinner(false);
          toast.show(response.message);
        }
      })
      .catch(error => {
        toast.show(textContent.general.general_error);
        setSpinner(false);
      });
  };

  const loginWithGoogle = async () => {
    setSpinner(true);

    try {
      //await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const trackingStatus = await requestTrackingPermission();
      if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
      } else {
      }
      let jsonData = {
        loginBy: 'google',
        email: userInfo.user.email,
        userName: userInfo.user.name
          .toString()
          .trim()
          .replace(' ', '')
          .concat((Math.random() + 1).toString(36).substring(4)),
        firstName: userInfo.user.givenName,
        lastName: userInfo.user.familyName,
      };

      userLogin(jsonData)
        .then(response => {
          const {
            PROFIT_WAXPLACE_ID,
            PROFIT_WAXPLACE_WALLET_ID,
            WAXPLACE_AUTHOR_ID,
            WAXPLACE_WALLET_ID,
            CLIENT_ID,
            MANGOPAY_APIKEY,
            API_BASE_URL,
          } = response.info;

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
          if (response.status == 'success') {
            if (!response?.user?.isRegistration) {
              updateUserDetails({
                prop: 'ProfileRegistration',
                value: {
                  firstName: response.user.firstName,
                  lastName: response.user.lastName,
                  email: response.user.email,
                  userId: response.user._id,
                  bearer: response.user.token,
                },
              });
              persistStorage.dispatch(
                updateUserData({
                  prop: 'userDetails',
                  value: null,
                }),
              );
              AuthNavigation.reset('Registration');
            } else {
              let externalUserId = response?.user?._id;

              OneSignal.setExternalUserId(externalUserId);

              setSpinner(false);

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

              if (
                'categories' in response.user &&
                response.user.categories.length > 0
              ) {
                HomeNavigation.reset('HomeScreen');
                StackNavigation.reset('Userscreens');
              } else {
                updateUserDetails({ prop: 'showCategories', value: true });
                StackNavigation.reset('Userscreens');
              }
            }
          } else {
            setSpinner(false);
            toast.show(response.message);
          }
        })
        .catch(error => {
          toast.show(textContent.general.general_error);
          setSpinner(false);
        });

      setUserInfo(userInfo);
    } catch (error) {
      setSpinner(false);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toast.show('Play services not available');
        // play services not available or outdated
      } else {
        toast.show(textContent.general.general_error);
        // some other error happened
      }
    }
  };

  const loginWithApple = async () => {
    let data;
    let firstName='';
    let lastName='';
    try {
      if (Platform.OS == 'ios') {
        // performs login request
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          // Note: it appears putting FULL_NAME first is important, see issue #293
          requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });
//  console.log("appleAuthRequestResponse",appleAuthRequestResponse)

        if(appleAuthRequestResponse?.fullName?.givenName)
        {
            firstName = appleAuthRequestResponse?.fullName?.givenName
        }
        
        if(appleAuthRequestResponse?.fullName?.familyName)
        {
            lastName = appleAuthRequestResponse?.fullName?.familyName
        }


        data = jwt_decode(appleAuthRequestResponse?.identityToken);

        // // get current authentication state for user
        // // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        // const credentialState = await appleAuth.getCredentialStateForUser(
        //   appleAuthRequestResponse.user,
        // );

        // // use credentialState response to ensure the user is authenticated
        // if (credentialState === appleAuth.State.AUTHORIZED) {
        //   // user is authenticated
        // }
      } else {
        // Generate secure, random values for state and nonce
        const rawNonce = uuid();
        const state = uuid();

        // Configure the request
        appleAuthAndroid.configure({
          // The Service ID you registered with Apple
          clientId: 'com.waxplace.co', //'com.hexims.stokeapp.signin',

          // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
          // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
          redirectUri: 'https://waxplace.co/',
          //'https://ihex.in',

          // The type of response requested - code, id_token, or both.
          responseType: appleAuthAndroid.ResponseType.ALL,

          // The amount of user information requested from Apple.
          scope: appleAuthAndroid.Scope.ALL,

          // Random nonce value that will be SHA256 hashed before sending to Apple.
          nonce: rawNonce,

          // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
          state,
        });

        // Open the browser window for user sign in
        const response = await appleAuthAndroid.signIn();

        // {
        //   token: response.id_token,
        //   id: response.code,
        // }
        data = jwt_decode(response?.id_token);
      }
      const trackingStatus = await requestTrackingPermission();
      if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
      } else {
      }
      let jsonData = {
        loginBy: 'apple',
        email: data?.email || `${data?.sub}@heximstemporary.com`,
        userName: '',
        firstName:firstName,
        lastName:lastName,
        appleId: data?.sub,
      };
//  console.log('apple login',jsonData,data)
      userLogin(jsonData)
        .then(response => {
          const {
            PROFIT_WAXPLACE_ID,
            PROFIT_WAXPLACE_WALLET_ID,
            WAXPLACE_AUTHOR_ID,
            WAXPLACE_WALLET_ID,
            CLIENT_ID,
            MANGOPAY_APIKEY,
            API_BASE_URL,
          } = response.info;

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
          if (response.status == 'success') {
            if (!response?.user?.isRegistration) {
              updateUserDetails({
                prop: 'ProfileRegistration',
                value: {
                  firstName: response.user.firstName,
                  lastName: response.user.lastName,
                  email: response.user.email,
                  userId: response.user._id,
                  bearer: response.user.token,
                },
              });

              AuthNavigation.reset('Registration');
            } else {
              let externalUserId = response?.user?._id;

              OneSignal.setExternalUserId(externalUserId);

              setSpinner(false);
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

              if (
                'categories' in response.user &&
                response.user.categories.length > 0
              ) {
                HomeNavigation.reset('HomeScreen');
                StackNavigation.reset('Userscreens');
              } else {
                updateUserDetails({ prop: 'showCategories', value: true });
                StackNavigation.reset('Userscreens');
              }
            }
          } else {
            setSpinner(false);
            toast.show(response.message);
          }
        })
        .catch(error => {
          toast.show(textContent.general.general_error);
          setSpinner(false);
        });
    } catch (error) {
      if (error?.message !== 'E_SIGNIN_CANCELLED_ERROR') {
        toast.show(textContent.general.general_error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={forgotPasswordDialog}
        onTouchOutside={() => {
          setForgotPasswordDialog(false);
          setForgotPasswordEmail('');
        }}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          padding: 0,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.primaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            paddingHorizontal: 25,
            paddingBottom: 20,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: normalize(16),
              alignSelf: 'center',
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Login.forgot_password}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,
              marginTop: 20,
              letterSpacing: 0.5,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.Login.email}
          </Text>

          <View
            style={{
              marginTop: normalize(10),
              borderRadius: 12,

              overflow: 'hidden',

              backgroundColor: colors.primaryBackground,
            }}>
            <TextInput
              value={forgotPasswordEmail}
              style={{
                width: '100%',
                height: 47,
                color: colors.primaryTextColor,
                paddingLeft: 10,
                fontSize: 14,
                letterSpacing: 0.5,
                fontFamily: fontFamily.MontserratRegular,
                backgroundColor: colors.searchBarColor,
              }}
              placeholder={''}
              onChangeText={text => {
                setForgotPasswordEmail(text);
              }}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>

          <TouchableOpacity
            style={{
              width: '70%',
              height: normalize(40),
              backgroundColor: colors.primaryButtonColor,
              borderRadius: 20,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginTop: 25,
              alignSelf: 'center',
            }}
            onPress={() => fogotPassword()}>
            <Text
              style={{
                color: colors.black,
                fontSize: normalize(16),
                letterSpacing: 1,
                fontFamily: fontFamily.MontserratMedium,
                alignSelf: 'center',
              }}>
              {textContent.Login.button_text_one}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
      <View style={{ flex: 1, width: '100%' }}>
        <ImageBackground
          style={{
            width,
            height: height * 0.3,
            top: 0,
            zIndex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          source={imagepath.headerblack}
          resizeMode="cover"></ImageBackground>
        <View
          style={{
            marginTop: '15%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: Platform.OS == 'ios' ? normalize(18) : normalize(22),
              fontFamily: fontFamily.MontserratBold,
              width: '90%',
              textAlign: 'center',
              color: colors.primaryTextColor + 'cc',
              fontWeight: 'bold',
            }}>
            {textContent.Login.welcome_back}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'flex-end',

          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              //   justifyContent:'center',
              paddingTop: '10%',
            }}>
            {Platform.OS == 'ios' ? (
              <LoginButtonComponent
                style={{
                  height: 40,
                  width: 240,
                  marginBottom: 22,
                }}
                textStyle={{
                  fontSize: 14.5,
                  marginTop: 1,
                  fontFamily: fontFamily.MontserratRegular,
                }}
                cornerRadius={20}
                buttonStyle={
                  darkMode ? AppleButton.Style.WHITE : AppleButton.Style.BLACK
                }
                buttonType={AppleButton.Type.SIGN_IN}
                onPress={() => {
                  loginWithApple();
                }}
                leftView={
                  <Image
                    style={{
                      alignSelf: 'center',
                      width: 20,
                      height: 20,
                      marginRight: 7,
                      resizeMode: 'contain',
                      tintColor: darkMode ? colors.black : colors.white,
                    }}
                    source={imagepath.apple}
                  />
                }
              />
            ) : null}

            <LoginButtonComponent
              style={{
                height: 40,
                width: 240,
                borderWidth: 2.2,
                borderColor: '#4285f4',
                backgroundColor: colors.primaryBackground,
                marginBottom: 22,
              }}
              textStyle={{
                fontSize: 14.5,
                color: '#4285f4',
                fontFamily: fontFamily.MontserratMedium,
              }}
              cornerRadius={20}
              displayName={'asd'}
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={'Google'}
              onPress={() => {
                loginWithGoogle();
              }}
              leftView={
                <Image
                  style={{
                    alignSelf: 'center',
                    width: 20,
                    height: 20,
                    marginRight: 7,
                    resizeMode: 'contain',
                    // tintColor: colors.black,
                  }}
                  source={imagepath.google}
                />
              }
            />
            <LoginButtonComponent
              style={{ height: 40, width: 240, marginBottom: 22 }}
              textStyle={{
                fontSize: 14.5,
                color: colors.white,
                fontFamily: fontFamily.MontserratMedium,
              }}
              cornerRadius={20}
              displayName={'asd'}
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={"Instagram"}
              onPress={() => {
                instagramLoginRef?.current?.show();
              }}
              leftView={
                <Image
                  style={{
                    alignSelf: 'center',
                    width: 20,
                    height: 20,
                    marginRight: 7,
                    resizeMode: 'contain',
                    // tintColor: colors.black,
                  }}
                  source={imagepath.instagram}
                />
              }
            />

            {/* <LoginButtonComponent
              style={{ height: 40, width: 240, backgroundColor: '#1877f2' }}
              textStyle={{
                fontSize: 14.5,
                color: colors.white,
                fontFamily: fontFamily.MontserratMedium,
              }}
              cornerRadius={20}
              displayName={'asd'}
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={'Facebook'}
              onPress={() => {
                loginWithFacebook();
              }}
              leftView={
                <Image
                  style={{
                    alignSelf: 'center',
                    width: 20,
                    height: 20,
                    marginRight: 5,
                    resizeMode: 'contain',
                    tintColor: colors.white,
                  }}
                  source={imagepath.facebook}
                />
              }
            />*/}
          </View>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View
              style={{
                // position: 'absolute',
                // bottom: 0,
                width: '100%',
                alignItems: 'center',
                marginVertical: Platform.OS == 'android' ? 25 : 0,
              }}>
              <Text
                style={{
                  fontSize: normalize(18),
                  fontFamily: fontFamily.MontserratMedium,
                  width: '90%',
                  textAlign: 'center',
                  color: colors.primaryTextColor,
                }}>
                {textContent.Login.signin_validate}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 5,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    AuthNavigation.navigate('Terms', { type: 'TandC' });
                  }}>
                  <Text
                    style={{
                      fontSize: normalize(18),
                      fontFamily: fontFamily.MontserratMedium,

                      textAlign: 'center',
                      color: colors.blue,
                    }}>
                    {textContent.Login.terms}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(18),
                    fontFamily: fontFamily.MontserratMedium,
                    color: colors.primaryTextColor,
                    textAlign: 'center',
                  }}>
                  {' & '}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    AuthNavigation.navigate('Terms', { type: 'privacyPolicy' });
                  }}>
                  <Text
                    style={{
                      fontSize: normalize(18),
                      fontFamily: fontFamily.MontserratMedium,

                      textAlign: 'center',
                      color: colors.blue,
                    }}>
                    {textContent.Login.privacy_policy}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      <InstagramLogin
        ref={instagramLoginRef}
        appId={INSTAGRAMAPPID}
        appSecret={INSTAAPPSECRET}
        redirectUrl="https://www.google.com/"
        scopes={['user_profile', 'user_media']}
        onLoginSuccess={loginWithInstagram}
        onLoginFailure={data => {
          toast.show(textContent.general.general_error);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    width: '100%',
    backgroundColor: colors.primaryBackground,

    justifyContent: 'center',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, { updateUserDetails })(LoginScreen);