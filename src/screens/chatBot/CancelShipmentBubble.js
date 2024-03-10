import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';

import {getImage} from '../../actions/GenericAPI';

import fontFamily from '../../utils/FontFamily';

import * as BottomNavigation from '../../router/_BottomNavigation';
import * as HomeNavigation from '../../router/_HomeNavigation';
import * as ProfileNavigation from '../../router/_ProfileNavigation';

import {cancelShipment} from '../../actions/ShipmentAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../../utils/textContent';

export const CancelShipmentBubble = ({
  _id,
  currentMessage,
  updateWaxbot,
  addAudio,
  addImage,
  userReducer,
  updateUserDetails,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [showContinue, setShowContinue] = useState(true);

  useEffect(() => {}, []);

  const renderInitialQuestion = item => {
    return (
      <View style={{width: '100%', backgroundColor: colors.transparent}}>
        {!item.isCancel && item.orderStatus.toUpperCase() == 'ORDER PLACED' && (
          <View style={{width: '100%', marginBottom: 10, marginTop: 15}}>
            <Text
              numberOfLines={2}
              style={{
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.cancel_message}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingVertical: 10,
            backgroundColor: colors.secondaryBackground,
            borderRadius: 12,
          }}>
          <View
            style={{
              flex: 1.3,
              height: '100%',
              // justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              paddingLeft: 10,
            }}>
            <Image
              style={{
                width: 90,
                height: 90,
                borderRadius: 10,
                alignSelf: 'center',
                backgroundColor: colors.bgGray,
              }}
              source={getImage(
                item?.albumId?.thumbnailImage ?? item?.albumId?.images[0],
              )}></Image>
          </View>
          <View
            style={{
              flex: 3,
              height: '100%',
              paddingLeft: 3,
            }}>
            <View
              style={{
                marginTop: 5,
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
                  marginLeft: 5,
                }}>
                {item?.albumId?.albumName}
              </Text>
            </View>
            <View style={{width: '100%'}}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  marginLeft: 5,
                  fontFamily: fontFamily.MontserratRegular,
                  marginTop: 2,
                }}>
                {item?.albumId?.artist}
              </Text>
            </View>
            <View style={{width: '100%'}}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,
                  marginLeft: 5,
                  fontFamily: fontFamily.MontserratRegular,
                  marginTop: 2,
                }}>
                {item?.albumId?.label + ', ' + item?.albumId?.year}
              </Text>
            </View>
          </View>
        </View>

        {!item.isCancel && item.orderStatus.toUpperCase() == 'ORDER PLACED' ? (
          <View style={{flexDirection: 'row', width: '100%'}}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  width: '95%',
                  backgroundColor: colors.secondaryBackground,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  alignItems: 'center',
                }}
                onPress={() => {
                  Alert.alert('', textContent.chatBot.cancel_proceed, [
                    {
                      text: textContent.chatBot.cancel,
                      onPress: () => {},
                      style: 'cancel',
                    },
                    {
                      text: textContent.chatBot.confirm,
                      onPress: () => {
                        updateUserDetails({prop: 'spinner', value: true});
                        let jsonData = {
                          // nseg: item?.shipmentDetails.nseg,
                          shipmentCharge: item?.shipmentCharge,
                          albumId: item.albumId._id,
                          albumCost: item.albumCost,
                          buyerTax: userReducer?.currentOrderDetails?.buyerTax,
                          buyerId: userReducer?.currentOrderDetails?.buyerId,
                          // userReducer?.currentOrderDetails
                          //   ?.buyerInformation[0]._id,
                          sellerId: item?.sellerId?._id
                            ? item.sellerId?._id
                            : item?.sellerId,
                          orderId: userReducer?.currentOrderDetails?.orderId,
                        };

                        cancelShipment(jsonData, userReducer)
                          .then(result => {
                            if (result.status == 'success') {
                              updateUserDetails({
                                prop: 'currentOrderDetails',
                                value: result.data,
                              });
                              result.data.albumDetails.map(value => {
                                if (
                                  value.albumId._id ==
                                  userReducer.selectedAlbum.albumId._id
                                ) {
                                  updateUserDetails({
                                    prop: 'selectedAlbum',
                                    value,
                                  });
                                  updateUserDetails({
                                    prop: 'reRenderOrderDetails',
                                    value: userReducer.reRenderOrderDetails + 1,
                                  });
                                  toast.show(result.message);
                                  if (
                                    BottomNavigation?.navigationRef?.getCurrentRoute()
                                      ?.name == 'HOME'
                                  ) {
                                    HomeNavigation.reset('HomeScreen');
                                  } else {
                                    ProfileNavigation.pop();
                                  }
                                }
                              });
                            }
                            updateUserDetails({prop: 'spinner', value: false});
                          })
                          .catch(err => {
                            toast.show(textContent.general.general_error);
                            updateUserDetails({prop: 'spinner', value: false});
                          });
                      },
                    },
                  ]);
                  // updateWaxbot();
                }}>
                <View
                  style={{
                    width: '100%',
                    paddingVertical: 10,
                    alignItems: 'center',
                    //flexDirection: 'row',
                    //paddingLeft: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.red,
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.confirm}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  width: '95%',
                  backgroundColor: colors.secondaryBackground,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                }}
                onPress={() => {
                  setShowContinue(false);
                  updateWaxbot();
                }}>
                <View
                  style={{
                    width: '100%',
                    paddingVertical: 10,
                    alignItems: 'center',
                    //   flexDirection: 'row',
                    //   paddingLeft: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.blue,
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.cancel}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : item.orderStatus.toUpperCase() == 'CANCELLED' ? (
          <View
            style={{marginVertical: 10, width: '100%', alignItems: 'center'}}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.grayShadeThree,

                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.purchase_cancelled}
            </Text>
          </View>
        ) : item.orderStatus.toUpperCase() == 'ORDER REJECTED' ? (
          <View
            style={{marginVertical: 10, width: '100%', alignItems: 'center'}}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.grayShadeThree,

                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.order_rejected}
            </Text>
          </View>
        ) : item.orderStatus.toUpperCase() == 'ORDER ACCEPTED' ? (
          <View
            style={{marginVertical: 10, width: '100%', alignItems: 'center'}}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.grayShadeThree,

                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.shipment_not_started}
            </Text>
          </View>
        ) : (
          <View
            style={{marginVertical: 10, width: '100%', alignItems: 'center'}}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.grayShadeThree,

                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.shipment_completed}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{width: '85%', marginTop: 10}}>
      <View
        style={{
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.transparent,
        }}>
        {renderInitialQuestion(currentMessage.data)}
      </View>
    </View>
  );
};
