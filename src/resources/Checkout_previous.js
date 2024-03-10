// import React, {useEffect, useRef, useState} from 'react';
// import * as CartNavigation from '../router/_CartNavigation';
// import fontFamily from '../utils/FontFamily';
// import {normalize} from '../components/NormalizeFonts';
// import imagepath from '../utils/Images';

// import {
//   View,
//   Dimensions,
//   NativeModules,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Button,
//   PermissionsAndroid,
//   TouchableOpacity,
//   TextInput,
//   Image,
//   StatusBar,
//   Alert,
//   Platform,
//   FlatList,
// } from 'react-native';
// const {width, height} = Dimensions.get('window');

// // Use iPhone6 as base size which is 375 x 667
// const baseWidth = width;
// const baseHeight = height;

// const scaleWidth = width / baseWidth;
// const scaleHeight = height / baseHeight;
// const scale = Math.min(scaleWidth, scaleHeight);
// import CheckBox from '@react-native-community/checkbox';
// import {Dialog} from 'react-native-simple-dialogs';
// import NetInfo from '@react-native-community/netinfo';
// import {Rating} from 'react-native-ratings';
// import Spinner from 'react-native-loading-spinner-overlay';

// import {openSettings} from 'react-native-permissions';
// import ProgressLoader from '../components/ProgressLoader';
// import {BottomBar} from '../components/BottomBar';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {SearchBar} from '../components/SearchBar';
// import {updateUserDetails} from '../redux/actions/UserAction';
// import {connect} from 'react-redux';
// import XMLParser from 'react-xml-parser';

// import {MainButton} from '../components/MainButton';
// import {purchaseAlbum} from '../actions/PurchaseFlowAPI';
// import {profileDetails} from '../actions/UserAPI';
// import {getImage} from '../actions/GenericAPI';
// import {
//   calculationRequestProcess,
//   checkRequestData,
//   ShipmentParameters,
//   shipmentRequestProcess,
// } from '../actions/_ZelerisAPI';

// const Checkout = ({props, route, userReducer, updateUserDetails}) => {
//   //Tokes
//   const [token, setToken] = useState({
//     token5: false,
//     token10: false,
//     token20: false,
//   });

//   const settingToken = data => {
//     setToken(prevState => ({...prevState, ...data}));
//   };

//   const [cust_id, setCustId] = useState('');

//   const [shareCodeDialog, setShareCodeDialog] = useState(false);
//   const [isWallet, setIsWallet] = useState(false);
//   const [thumbImage, setThumbImage] = useState('');
//   const [searchText, setSearchText] = useState('');
//   const [cartLength, setCartLength] = useState(0);
//   const [shareCodeCheck, setShareCodeCheck] = useState(false);
//   const [shareCode, setShareCode] = useState('');
//   const [spinner, setSpinner] = useState(false);
//   const [shopPickcheck, setShopPickcheck] = useState(false);
//   const [noInternet, setNoInternet] = useState(false);
//   const [checkoutPaymentPopUp, setCheckoutPaymentPopUp] = useState(false);
//   const [listingSuccess_NoTokens_PopUp, setListingSuccessNoTokensPopUp] =
//     useState(false);
//   const [saleProductId, setSaleProductId] = useState('');
//   const [profile, setProfile] = useState(null);
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [data, setData] = useState(null);
//   const [shippingCheck, setShippingCheck] = useState(false);
//   const [pickFromStoreCheck, setPickFromStoreCheck] = useState(false);
//   const [shippingValue, setShippingValue] = useState(12);
//   const [pickValue, setPickValue] = useState(23);
//   const [totalValue, setTotalValue] = useState(0);
//   const [extra, setExtra] = useState(0);
//   const [vendorData, setVendorData] = useState([]);
//   const [cardParams, setCardParams] = useState({});
//   const [isValid, setIsValid] = useState(false);
//   const [functionCall, setFunctionCall] = useState('');
//   const [prePuchaseValues, setPrePuchaseValues] = useState({
//     data: {},
//     check: false,
//   });

//   useEffect(() => {
//     mountFunction();
//   }, []);

//   useEffect(() => {
//     if (functionCall == '') {
//     }
//     if (functionCall == 'mount') {
//       setFunctionCall('');
//      
//       setThumbImage(data?.releaseDetails?.albumImage);
//       // setTotalValue(
//       //   pickFromStoreCheck
//       //     ? data.otherData.price + pickValue
//       //     : shippingCheck == true
//       //     ? data.otherData.price + shippingValue
//       //     : data.otherData.price,
//       // );
//       getProfile();
//     }
//     if (functionCall == 'purchaseSuccess') {
//       setFunctionCall('');
//       callZelerisAPis();
//     }
//     if (functionCall == 'createStripeUser') {
//       setFunctionCall('');
//     }
//     if (functionCall == 'stripePay') {
//       setFunctionCall('');
//       checkout(false);
//     }
//     if (functionCall == 'shareCodeDialog') {
//       setFunctionCall('');
//       if (isWallet == true) {
//         checkout(true);
//       } else {
//         checkout(false);
//       }
//     }
//     if (functionCall == 'shareCodeCance') {
//       setFunctionCall('');
//       if (isWallet == true) {
//         checkout(true);
//       } else {
//         checkout(false);
//       }
//     }
//     if (functionCall == 'shareCodeOk') {
//       setFunctionCall('');
//       if (isWallet == true) {
//         checkout(true);
//       } else {
//         checkout(false);
//       }
//     }
//     if (functionCall == 'buyFromWallet') {
//       setFunctionCall('');
//       if (isWallet == true) {
//         checkout(true);
//       } else {
//         checkout(false);
//       }
//     }
//     if (functionCall == 'buyNow') {
//       setFunctionCall('');
//       if (isWallet == true) {
//         checkout(true);
//       } else {
//         checkout(false);
//       }
//     }
//   }, [functionCall]);

//   const callZelerisAPis = async () => {
//     const unresolved = userReducer?.cartDetails?.data.map(async item => {});

//     const resolved = await Promise.all(unresolved);
//     updateUserDetails({prop: 'spinner', value: false});
//     CartNavigation.reset('OrderSuccess');
//   };

//   const createShipment = async jsonData => {
//     await shipmentRequestProcess(
//       ShipmentParameters.newShipmentRequest,
//       jsonData,
//       userReducer,
//     )
//       .then(result => {})
//       .catch(err => {});
//   };

//   const getProfile = () => {
//     profileDetails()
//       .then(response => {
//         setProfile(response.user);
//         setWalletBalance(response.user.balance);
//        
//       })
//       .catch(error => {
//        
//       });
//   };

//   const getPrice = number => {
//     let num = number;
//     let n = num.toFixed(2);
//     let replaceString = n.toString().replace('.', ',');

//     return replaceString;
//   };

//   // SHIPMENT COST CALCULATION
//   const getShipmentCost = async jsonData => {
//     let data = null;
//     await calculationRequestProcess(
//       ShipmentParameters.calculateShipmentCost,
//       jsonData,
//       userReducer,
//     )
//       .then(result => {
//         if (result.getElementsByTagName('PresupuestoServicio').length > 0) {
//           data = result.getElementsByTagName('PresupuestoServicio')[0].value;
//         } else data = -1;
//       })
//       .catch(err => {
//         data = -1;
//       });

//     return data;
//   };

//   const mountFunction = async () => {
//     let data = [];
//     let totalValue = 0;

//     // SHIPMENT CHARGE
//     const unresolved = userReducer?.cartDetails?.data.map(async item => {
//       let jsonData = {
//         CpOri: '08025', //sellers pincode
//         Pais: '',
//         Codpos: userReducer?.profileDetails?.zipcode, //buyers pincode
//         Bultos: '1',
//         Kilos: '1',
//         Volumen: '0',
//         Servicio: '2',
//         Reembolso: '0',
//         ValorSeguro: item?.otherData?.price.toString(),
//       };
//       let shipmentCharge = '';
//       await getShipmentCost(jsonData).then(result => {
//         shipmentCharge = result;
//       });
//       let subTotal =
//         parseFloat(item?.otherData.price) +
//         parseFloat(shipmentCharge == -1 ? 0 : shipmentCharge);
//       data.push({
//         ...item,
//         shipmentCharge,
//         total: subTotal,
//         shipmentCalculated: shipmentCharge == -1 ? false : true,
//       });
//       totalValue = totalValue + subTotal;
//     });

//     const resolved = await Promise.all(unresolved);

//     setData(data);
//     setShippingCheck(true);
//     setPickFromStoreCheck(userReducer?.cartDetails?.storeCheckoutCheck);
//     setShippingValue(100);
//     setPickValue(100);
//     setShareCode(userReducer?.cartDetails?.shareCode);
//     setTotalValue(totalValue);
//     setVendorData(userReducer?.cartDetails?.vendorData);
//     setShareCodeCheck(false);
//     setFunctionCall('mount');
//   };

//   const checkout = async isWallet => {
//     const returnValue = await stripePayment(
//       {
//         isVendor: false,
//         amount: totalValue * 100,
//         currency: 'eur',
//         email: profile?.email,
//       },
//       updateUserDetails,
//       'purchase_album',
//     );

//     if (returnValue.subscriptionId == false) {
//     } else {
//       const d = new Date();
//       let date = d.toISOString();
//       // let jsonData = {
//       //   amount: totalValue,
//       //   currency: 'Euro',
//       //   customerId: returnValue.customerId,
//       //   paymentIntentId: returnValue.paymentIntent,
//       //   productsWithPrice: JSON.stringify([
//       //     {saleProductId: '', price: ''},
//       //     {saleProductId: '', price: ''},
//       //     {saleProductId: '', price: ''},
//       //   ]),
//       //   saleProductId: data?.otherData?._id,
//       //   pickUpId: vendorData._id,
//       //   pickUpDate: date,
//       //   isWallet,
//       //   email: data?.user ? data?.user?.email : data?.otherData?.vendorId.email,
//       //   price: data?.otherData?.price,
//       //   isVendor: data?.user ? false : true,
//       //   userSellerId: data?.user ? data.user._id : null,
//       //   vendorSellerId: data?.otherData?.vendorId
//       //     ? data?.otherData?.vendorId._id
//       //     : null,
//       // };

//       let productsWithPrice = [];
//       data.map(data => {
//         productsWithPrice.push({
//           saleProductId: data?.otherData?._id,
//           price: data?.otherData?.price,
//           shipmentCharge: 10,
//           email: data?.user
//             ? data?.user?.email
//             : data?.otherData?.vendorId.email,
//           isVendor: data?.user ? false : true,
//           userSellerId: data?.user ? data.user._id : null,
//           vendorSellerId: data?.otherData?.vendorId
//             ? data?.otherData?.vendorId._id
//             : null,
//         });
//       });

//       let jsonData = {
//         amount: totalValue,
//         currency: 'Euro',
//         customerId: returnValue.customerId,
//         paymentIntentId: returnValue.paymentIntent,
//         productsWithPrice: JSON.stringify(productsWithPrice),
//         pickUpId: vendorData._id,
//         pickUpDate: date,
//         isWallet,
//       };

//       if (shareCode) {
//         jsonData = {...jsonData, shareCode};
//       }

//       jsonData = {
//         ...jsonData,
//         orderStat: JSON.stringify({
//           time: date,
//           status: 'start',
//         }),
//       };
//       setPrePuchaseValues({data: jsonData, check: true});
//       updateUserDetails({prop: 'spinner', value: true});
//       purchaseAlbum(jsonData)
//         .then(response => {
//           if (response?.status == 'success') {
//             setCheckoutPaymentPopUp(false);
//             setShareCode('');
//             setPrePuchaseValues({data: {}, check: false});
//             // updateUserDetails({prop: 'spinner', value: false});
//             setFunctionCall('purchaseSuccess');
//           } else {
//             updateUserDetails({prop: 'spinner', value: false});
//             alert('Something went wrong');
//           }
//         })
//         .catch(error => {
//           updateUserDetails({prop: 'spinner', value: false});
//          
//         });
//     }
//   };

//   const renderCartItems = (item, index) => {
//     return (
//       <View
//         style={{
//           width: '95%',
//           alignSelf: 'center',
//           borderRadius: 12,
//           backgroundColor: colors.white,
//           elevation: 3,
//           shadowColor: colors.black,
//           shadowOffset: {
//             width: 0,
//             height: 1,
//           },
//           shadowOpacity: 0.22,
//           shadowRadius: 2.22,
//           marginBottom: 12,
//         }}>
//         <View
//           style={{
//             height: 110,
//             width: '100%',
//             paddingTop: 5,
//             borderBottomWidth: StyleSheet.hairlineWidth,
//             borderColor: colors.premiumGrayOne + '80',
//           }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               width: '100%',
//             }}>
//             <View
//               style={{
//                 flex: 1.3,
//                 height: '100%',
//                 justifyContent: 'center',
//                 alignContent: 'center',
//                 alignItems: 'center',
//                 paddingLeft: 10,
//               }}>
//               <Image
//                 style={{
//                   width: 90,
//                   height: 90,
//                   borderRadius: 10,
//                   alignSelf: 'center',
//                   backgroundColor: colors.bgGray,
//                 }}
//                 source={getImage(item.image)}></Image>
//             </View>
//             <View
//               style={{
//                 flex: 3,
//                 height: '100%',
//                 paddingLeft: 6,
//                 marginTop: -2,
//               }}>
//               <View
//                 style={{
//                   flex: 1,
//                   width: '100%',
//                 }}>
//                 <View
//                   style={{
//                     flex: 1.2,
//                     width: '100%',
//                     justifyContent: 'flex-end',
//                   }}>
//                   <Text
//                     numberOfLines={1}
//                     style={{
//                       color: colors.altBlack,

//                       fontSize: 17,
//                       fontFamily: fontFamily.MontserratRegular,
//                       fontWeight: '600',
//                       marginLeft: 8,
//                     }}>
//                     {item?.releaseDetails?.album}
//                   </Text>
//                 </View>
//                 <View style={{flex: 1, width: '100%'}}>
//                   <Text
//                     numberOfLines={1}
//                     ellipsizeMode={'tail'}
//                     style={{
//                       color: colors.altBlack,
//                       fontSize: 13,
//                       marginLeft: 8,
//                       fontFamily: fontFamily.MontserratRegular,
//                       marginTop: 2,
//                     }}>
//                     {item?.otherData?.label ? item?.otherData?.label + ',' : ''}
//                     {item?.otherData?.year ? item?.otherData?.year : '2020'}
//                   </Text>
//                 </View>
//               </View>

//               <View
//                 style={{
//                   flex: 0.8,
//                   width: '100%',
//                   justifyContent: 'flex-start',
//                   alignItems: 'center',
//                 }}>
//                 <View style={{flex: 1, width: '100%'}}>
//                   {item?.otherData?.mediaCondition ? (
//                     <View
//                       style={{
//                         flex: 1,
//                         width: '100%',
//                         justifyContent: 'flex-start',
//                       }}>
//                       <Text
//                         numberOfLines={1}
//                         ellipsizeMode={'tail'}
//                         style={{
//                           fontSize: 12,
//                           fontFamily: fontFamily.MontserratRegular,
//                           marginLeft: 8,
//                           color: colors.altBlack,
//                           fontWeight: '600',
//                           marginBottom: -3,
//                         }}>
//                         Media: {item?.otherData?.mediaCondition}
//                       </Text>
//                     </View>
//                   ) : null}
//                   {item?.otherData?.sleveCondition ? (
//                     <View
//                       style={{
//                         flex: 1,
//                         width: '100%',
//                         justifyContent: 'flex-start',
//                       }}>
//                       <Text
//                         numberOfLines={1}
//                         ellipsizeMode={'tail'}
//                         style={{
//                           fontSize: 12,
//                           fontFamily: fontFamily.MontserratRegular,
//                           marginLeft: 8,
//                           color: colors.altBlack,
//                           fontWeight: '600',
//                           marginTop: -3,
//                         }}>
//                         Sleve: {item?.otherData?.sleveCondition}
//                       </Text>
//                     </View>
//                   ) : null}
//                 </View>
//               </View>
//             </View>
//             <View
//               style={{
//                 flex: 1,
//                 height: '100%',
//                 justifyContent: 'flex-start',
//                 alignItems: 'flex-end',
//               }}>
//               <View
//                 style={{
//                   flex: 1,
//                   width: '100%',
//                   justifyContent: 'flex-start',
//                   alignItems: 'flex-end',
//                   marginRight: 15,
//                   marginTop: 15,
//                 }}>
//                 <TouchableOpacity
//                   style={{}}
//                   onPress={() => {
//                     let newsortedCartList = [];
//                     let saleProductId = item?.otherData?._id;

//                     data.map(value => {
//                       if (saleProductId != value.saleProductId) {
//                         newsortedCartList.push(value);
//                       }
//                     });

//                     if (newsortedCartList.length == 0) {
//                       CartNavigation.reset('Cartscreen');
//                     } else {
//                       setData(newsortedCartList);
//                       setExtra(extra + 1);
//                     }
//                   }}>
//                   <Image
//                     style={{
//                       width: 22,
//                       height: 22,
//                       tintColor: colors.grayShadeThree,
//                     }}
//                     source={imagepath.trash}></Image>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//           <View style={{height: 15}} />
//         </View>
//         <TouchableOpacity
//           style={{
//             width: '100%',

//             height: 120,
//           }}
//           onPress={() => {
//             if (
//               item?.otherData?.isVendor == true &&
//               item?.otherData &&
//               item?.otherData?.vendorId
//             ) {
//               CartNavigation.navigate('StoreDetails', {
//                 vendorData: item?.otherData?.vendorId,
//               });
//             } else if (
//               item?.otherData?.isVendor == false &&
//               item?.otherData &&
//               item?.otherData?.userId
//             ) {
//               CartNavigation.navigate('FriendProfile', {
//                 userData: item?.otherData?.userId,
//               });
//             }
//           }}>
//           <View style={{flex: 3, height: '100%', flexDirection: 'row'}}>
//             <View
//               style={{
//                 paddingLeft: 10,
//                 height: '100%',
//                 justifyContent: 'center',
//                 alignContent: 'center',
//                 alignItems: 'center',
//               }}>
//               <Image
//                 style={{
//                   width: 75,
//                   height: 75,
//                   borderRadius: 37.5,
//                   backgroundColor: colors.bgGray,
//                   alignSelf: 'center',
//                 }}
//                 source={
//                   item?.otherData?.isVendor == false &&
//                   item?.otherData &&
//                   item?.otherData?.userId &&
//                   item?.otherData?.userId?.profile_image
//                     ? item?.otherData?.userId?.profile_image !== ''
//                       ? getImage(item?.otherData?.userId?.profile_image)
//                       : ''
//                     : item?.otherData &&
//                       item?.otherData?.vendorId &&
//                       item?.otherData?.vendorId?.image &&
//                       item?.otherData?.vendorId?.image !== ''
//                     ? getImage(item?.otherData?.vendorId?.image)
//                     : ''
//                 }></Image>
//             </View>
//             <View
//               style={{
//                 flex: 1,
//                 height: '100%',
//               }}>
//               <View
//                 style={{
//                   flex: 3,
//                   width: '100%',
//                   justifyContent: 'flex-start',
//                   paddingLeft: 5,
//                 }}>
//                 <View
//                   style={{
//                     flex: 0.1,
//                     width: '100%',

//                     overflow: 'hidden',
//                   }}></View>
//                 <View
//                   style={{
//                     flex: 1,
//                     width: '100%',
//                     justifyContent: 'center',
//                     overflow: 'hidden',
//                   }}>
//                   <Text
//                     numberOfLines={1}
//                     style={{
//                       color: colors.black,
//                       fontSize: 15,
//                       marginLeft: 5,
//                       fontFamily: fontFamily.MontserratMedium,
//                     }}>
//                     {item?.otherData?.isVendor == false
//                       ? (item?.user && item?.user?.firstName
//                           ? item?.user?.firstName
//                           : '') +
//                         ' ' +
//                         (item?.user && item?.user?.lastName
//                           ? item?.user?.lastName
//                           : '')
//                       : item?.otherData?.vendorId &&
//                         item?.otherData?.vendorId?.businessName
//                       ? item?.otherData?.vendorId?.businessName
//                       : ''}
//                   </Text>
//                 </View>
//                 <View
//                   style={{
//                     flex: 1,
//                     width: '100%',

//                     overflow: 'hidden',
//                   }}></View>
//               </View>
//             </View>
//             <View
//               style={{
//                 flex: 1,
//                 height: '100%',
//                 paddingRight: 12,
//               }}>
//               {/* <View
//                 style={{
//                   flex: 1.5,
//                   width: '100%',
//                   justifyContent: 'center',
//                   paddingRight: 10,
//                 }}>
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     color: colors.grayShadeEleven,
//                     textAlign: 'right',
//                     fontSize: 11.5,
//                     letterSpacing: 1,
//                     marginTop: 2,
//                     fontFamily: fontFamily.MontserratRegular,
//                   }}>
//                   1 item
//                 </Text>
//               </View>
//               <View
//                 style={{
//                   flex: 1.5,
//                   width: '100%',
//                   justifyContent: 'center',
//                   paddingRight: 10,
//                   flexDirection: 'row',
//                 }}>
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     color: colors.grayShadeEleven,
//                     textAlign: 'right',
//                     fontSize: 11.5,
//                     letterSpacing: 1,
//                     marginTop: 2,
//                     fontFamily: fontFamily.MontserratRegular,
//                   }}>
//                   + Shipment{' '}
//                 </Text>
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     color: colors.grayShadeSeven,
//                     textAlign: 'right',
//                     fontSize: 13,
//                     letterSpacing: 1,

//                     fontFamily: fontFamily.MontserratRegular,
//                   }}>
//                   {item?.shipmentCharge}
//                 </Text>
//               </View> */}
//               <View
//                 style={{
//                   flex: 3,
//                   width: '100%',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                 }}>
//                 <View
//                   style={{
//                     flex: 0.8,
//                     width: '100%',
//                     justifyContent: 'flex-end',
//                     alignItems: 'flex-end',
//                     paddingTop: 3,
//                     flexDirection: 'row',
//                   }}>
//                   <View
//                     style={{
//                       height: '100%',
//                       justifyContent: 'flex-end',
//                       alignItems: 'flex-end',
//                       paddingRight: 2,
//                       marginRight: 5,
//                       marginTop: 4,
//                     }}>
//                     <Text
//                       style={{
//                         color: colors.black,
//                         textAlign: 'right',
//                         fontSize: 13,

//                         fontFamily: fontFamily.MontserratRegular,
//                       }}>
//                       1 item
//                     </Text>
//                   </View>
//                   <View
//                     style={{
//                       height: '100%',
//                       justifyContent: 'flex-end',
//                       alignItems: 'flex-end',
//                       marginTop: 4,
//                     }}>
//                     <Text
//                       style={{
//                         color: colors.grayShadeFour,
//                         textAlign: 'center',
//                         fontSize: 16,

//                         fontFamily: fontFamily.MontserratMedium,
//                       }}>
//                       {`\u20AC${getPrice(
//                         parseFloat(
//                           item?.releaseDetails?.price &&
//                             item?.releaseDetails?.price !== ''
//                             ? item?.releaseDetails?.price
//                             : item?.otherData?.price,
//                         ),
//                       )}`}
//                     </Text>
//                   </View>
//                 </View>
//                 <View
//                   style={{
//                     flex: 1.2,
//                     width: '100%',
//                     justifyContent: 'center',
//                     alignItems: 'flex-end',
//                     // marginTop: 5,
//                   }}>
//                   <Text
//                     numberOfLines={2}
//                     style={{
//                       color: colors.black,
//                       textAlign: 'right',
//                       fontSize: 14,

//                       fontFamily: fontFamily.MontserratRegular,
//                     }}>
//                     +{item.shipmentCharge}
//                   </Text>
//                   <Text
//                     numberOfLines={2}
//                     style={{
//                       color: colors.black,
//                       textAlign: 'right',
//                       fontSize: 12,

//                       fontFamily: fontFamily.MontserratRegular,
//                     }}>
//                     Shipping Cost
//                   </Text>
//                 </View>
//               </View>
//               <View
//                 style={{
//                   flex: 1,
//                   width: '100%',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   paddingBottom: 12,
//                   // paddingRight: 5,
//                 }}>
//                 <View
//                   style={{
//                     flex: 1,
//                     width: '100%',
//                     justifyContent: 'flex-end',
//                     alignItems: 'center',
//                     flexDirection: 'row',
//                   }}>
//                   <View
//                     style={{
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                     }}>
//                     <Text
//                       style={{
//                         color: colors.black,

//                         fontSize: 14,

//                         fontFamily: fontFamily.MontserratRegular,
//                       }}>
//                       Amount
//                     </Text>
//                   </View>
//                   <View
//                     style={{
//                       marginLeft: 5,

//                       justifyContent: 'center',
//                       alignItems: 'center',
//                     }}>
//                     <Text
//                       style={{
//                         color: colors.altBlack,
//                         fontSize: 18,
//                         letterSpacing: 1,
//                         fontFamily: fontFamily.MontserratBold,
//                       }}>
//                       {`\u20AC${getPrice(parseFloat(item.total))}`}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </View>
//     );
//   };
//   return (
//     <SafeAreaView style={styles.maincontainer}>
//       <Dialog
//         visible={shareCodeDialog}
//         onTouchOutside={() => {
//           setShareCode('');
//           setShareCodeDialog(false);
//           setFunctionCall('shareCodeDialog');
//         }}
//         contentStyle={{
//           backgroundColor: colors.white,
//           borderRadius: 15,
//           padding: 0,
//         }}
//         dialogStyle={{
//  backgroundColor: colors.cardColor,
//           borderRadius: 15,

//           backgroundColor: colors.white,
//           width: '100%',
//           alignSelf: 'center',
//         }}>
//         <View
//           style={{
//             width: '100%',

//             marginBottom: normalize(35),
//             paddingHorizontal: 20,
//             paddingTop: 10,
//             paddingBottom: 20,
//           }}>
//           <View style={{width: '100%'}}>
//             <Text
//               style={{
//                 color: colors.black,
//                 fontSize: normalize(18),
//                 alignSelf: 'center',
//                 fontFamily: fontFamily.MontserratMedium,
//               }}>
//               SHARE CODE
//             </Text>
//           </View>
//           <View style={{width: '95%'}}>
//             <Text
//               style={{
//                 color: colors.black,
//                 fontSize: normalize(16),
//                 marginTop: normalize(20),
//                 marginBottom: normalize(8),
//                 letterSpacing: 0.5,
//                 fontFamily: fontFamily.MontserratMedium,
//               }}>
//               Enter share code
//             </Text>
//           </View>
//           <View
//             style={{
//               width: '100%',

//               justifyContent: 'center',
//             }}>
//             <View
//               style={{
//                 borderRadius: 12,
//                 backgroundColor: colors.white,
//                 elevation: 4,
//                 shadowColor: colors.black,
//                 shadowOffset: {
//                   width: 0,
//                   height: 1,
//                 },
//                 shadowOpacity: 0.22,
//                 shadowRadius: 2.22,
//               }}>
//               <TextInput
//                 style={{
//                   width: '95%',
//                   height: normalize(47),
//                   color: colors.black,
//                   paddingLeft: normalize(10),
//                   fontSize: normalize(14),
//                   letterSpacing: 0.5,
//                   fontFamily: fontFamily.MontserratRegular,
//                   backgroundColor: colors.transparent,
//                 }}
//                 placeholder={''}
//                 onChangeText={text => {
//                   setShareCode(text);
//                 }}
//                 placeholderTextColor={colors.altBlack}></TextInput>
//             </View>
//           </View>
//           <View style={{flex: 1.5, width: '100%', flexDirection: 'row'}}>
//             <View
//               style={{
//                 flex: 1,
//                 height: '100%',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               }}>
//               <TouchableOpacity
//                 style={{
//                   minWidth: '90%',
//                   height: normalize(40),
//                   borderRadius: 20,
//                   borderWidth: 1,
//                   borderColor: colors.premiumGray,
//                   backgroundColor: colors.white,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   alignContent: 'center',
//                 }}
//                 onPress={() => {
//                   setShareCodeDialog(false);
//                   setShareCode('');
//                   setFunctionCall('shareCodeCancel');
//                 }}>
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     color: colors.black,
//                     fontSize: normalize(14),
//                     alignSelf: 'center',
//                     fontFamily: fontFamily.MontserratMedium,
//                   }}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <View
//               style={{
//                 flex: 1,
//                 height: '100%',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               }}>
//               <TouchableOpacity
//                 style={{
//                   minWidth: '90%',
//                   height: normalize(40),
//                   borderRadius: 20,
//                   backgroundColor: colors.baseGreen,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   alignContent: 'center',
//                 }}
//                 onPress={() => {
//                   setShareCodeDialog(false);
//                   setFunctionCall('ShareCodeOk');
//                 }}>
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     color: colors.black,
//                     fontSize: normalize(14),
//                     alignSelf: 'center',
//                     fontFamily: fontFamily.MontserratMedium,
//                   }}>
//                   Apply
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Dialog>

//       <Dialog
//         visible={checkoutPaymentPopUp}
//         onTouchOutside={() => setCheckoutPaymentPopUp(false)}
//         contentStyle={{
//           backgroundColor: colors.white,
//           borderRadius: 15,
//           padding: 0,
//         }}
//         dialogStyle={{
//  backgroundColor: colors.cardColor,
//           borderRadius: 15,
//           paddingBottom: normalize(20),
//           backgroundColor: colors.white,
//           width: '100%',
//           alignSelf: 'center',
//         }}>
//         <View style={{width: '100%', alignItems: 'center'}}>
//           <Text
//             style={{
//               color: colors.black,
//               fontSize: normalize(23),
//               alignSelf: 'center',
//               fontWeight: 'bold',
//               textAlign: 'justify',
//               fontFamily: fontFamily.MontserratRegular,
//             }}>
//             ACTIVATE
//           </Text>

//           <View
//             style={{
//               width: normalize(235),
//               height: normalize(52),
//               alignSelf: 'center',
//               marginTop: normalize(20),
//               marginBottom: normalize(10),
//               borderRadius: 15,
//               backgroundColor: colors.white,
//               elevation: 8,
//               shadowColor: colors.black,
//               shadowOffset: {
//                 width: 0,
//                 height: 5,
//               },
//               shadowOpacity: 0.2,
//               shadowRadius: 3.84,
//               justifyContent: 'center',
//             }}>
//             <Text
//               style={{
//                 color: colors.grayShadeFour,
//                 alignSelf: 'center',
//                 fontSize: normalize(13),
//                 fontFamily: fontFamily.MontserratRegular,
//               }}>
//               TOKENS
//             </Text>
//             <View
//               style={{
//                 alignSelf: 'center',
//                 flexDirection: 'row',
//               }}>
//               <Image
//                 style={{
//                   width: normalize(25),
//                   height: normalize(25),
//                   alignSelf: 'center',
//                 }}
//                 source={imagepath.premium}></Image>

//               <Text
//                 style={{
//                   color: colors.altBlack,
//                   fontSize: normalize(19),
//                   marginLeft: normalize(10),
//                   fontFamily: fontFamily.MontserratBold,
//                 }}>
//                 {walletBalance}
//               </Text>
//               <Text
//                 style={{
//                   color: colors.grayShadeFour,
//                   fontSize: normalize(17),
//                   marginLeft: normalize(5),
//                   marginTop: normalize(4),
//                   fontFamily: fontFamily.MontserratBold,
//                 }}>
//                 AVAILABLE
//               </Text>
//             </View>
//           </View>
//           {walletBalance > totalValue && (
//             <TouchableOpacity
//               style={{
//                 paddingVertical: normalize(5),
//                 paddingHorizontal: normalize(15),
//                 alignSelf: 'center',
//                 marginTop: normalize(40),
//                 width: '60%',
//                 height: normalize(40),
//                 borderRadius: 10,
//                 backgroundColor: colors.baseGreen,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 flexDirection: 'row',
//               }}
//               onPress={() => {
//                 if (shareCodeCheck == false) {
//                   setCheckoutPaymentPopUp(false);
//                   setShareCodeDialog(true);
//                   setIsWallet(true);
//                 } else {
//                   setCheckoutPaymentPopUp(false);
//                   setIsWallet(true);
//                   setFunctionCall('buyFromWallet');
//                 }
//               }}>
//               <View
//                 style={{
//                   alignSelf: 'center',
//                   flexDirection: 'row',
//                 }}>
//                 <Text
//                   style={{
//                     alignSelf: 'center',
//                     color: colors.black,
//                     fontSize: normalize(16),
//                     fontFamily: fontFamily.MontserratBold,
//                     letterSpacing: 1,
//                   }}>
//                   BUY FROM WALLET
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity
//             style={{
//               paddingVertical: normalize(5),
//               paddingHorizontal: normalize(15),
//               alignSelf: 'center',
//               marginTop: normalize(20),
//               marginBottom: normalize(10),
//               height: normalize(40),
//               width: '60%',
//               borderRadius: 10,
//               backgroundColor: colors.baseGreen,
//               justifyContent: 'center',
//               alignItems: 'center',
//               flexDirection: 'row',
//             }}
//             onPress={() => {
//               if (shareCodeCheck == true) {
//                 setCheckoutPaymentPopUp(false);
//                 setShareCodeDialog(true);
//                 setIsWallet(true);
//               } else {
//                 setCheckoutPaymentPopUp(false);
//                 setIsWallet(false);
//                 setFunctionCall('buyNow');
//               }
//             }}>
//             <View
//               style={{
//                 alignSelf: 'center',
//                 flexDirection: 'row',
//               }}>
//               <Text
//                 style={{
//                   alignSelf: 'center',
//                   color: colors.black,
//                   fontSize: normalize(16),
//                   fontFamily: fontFamily.MontserratBold,
//                   letterSpacing: 1,
//                 }}>
//                 BUY NOW
//               </Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={{alignSelf: 'center', marginTop: normalize(15)}}
//             onPress={() => setCheckoutPaymentPopUp(false)}>
//             <Text
//               style={{
//                 color: colors.black,
//                 alignSelf: 'center',
//                 fontSize: normalize(16),
//                 fontFamily: fontFamily.MontserratRegular,
//               }}>
//               SKIP
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </Dialog>

//      <SearchBar
//         cartValue={userReducer?.cartLength}
//         searchEnabled={false}
//         searchText={searchText !== '' ? '' : ''}
//         searchFunction={text => {}}
//         placeHolderCondition={searchText !== '' ? '' : 'Buy From WaxPlace'}
//       />
//       {data ? (
//         <View
//           style={{
//             width: '100%',
//             paddingTop: 8,
//             paddingBottom: 50,
//             height: '100%',
//           }}>
//           <View style={{width: '100%', alignItems: 'center'}}>
//             <Text
//               style={{
//                 color: colors.black,
//                 fontSize: 20,
//                 letterSpacing: 1,
//                 alignSelf: 'center',
//                 fontFamily: fontFamily.MontserratBold,
//                 marginTop: 5,
//                 marginBottom: 5,
//               }}>
//               Checkout
//             </Text>
//           </View>

//           <FlatList
//             showsVerticalScrollIndicator={false}
//             listKey={(item, index) => `_key${index.toString()}`}
//             data={data}
//             ListFooterComponent={
//               <View
//                 style={{
//                   marginTop: 15,

//                   // borderTopWidth: 0.6,
//                   //borderColor: colors.premiumGrayOne + '90',
//                   // backgroundColor: colors.bgGray + '50',
//                 }}>
//                 <View
//                   style={{
//                     flex: 1,
//                     width: '100%',
//                     paddingRight: 15,
//                     paddingTop: 5,
//                   }}>
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       justifyContent: 'flex-end',
//                       alignItems: 'center',
//                     }}>
//                     <Text
//                       style={{
//                         color: colors.black,
//                         fontSize: 16,
//                         fontFamily: fontFamily.MontserratRegular,
//                       }}>
//                       Total
//                     </Text>

//                     <Text
//                       style={{
//                         //marginTop: 2,
//                         color: colors.waxplaceColor,
//                         fontSize: 20,
//                         fontFamily: fontFamily.MontserratBold,
//                         // alignSelf: 'flex-end',
//                       }}>
//                       {` \u20AC${getPrice(parseFloat(totalValue))}`}
//                     </Text>
//                   </View>
//                 </View>
//                 {vendorData ? (
//                   <View
//                     style={{
//                       width: '100%',
//                       alignItems: 'flex-start',
//                       marginVertical: 15,
//                     }}>
//                     {vendorData ? (
//                       <Text
//                         style={{
//                           paddingLeft: 10,
//                           color: colors.altBlack,
//                           fontSize: normalize(16.5),

//                           letterSpacing: 1,

//                           fontFamily: fontFamily.MontserratRegular,
//                         }}>
//                         Pickup from
//                       </Text>
//                     ) : null}
//                   </View>
//                 ) : null}
//                 {vendorData ? (
//                   <View
//                     style={{
//                       width: '100%',
//                       alignItems: 'center',
//                       flexDirection: 'row',
//                       paddingRight: 10,
//                     }}>
//                     <View
//                       style={{
//                         flex: 7,
//                         flexDirection: 'row',
//                         width: '100%',
//                       }}>
//                       <View
//                         style={{
//                           flex: 1,
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                           //  paddingHorizontal:15,
//                         }}>
//                         {vendorData ? (
//                           <Image
//                             style={{
//                               width: normalize(80),
//                               height: normalize(80),
//                               borderRadius: 40,

//                               backgroundColor: colors.bgGray,
//                             }}
//                             source={getImage(vendorData.image)}></Image>
//                         ) : null}
//                       </View>
//                       <View
//                         style={{
//                           flex: 3,
//                           justifyContent: 'flex-start',
//                           paddingHorizontal: 2,
//                           height: normalize(80),
//                         }}>
//                         {vendorData ? (
//                           <Text
//                             style={{
//                               color: colors.grayShadeEight,
//                               marginTop: 3,
//                               fontSize: 18,
//                               fontFamily: fontFamily.MontserratMedium,
//                             }}>
//                             {vendorData.storeName ? vendorData.storeName : ''}
//                           </Text>
//                         ) : null}
//                         {vendorData ? (
//                           <Text
//                             style={{
//                               color: colors.grayShadeEleven,
//                               marginTop: 3,
//                               fontSize: 14,
//                               fontFamily: fontFamily.MontserratMedium,
//                             }}>
//                             {vendorData.address ? vendorData.address : ''}
//                           </Text>
//                         ) : null}
//                       </View>
//                     </View>
//                   </View>
//                 ) : null}

//                 <View
//                   style={{
//                     marginTop: vendorData ? 20 : 0,
//                     width: '100%',
//                     alignItems: 'center',
//                     paddingVertical: 10,
//                     paddingHorizontal: 5,
//                   }}>
//                   <View
//                     style={{
//                       width: '90%',
//                       alignSelf: 'center',
//                       borderTopWidth: 0.6,
//                       borderColor: colors.premiumGray,
//                       marginTop: normalize(17),
//                       marginBottom: normalize(3),
//                     }}></View>
//                 </View>

//                 <View
//                   style={{
//                     width: '100%',
//                     alignItems: 'center',
//                     paddingHorizontal: 10,
//                   }}>
//                   <Text
//                     style={{
//                       alignSelf: 'center',
//                       color: colors.blackShadeOne,
//                       fontSize: normalize(15),

//                       fontFamily: fontFamily.MontserratRegular,
//                     }}>
//                     {
//                       'You Will Receive A Notification When Your Records Is 24hrs From In Shop & You Can Schedule Your Precise Pick Up.'
//                     }
//                   </Text>
//                 </View>

//                 <View
//                   style={{
//                     width: '100%',
//                     alignItems: 'flex-end',
//                     marginVertical: 20,
//                     paddingHorizontal: 10,
//                   }}>
//                   <MainButton
//                     style={{
//                       //height: 30,
//                       borderRadius: 20,
//                       padding: 5,
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       alignContent: 'center',
//                       elevation: 2,
//                       shadowColor: colors.black,
//                       shadowOffset: {
//                         width: 0,
//                         height: 1,
//                       },
//                       shadowOpacity: 0.2,
//                       shadowRadius: 1.41,
//                     }}
//                     fontSize={14}
//                     onPress={() => {
//                       if (userReducer?.prePuchaseValues?.check == false) {
//                         checkout(false);
//                       } else {
//                         purchaseAlbum(userReducer?.prePuchaseValues?.data)
//                           .then(response => {
//                             if (response?.status == 'success') {
//                               setCheckoutPaymentPopUp(false);
//                               setShareCode('');
//                               setPrePuchaseValues({data: {}, check: false});
//                               // updateUserDetails({
//                               //   prop: 'spinner',
//                               //   value: false,
//                               // });
//                               setFunctionCall('purchaseSuccess');
//                             } else {
//                               updateUserDetails({
//                                 prop: 'spinner',
//                                 value: false,
//                               });
//                               alert('Something went wrong');
//                             }
//                           })
//                           .catch(error => {
//                             updateUserDetails({prop: 'spinner', value: false});
//                            
//                           });
//                       }
//                     }}
//                     title={'PLACE YOUR ORDER'}
//                   />
//                 </View>
//               </View>
//             }
//             extraData={extra}
//             style={{marginTop: 0}}
//             contentContainerStyle={{paddingBottom: 60, paddingTop: 15}}
//             renderItem={({item, index}) =>
//               renderCartItems(item, index)
//             }></FlatList>
//         </View>
//       ) : null}

//       <ProgressLoader
//         visible={userReducer.spinner}
//         isHUD={true}
//         isModal={true}
//         color={colors.spinner}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   maincontainer: {
//     flex: 1,
//     backgroundColor: colors.bgColor,
//   },
//   checkbox: {
//     alignSelf: 'center',
//     width: 15,
//     height: 15,
//   },
// });

// const mapStateToProps = state => ({
//   userReducer: state.userReducer,
// });

// export default connect(mapStateToProps, {updateUserDetails})(Checkout);
