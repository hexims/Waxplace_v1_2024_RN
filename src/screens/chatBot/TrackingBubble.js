import moment from 'moment';
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useReducer,
} from 'react';
import {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {getImage} from '../../actions/GenericAPI';
import {shipmentTracking, trackOrder} from '../../actions/ShipmentAPI';
import {getCurrentShipmentStatus} from '../../actions/_CorreosAPI';
import {DarkModeContext} from '../../components/DarkModeContext';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
import textContent from '../../utils/textContent';

export const TrackingBubble = ({
  _id,
  currentMessage,
  updateWaxbot,
  userReducer,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [showContine, setShowContinue] = useState(true);
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    getCurrentShipmentStatus(
      userReducer?.selectedAlbum?.shipmentDetails?.codEnvio,
    )
      .then(result => {
        if (result[0].eventos[0].desTextoResumen) {
          setStatusData(result[0].eventos[0]);
        }
      })
      .catch(err => {});
  }, []);

  const getCurrentStatus = async () => {};

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');
    return replaceString;
  };

  const renderData = item => {
    return (
      <View style={{width: '100%', backgroundColor: colors.transparent}}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.primaryTextColor,
            fontSize: 16,
            fontFamily: fontFamily.MontserratMedium,
            marginVertical: 10,
          }}>
          {textContent.chatBot.shipment_details}
        </Text>
        <View
          style={{
            width: '99%',
            alignSelf: 'center',
            marginBottom: 2,

            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 15,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.chatBot.shipment_status}
          </Text>
          <View style={{flexDirection: 'row', marginTop: 10, width: 200}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.chatBot.event_date}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {statusData?.fecEvento}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 10, width: 200}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.chatBot.event_time}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {moment(statusData?.horEvento, 'HH:mm:ss').format('LT')}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', marginVertical: 10, width: 200}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 80,
                }}>
                {textContent.chatBot.info}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {statusData?.desTextoAmpliado}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 5, width: 200}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.chatBot.status}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                ellipsizeMode={'tail'}
                style={{
                  color: colors.notificationColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {statusData?.desTextoResumen}
              </Text>
            </View>
          </View>
        </View>

        {showContine && (
          <TouchableOpacity
            style={{
              marginTop: 10,
              marginLeft: 5,
              width: '45%',
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
              {item.releaseDetails.album}
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
              {item.releaseDetails.artist}
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
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {`\u20AC${getPrice(
                parseFloat(
                  item.saleProductId.price ? item.saleProductId.price : 0,
                ),
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
        {!statusData ? (
          <View
            style={{
              height: 150,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor:colors.transparent
            }}>
            <ActivityIndicator size={'small'} color={colors.primaryTextColor} />
          </View>
        ) : (
          renderData(currentMessage.data)
        )}
      </View>
    </View>
  );
};
