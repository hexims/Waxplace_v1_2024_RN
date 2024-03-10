import moment from 'moment';
import React, {useCallback, useLayoutEffect, useState, useEffect} from 'react';
import { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {getImage} from '../../actions/GenericAPI';
import { DarkModeContext } from '../../components/DarkModeContext';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';

export const ContactUsBubble = ({_id, currentMessage, updateWaxbot}) => {
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
            // height: 480,
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            paddingTop: 5,
            paddingBottom: 10,
            paddingHorizontal: 10,
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
              CONTACT US
            </Text>
          </View>
          <View style={{width: '100%'}}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                paddingVertical: 5,
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
                  Contact Email:{' '}
                </Text>
              </View>
              <View style={{flex: 2.5}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 14,

                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {'orders@waxplace.com'}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 3,
                marginTop: 10,
              }}>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  backgroundColor: colors.premiumGrayOne,

                  minWidth: '30%',

                  borderRadius: 10,

                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                    Linking.openURL('mailto:orders@waxplace.com')
                }}>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      alignSelf: 'center',
                      color: colors.primaryTextColor,
                      fontSize: 14,
                      fontFamily: fontFamily.MontserratBold,
                    }}>
                    {'Open Email'}
                  </Text>
                </View>

                <View
                  style={{
                    paddingRight: 10,

                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{
                      width: 15,
                      height: 15,
                      padding: 0,
                      alignSelf: 'center',
                    }}
                    source={imagepath.edit}></Image>
                </View>
              </TouchableOpacity>
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
                color:colors.grayShadeOne,
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
        {renderData(currentMessage.data)}
      </View>
    </View>
  );
};
