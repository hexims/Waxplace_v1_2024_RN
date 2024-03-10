import moment from 'moment';
import React, {useCallback, useLayoutEffect, useState, useEffect} from 'react';
import {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {getImage} from '../../actions/GenericAPI';
import {DarkModeContext} from '../../components/DarkModeContext';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
export const OrderDetailsBubble = ({_id, currentMessage, updateWaxbot}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [showContine, setShowContinue] = useState(true);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const renderData = item => {
    return (
      <View style={{width: '100%', backgroundColor: colors.transparent}}>
        <View
          style={{
            width: '99%',
            alignSelf: 'center',
            marginBottom: 2,
            height: 480,
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            paddingTop: 5,
          }}>
          <View
            style={{
              paddingVertical: 10,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.grayShadeOne,
                fontSize: 15,

                fontFamily: fontFamily.MontserratBold,
              }}>
              ORDER DETAILS
            </Text>
          </View>
          <View style={{width: '100%'}}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                paddingVertical: 3,
              }}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 13,
                  marginLeft: 8,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                OrderId#:{' '}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item?.orderId}
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                paddingVertical: 3,
                alignItems: 'center',
                flexDirection: 'row',
                marginLeft: 8,
              }}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 13,

                  fontFamily: fontFamily.MontserratRegular,
                }}>
                Status:{' '}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  //     color: item.isCanceled == false ? colors.primaryButtonColor : fontFamily.Pink,
                  fontSize: 12,
                  fontFamily: fontFamily.MontserratBold,
                }}></Text>
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                paddingVertical: 3,
              }}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 13,
                  marginLeft: 8,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                PickUp:{' '}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {/* {item.pickUpId ? item.pickUpId.storeName : item.pickUpId} */}
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                paddingVertical: 3,
                flexDirection: 'row',
              }}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 13,
                  marginLeft: 8,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                Date:{' '}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  fontSize: 14,
                  fontFamily: fontFamily.MontserratMedium,

                  color: colors.primaryTextColor,
                }}>
                {/* {moment(item.pickUpDate).format('DD/MM/YY')} */}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
              marginBottom: 2,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'flex-start',
              marginLeft: 15,
            }}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.grayShadeOne,
                fontSize: 14,

                fontFamily: fontFamily.MontserratMedium,
              }}>
              ALBUM DETAILS
            </Text>
          </View>
          <View style={{flex: 1, width: '100%'}}>
            <FlatList
              data={item?.albumDetails}
              style={{padding: 5}}
              contentContainerStyle={{}}
              renderItem={({item, index}) =>
                renderAlbumData(item, index)
              }></FlatList>
          </View>
          <View
            style={{
              flex: 0.2,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingRight: 15,
            }}>
            <View
              style={{
                height: '100%',
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                Total:{' '}
              </Text>
            </View>
            <View
              style={{
                height: '100%',
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 17,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(
                  parseFloat(
                    0,
                    //    item.saleProductId.price ? item.saleProductId.price : 0,
                  ),
                )}`}
              </Text>
            </View>
          </View>
        </View>
        {showContine && (
          <TouchableOpacity
            style={{
              marginTop: 10,
              width: '80%',
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
                flexDirection: 'row',
                paddingLeft: 10,
              }}>
              <Image
                source={imagepath.check}
                resizeMode="contain"
                style={{
                  height: 13,
                  width: 13,
                  tintColor: colors.blue,
                  marginRight: 5,
                  marginTop: 2,
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: colors.blue,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                Continue
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAlbumData = (item, index) => {
    return (
      <View style={{paddingVertical: 10, flexDirection: 'row'}}>
        <View
          style={{
            paddingHorizontal: 10,

            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{
              width: 95,
              height: 95,
              borderRadius: 10,
              alignSelf: 'center',
              backgroundColor: colors.bgGray,
            }}
            source={
              item.image ? getImage(item.image) : imagepath.gallery3
            }></Image>
        </View>
        <View style={{flex: 4, paddingLeft: 3}}>
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'flex-start',
              overflow: 'hidden',
              justifyContent: 'center',
            }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.gray,

                fontSize: 16,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {item?.albumId?.album}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
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
              {item?.albumId?.artist}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
            <Text
              numberOfLines={1}
              style={{
                color: colors.grayShadeOne,
                fontSize: 15,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {`\u20AC${getPrice(
                parseFloat(item.albumCost) + parseFloat(item.shipmentCharge),
              )}`}
            </Text>
          </View>
          <View style={{flex: 0.3}} />
        </View>
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
        {renderData(currentMessage.data)}
      </View>
    </View>
  );
};
