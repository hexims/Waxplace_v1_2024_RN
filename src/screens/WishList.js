import React, {useEffect, useState} from 'react';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import {getWishListofUser} from '../actions/UserAPI';

import _, {filter} from 'lodash';

import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';
import {SortView} from '../components/SortView';
import {getImage} from '../actions/GenericAPI';
import {
  addProductToUserCart,
  removeFromWishlist,
  removeProductFromUserCart,
} from '../actions/PurchaseFlowAPI';
import {updateUserDetails} from '../redux/actions/UserAction';
import ProgressLoader from '../components/ProgressLoader';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import {useKeyboard} from '../utils/UseKeyBoard';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const Wishlist = ({
  props,
  route,
  userReducer,
  updateUserDetails,
  navigation,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [wishList, setWishList] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [collection, setCollection] = useState(true);
  const [collectionList, setCollectionList] = useState([]);
  const [noInternet, setNoInternet] = useState(false);
  const [days, setDays] = useState({
    day1: true,
    day2: false,
    day3: false,
  });

  const [wishListArray, setWishListArray] = useState([]);
  const [collectionsArray, setCollectionsArray] = useState([]);
  const [cartLength, setCartLength] = useState(0);
  const [dataArray, setDataArray] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [initial, setInitial] = useState(true);
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    if (
      ProfileNavigation?.profileNavigationRef.getCurrentRoute().name ==
      'Wishlist'
    ) {
      setWishListArray([]);
      setInitial(true);
      getWishlistArray();
    }
  }, [
    ProfileNavigation?.profileNavigationRef.getCurrentRoute().name,
    searchText,
    sortValue,
  ]);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const selectDayspromo = item => {
    if (item == 0) {
      setDays({
        day1: true,
        day2: false,
        day3: false,
      });
    } else if (item == 1) {
      setDays({
        day1: false,
        day2: true,
        day3: false,
      });
    } else if (item == 2) {
      setDays({
        day1: false,
        day2: false,
        day3: true,
      });
    }
  };

  const getWishlistArray = () => {
    getWishListofUser(searchText, sortValue)
      .then(response => {
        setInitial(false);
        setWishListArray(response);
        setDataArray(response);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const removeDataFromWishList = (saleProductId, index, type) => {
    setSpinner(true);
    removeFromWishlist(saleProductId)
      .then(response => {
        if (response.status == 'success') {
          let wishlistArray = [];
          wishlistArray = wishListArray.filter(value => {
            if (value._id !== saleProductId) {
              return value;
            }
          });
          setSpinner(false);
          setWishListArray(wishlistArray);
          setDataArray(wishListArray);
        } else {
          setSpinner(false);
          toast.show(response.message);
        }
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const renderWishList = (item, index) => {
    return (
      <View
        style={{
          width: '100%',
          alignSelf: 'center',
          marginBottom: 5,
          height: 110,
          borderRadius: 10,
          backgroundColor: colors.secondaryBackground,
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          marginTop: 5,
          flexDirection: 'row',
        }}>
        <View
          style={{
            flex: 1.6,
            height: '100%',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            style={{
              width: 95,
              height: 95,
              borderRadius: 10,
              alignSelf: 'center',
              backgroundColor: colors.bgGray,
            }}
            source={{
              ...getImage(item.thumbnailImage ?? item.images[0]),
              priority: FastImage.priority.normal, // Set the priority if needed
            }}
          />
        </View>
        <View style={{flex: 4, height: '100%'}}>
          <View
            style={{
              flex: 3,
              width: '100%',
              flexDirection: 'row',
            }}>
            <View
              style={{
                flex: 3.8,
                height: '90%',
                overflow: 'hidden',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 18,
                  marginTop: 3,
                  fontFamily: fontFamily.MontserratRegular,
                  marginLeft: 8,
                }}>
                {item?.artist}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,

                  fontSize: 12,
                  fontFamily: fontFamily.MontserratRegular,

                  marginLeft: 8,
                  letterSpacing: 0.5,
                }}>
                {item?.albumName}
              </Text>

              <View style={{}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 11,
                    marginLeft: 8,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.label ? item?.label + ',' : ''}
                  {item?.year ? item?.year : '2020'}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1.8,
                height: '100%',
                paddingLeft: 10,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    marginTop: 2,
                  }}>
                  {`\u20AC${item?.cost}`}
                </Text>
              </View>
              <View
                style={{
                  flex: 1.5,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    removeDataFromWishList(item?._id, index, 'delete');
                  }}>
                  <Image
                    style={[
                      {width: 20, height: 20},
                      darkMode && {tintColor: colors.grayShadeOne},
                    ]}
                    source={imagepath.trash}></Image>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 1.5,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View style={{flex: 1, height: '100%'}}>
              {item?.mediaCondition ? (
                <View style={{}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontSize: 11,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 8,
                      color: colors.primaryTextColor,
                    }}>
                    {textContent.WishList.media_condition}:{' '}
                    {item?.mediaCondition}
                  </Text>
                </View>
              ) : null}
              {item?.sleveCondition ? (
                <View style={{}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontSize: 11,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 8,
                      color: colors.primaryTextColor,
                    }}>
                    {textContent.WishList.sleeve_condition}:{' '}
                    {item?.sleveCondition}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{flex: 0.9, height: '100%'}}>
              {item?.mediaCondition && !item.isAdmin ? (
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    backgroundColor: colors.primaryButtonColor,
                    height: '80%',
                    minWidth: '45%',
                    paddingHorizontal: 7,
                    borderRadius: 10,
                    marginRight: 8,
                    marginBottom: 3,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                  }}
                  onPress={() => {
                    if (item?.inCart) {
                      removeFromCart(item?._id, index, item);
                    } else {
                      addToCart(item?._id, index, item);
                    }
                  }}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      color: colors.black,
                      fontSize: 12,
                      fontFamily: fontFamily.MontserratBold,
                    }}>
                    {item?.inCart
                      ? textContent.WishList.remove
                      : textContent.WishList.add_to_cart}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const addToCart = (saleProductId, index, item) => {
    let jsonData = {
      saleProductId,
    };
    setSpinner(true);
    addProductToUserCart(jsonData)
      .then(response => {
        if (response.status == 'success') {
          wishListArray.splice(index, 1, {...item, inCart: true});
          setExtra(extra + 1);
        } else {
          toast.show(response.message);
        }
        setSpinner(false);
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const removeFromCart = (saleProductId, index, item) => {
    setSpinner(true);
    removeProductFromUserCart(saleProductId)
      .then(response => {
        if (response.status == 'success') {
          wishListArray.splice(index, 1, {...item, inCart: false});
          setExtra(extra + 1);
          toast.show(response.message);
        } else {
          toast.show(response.message);
        }
        setSpinner(false);
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', flex: 1}}>
        <SortView
          initial={initial}
          hideDistance={true}
          marginBottom={0}
          setFilterType={type => {
            setSortValue(type);
          }}
        />
        <View style={{width: '100%'}}>
          <FlatList
            ListFooterComponent={
              <>
                {initial && (
                  <ActivityIndicator
                    size={'small'}
                    style={{marginTop: '20%'}}
                    color={colors.spinner}
                  />
                )}
              </>
            }
            data={wishListArray}
            extraData={extra}
            showsVerticalScrollIndicator={false}
            style={{marginTop: 10, width: '100%'}}
            contentContainerStyle={{
              paddingBottom: useKeyboard() + 50,
              paddingHorizontal: 10,
              width: '100%',
            }}
            renderItem={({item, index}) =>
              renderWishList(item, index)
            }></FlatList>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.WishList.search_text
        }
      />

      {renderPage()}
      <ProgressLoader
        visible={spinner}
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
    justifyContent: 'center',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Wishlist);
