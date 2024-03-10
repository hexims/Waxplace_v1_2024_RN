import React, {useContext, useEffect, useRef, useState} from 'react';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  Dimensions,
  NativeModules,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  PermissionsAndroid,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  FlatList,
  ImageBackground,
  Platform,
} from 'react-native';
import {DISCOSKEY, DISCOSSECRET} from '../utils/keys';
import {openSettings} from 'react-native-permissions';
import {getImage} from '../actions/GenericAPI';
import {times} from 'lodash';
import {normalize} from './NormalizeFonts';
import {DarkModeContext} from './DarkModeContext';
import {changeWishList, getPrice} from '../actions/HelperFunctions';
import FastImage from 'react-native-fast-image';

const FeaturedItemComponent = ({
  item,
  index,
  onPress,
  route,
  userReducer,
  updateUserDetails,
  HomeNavigation,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [wishList, setWishList] = useState(false);

  useEffect(() => {
    setWishList(item?.isWishList);
  }, [item?.isWishList]);

  const updateWishList = wishList => {
    setWishList(wishList);
  };

  return item.data && item.data == 'emptyLoader' ? (
    <View
      style={{
        marginLeft: index == 0 ? 9 : 10,
        width: 150,
        height: 200,
        borderWidth: 0,
        elevation: 4,
        shadowColor: colors.shadowColor,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        backgroundColor: colors.premiumGrayOne,
        borderRadius: 12,

        marginBottom: 8,
      }}></View>
  ) : (
    <TouchableOpacity
      style={[styles.albumitemContainer(colors, darkMode, index), {}]}
      onPress={() => {
        HomeNavigation.navigate('AlbumDetails', {
          selectedAlbumId: item._id,
          type: 'featuredData',
          updateWishList,
        });
      }}>
      <View
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          borderRadius: 12,
        }}>
        <View style={{flex: 2.6, width: '100%'}}>
          <FastImage
            style={{
              backgroundColor: colors.bgGray,
              width: '100%',
              height: '100%',
            }}
            resizeMode={FastImage.resizeMode.cover}
            onError={e => {}}
            source={
              item.images
                ? {
                    ...getImage(item.thumbnailImage ?? item.images[0]),
                    priority: FastImage.priority.normal,
                  }
                : imagepath.cover3
            }
          />
        </View>
        <View
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: colors.cardColor,
            paddingHorizontal: normalize(10),
            paddingBottom: 10,
            flexDirection: 'row',
          }}>
          <View style={{flex: 3, height: '100%'}}>
            <View
              style={{
                //  flex: 1.2,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 5,
              }}>
              <View
                style={{
                  flex: 2.8,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.primaryTextColor,

                    fontSize: 20,
                    fontFamily: fontFamily.MontserratMedium,
                    letterSpacing: 1,
                    fontWeight: '800',
                  }}>
                  {`\u20AC${getPrice(parseFloat(item.cost))}`}
                </Text>
              </View>
            </View>
            <View
              style={{flex: 1.2, width: '100%', justifyContent: 'flex-start'}}>
              <Text
                style={{
                  width: '100%',
                  marginTop: 2.1,
                  color: colors.primaryTextColor,
                  fontSize: 14,
                  letterSpacing: 1,
                  fontFamily: fontFamily.MontserratMedium,
                  fontWeight: '600',
                }}
                numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              width: '100%',

              alignItems: 'center',
              justifyContent: 'center',
              // paddingRight:3
            }}>
            <TouchableOpacity
              onPress={() => {
                changeWishList(
                  wishList => {
                    setWishList(wishList);
                    const featuredData = userReducer.featuredData.map(value => {
                      if (value._id == item._id) {
                        return {...value, isWishList: wishList};
                      } else {
                        return value;
                      }
                    });

                    updateUserDetails({
                      prop: 'featuredData',
                      value: featuredData,
                    });

                    const categoryData = userReducer.categoryData.map(value => {
                      if (
                        value[0]?._id == item._id ||
                        value[1]?._id == item._id
                      ) {
                        var returnData = [];
                        if (value[0]?._id == item._id) {
                          returnData.push({...value[0], isWishList: wishList});
                        } else {
                          returnData.push(value[0]);
                        }

                        if (value[1]?._id == item._id) {
                          returnData.push({...value[1], isWishList: wishList});
                        } else {
                          returnData.push(value[1]);
                        }
                        return returnData;
                      } else {
                        return value;
                      }
                    });

                    updateUserDetails({
                      prop: 'categoryData',
                      value: categoryData,
                    });
                  },
                  item._id,
                  wishList,
                  userReducer,
                  updateUserDetails,
                );
              }}>
              <Image
                style={[
                  {
                    width: 25,
                    height: 25,
                  },
                  darkMode && !wishList && {tintColor: colors.grayShadeOne},
                ]}
                resizeMode="contain"
                source={
                  wishList ? imagepath.wishlistimage : imagepath.hearticon
                }></Image>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  albumitemContainer: (colors, darkMode, index) => [
    {
      marginLeft: index == 0 ? 9 : 10,
      width: 150,
      height: 200,
      borderWidth: 0,
      elevation: 4,
      shadowColor: colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      backgroundColor: colors.cardColor,
      borderRadius: 12,

      marginBottom: 8,
    },
    !darkMode && {},
  ],
});

export default FeaturedItemComponent;
