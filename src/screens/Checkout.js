import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
  AppState,
} from 'react-native';
import * as CartNavigation from '../router/_CartNavigation';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import fontFamily from '../utils/FontFamily';
import {normalize} from '../components/NormalizeFonts';
import imagepath from '../utils/Images';
import {CheckBox} from 'react-native-elements';


import ProgressLoader from '../components/ProgressLoader';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import {updateUserDetails} from '../redux/actions/UserAction';
import {connect} from 'react-redux';

import {MainButton} from '../components/MainButton';
import {
  getTaxPercent,
  makeAlbumLock,
  makeAlbumsUnLock,
  purchaseAlbum,
} from '../actions/PurchaseFlowAPI';
import {decodeCvv, profileDetails} from '../actions/UserAPI';
import {getImage} from '../actions/GenericAPI';
import {calculateShipmentCost} from '../actions/ShipmentAPI';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {
  getProvinceFromPostalCode,
  getShippingZone,
} from '../actions/_correosCalculations';
import {getZoneBasedPrice} from '../actions/_CorreosAPI';
import {result, update} from 'lodash';
import {
  checkPayInStatus,
  directPayment,
  handleSecureModeRedirectUrl,
  registerCard,
} from '../actions/_MangoPay';
import {useIsFocused} from '@react-navigation/native';
import {CardBottomSheet} from '../components/CardBottomSheet';
import {useSocket} from '../actions/Socket';
import FastImage from 'react-native-fast-image';

const Checkout = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const socket = useSocket();
  const appStateRef = useRef(AppState.currentState);
  //Tokens
  const [shareCodeDialog, setShareCodeDialog] = useState(false);
  const [initial, setInitial] = useState(true);
  const [isWallet, setIsWallet] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [shareCodeCheck, setShareCodeCheck] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [checkoutPaymentPopUp, setCheckoutPaymentPopUp] = useState(false);
  const [profile, setProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [data, setData] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [shipmentTotal, setShipmentTotal] = useState(0);
  const [taxPercent, setTaxPercent] = useState({buyerTax: -1, sellerTax: -1});
  const [extra, setExtra] = useState(0);
  const [vendorData, setVendorData] = useState(null);
  const [unLock, setUnLock] = useState(false);
  const [startTimer, setStartTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(240);
  const [isNewCard, setIsNewCard] = useState(true);
  const [cardData, setCardData] = useState(null);
  const [showPurchaseCard, setShowPurchaseCard] = useState(false);
  const setIntervalRef = useRef(null);
  const isFocused = useIsFocused();
  const backgroundTimestampRef = useRef(null);

  const reload = () => {
    let albumIds = [];
    data.map(value => {
      if (value.isAvailable && value.enable) {
        albumIds.push(value._id);
      }
    });
    let jsonData = {albumIds: JSON.stringify(albumIds)};

    makeAlbumsUnLock(jsonData)
      .then(result => {
        updateUserDetails({prop: 'spinner', value: true});
        mountFunction();
      })
      .catch(err => {});
  };

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      updateUserDetails({prop: 'spinner', value: false});
      updateUserDetails({prop: 'DeliveryDetails', value: null});
    };
  }, []);

  // useEffect(() => {
  //   if (userReducer?.reloadCheckout && userReducer?.transactionCompleted) {
  //     reload();
  //   }
  //   if (userReducer?.reloadCheckout) {
  //     updateUserDetails({prop: 'reloadCheckout', value: false});
  //   }
  // }, [userReducer?.reloadCheckout]);

  useEffect(() => {
    BottomNavigation.navigationRef?.setParams({hide: true});

    mountFunction();
    return () => {
      BottomNavigation.navigationRef?.setParams({hide: false});
      updateUserDetails({
        prop: 'paymentBottomSheet',
        value: {amount: null, visible: false, type: null},
      });

      clearInterval(setIntervalRef.current);
    };
  }, []);

  // const handleAppStateChange = nextAppState => {
  //   if (
  //     appStateRef.current.match(/inactive|background/) &&
  //     nextAppState === 'active'
  //   ) {
  //     setStartTimer(false);
  //     setInitial(true);
  //     reload();
  //   } else {
  //     clearInterval(setIntervalRef.current);
  //   }

  //   appStateRef.current = nextAppState;
  // };

  const handleAppStateChange = nextAppState => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // The app is back to the foreground
      if (startTimer && backgroundTimestampRef.current) {
        const currentTime = Date.now();
        const backgroundTime = currentTime - backgroundTimestampRef.current;
        const remainingTime = timeLeft - Math.floor(backgroundTime / 1000);

        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
        } else {
          setTimeLeft(0);
          setUnLock(true);
        }
      }
    } else {
      // The app is going to the background
      if (startTimer) {
        backgroundTimestampRef.current = Date.now();
      }
    }

    appStateRef.current = nextAppState;
  };

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  useEffect(() => {
    if (unLock) {
      updateUserDetails({prop: 'spinner', value: true});
      let albumIds = [];
      data.map(value => {
        if (value.isAvailable && value.enable) {
          albumIds.push(value._id);
        }
      });
      let jsonData = {albumIds: JSON.stringify(albumIds)};

      makeAlbumsUnLock(jsonData)
        .then(result => {})
        .catch(err => {});
      toast.show(textContent.Checkout.timeout);
      updateUserDetails({prop: 'spinner', value: false});
      CartNavigation.reset('Cartscreen');
      setTimeLeft(0);
      clearInterval(setIntervalRef.current);
      setUnLock(false);
    }
  }, [unLock]);

  // useEffect(() => {
  //   if (startTimer) {
  //     setStartTimer(false);
  //     setTimeLeft(240);
  //     let focusTime = parseInt(240) * 1000;
  //     setIntervalRef.current = setInterval(function () {
  //       focusTime -= 1000;
  //       if (focusTime >= 0) {
  //         setTimeLeft(focusTime / 1000);
  //       } else {
  //         setUnLock(true);
  //       }
  //     }, 1000);
  //   }
  // }, [startTimer]);

  useEffect(() => {
    if (startTimer) {
      setTimeLeft(240);
      setUnLock(false);

      const updateTimer = () => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      };

      setIntervalRef.current = setInterval(updateTimer, 1000);
    } else {
      clearInterval(setIntervalRef.current);
    }

    return () => {
      clearInterval(setIntervalRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(setIntervalRef.current);
      setUnLock(true);
    }
  }, [timeLeft]);

  const getBuyerTaxPercent = async () => {
    try {
      const result = await getTaxPercent();
      setTaxPercent({
        buyerTax: result?.buyerTax,
        sellerTax: result?.sellertax,
      });
      return result?.buyerTax;
    } catch (error) {
      throw new Error(textContent.general.general_error);
    }
  };

  const handleError = () => {
    toast.show(textContent.general.general_error);
    updateUserDetails({prop: 'spinner', value: true});
    let albumIds = [];
    data.map(value => {
      if (value.isAvailable && value.enable) {
        albumIds.push(value._id);
      }
    });
    if (albumIds.length > 0) {
      let jsonData = {albumIds: JSON.stringify(albumIds)};

      makeAlbumsUnLock(jsonData)
        .then(result => {
          clearInterval(setIntervalRef.current);
        })
        .catch(err => {});
    }
    updateUserDetails({prop: 'spinner', value: false});
    CartNavigation.reset('Cartscreen');
  };

  const mountFunction = async () => {
    try {
      //  clearInterval(setIntervalRef.current);
      setTimeLeft(240);

      let postalCodeForProvince = userReducer?.cartDetails?.vendorData
        ? userReducer?.cartDetails?.vendorData?.zipcode
        : userReducer?.DeliveryDetails?.postalCode;

      const destinationProvince = await getProvinceFromPostalCode(
        postalCodeForProvince,
      );
      if (destinationProvince === 'error') {
        handleError();
        return;
      }

      const data = [];
      let totalValue = 0;
      let shipmentTotalValue = 0;
      const buyerTax = await getBuyerTaxPercent();

      await Promise.all(
        userReducer?.cartDetails?.data.map(async item => {
          const postalCode =
            item.addedBy === 'vendor'
              ? item.sellerId?.zipcode
              : item.postalCode;
          const zoneInfo = await getShippingZone(
            postalCode,
            destinationProvince,
          );

          let shipmentCharge = 0;
          const response = await getZoneBasedPrice(zoneInfo);

          if (response.status === 'success') {
            shipmentCharge = response.result.price;
          } else {
            handleError();
            return;
          }

          const taxAmt =
            (parseFloat(item.cost) + parseFloat(shipmentCharge || 0)) *
            (buyerTax / 100);
          const subTotal =
            parseFloat(item.cost) + parseFloat(shipmentCharge || 0) + taxAmt;

          const jsonData = {
            albumId: item._id,
            isLock: true,
            time: new Date().toISOString(),
          };

          let isAvailable = true;
          const result = await makeAlbumLock(jsonData);

          if (result.status === 'failed') {
            isAvailable = false;
          }

          data.push({
            ...item,
            shipmentCharge,
            tax: taxAmt,
            total: subTotal,
            shipmentCalculated: !!shipmentCharge,
            enable: isAvailable,
            isAvailable,
          });

          if (isAvailable) {
            shipmentTotalValue += parseFloat(shipmentCharge);
            totalValue += subTotal;
          }
        }),
      );

      setData(data);
      setShareCode(userReducer?.cartDetails?.shareCode);
      setTotalValue(totalValue);
      setShipmentTotal(shipmentTotalValue);
      setVendorData(userReducer?.cartDetails?.vendorData);
      setShareCodeCheck(false);
      setExtra(extra + 1);
      setInitial(false);
      updateUserDetails({prop: 'spinner', value: false});
    } catch (error) {
      updateUserDetails({prop: 'spinner', value: false});
      handleError();
    }
  };

  useEffect(() => {
    if (!initial) {
      placeOrder();
    }
  }, [initial]);

  const placeOrder = async () => {
    // clearInterval(setIntervalRef.current);

    if (totalValue === 0) {
      toast.show(textContent.Checkout.no_product);
      return;
    }

    if (taxPercent?.buyerTax === -1 || taxPercent.sellerTax === -1) {
      toast.show(textContent.Checkout.tax_failed);
      return;
    }

    const albumDetails = data
      .filter(data => data.isAvailable && data.enable)
      .map(data => {
        const seller = data.sellerId;
        return {
          orderStatus: 'Order Placed',
          orderStatusDate: new Date().toISOString(),
          albumId: data?._id,
          albumName: data?.albumName,
          barCode: data?.barCode,
          sellerId: seller._id,
          sellerInformation:
            data?.addedBy === 'vendor'
              ? {
                  name: seller?.businessName,
                  deliveryAddress: seller.address,
                  city: seller?.city,
                  country: seller?.country,
                  zipcode: seller.zipcode,
                  mobileNumber: seller.businessContact,
                }
              : {
                  name: seller?.firstName + ' ' + seller?.lastName,
                  mobileNumber: seller?.mobileNumber,
                },
          email: seller?.email,
          isVendor: data?.addedBy == 'vendor',
          albumCost: data?.cost,
          shipmentCharge: data.shipmentCharge,
          isReturn: false,
          isCancel: false,
          returnTime: null,
          isSend: false,
        };
      });

    if (albumDetails.length === 0) {
      toast.show(textContent.Checkout.no_product);
      return;
    }

    const jsonData = {
      customerId: userReducer.profileDetails.paymentDetails.mangopayCustomerId,
      albumDetails: JSON.stringify(albumDetails),
      buyerId: userReducer?.profileDetails?._id,
      buyerName: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
      buyerEmail: userReducer?.profileDetails?.email,
      buyerInformation: {
        vendorData: vendorData
          ? {
              userName: vendorData?.userName,
              businessName: vendorData?.businessName,
              deliveryAddress: vendorData?.address,
              city: vendorData?.city,
              country: vendorData?.country,
              zipcode: vendorData?.zipcode,
              latitude: vendorData?.latitude,
              longitude: vendorData?.longitude,
              contact: vendorData?.businessContact,
              email: vendorData?.email,
              _id: vendorData?._id,
            }
          : null,
        firstName: userReducer?.DeliveryDetails
          ? userReducer?.DeliveryDetails?.firstName
          : userReducer?.profileDetails?.firstName,
        lastName: userReducer?.DeliveryDetails
          ? userReducer?.DeliveryDetails?.lastName
          : userReducer?.profileDetails?.lastName,
        deliveryAddress: userReducer?.DeliveryDetails?.deliveryAddress,
        mobileNumber: userReducer?.profileDetails?.mobileNumber,
        city: userReducer?.DeliveryDetails?.city,
        country: userReducer?.DeliveryDetails?.country,
        postalCode: userReducer?.DeliveryDetails?.postalCode,
        isVendorPickup: !!vendorData,
        email: userReducer?.profileDetails?.email,
        _id: userReducer?.profileDetails?._id,
      },
      isStorePickup: !!vendorData,
      storePickupId: vendorData ? vendorData._id : null,
      buyerTax: taxPercent?.buyerTax,
      sellerTax: taxPercent?.sellerTax,
      currency: 'Euro',
      totalShippingCost: shipmentTotal,
      totalPayment: totalValue.toFixed(2),
      shareCode: shareCode,
      appliedShareCode: !!shareCode,
    };

    //clearInterval(setIntervalRef.current);

    try {
      const response = await purchaseAlbum(jsonData);
      if (response?.orderId) {
        updateUserDetails({prop: 'currentOrderId', value: response?.orderId});
        setOrderId(response?.orderId);
        setStartTimer(true);
      } else {
        // reload();
        toast.show(textContent.general.general_error);
      }
    } catch (error) {
      // reload();
      toast.show(textContent.general.general_error);
    }
  };

  const renderCartItems = (item, index) => {
    return (
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          borderRadius: 12,
          backgroundColor: colors.cardColor,
          elevation: 3,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          marginBottom: 12,
        }}>
        <View
          style={{
            width: '100%',
            paddingTop: 5,
            paddingBottom: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: colors.primaryTextColor + '50',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              paddingVertical: 5,
            }}>
            <View
              style={{
                flex: 1.3,
                paddingTop: 5,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                paddingLeft: 10,
              }}>
              <FastImage
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 10,
                  alignSelf: 'center',
                  backgroundColor: colors.bgGray,
                }}
                source={{
                  ...getImage(item.thumbnailImage ?? item.images[0]),
                  priority: FastImage.priority.normal,
                }}
              />
            </View>
            <View
              style={{
                flex: 3,
                paddingLeft: 6,
                marginTop: -2,
              }}>
              <View
                style={{
                  flex: 1,
                  width: '100%',
                }}>
                <View
                  style={{
                    flex: 1.2,
                    width: '100%',
                    justifyContent: 'flex-end',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,

                      fontSize: 17,
                      fontFamily: fontFamily.MontserratRegular,
                      fontWeight: '600',
                      marginLeft: 8,
                    }}>
                    {item?.albumName}
                  </Text>
                </View>
                <View style={{flex: 1, width: '100%'}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 13,
                      marginLeft: 8,
                      fontFamily: fontFamily.MontserratRegular,
                      marginTop: 2,
                    }}>
                    {item?.label ? item?.label + ',' : ''}
                    {item?.year ? item?.year : '2020'}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 0.8,
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1, width: '100%'}}>
                  {item?.mediaCondition ? (
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        justifyContent: 'flex-start',
                      }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                          fontSize: 12,
                          fontFamily: fontFamily.MontserratRegular,
                          marginLeft: 8,
                          color: colors.primaryTextColor,
                          fontWeight: '600',
                          marginBottom: -3,
                        }}>
                        {textContent.Checkout.media_condition}:{' '}
                        {item?.mediaCondition}
                      </Text>
                    </View>
                  ) : null}
                  {item?.sleveCondition ? (
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        justifyContent: 'flex-start',
                      }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                          fontSize: 12,
                          fontFamily: fontFamily.MontserratRegular,
                          marginLeft: 8,
                          color: colors.primaryTextColor,
                          fontWeight: '600',
                          marginTop: -3,
                        }}>
                        {textContent.Checkout.sleeve_condition}:{' '}
                        {item?.sleveCondition}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
              }}>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-end',
                }}>
                <CheckBox
                  onPress={() => {
                    let jsonData = {
                      albumId: item._id,
                      isLock: !item.enable,
                      time: new Date().toISOString(),
                    };
                    makeAlbumLock(jsonData)
                      .then(result => {
                        if (result?.status == 'failed') {
                        } else {
                          if (item.enable == false) {
                            setTotalValue(
                              parseFloat(totalValue) + parseFloat(item?.total),
                            );
                          }
                          if (item.enable == true) {
                            setTotalValue(
                              parseFloat(totalValue) - parseFloat(item?.total),
                            );
                          }

                          data.splice(index, 1, {
                            ...item,
                            enable: !item.enable,
                            isAvailable: true,
                          });

                          setExtra(extra + 1);
                        }
                      })
                      .catch(err => {});
                  }}
                  checked={item.enable}
                  checkedIcon={
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: colors.primaryButtonColor,
                      }}
                      source={imagepath.checked}
                    />
                  }
                  uncheckedIcon={
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: colors.primaryButtonColor,
                      }}
                      source={imagepath.unchecked}
                    />
                  }
                  containerStyle={{
                    margin: 0,
                    marginRight: 3,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    paddingHorizontal: 13,
                    paddingBottom: 5,
                  }}>
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      let jsonData = {
                        albumId: item._id,
                        isLock: false,
                        time: new Date().toISOString(),
                      };
                      makeAlbumLock(jsonData)
                        .then(result => {
                          let newsortedCartList = [];
                          let saleProductId = item?._id;
                          data.map(value => {
                            if (saleProductId != value._id) {
                              newsortedCartList.push(value);
                            } else {
                              setTotalValue(
                                parseFloat(totalValue) -
                                  parseFloat(item?.total),
                              );
                            }
                          });

                          if (newsortedCartList.length == 0) {
                            CartNavigation.reset('Cartscreen');
                          } else {
                            setData(newsortedCartList);
                            setExtra(extra + 1);
                          }
                        })
                        .catch(err => {});
                    }}>
                    <Image
                      style={{
                        width: 22,
                        height: 22,
                        tintColor: colors.primaryTextColor,
                      }}
                      source={imagepath.trash}></Image>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          {!item.isAvailable && (
            <View
              style={{
                marginTop: -2,
                marginBottom: 8,
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'flex-end',
                paddingRight: 15,
              }}>
              <Text
                style={{
                  color: colors.red + 'aa',
                  fontFamily: fontFamily.MontserratMedium,
                  fontSize: 13,
                }}>
                {textContent.Checkout.unavailable}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={{
            width: '100%',

            height: 130,
          }}
          disabled={true}
          onPress={() => {
            if (item?.addedBy == 'vendor') {
              CartNavigation.navigate('StoreDetails', {
                vendorData: item?.sellerId,
              });
            } else {
              CartNavigation.navigate('FriendProfile', {
                userData: item?.sellerId,
              });
            }
          }}>
          <View style={{flex: 3, height: '100%', flexDirection: 'row'}}>
            <View
              style={{
                paddingLeft: 10,
                height: '100%',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <FastImage
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: 37.5,
                  backgroundColor: colors.bgGray,
                  alignSelf: 'center',
                }}
                source={{
                  ...getImage(
                    item?.sellerId?.profile_image
                      ? item?.sellerId?.profile_image
                      : item?.sellerId?.image,
                  ),
                  priority: FastImage.priority.normal,
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
              }}>
              <View
                style={{
                  flex: 3,
                  width: '100%',
                  justifyContent: 'center',
                  paddingLeft: 5,
                }}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    paddingBottom: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 15,
                      marginLeft: 5,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {item?.addedBy != 'vendor'
                      ? (item?.sellerId && item?.sellerId?.firstName
                          ? item?.sellerId?.firstName
                          : '') +
                        ' ' +
                        (item?.sellerId && item?.sellerId?.lastName
                          ? item?.sellerId?.lastName
                          : '')
                      : item?.sellerId.storeName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 3,
                      color: colors.primaryTextColor,
                      fontSize: 13,
                      marginLeft: 5,
                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    {item?.addedBy == 'vendor'
                      ? 'Shop Seller'
                      : 'Waxplace User'}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
                paddingRight: 12,
              }}>
              <View
                style={{
                  flex: 3,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flex: 1.8,
                    width: '100%',
                    justifyContent: 'flex-end',
                    alignItems: 'center',

                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      height: '100%',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                      paddingRight: 2,
                      marginRight: 5,
                      marginTop: 4,
                    }}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        textAlign: 'right',
                        fontSize: 13,

                        fontFamily: fontFamily.MontserratRegular,
                      }}>
                      {textContent.Checkout.one_item}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: '100%',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                      marginTop: 4,
                    }}>
                    <Text
                      style={{
                        color: colors.grayShadeThree,
                        textAlign: 'center',
                        fontSize: 16,

                        fontFamily: fontFamily.MontserratMedium,
                      }}>
                      {`\u20AC${getPrice(parseFloat(item?.cost))}`}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 2,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: colors.primaryTextColor,
                      textAlign: 'right',
                      fontSize: 14,

                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    +{item.shipmentCharge}(
                    {textContent.Checkout.shipment_short_form})
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1.5,
                    width: '100%',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: colors.primaryTextColor,
                      textAlign: 'right',
                      fontSize: 14,

                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    +{parseFloat(item.tax).toFixed(2)}(
                    {textContent.Checkout.tax})
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 12,
                }}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,

                        fontSize: 14,

                        fontFamily: fontFamily.MontserratRegular,
                      }}>
                      {textContent.Checkout.amount}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginLeft: 5,

                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 18,
                        letterSpacing: 1,
                        fontFamily: fontFamily.MontserratBold,
                      }}>
                      {`\u20AC${getPrice(parseFloat(item.total))}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `0${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        showCart={false}
        onBackPress={() => {
          let albumIds = [];
          data?.map(value => {
            if (value?.isAvailable && value?.enable) {
              albumIds.push(value?._id);
            }
          });
          let jsonData = {albumIds: JSON.stringify(albumIds)};

          makeAlbumsUnLock(jsonData)
            .then(result => {})
            .catch(err => {});

          CartNavigation.pop();
        }}
        cartValue={userReducer?.cartLength}
        searchEnabled={false}
        searchText={searchText !== '' ? '' : ''}
        searchFunction={text => {}}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.Checkout.search_text
        }
      />
      {true ? (
        <View
          style={{
            width: '100%',
            paddingTop: 8,
            paddingBottom: 50,
            height: '100%',
          }}>
          <View style={{width: '100%', alignItems: 'center'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 20,
                letterSpacing: 1,
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratBold,
                marginTop: 5,
                marginBottom: 2,
              }}>
              {textContent.Checkout.checkout}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                width: 100,
                marginBottom: 3,
              }}>
              {/* <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color:
                      timeLeft == 0
                        ? colors.red
                        : timeLeft < 100
                        ? colors.baseYellow
                        : colors.primaryButtonColor,
                    fontSize: 18,
                    letterSpacing: 1,
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratBold,
                  }}>
                  {formattedTime}
                </Text>
              </View> */}
              {/* <View>
                <Text
                  style={{
                    color:
                      timeLeft == 0
                        ? colors.red
                        : timeLeft < 13
                        ? colors.baseYellow
                        : colors.primaryButtonColor,
                    fontSize: 18,
                    letterSpacing: 1,
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratBold,
                    marginTop: -1,
                  }}>
                  {':'}
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-start'}}>
                <Text
                  style={{
                    color:
                      timeLeft == 0
                        ? colors.red
                        : timeLeft < 13
                        ? colors.baseYellow
                        : colors.primaryButtonColor,
                    fontSize: 18,
                    letterSpacing: 1,
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratBold,
                    marginLeft: -12,
                  }}>
                  {parseFloat(timeLeft /60%10).toFixed(2)}
                </Text>
              </View> */}
            </View>
          </View>

          <FlatList
            ListEmptyComponent={
              <>
                {initial && (
                  <ActivityIndicator
                    size={'small'}
                    style={{marginTop: '1%'}}
                    color={colors.spinner}
                  />
                )}
              </>
            }
            showsVerticalScrollIndicator={false}
            listKey={(item, index) => `_key${index.toString()}`}
            data={data}
            ListFooterComponent={
              <>
                {!initial && (
                  <View
                    style={{
                      marginTop: 5,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        paddingRight: 15,
                        paddingTop: 5,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: colors.primaryTextColor,
                            fontSize: 16,
                            fontFamily: fontFamily.MontserratRegular,
                          }}>
                          {textContent.Checkout.total}
                        </Text>

                        <Text
                          style={{
                            color: colors.waxplaceColor,
                            fontSize: 20,
                            fontFamily: fontFamily.MontserratBold,
                          }}>
                          {` \u20AC${getPrice(parseFloat(totalValue))}`}
                        </Text>
                      </View>
                    </View>
                    {vendorData ? (
                      <View
                        style={{
                          width: '100%',
                          alignItems: 'flex-start',
                          marginVertical: 15,
                        }}>
                        {vendorData ? (
                          <Text
                            style={{
                              paddingLeft: 10,
                              color: colors.primaryTextColor,
                              fontSize: normalize(16.5),

                              letterSpacing: 1,

                              fontFamily: fontFamily.MontserratRegular,
                            }}>
                            {textContent.Checkout.pick_from}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}

                    {vendorData ? (
                      <View
                        style={{
                          width: '100%',
                          alignItems: 'center',
                          flexDirection: 'row',
                          paddingRight: 10,
                        }}>
                        <View
                          style={{
                            flex: 7,
                            flexDirection: 'row',
                            width: '100%',
                          }}>
                          <View
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            {vendorData ? (
                              <Image
                                style={{
                                  width: normalize(80),
                                  height: normalize(80),
                                  borderRadius: 40,

                                  backgroundColor: colors.bgGray,
                                }}
                                source={getImage(vendorData.image)}></Image>
                            ) : null}
                          </View>
                          <View
                            style={{
                              flex: 3,
                              justifyContent: 'flex-start',
                              paddingHorizontal: 2,
                              height: normalize(80),
                            }}>
                            {vendorData ? (
                              <Text
                                style={{
                                  color: colors.grayShadeTwo,
                                  marginTop: 3,
                                  fontSize: 18,
                                  fontFamily: fontFamily.MontserratMedium,
                                }}>
                                {vendorData.storeName
                                  ? vendorData.storeName
                                  : ''}
                              </Text>
                            ) : null}
                            {vendorData ? (
                              <Text
                                style={{
                                  color: colors.grayShadeOne,
                                  marginTop: 3,
                                  fontSize: 14,
                                  fontFamily: fontFamily.MontserratMedium,
                                }}>
                                {vendorData.address ? vendorData.address : ''}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    ) : null}

                    <View
                      style={{
                        marginTop: vendorData ? 20 : 0,
                        width: '100%',
                        alignItems: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 5,
                      }}>
                      <View
                        style={{
                          width: '90%',
                          alignSelf: 'center',
                          borderTopWidth: 0.6,
                          borderColor: colors.premiumGray,
                          marginTop: normalize(17),
                          marginBottom: normalize(3),
                        }}></View>
                    </View>

                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        paddingHorizontal: 10,
                      }}>
                      {vendorData && (
                        <Text
                          style={{
                            alignSelf: 'center',
                            color: colors.red + 'aa',
                            fontSize: normalize(16),
                            marginBottom: 5,
                            fontFamily: fontFamily.MontserratBold,
                          }}>
                          {textContent.Checkout.return_policy}
                        </Text>
                      )}
                      <Text
                        style={{
                          alignSelf: 'center',
                          color: colors.grayShadeOne,
                          fontSize: normalize(15),
                          fontFamily: fontFamily.MontserratRegular,
                        }}>
                        {textContent.Checkout.pickup_message}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: '100%',
                        alignItems: 'flex-end',
                        marginVertical: 20,
                        paddingHorizontal: 10,
                      }}>
                      <MainButton
                        disabled={orderId == ''}
                        backgroundColor={
                          orderId == ''
                            ? colors.gray
                            : colors.primaryButtonColor
                        }
                        style={{
                          borderRadius: 20,
                          padding: 5,
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          shadowColor: colors.shadowColor,
                          shadowOffset: {
                            width: 0,
                            height: 4,
                          },
                          shadowOpacity: 0.3,
                          shadowRadius: 4.65,
                          elevation: 8,
                        }}
                        fontSize={14}
                        onPress={() => {
                          updateUserDetails({
                            prop: 'paymentBottomSheet',
                            value: {
                              visible: true,
                              type: 'purchaseAlbum',
                              amount: totalValue.toFixed(2),
                              orderId: orderId,
                            },
                          });
                        }}
                        title={textContent.Checkout.button_text}
                      />
                    </View>
                  </View>
                )}
              </>
            }
            extraData={extra}
            style={{marginTop: 0}}
            contentContainerStyle={{paddingBottom: 60, paddingTop: 15}}
            renderItem={({item, index}) =>
              renderCartItems(item, index)
            }></FlatList>
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
  checkbox: {
    alignSelf: 'center',
    width: 15,
    height: 15,
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Checkout);
