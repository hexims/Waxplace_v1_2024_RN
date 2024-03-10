import React, {useContext, useEffect, useRef, useState} from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';
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
import {addToWishlist, removeFromWishlist} from '../actions/PurchaseFlowAPI';
import {getImage} from '../actions/GenericAPI';
import {normalize} from './NormalizeFonts';
import {DarkModeContext} from './DarkModeContext';
import {changeWishList, getPrice} from '../actions/HelperFunctions';
import FastImage from 'react-native-fast-image';

const AlbumItemComponent = ({
  item,
  index,
  pos,
  route,
  navigation,
  updateData,
  data,
  updateUserDetails,
  userReducer,
  type,
  saleProductIndex,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [wishList, setWishList] = useState(false);
  useEffect(() => {
    setWishList(data?.isWishList);
  }, [data?.isWishList]);

  if (item?.data && item?.data == 'emptyLoader') {
    return (
      <View
        style={{
          width: '92%',
          height: 285,

          backgroundColor: colors.premiumGrayOne,
          elevation: 2,
          borderRadius: 12,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          // marginBottom: 10,
          alignSelf: 'center',
          // alignSelf: index == 0 ? 'flex-end' : 'flex-start',
          // marginRight: index == 0 ? 7 : 0,
          // marginLeft: index == 0 ? 0 : 7,
        }}>
        <View style={{height: '100%', width: '100%', overflow: 'hidden'}}>
          <View
            itemStyle={{
              width: '100%',
              height: '100%',
            }}
            primaryColor={colors.premiumGrayTwo + '25'}
            secondaryColor={colors.premiumGrayTwo + '25'}
            animationType={'overlay'}
            duration={700}
          />
        </View>
      </View>
    );
  }

  const updateWishList = wishList => {
    setWishList(wishList);
  };

  return (
    <TouchableOpacity
      style={[
        styles.albumitemContainer(colors, darkMode),
        {
          alignSelf: 'center',
        },
      ]}
      onPress={() => {
        HomeNavigation.navigate('AlbumDetails', {
          selectedAlbumId: item._id,
          type,
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
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              marginRight: 3,
              marginTop: -3,
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
          }}>
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
                  color: colors.grayShadeThree,

                  fontSize: 20,
                  fontFamily: fontFamily.MontserratMedium,
                  letterSpacing: 1,
                  fontWeight: '800',
                }}>
                {`\u20AC${getPrice(parseFloat(item.cost))}`}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                // paddingRight:3
              }}>
              <TouchableOpacity
                onPress={() =>
                  changeWishList(
                    wishList => {
                      setWishList(wishList);
                      const featuredData = userReducer.featuredData.map(
                        value => {
                          if (value._id == data._id) {
                            return {...value, isWishList: wishList};
                          } else {
                            return value;
                          }
                        },
                      );

                      updateUserDetails({
                        prop: 'featuredData',
                        value: featuredData,
                      });

                      const categoryData = userReducer.categoryData.map(
                        value => {
                          if (
                            value[0]?._id == data._id ||
                            value[1]?._id == data._id
                          ) {
                            var returnData = [];
                            if (value[0]?._id == data._id) {
                              returnData.push({
                                ...value[0],
                                isWishList: wishList,
                              });
                            } else {
                              returnData.push(value[0]);
                            }

                            if (value[1]?._id == data._id) {
                              returnData.push({
                                ...value[1],
                                isWishList: wishList,
                              });
                            } else {
                              returnData.push(value[1]);
                            }
                            return returnData;
                          } else {
                            return value;
                          }
                        },
                      );

                      updateUserDetails({
                        prop: 'categoryData',
                        value: categoryData,
                      });
                    },
                    item._id,
                    wishList,
                    userReducer,
                    updateUserDetails,
                  )
                }>
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
          <View
            style={{flex: 1.2, width: '100%', justifyContent: 'flex-start'}}>
            <Text
              style={{
                marginTop: 3,
                width: '100%',
                color: colors.grayShadeThree,
                fontSize: 16,
                fontFamily: fontFamily.MontserratMedium,
                letterSpacing: 1,
                fontWeight: '600',
              }}
              numberOfLines={1}>
              {item.albumName}
            </Text>
            <Text
              style={{
                width: '100%',
                marginTop: 2.1,
                color: colors.grayShadeOne,
                fontSize: 13,
                letterSpacing: 1,
                fontFamily: fontFamily.MontserratRegular,
                fontWeight: '600',
              }}
              numberOfLines={1}>
              {item.artist}
            </Text>
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
  albumitemContainer: (colors, darkMode) => [
    {
      width: '92%',
      height: 285,
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

      // marginBottom: 10,
    },
    !darkMode && {},
  ],
});

export default AlbumItemComponent;
