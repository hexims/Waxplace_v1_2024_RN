import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PanResponder,
} from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import { Pagination } from 'react-native-snap-carousel';
import imagepath from '../utils/Images';
import { MainButton } from './MainButton';
import fontFamily from '../utils/FontFamily';
import { getImage } from '../actions/GenericAPI';
import LinearGradient from 'react-native-linear-gradient';
import { changeWishList } from '../actions/HelperFunctions';
import { addProductToUserCart } from '../actions/PurchaseFlowAPI';
import { useToast } from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const PaginationDots = ({ numDots }) => {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <View style={styles.container}>
      {[...Array(numDots)].map((_, i) => (
        <TouchableOpacity key={i} onPress={() => setActiveDot(i)}>
          <Text style={[styles.dot, activeDot === i && styles.activeDot]}>
            &bull;
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const ImageCarousel = ({
  images,
  type,
  colors,
  HomeNavigation,
  userReducer,
  updateUserDetails,
  data,
  callback,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const toast = useToast();
  const [activeDot, setActiveDot] = useState(0);
  const viewPager = useRef(null);

  const [wishList, setWishList] = useState(false);

  useEffect(() => {
    setWishList(data?.isWishList);
  }, [data?.isWishList]);

  const renderItem = ({ item, index, type, route }) => {
    return (
      <View style={{}}>
        <FastImage
          source={{ ...getImage(item), priority: FastImage.priority.normal }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.premiumGrayOne,
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ height: 400, width: '100%' }}>
      <ViewPager
        ref={viewPager}
        style={{ flex: 1, width: '100%' }}
        initialPage={0}
        onPageSelected={e => {
          setSelectedIndex(e.nativeEvent.position);
          setActiveDot(e.nativeEvent.position);
        }}>
        {images.map((image, index) => (
          <View key={index}>{renderItem({ item: image, index })}</View>
        ))}
      </ViewPager>
      <LinearGradient
        colors={
          images.length > 0
            ? [
              colors.transparent,
              colors.transparent,
              colors.transparent,
              colors.transparent,
              colors.black + '90',
              colors.black + 'cc',
              colors.black,
            ]
            : [colors.transparent, colors.transparent]
        }
        style={{
          width: '100%',
          height: 150,
          position: 'absolute',
          bottom: 0,
        }}></LinearGradient>

      <TouchableOpacity
        style={{
          width: 45,
          height: 45,
          marginTop: 30,
          marginRight: 20,
          position: 'absolute',
          bottom: 60,
          right: 0,
        }}
        onPress={() =>
          changeWishList(
            wishList => {
              setWishList(wishList);
              if (type) {
                callback(wishList);
              }
              const featuredData = userReducer.featuredData.map(value => {
                if (value._id == data._id) {
                  return { ...value, isWishList: wishList };
                } else {
                  return value;
                }
              });

              updateUserDetails({ prop: 'featuredData', value: featuredData });

              const categoryData = userReducer.categoryData.map(value => {
                if (value[0]?._id == data._id || value[1]?._id == data._id) {
                  var returnData = [];
                  if (value[0]?._id == data._id) {
                    returnData.push({ ...value[0], isWishList: wishList });
                  } else {
                    returnData.push(value[0]);
                  }

                  if (value[1]?._id == data._id) {
                    returnData.push({ ...value[1], isWishList: wishList });
                  } else {
                    returnData.push(value[1]);
                  }
                  return returnData;
                } else {
                  return value;
                }
              });

              updateUserDetails({ prop: 'categoryData', value: categoryData });
            },
            data?._id,
            wishList,
            userReducer,
            updateUserDetails,
          )
        }>
        <Image
          style={{
            width: wishList ? 35 : 45,
            height: wishList ? 35 : 45,
            marginLeft: wishList ? 5 : 0,
          }}
          source={wishList ? imagepath.wishlistimage : imagepath.heart}></Image>
      </TouchableOpacity>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View style={styles.container}>
          {images.length > 1 && [...Array(images[0] == 'none' ? 0 : images.length)].map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                viewPager.current.setPage(i);
                setActiveDot(i);
              }}>
              <View
                style={[
                  styles.dot,
                  activeDot === i && styles.activeDot,
                ]}></View>
            </TouchableOpacity>
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 10,
              paddingBottom: 15,
            }}>
            <MainButton
              style={{
                width: '90%',
                height: 30,
                borderRadius: 20,
                backgroundColor: colors.secondaryBackground,
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
              textStyle={{
                color: colors.primaryTextColor,

                letterSpacing: 0.5,
                paddingVertical: 2,
                paddingHorizontal: 10,
                fontFamily: fontFamily.MontserratRegular,
              }}
              backgroundColor={colors.primaryBackground}
              onPress={() => {
                HomeNavigation.navigate('CreateSaleProduct', {
                  selectedAlbumDetails: data,
                });
              }}
              title={textContent.components.sell_item}
            />
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 10,
              paddingBottom: 15,
            }}>
            {!data.isAdmin && (
              <MainButton
                style={{
                  width: '90%',
                  height: 30,
                  borderRadius: 20,
                  backgroundColor: colors.primaryButtonColor,
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
                textStyle={{
                  color: colors.black,

                  letterSpacing: 0.5,
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                  fontFamily: fontFamily.MontserratRegular,
                }}
                backgroundColor={colors.primaryButtonColor}
                onPress={() => {
                  let jsonData = { saleProductId: data._id };

                  addProductToUserCart(jsonData)
                    .then(response => {
                      if (response.status == 'success') {
                        toast.show(response.message);
                        //  HomeNavigation.navigate('CartStack');
                      } else {
                        toast.show(response.message);
                      }
                    })
                    .catch(err => { });
                }}
                title={textContent.components.buy_item}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#d9d9d9',
  },
});

export default ImageCarousel;
