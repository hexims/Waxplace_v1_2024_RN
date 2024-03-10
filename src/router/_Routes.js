import React, {useEffect, useReducer, useRef, useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  Linking,
  NativeModules,
} from 'react-native';
const {Appearance, useColorScheme} =
  Platform.OS === 'ios'
    ? require('react-native')
    : require('react-native-appearance');
import textContent from '../utils/textContent';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as AuthNavigation from '../router/_AuthNavigation';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from './_ProfileNavigation';
import * as BottomNavigation from './_BottomNavigation';
import * as StackNavigation from './_StackNavigation';
import * as MapNavigation from './_MapNavigation';
import * as CartNavigation from './_CartNavigation';
import {createStackNavigator} from '@react-navigation/stack';
import {Dialog} from 'react-native-simple-dialogs';
import {ToastProvider} from 'react-native-toast-notifications';
import persistStorage from '../redux/store/persistStore';
import {
  BottomTabBar,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import * as Sentry from '@sentry/react-native';
import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {connect} from 'react-redux';
import {darkModeColors, lightModeColors} from '../utils/Colors';
import imagepath from '../utils/Images';
import fontFamily from '../utils/FontFamily';
import {useSafeArea, useSafeAreaInsets} from 'react-native-safe-area-context';
// import SplashScreenModule from 'react-native-splash-screen';

const {width, height} = Dimensions.get('window');

//Screens
import SplashScreen from '../screens/Splash';
import Categoriesscreen from '../screens/Categories';
import HomeScreen from '../screens/homepage';
//import HomeScreen from '../screens/Correos';
import Profilescreen from '../screens/Profile';
import Mapscreen from '../screens/Maps';
import AlbumDetails from '../screens/AlbumDetails';

import Loginscreen from '../screens/Login';
import Registration from '../screens/Registration';

import Cartscreen from '../screens/Cart';
import Checkout from '../screens/Checkout';
import Collections from '../screens/Collections';
import Wishlist from '../screens/WishList';
import PickUpForUser from '../screens/PickupForUser';
import Settings from '../screens/Settings';
import DeleteAccount from '../screens/DeleteAccount';
import Friends from '../screens/Friends';
import ProfileWeeklyDrops from '../screens/ProfileWeeklyDrops';
import WeeklyDrops from '../screens/WeeklyDrops';
import FriendProfile from '../screens/FriendProfile';
import StoreDetails from '../screens/StoreDetails';
import WalletHistory from '../screens/WalletHistory';
import Notifications from '../screens/Notifications';
import MySales from '../screens/MySales';
import MyPurchases from '../screens/MyPurchases';
import OrderDetails from '../screens/OrderDetails';
import Address from '../screens/EditProfile';
import ChatScreen from '../screens/chatBot/_ChatScreen';
import Terms from '../screens/Terms';
import HelpFaq from '../screens/HelpFaq';
import NearbyDepots from '../screens/NearbyDepots';
import DeliveryDetails from '../screens/DelveryDetails';
import SellerDetails from '../screens/SellerDetails';

import {BASEURL} from '../actions/_apiUrls';
// import Settings from '../screens/Settings';

import CreateSaleProduct from '../screens/CreateSaleProduct';
import PaymentSettings from '../screens/payments';
// import WalletHistory from '../screens/WalletHistory';

import store from '../redux/store';
import {UPDATE_USER_DETAILS} from '../redux/actions/types';
import {updateUserDetails} from '../redux/actions/UserAction';
import {Avatar} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import {DarkModeContext, DarkModeProvider} from '../components/DarkModeContext';

import {useContext} from 'react';
import {KeyboardAvoidingView} from 'react-native';
import {Animated} from 'react-native';
import {Keyboard} from 'react-native';
import {updateUserData} from '../redux/reducers/PersistReducer';
import {useSocket} from '../actions/Socket';
import {io} from 'socket?.io-client';
import {useMemo} from 'react';
import {CardBottomSheet} from '../components/CardBottomSheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// const socket = io(BASEURL.slice(0, -1));

const handleDeepLink = (url, updateUserDetails) => {
  // Parse the URL to extract any data or parameters
  const data = parseDeepLink(url);
 
  // Navigate to the appropriate screen in your app
  updateUserDetails({prop: 'transactionId', value: data.split('&status')[0]});
};

const parseDeepLink = url => {
  // Parse the URL to extract any data or parameters
  // For example, you can use the URLSearchParams API to extract query parameters:

  const transactionId = url.split('?')[1].split('=')[1];

  return transactionId;
};

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  // dsn: 'https://3fd9c81f9f68450b812de44a87c265be@o4504240892608512.ingest.sentry.io/4504241102127104',
  dsn: 'https://63610ba474e44982be6b556ecd594d97@o4504676262412288.ingest.sentry.io/4504710514802688',
  tracesSampleRate: 0.2,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

// AUTHENTICATION FLOW
const authNav = createStackNavigator();
const AuthStack = () => {
  return (
    <NavigationContainer
      ref={AuthNavigation.authNavigationRef}
      independent={true}>
      <authNav.Navigator
        initialRouteName={
          store.getState().userReducer.initial == false
            ? 'Login'
            : 'SplashScreen'
        }
        headerMode="screen"
        screenOptions={{headerShown: false}}>
        <authNav.Screen name="SplashScreen" component={SplashScreen} />
        <authNav.Screen name="Login" component={Loginscreen} />
        <authNav.Screen name="Registration" component={Registration} />
        <authNav.Screen name="Terms" component={Terms} />
      </authNav.Navigator>
    </NavigationContainer>
  );
};

// USER PAGES FLOW
const homeNav = createStackNavigator();
const HomeStack = () => {
  useEffect(() => {
    if (store.getState().userReducer.showCategories == true) {
    }
  }, [store.getState().userReducer.showCategories]);
  return (
    <NavigationContainer
      ref={HomeNavigation.homeNavigationRef}
      independent={true}>
      <homeNav.Navigator
        initialRouteName={
          store.getState().userReducer.showCategories == false
            ? 'HomeScreen'
            : 'Categoriesscreen'
        }
        headerMode="screen"
        screenOptions={{headerShown: false}}>
        <homeNav.Screen name="HomeScreen" component={HomeScreen} />
        <homeNav.Screen name="Categoriesscreen" component={Categoriesscreen} />

        <homeNav.Screen name="AlbumDetails" component={AlbumDetails} />
        <homeNav.Screen
          name="CreateSaleProduct"
          component={CreateSaleProduct}
        />
        <homeNav.Screen name="CartStack" component={CartStack} />
        <homeNav.Screen name="Collections" component={Collections} />
        <homeNav.Screen name="FriendProfile" component={FriendProfile} />
        <homeNav.Screen name="StoreDetails" component={StoreDetails} />
        <homeNav.Screen name="WeeklyDrops" component={WeeklyDrops} />
        <homeNav.Screen name="OrderDetails" component={OrderDetails} />
        <homeNav.Screen
          options={{
            headerShown: true,
          }}
          name="ChatScreen"
          component={ChatScreen}
        />
      </homeNav.Navigator>
    </NavigationContainer>
  );
};

const MapNav = createStackNavigator();
const MapStack = () => {
  return (
    <NavigationContainer
      ref={MapNavigation.mapNavigationRef}
      independent={true}>
      <MapNav.Navigator
        headerMode="screen"
        screenOptions={{headerShown: false}}>
        <MapNav.Screen name="Mapscreen" component={Mapscreen} />
        <MapNav.Screen name="CartStack" component={CartStack} />
        <MapNav.Screen name="FriendProfile" component={FriendProfile} />
        <MapNav.Screen name="StoreDetails" component={StoreDetails} />
      </MapNav.Navigator>
    </NavigationContainer>
  );
};

const profileNav = createStackNavigator();

const ProfileStack = () => {
  return (
    <NavigationContainer
      ref={ProfileNavigation.profileNavigationRef}
      //initialState={store.getState().userReducer.profileNavState}
      onUnhandledAction={() => {}}
      onReady={() => {
        if (store.getState().userReducer.showStoreDetails.toggle) {
          ProfileNavigation.reset(
            'StoreDetails',
            store.getState().userReducer.showStoreDetails.params,
          );
        }
        if (store.getState().userReducer.showFriendProfile.toggle) {
          ProfileNavigation.reset(
            'FriendProfile',
            store.getState().userReducer.showFriendProfile.params,
          );
        }
      }}
      independent={true}>
      <profileNav.Navigator
        headerMode="screen"
        screenOptions={{headerShown: false}}>
        <profileNav.Screen name="Profilescreen" component={Profilescreen} />
        <profileNav.Screen name="Collections" component={Collections} />
        <profileNav.Screen name="Wishlist" component={Wishlist} />
        <profileNav.Screen name="PickUpForUser" component={PickUpForUser} />
        <profileNav.Screen name="Settings" component={Settings} />
        <profileNav.Screen name="DeleteAccount" component={DeleteAccount} />
        <profileNav.Screen
          name="Categoriesscreen"
          component={Categoriesscreen}
        />
        <profileNav.Screen name="PaymentSettings" component={PaymentSettings} />
        <profileNav.Screen name="FriendProfile" component={FriendProfile} />
        <profileNav.Screen name="StoreDetails" component={StoreDetails} />
        <profileNav.Screen name="FriendsListing" component={Friends} />
        <profileNav.Screen
          name="ProfileWeeklyDrops"
          component={ProfileWeeklyDrops}
        />
        <profileNav.Screen name="WalletHistory" component={WalletHistory} />
        <profileNav.Screen name="CartStack" component={CartStack} />
        <profileNav.Screen name="Terms" component={Terms} />
        <profileNav.Screen name="HelpFaq" component={HelpFaq} />
        <profileNav.Screen name="Notifications" component={Notifications} />
        <profileNav.Screen name="MySales" component={MySales} />
        <profileNav.Screen name="SellerDetails" component={SellerDetails} />
        <profileNav.Screen name="MyPurchases" component={MyPurchases} />
        <profileNav.Screen name="OrderDetails" component={OrderDetails} />
        <profileNav.Screen name="NearbyDepots" component={NearbyDepots} />
        <profileNav.Screen
          options={{
            headerShown: true,
          }}
          name="ChatScreen"
          component={ChatScreen}
        />
        <profileNav.Screen name="Address" component={Address} />
        <profileNav.Screen
          name="CreateSaleProduct"
          component={CreateSaleProduct}
        />
      </profileNav.Navigator>
    </NavigationContainer>
  );
};

//Cart Stack
const cartNav = createStackNavigator();
const CartStack = () => {
  return (
    <NavigationContainer
      ref={CartNavigation.cartNavigationRef}
      independent={true}>
      <cartNav.Navigator
        headerMode="screen"
        screenOptions={{headerShown: false}}>
        <cartNav.Screen name="Cartscreen" component={Cartscreen} />
        <cartNav.Screen name="Mapscreen" component={Mapscreen} />
        <cartNav.Screen name="Checkout" component={Checkout} />
        <cartNav.Screen name="FriendProfile" component={FriendProfile} />
        <cartNav.Screen name="StoreDetails" component={StoreDetails} />
        <cartNav.Screen name="AlbumDetails" component={AlbumDetails} />
        <cartNav.Screen name="OrderDetails" component={OrderDetails} />
        <cartNav.Screen name="DeliveryDetails" component={DeliveryDetails} />
        <cartNav.Screen
          options={{
            headerShown: true,
          }}
          name="ChatScreen"
          component={ChatScreen}
        />
      </cartNav.Navigator>
    </NavigationContainer>
  );
};

const MyTabBar = ({state, descriptors, navigation}) => {
  const {darkMode, colors} = useContext(DarkModeContext);

  if (
    navigation?.getState()?.routes[0]?.params?.hide == true ||
    navigation?.getState()?.routes[1]?.params?.hide == true ||
    navigation?.getState()?.routes[2]?.params?.hide == true
  ) {
    return null;
  } else {
    return (
      <ImageBackground
        source={darkMode ? imagepath.tab_bg_dark : imagepath.tab_bg}
        resizeMode="stretch"
        style={{
          width: '100%',
          height: 60,
          paddingVertical: 8,
          backgroundColor: colors.transparent,
          // borderTopWidth: 0.6,
          // borderColor: colors.premiumGrayOne + 'aa',
          position: 'absolute',
          bottom: 0,
          flexDirection: 'row',
        }}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            if (BottomNavigation?.navigationRef?.getCurrentRoute()?.name) {
              store.dispatch({
                type: UPDATE_USER_DETAILS,
                payload: {
                  prop: 'previousBottomPage',
                  value:
                    BottomNavigation?.navigationRef?.getCurrentRoute()?.name,
                },
              });
            }
            store.dispatch({
              type: UPDATE_USER_DETAILS,
              payload: {prop: 'selectedBottomPage', value: route.name},
            });
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              //navigation.navigate({name: route.name, merge: true});

              BottomNavigation.reset(route.name);
            } else {
              BottomNavigation.reset(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              style={{
                flex: route.name == 'WAXMAP' ? 1.5 : 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 3.2,
              }}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}>
              <View
                style={{
                  flex: 2,
                  width: '100%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  //   paddingBottom: 3.2,
                }}>
                <Image
                  style={{
                    // width: route.name == 'WAXMAP' ? 25 : 24,
                    // height: route.name == 'WAXMAP' ? 25 : 24,
                    width: route.name == 'WAXMAP' ? 22 : 21,
                    height: route.name == 'WAXMAP' ? 22 : 21,
                    tintColor: isFocused
                      ? darkMode
                        ? colors.waxplaceTextColor
                        : colors.waxplaceColor
                      : colors.inactiveColor,
                  }}
                  source={
                    route.name == 'HOME'
                      ? imagepath.home_tab
                      : route.name == 'WAXMAP'
                      ? imagepath.map_tab
                      : imagepath.profile_tab
                  }
                  resizeMode={'contain'}></Image>
              </View>
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    // fontSize: 11.5,
                    fontSize: 12,
                    letterSpacing: 0.5,

                    fontFamily: fontFamily.MontserratRegular,

                    color: isFocused
                      ? darkMode
                        ? colors.waxplaceTextColor
                        : colors.waxplaceColor
                      : colors.inactiveColor,
                  }}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ImageBackground>
    );
  }
};

const BottomBar = createBottomTabNavigator();

const Screens = ({userReducer}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [phoneHeight, setPhoneHeight] = useState('100%');

  const [isConnected, setIsconnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsconnected(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const openSettings = () => {
    NativeModules.OpenSettings.openNetworkSettings(data => {});
  };
  const onLayout = event => {
    const {x, y, height, width} = event.nativeEvent.layout;

    setPhoneHeight(height);
  };
  return (
    <>
      {StackNavigation?.stackNavigationRef?.isReady() &&
        StackNavigation?.stackNavigationRef?.getCurrentRoute().name !=
          'Authscreens' && (
          <Dialog
            visible={!isConnected}
            onTouchOutside={() => setNoInternet(false)}
            contentStyle={{backgroundColor: colors.white, borderRadius: 15}}
            dialogStyle={{
              backgroundColor: colors.cardColor,
              borderRadius: 15,

              backgroundColor: colors.white,
              width: '100%',
              alignSelf: 'center',
            }}>
            <View
              style={{
                borderRadius: 10,
                backgroundColor: colors.white,
                marginTop: 10,
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.black,
                  fontSize: 20,
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {textContent._routes.no_internet}
              </Text>

              <Image
                style={{
                  width: '100%',
                  height: 200,
                  alignSelf: 'center',
                  marginVertical: 30,
                }}
                source={imagepath.warning}
                resizeMode={'contain'}></Image>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.black,
                  width: '100%',

                  textAlign: 'center',
                  fontSize: 16,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {textContent._routes.check_internet}
              </Text>

              <TouchableOpacity
                style={{
                  width: '70%',
                  alignSelf: 'center',
                  marginTop: 30,
                  height: 40,
                  justifyContent: 'center',
                  borderRadius: 30,
                  backgroundColor: colors.notificationColor,
                }}
                onPress={() => {
                  Platform.OS === 'ios'
                    ? Linking.openURL('App-Prefs:root=WIFI')
                    : openSettings();
                }}>
                <Text
                  style={{
                    color: colors.white,
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratMedium,
                    fontSize: 18,
                  }}>
                  {textContent._routes.go_to_settings}
                </Text>
              </TouchableOpacity>
            </View>
          </Dialog>
        )}

      <NavigationContainer
        independent={true}
        ref={BottomNavigation.navigationRef}>
        <BottomBar.Navigator
          tabBar={props => <MyTabBar {...props} />}
          screenOptions={{headerShown: false, keyboardHidesTabBar: true}}
          tabBarOptions={{
            keyboardHidesTabBar: true,
            showIcon: true,
            style: {
              width: '100%',
              position: 'absolute',
              height: '100%',
              backgroundColor: colors.transparent,

              bottom: 0,
            },
            allowFontScaling: false,
            activeTintColor: colors.waxplaceColor,
            labelStyle: {
              fontSize: 14,
              color: colors.black,
              height: 15,
            },

            tabStyle: {
              flex: 1,
              backgroundColor: colors.transparent,
              height: 50,
            },
            backBehavior: 'history',
          }}>
          <BottomBar.Screen
            name={textContent._routes.home}
            component={HomeStack}
            options={{
              tabBarIcon: ({color}) => (
                <Image
                  style={{width: 25, height: 25}}
                  source={imagepath.home_tab}
                />
              ),
            }}
          />
          <BottomBar.Screen
            name={textContent._routes.waxmap}
            component={MapStack}
            options={{
              tabBarIcon: ({color}) => (
                <Image
                  style={{width: 25, height: 25}}
                  source={imagepath.map_tab}
                />
              ),
            }}
          />
          <BottomBar.Screen
            name={textContent._routes.profile}
            component={ProfileStack}
            options={{
              tabBarIcon: ({color}) => (
                <Image
                  style={{width: 25, height: 25}}
                  source={imagepath.map_tab}
                />
              ),
            }}
          />
        </BottomBar.Navigator>
      </NavigationContainer>
    </>
  );
};

const UserScreens = {
  pages: Screens,
};

const AuthScreens = {
  pages: AuthStack,
};

const Stack = createStackNavigator();

const stackPage = (
  userReducer,
  updateUserDetails,
  persistStorage,
  updateUserData,
) => {
  const value = useColorScheme();
  const [phoneHeight, setPhoneHeight] = useState('100');

  useEffect(() => {
    if (persistStorage.getState().systemTheme) {
      updateUserDetails({
        prop: 'darkMode',
        value:
          persistStorage.getState().systemTheme == 'Auto'
            ? value == 'dark'
            : persistStorage.getState().systemTheme == 'Dark Mode'
            ? true
            : false,
      });
    }
  }, [persistStorage.getState().systemTheme]);

  useEffect(() => {
    StatusBar.setBackgroundColor(
      userReducer?.darkMode
        ? darkModeColors.primaryBackground
        : lightModeColors.primaryBackground,
    );
    StatusBar.setBarStyle(
      userReducer.darkMode ? 'light-content' : 'dark-content',
    );
  }, [userReducer?.darkMode]);

  const memoizedAuthStack = useMemo(() => AuthStack, []);
  const memoizedScreens = useMemo(() => Screens, []);
  const memoizedDarkModeProvider = userReducer => {
    return (
      <DarkModeProvider darkMode={userReducer?.darkMode}>
        <ToastProvider
          duration={5000}
          //   style={{marginBottom: 60}}
          textStyle={{
            fontSize: 14,
            fontFamily: fontFamily.MontserratMedium,
            color: userReducer?.darkMode
              ? lightModeColors.primaryTextColor
              : darkModeColors.primaryTextColor,
            textAlign: 'center',
          }}
          normalColor={
            userReducer?.darkMode
              ? lightModeColors.premiumGrayOne
              : darkModeColors.premiumGrayOne
          }>
          <NavigationContainer
            independent={true}
            ref={StackNavigation.stackNavigationRef}
            onReady={() => {
              routingInstrumentation.registerNavigationContainer(
                HomeNavigation.homeNavigationRef,
              );
              routingInstrumentation.registerNavigationContainer(
                AuthNavigation.authNavigationRef,
              );
              routingInstrumentation.registerNavigationContainer(
                ProfileNavigation.profileNavigationRef,
              );
            }}>
            <Stack.Navigator
              headerMode="screen"
              screenOptions={{headerShown: false}}>
              <Stack.Screen name="Authscreens" component={memoizedAuthStack} />
              <Stack.Screen name="Userscreens" component={memoizedScreens} />
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </DarkModeProvider>
    );
  };

  return (
    <>
      <DarkModeProvider darkMode={userReducer?.darkMode}>
        <ToastProvider
          duration={5000}
          //   style={{marginBottom: 60}}
          textStyle={{
            fontSize: 14,
            fontFamily: fontFamily.MontserratMedium,
            color: userReducer?.darkMode
              ? lightModeColors.primaryTextColor
              : darkModeColors.primaryTextColor,
            textAlign: 'center',
          }}
          normalColor={
            userReducer?.darkMode
              ? lightModeColors.premiumGrayOne
              : darkModeColors.premiumGrayOne
          }>
          <NavigationContainer
            independent={true}
            ref={StackNavigation.stackNavigationRef}
            onReady={() => {
              routingInstrumentation.registerNavigationContainer(
                HomeNavigation.homeNavigationRef,
              );
              routingInstrumentation.registerNavigationContainer(
                AuthNavigation.authNavigationRef,
              );
              routingInstrumentation.registerNavigationContainer(
                ProfileNavigation.profileNavigationRef,
              );
            }}>
            <Stack.Navigator
              headerMode="screen"
              screenOptions={{headerShown: false}}>
              <Stack.Screen name="Authscreens" component={memoizedAuthStack} />
              <Stack.Screen name="Userscreens" component={memoizedScreens} />
            </Stack.Navigator>
          </NavigationContainer>
          {/* {userReducer?.paymentBottomSheet?.visible ? ( */}
          <CardBottomSheet
            userReducer={userReducer}
            updateUserDetails={updateUserDetails}
          />
          {/* ) : null} */}
        </ToastProvider>
      </DarkModeProvider>
    </>
  );
};

const App = ({userReducer, updateUserDetails}) => {
  const [phoneHeight, setPhoneHeight] = useState('100%');
  const [initial, setIntial] = useState(true);
  const [isConnected, setIsconnected] = useState(true);

  useEffect(() => {
   // SplashScreenModule.hide();
    const firebaseConfig = {
      apiKey: 'AIzaSyAVOSb11Mci8WAqTKxrVxFI2rvSFWfCKOA',
      authDomain: 'waxplaceco.firebaseapp.com',
      databaseURL: 'https://waxplaceco-default-rtdb.firebaseio.com',
      projectId: 'waxplaceco',
      storageBucket: 'waxplaceco.appspot.com',
      messagingSenderId: '787173364961',
      appId: '1:787173364961:web:defea1c251f980dbf713a0',
      measurementId: 'G-7QXG7J72JS',
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    updateUserDetails({prop: 'firebasedb', value: db});
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsconnected(state.isConnected);
      updateUserDetails({
        prop: 'isConnectedToInternet',
        value: state.isConnected,
      });
    });

    // Get the initial URL when the app starts
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url, updateUserDetails);
      }
    });

    // Listen for deep link events
    Linking.addEventListener('url', event => {
      handleDeepLink(event.url, updateUserDetails);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openSettings = () => {
    NativeModules.OpenSettings.openNetworkSettings(data => {});
  };
  const onLayout = event => {
    const {x, y, height, width} = event.nativeEvent.layout;

    if (!userReducer?.isChatScreen) {
      setPhoneHeight(height);
    }
  };
  const insets = useSafeAreaInsets();
  if (Platform.OS == 'ios') {
    return (
      <GestureHandlerRootView>
        <KeyboardAvoidingView
          onLayout={onLayout}
          style={{height: userReducer?.isChatScreen ? '100%' : phoneHeight}}>
          <View
            edges={['top', 'left', 'right']}
            style={[
              {
                width,
                flex: 1,
                paddingBottom: insets.bottom,
              },
            ]}>
            {stackPage(
              userReducer,
              updateUserDetails,
              persistStorage,
              updateUserData,
            )}
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    );
  } else if (Platform.OS == 'android') {
    return (
      <>
        <GestureHandlerRootView style={{flex:1}}>
          <KeyboardAvoidingView
            onLayout={onLayout}
            style={{height: userReducer?.isChatScreen ? '100%' : phoneHeight}}>
            {stackPage(
              userReducer,
              updateUserDetails,
              persistStorage,
              updateUserData,
            )}
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </>
    );
  }
};

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});
export default connect(mapStateToProps, {updateUserDetails})(Sentry.wrap(App));
