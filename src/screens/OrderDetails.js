import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import * as CartNavigation from '../router/_CartNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import _ from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import {updateUserDetails} from '../redux/actions/UserAction';
import {connect} from 'react-redux';
import {getUserCart, userFieldCheck} from '../actions/UserAPI';
import {getImage} from '../actions/GenericAPI';

import {checkRequestData, ShipmentParameters} from '../actions/_ZelerisAPI';

import moment from 'moment';

import {DarkModeContext} from '../components/DarkModeContext';
import {isCustomsCorreosShipment, isMatch} from '../actions/HelperFunctions';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {
  getCorreosCustomsDocument,
  getCorreosLabel,
} from '../actions/_CorreosAPI';
import RNFetchBlob from 'rn-fetch-blob';
import FastImage from 'react-native-fast-image';

const OrderDetails = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [cartList, setCartList] = useState([]);
  const [noInternet, setNoInternet] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [releaseData, setReleaseData] = useState({});
  const [releaseResponse, setReleaseResponse] = useState({});
  const [searchText, setSearchText] = useState('');
  const [cartLength, setCartLength] = useState(0);
  const [functionCall, setFunctionCall] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [extra, setExtra] = useState(0);
  const [shareCodeCheck, setShareCodeCheck] = useState(false);
  const [storeCheckoutCheck, setStoreCheckoutCheck] = useState(false);
  const [username, setUserName] = useState(
    userReducer?.profileDetails?.userName,
  );
  const [showerror, setShowError] = useState(false);
  const [error, setError] = useState(true);
  const [errortext, setErrorText] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [shareCodeDialog, setShareCodeDialog] = useState(false);
  const [initial, setInital] = useState(false);
  const [labelDialog, setLabelDialog] = useState(false);
  const [labelItem, setLabelItem] = useState({item: null, index: null});

  useEffect(() => {
    if (shareCodeCheck == true) {
      setShareCodeDialog(true);
    }
  }, [shareCodeCheck]);

  const printLabel = async (item, index) => {
    let jsonData = {
      'soapenv:Envelope': {
        _attributes: {
          'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:prer':
            'http://www.correos.es/iris6/services/preregistroetiquetas',
        },
        'soapenv:Header': {},
        'soapenv:Body': {
          'prer:SolicitudEtiqueta': {
            'prer:FechaOperacion': moment().format('DD-MM-YYYY HH:mm:ss'),
            'prer:CodEtiquetador': '8DTG',
            'prer:NumContrato': '54055316',
            'prer:NumCliente': '81357204',
            'prer:CodEnvio': item.shipmentDetails.codEnvio,
            'prer:Care': {},
            'prer:ModDevEtiqueta': '2',
          },
        },
      },
    };
    getCorreosLabel(jsonData)
      .then(result => {
        const filePath =
          RNFetchBlob.fs.dirs.DownloadDir +
          `/${item.albumName}_${item.shipmentDetails.codEnvio}.pdf`;

        RNFetchBlob.fs
          .writeFile(filePath, result.pdf, 'base64')
          .then(() => {
            toast.show('Correos Label has been download:\n' + filePath);
            setLabelDialog(false);
            // Share.open({
            //   url: `file://${filePath}`,
            //   type: 'application/pdf',
            // });
          })
          .catch(err => {});
      })
      .catch(err => {});
  };

  const printCustomsDocument = async (item, index) => {
    let jsonData = {
      'soapenv:Envelope': {
        _attributes: {
          'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:prer':
            'http://www.correos.es/iris6/services/preregistroetiquetas',
        },
        'soapenv:Header': {},
        'soapenv:Body': {
          'prer:SolicitudDocumentacionAduanera': {
            'prer:TipoESAD': 'DDP',
            'prer:NumContrato': '54055316',
            'prer:NumCliente': '81357204',
            'prer:CodEtiquetador': '8DTG',
            'prer:Provincia': userReducer?.currentOrderDetails?.albumDetails[
              index
            ]?.sellerInformation?.zipcode
              ?.toString()
              ?.substring(0, 2),
            'prer:PaisDestino': 'ES',
            'prer:NombreDestinatario':
              userReducer?.currentOrderDetails?.albumDetails[index]
                ?.sellerInformation?.name,
            'prer:NumeroEnvios': '1',
          },
        },
      },
    };

    getCorreosCustomsDocument(jsonData)
      .then(result => {
        const filePath =
          RNFetchBlob.fs.dirs.DownloadDir +
          `/${item.albumName}_${'Customs_Document'}_${
            item.shipmentDetails.codEnvio
          }.pdf`;

        RNFetchBlob.fs
          .writeFile(filePath, result.pdf, 'base64')
          .then(() => {
            toast.show('Correos Label has been download:\n' + filePath);
            setLabelDialog(false);
            // Share.open({
            //   url: `file://${filePath}`,
            //   type: 'application/pdf',
            // });
          })
          .catch(err => {});
      })
      .catch(err => {});
  };

  const checkUserName = username => {
    let jsonData = {userName: username};

    userFieldCheck(jsonData)
      .then(response => {
        if (response.status === 'success') {
          setShareCode(username);

          setError(true);
          setErrorText(textContent.OrderDetails.invalid_share_code);
        } else {
          setShareCode(username);
          setError(false);
        }
      })
      .catch(error => {
        setShareCode(username);
        setError(true);
        setErrorText(textContent.OrderDetails.invalid_share_code);
      });
  };

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardStatus(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardStatus(false);
      },
    );

    mountFunction();

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const mountFunction = () => {
    getUserCart()
      .then(response => {
        updateUserDetails({
          prop: 'cartLength',
          value: response?.findOne?.cart?.length,
        });
      })
      .catch(err => {});

    setReleaseData(route?.params?.releaseData);
    setReleaseResponse(route?.params?.releaseResponse);
  };

  const renderOrderDetailsComponent = (item, index) => {
    let date = moment(item.createdAt).format('DD/MM/YY').toString();
    if (
      !isMatch(
        item,
        ['albumName', 'artist', 'orderStatus', 'firstName', 'lastName', 'cost'],
        searchText,
      ) &&
      !date.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return null;
    }

    return (
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 8,
          paddingTop: 5,
          paddingHorizontal: 10,
          paddingBottom: 10,
          borderRadius: 10,
          backgroundColor: colors.cardColor,
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,

          marginTop: 5,
        }}>
        <View style={{width: '100%'}}>
          <View style={{paddingVertical: 5, flexDirection: 'row'}}>
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <FastImage
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  alignSelf: 'center',
                  backgroundColor: colors.bgGray,
                }}
                source={{
                  ...getImage(
                    item?.albumId?.thumbnailImage ?? item?.albumId?.images[0],
                  ),
                  priority: FastImage.priority.normal, // Set the priority if needed
                }}
                resizeMode={FastImage.resizeMode.cover} // Set resizeMode
              />
            </View>
            <View style={{flex: 4, paddingLeft: 10}}>
              <View
                style={{
                  paddingVertical: 2,
                  width: '100%',
                  alignItems: 'flex-start',
                  overflow: 'hidden',
                  justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.grayShadeOne,

                    fontSize: 17,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {item?.albumId?.albumName}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.grayShadeTwo,
                    fontSize: 17,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.albumId?.artist}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.grayShadeTwo,
                    fontSize: 16,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.albumId?.label}
                </Text>
              </View>
              <View
                style={{
                  paddingVertical: 2,
                  width: '100%',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.grayShadeTwo,
                    fontSize: 16,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {moment(item.createdAt).format('DD/MM/YYYY hh:mm a')}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 2,
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 2,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.notificationColor,
                  fontSize: 17,
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {`\u20AC${getPrice(
                  parseFloat(item.albumCost) +
                    parseFloat(item.shipmentCharge) +
                    (parseFloat(item.albumCost) +
                      parseFloat(item.shipmentCharge)) *
                      (userReducer.currentOrderDetails.buyerTax / 100),
                )}`}
              </Text>
            </View>
          </View>
        </View>
        <View style={{marginVertical: 10, width: '100%'}}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.OrderDetails.order_id}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {userReducer.currentOrderDetails.orderId}
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', marginTop: 2}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.OrderDetails.seller}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item?.sellerInformation?.name}
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', marginTop: 2}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.OrderDetails.cost}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(parseFloat(item.albumCost))}`}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 2}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.OrderDetails.shipment_charge}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(parseFloat(item.shipmentCharge))}`}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 2}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.OrderDetails.tax}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(
                  (parseFloat(item.albumCost) +
                    parseFloat(item.shipmentCharge)) *
                    (userReducer.currentOrderDetails.buyerTax / 100),
                )}`}{' '}
                {'(' + userReducer.currentOrderDetails.buyerTax + '%)'}
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', marginVertical: 2}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.OrderDetails.order_status}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item.orderStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        {!item.isCancel && item.orderStatus.toUpperCase() == 'RETURN APPROVED' && (
          <View
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              marginVertical: 5,
              alignItems: 'flex-start',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                height: 35,

                overflow: 'hidden',
              }}
              onPress={() => {
                ProfileNavigation.navigate('NearbyDepots', {
                  postalCode: userReducer?.currentOrderDetails
                    ?.buyerInformation[0]?.vendorData
                    ? userReducer?.currentOrderDetails?.buyerInformation[0]
                        ?.vendorData?.zipcode
                    : userReducer?.currentOrderDetails?.buyerInformation[0]
                        ?.postalCode,
                });
              }}>
              <View
                style={{
                  height: '100%',

                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  resizeMode="contain"
                  style={{
                    height: 20,
                    width: 20,
                    padding: 2,
                    alignSelf: 'center',
                    tintColor: colors.primaryTextColor + '90',
                    marginHorizontal: 4,
                  }}
                  source={imagepath.correos}></Image>

                <Text
                  style={{
                    color: colors.blue + 'dd',
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    marginRight: 10,
                  }}>
                  {textContent.OrderDetails.view_depots}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 35,

                overflow: 'hidden',
              }}
              onPress={() => {
                setLabelItem({item, index});
                setLabelDialog(true);
              }}>
              <View
                style={{
                  height: '100%',

                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  resizeMode="contain"
                  style={{
                    height: 18,
                    width: 18,
                    padding: 2,
                    alignSelf: 'center',
                    tintColor: colors.primaryTextColor + '90',
                    marginHorizontal: 4,
                  }}
                  source={imagepath.document}></Image>

                <Text
                  style={{
                    color: colors.blue + 'dd',
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    marginRight: 10,
                  }}>
                  {textContent.OrderDetails.print_label}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {!item.isCancel &&
          item.orderStatus.toUpperCase() !== 'RETURN DELIVERED' &&
          item.orderStatus.toUpperCase() !== 'ORDER REJECTED' &&
          item.orderStatus.toUpperCase() !== 'ORDER COMPLETED' &&
          item.orderStatus.toUpperCase() !== 'RETURN DENIED' &&
          item.orderStatus.toUpperCase() !== 'CANCELLED' && (
            <View
              style={{
                width: '100%',
                justifyContent: 'flex-end',

                alignItems: 'flex-end',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  height: 35,

                  overflow: 'hidden',
                }}
                onPress={() => {
                  updateUserDetails({
                    prop: 'selectedAlbum',
                    value: {...item, index},
                  });
                  if (CartNavigation?.cartNavigationRef?.isReady()) {
                    CartNavigation.navigate('ChatScreen');
                  } else {
                    ProfileNavigation.navigate('ChatScreen');
                  }
                }}>
                <View
                  style={{
                    height: '100%',

                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Image
                    resizeMode="contain"
                    style={{
                      height: 18,
                      width: 18,
                      padding: 2,
                      alignSelf: 'center',
                      tintColor: colors.primaryTextColor + '90',
                      marginHorizontal: 4,
                    }}
                    source={imagepath.questionmark}></Image>

                  <Text
                    style={{
                      color: colors.blue + 'dd',
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                      marginRight: 10,
                    }}>
                    {textContent.OrderDetails.help}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  };
  const checkPostalCodeInfo = async jsonData => {
    return await checkRequestData(
      ShipmentParameters.postCodeInfo,
      jsonData,
      userReducer,
    )
      .then(result => {
        if (result.getElementsByTagName('resultado')[0].value == 'OK') {
          return true;
        } else {
          return false;
        }
      })
      .catch(err => {
        return false;
      });
  };

  const renderPage = () => {
    return (
      <View style={{flex: 1, width: '100%'}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          listKey={(item, index) => `_key${index.toString()}`}
          data={userReducer?.currentOrderDetails?.albumDetails}
          extraData={userReducer?.reRenderOrderDetails}
          style={{marginTop: 15}}
          ListFooterComponent={
            searchText == '' ? (
              <View style={{marginTop: 15}}>
                <View
                  style={{
                    height: 40,
                    width: '100%',
                    borderColor: colors.premiumGrayOne + '90',
                    flexDirection: 'row',
                    paddingRight: 2,
                    paddingTop: 10,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      width: '100%',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      flexDirection: 'row',
                      paddingRight: 15,
                    }}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                      }}>
                      <Text
                        style={{
                          color: colors.primaryTextColor,
                          fontSize: 16,
                          fontFamily: fontFamily.MontserratRegular,
                        }}>
                        {textContent.OrderDetails.total}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingLeft: 5,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}>
                      <Text
                        style={{
                          color: colors.waxplaceColor,
                          fontSize: 20,
                          letterSpacing: 1,
                          fontFamily: fontFamily.MontserratBold,
                        }}>
                        {`\u20AC${getPrice(
                          parseFloat(
                            userReducer?.currentOrderDetails?.totalPayment,
                          ),
                        )}`}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    width: '100%',
                    paddingRight: 10,
                    paddingLeft: 10,
                    justifyContent: 'flex-end',
                    marginVertical: 25,
                  }}>
                  <View
                    style={{
                      width: '100%',
                      marginBottom: 3,
                      paddingVertical: 3,
                    }}>
                    <View style={{flex: 1.5}}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                          color: colors.grayShadeOne,
                          fontSize: 13,

                          fontFamily: fontFamily.MontserratRegular,
                        }}>
                        {textContent.OrderDetails.order_id}#:{' '}
                      </Text>
                    </View>
                    <View style={{flex: 2.5, marginTop: 2}}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                          color: colors.blue,
                          fontSize: 18,

                          fontFamily: fontFamily.MontserratMedium,
                        }}>
                        {userReducer?.currentOrderDetails?.orderId}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : null
          }
          renderItem={({item, index}) =>
            renderOrderDetailsComponent(item, index)
          }></FlatList>
      </View>
    );
  };

  const gotoNext = async () => {
    let jsonData = {
      codcliente: '', //string 9 Billing Account Code
      codpos: userReducer?.profileDetails?.zipcode
        ? userReducer?.profileDetails?.zipcode
        : '0', //Pincode X
    };

    // SELLER'S POSTAL CODE CHECK
    let postalCodeShipmentCheck = false;
    await checkPostalCodeInfo(jsonData)
      .then(result => {
        if (result == true) {
          postalCodeShipmentCheck = true;
        }
      })
      .catch(err => {});

    if (postalCodeShipmentCheck == false) {
      toast.show(textContent.OrderDetails.shipment_settings);
      return;
    }

    let data = cartList.filter(data => data.enable);
    if (data.length > 0) {
      updateUserDetails({
        prop: 'cartDetails',
        value: {
          data,
          shareCode,
          shareCodeCheck,
          storeCheckoutCheck,
          vendorData: null,
          totalValue,
        },
      });

      if (storeCheckoutCheck) {
        CartNavigation.navigate('Mapscreen');
      } else {
        CartNavigation.navigate('Checkout');
      }
    } else {
      toast.show(textContent.OrderDetails.album_continue);
    }
  };

  return (
    <SafeAreaView
      style={styles.maincontainer(colors)}
      keyboardShouldPersistTaps={'always'}
      scrollEnabled={false}>
      <Dialog
        visible={labelDialog}
        onTouchOutside={() => setLabelDialog(false)}
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
              width: '100%',
              justifyContent: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => printLabel(labelItem.item, labelItem.index)}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 18,
                alignSelf: 'center',
              }}>
              PRINT LABEL
            </Text>
          </TouchableOpacity>
          {isCustomsCorreosShipment(
            userReducer?.currentOrderDetails?.albumDetails[labelItem.index]
              ?.sellerInformation?.zipcode,
            userReducer?.currentOrderDetails?.sellerInformation?.zipcode,
          ) && (
            <TouchableOpacity
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 16,
                alignSelf: 'center',
                flexDirection: 'row',
              }}
              onPress={() =>
                printCustomsDocument(labelItem.item, labelItem.index)
              }>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontFamily: fontFamily.MontserratRegular,
                  fontSize: 18,
                  alignSelf: 'center',
                }}>
                CUSTOMS DOCUMENT
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Dialog>
      <SearchBar
        userReducer={userReducer}
        helpEnabled={true}
        onBackPress={() => {
          if (CartNavigation?.cartNavigationRef?.isReady()) {
            BottomNavigation.reset('HOME');
          } else {
            ProfileNavigation.pop();
          }
        }}
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.OrderDetails.search_text
        }
      />

      {renderPage()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
    paddingBottom: 55,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(OrderDetails);
