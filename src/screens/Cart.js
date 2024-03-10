import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as MapNavigation from '../router/_MapNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import * as CartNavigation from '../router/_CartNavigation';
import fontFamily from '../utils/FontFamily';
import {normalize} from '../components/NormalizeFonts';
import imagepath from '../utils/Images';

import {Dialog} from 'react-native-simple-dialogs';
import _ from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import {updateUserDetails} from '../redux/actions/UserAction';
import {connect} from 'react-redux';

import {MainButton} from '../components/MainButton';
import {CheckBox} from 'react-native-elements';
import ProgressLoader from '../components/ProgressLoader';

import {getPrice, isMatch} from '../actions/HelperFunctions';
import {getImage} from '../actions/GenericAPI';

import {removeProductFromUserCart} from '../actions/PurchaseFlowAPI';
import {getUserCart, shareCodeCheckFunction} from '../actions/UserAPI';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const CartScreen = ({props, route, userReducer, updateUserDetails}) => {
  const toast = useToast();
  const {darkMode, colors} = useContext(DarkModeContext);
  const [cartList, setCartList] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [extra, setExtra] = useState(0);
  const [shareCodeCheckValue, setShareCodeCheckValue] = useState(false);
  const [storeCheckoutCheck, setStoreCheckoutCheck] = useState(false);
  const [username, setUserName] = useState('');
  const [showerror, setShowError] = useState(false);
  const [shareCodeError, setShareCodeError] = useState(false);
  const [errortext, setErrorText] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [shareCodeDialog, setShareCodeDialog] = useState(false);
  const [initial, setInital] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [sortValue, setSortValue] = useState('newest');

  const checkShareCodeCheck = shareCode => {
    let jsonData = {shareCode};

    shareCodeCheckFunction(jsonData)
      .then(response => {
        setShareCodeError(response);
        if (response == true) {
          setShareCodeDialog(false);
          setShareCodeCheckValue(true);
          setShareCodeError(false);
        } else {
          setShareCodeError(true);
        }
      })
      .catch(error => {
        setShareCodeError(true);
      });
  };

  useEffect(() => {
    updateUserDetails({prop: 'spinner', value: false});
    mountFunction();

    return () => {};
  }, []);

  const mountFunction = () => {
    setSpinner(true);
    setUserName(userReducer?.profileDetails?.userName);
    getUserCart(sortValue)
      .then(response => {
        let totalValue = 0;

        if (response.findOne && response.findOne.cart) {
          response.findOne.cart.map(value => {
            totalValue = parseFloat(totalValue) + parseFloat(value.cost);
          });
          setTotalValue(totalValue);
          setCartList(response?.findOne?.cart);
          if (response?.findOne.cart.length > 0) {
            setInital(true);
          }
          setInitialLoading(true);
          setExtra(extra + 1);
        }
        setSpinner(false);
      })
      .catch(error => {
        toast.show('Something went wrong');

        setSpinner(false);
      });
  };

  const removeFromCart = saleProductId => {
    updateUserDetails({prop: 'spinner', value: true});
    removeProductFromUserCart(saleProductId)
      .then(response => {
        if (response?.user?.cart) {
          let newsortedCartList = [];
          let unSortedCart = response?.user?.cart;

          cartList.map(value => {
            if (saleProductId != value._id) {
              newsortedCartList.push(value);
            } else {
              setTotalValue(parseFloat(totalValue) - parseFloat(value?.cost));
            }
          });

          updateUserDetails({
            prop: 'cartLength',
            value: newsortedCartList.length,
          });
          updateUserDetails({prop: 'spinner', value: false});
          setCartList(newsortedCartList);
          setExtra(extra + 1);
        } else {
          updateUserDetails({prop: 'spinner', value: false});
          setCartList([]);
        }
        updateUserDetails({prop: 'spinner', value: false});
      })
      .catch(error => {
        updateUserDetails({prop: 'spinner', value: false});
      });
  };

  const renderCartItems = (item, index) => {
    if (
      !isMatch(
        item,
        ['albumName', 'artist', 'mediaCondition', 'cost', 'sleveCondition'],
        searchText,
      )
    ) {
      return null;
    }
    return (
      <TouchableOpacity
        style={{
          width: '95%',
          alignSelf: 'center',
          borderRadius: 12,
          backgroundColor: colors.cardColor,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 4,
          marginBottom: 12,
        }}
        onPress={() => {
          CartNavigation.navigate('AlbumDetails', {
            selectedAlbumId: item._id,
          });
        }}>
        <View
          style={{
            height: 110,
            width: '100%',
            paddingTop: 5,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: colors.primaryTextColor + '50',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
            }}>
            <View
              style={{
                flex: 1.3,
                height: '100%',
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
                height: '100%',
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
                      fontSize: 14,
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
                          fontSize: 13,
                          fontFamily: fontFamily.MontserratRegular,
                          marginLeft: 8,
                          color: colors.primaryTextColor,
                          fontWeight: '600',
                          marginBottom: -3,
                        }}>
                        {textContent.Cart.media_condition}:{' '}
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
                          fontSize: 13,
                          fontFamily: fontFamily.MontserratRegular,
                          marginLeft: 8,
                          color: colors.primaryTextColor,
                          fontWeight: '600',
                          marginTop: -3,
                        }}>
                        {textContent.Cart.sleeve_condition}:{' '}
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
                alignItems: 'flex-end',
              }}>
              <TouchableOpacity
                style={{marginTop: 10, marginRight: 15}}
                onPress={() => {
                  removeFromCart(item?._id);
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
          <View style={{height: 15}} />
        </View>
        <TouchableOpacity
          disabled={true}
          style={{
            width: '100%',

            height: 100,
          }}
          // onPress={() => {
          //   CartNavigation.navigate('FriendProfile', {
          //     userData: item?.otherData?.userId,
          //   });
          // }}
        >
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
                  justifyContent: 'flex-start',
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
                    {item?.addedBy == 'vendor'
                      ? item?.sellerId?.storeName
                      : item?.sellerId?.firstName +
                        ' ' +
                        item?.sellerId?.lastName}
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
                  flex: 1.5,
                  width: '100%',
                  justifyContent: 'center',
                  paddingRight: 10,
                }}>
                {item?.city && item?.city !== '' ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 3,
                      color: colors.primaryTextColor,
                      textAlign: 'right',
                      fontSize: 11.5,
                      letterSpacing: 1,

                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    {textContent?.Cart?.buy_from}
                  </Text>
                ) : null}
                {item?.city && item?.city !== '' ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 2,
                      color: colors.primaryTextColor,
                      textAlign: 'right',
                      fontSize: 13,
                      letterSpacing: 1,

                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    {item?.city}
                  </Text>
                ) : null}
              </View>

              <View
                style={{
                  flex: 1,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 12,
                  paddingRight: 5,
                }}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  {/* <View
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
                      {textContent?.Cart?.amount}
                    </Text>
                  </View> */}
                  <View
                    style={{
                      marginLeft: 5,

                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 21,
                        letterSpacing: 1,
                        fontFamily: fontFamily.MontserratBold,
                      }}>
                      {`\u20AC${getPrice(parseFloat(item?.cost))}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderPage = () => {
    return (
      <View style={{flex: 1, width: '100%'}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          // ListHeaderComponent={
          //   <>
          //     <SortView
          //       initial={spinner}
          //       visible={cartList.length > 0}
          //       setFilterType={type => {
          //         getSortedArray(cartList, type, persistStorage).then(
          //           result => {
          //             setCartList(result);
          //             setExtra(extra + 1);
          //           },
          //         );
          //       }}
          //     />
          //   </>
          // }
          ListEmptyComponent={
            initialLoading && (
              <>
                <View
                  style={{
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{
                      marginTop: 55,
                      marginBottom: 5,
                      width: 150,
                      height: 150,
                      tintColor: colors.primaryTextColor,
                    }}
                    resizeMode={'contain'}
                    source={imagepath.emptycart}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 20,
                      fontFamily: fontFamily.MontserratBold,
                      color: colors.primaryTextColor,
                      marginBottom: 10,
                    }}>
                    {textContent.Cart.hmm}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 14,
                      fontFamily: fontFamily.MontserratMedium,
                      marginBottom: 40,
                      color: colors.primaryTextColor,
                    }}>
                    {textContent.Cart.empty_cart}
                  </Text>
                  <MainButton
                    backgroundColor={colors.primaryButtonColor}
                    style={{
                      height: 35,
                      paddingHorizontal: 5,
                      borderRadius: 10,
                      backgroundColor: colors.red,
                      shadowColor: colors.shadowColor,
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}
                    textStyle={{
                      color: colors.black,

                      letterSpacing: 0.5,
                      paddingVertical: 2,
                      fontFamily: fontFamily.MontserratRegular,
                    }}
                    fontSize={16}
                    title={textContent.Cart.empty_button}
                    onPress={() => {
                      if (
                        HomeNavigation?.homeNavigationRef?.getCurrentRoute()
                          ?.name == 'CartStack' ||
                        ProfileNavigation?.profileNavigationRef?.getCurrentRoute()
                          ?.name == 'CartStack' ||
                        MapNavigation?.mapNavigationRef?.getCurrentRoute()
                          ?.name == 'CartStack'
                      ) {
                        if (
                          CartNavigation.cartNavigationRef.getCurrentRoute()
                            .name == 'Cartscreen'
                        ) {
                          if (
                            BottomNavigation?.navigationRef?.getCurrentRoute()
                              ?.name == 'HOME'
                          ) {
                            HomeNavigation.reset('HomeScreen');
                          } else if (
                            BottomNavigation?.navigationRef?.getCurrentRoute()
                              ?.name == 'PROFILE'
                          ) {
                            BottomNavigation.reset('HOME');
                            //ProfileNavigation.pop();
                          } else if (
                            BottomNavigation?.navigationRef?.getCurrentRoute()
                              ?.name == 'WAXMAP'
                          ) {
                            BottomNavigation.reset('HOME');
                            // MapNavigation.pop();
                          }
                        }
                      }
                    }}
                  />
                </View>
              </>
            )
          }
          listKey={(item, index) => `_key${index.toString()}`}
          data={cartList}
          extraData={extra}
          style={{marginTop: 10, paddingBottom: 50}}
          contentContainerStyle={{paddingTop: 20, paddingBottom: 50}}
          ListFooterComponent={
            <>
              {spinner && (
                <ActivityIndicator
                  size={'small'}
                  style={{marginTop: '20%'}}
                  color={colors.spinner}
                />
              )}
              {searchText == '' && initial == true && totalValue !== 0 ? (
                <View style={{marginTop: 10}}>
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
                          marginRight: 4,
                        }}>
                        <Text
                          style={{
                            color: colors.primaryTextColor,
                            fontSize: 18,
                            fontFamily: fontFamily.MontserratRegular,
                          }}>
                          {textContent.Cart.total}
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
                            fontSize: 24,
                            letterSpacing: 1,
                            fontFamily: fontFamily.MontserratBold,
                          }}>
                          {`\u20AC${getPrice(parseFloat(totalValue))}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: 40,
                      alignSelf: 'center',
                      borderTopWidth: 0.6,
                      borderColor: colors.borderColor + '40',
                      width: '85%',
                    }}
                  />
                  <View
                    style={{
                      marginTop: 40,
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}>
                    <View
                      style={{
                        marginLeft: 15,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      <Image
                        style={{
                          width: 35,
                          height: 35,
                          alignSelf: 'center',
                          tintColor: darkMode ? colors.primaryTextColor : '',
                        }}
                        source={imagepath.token1}></Image>

                      <Text
                        style={{
                          color: colors.primaryTextColor,
                          fontSize: 16,
                          marginLeft: 10,
                          fontFamily: fontFamily.MontserratBold,
                        }}>
                        {textContent.Cart.free_token}
                      </Text>
                      <CheckBox
                        title={
                          <Text
                            style={{
                              color: colors.primaryTextColor,
                              textAlign: 'right',
                              fontSize: 16,
                              marginLeft: 5,
                              fontFamily: fontFamily.MontserratRegular,
                            }}>
                            {textContent.Cart.have_sharecode}
                          </Text>
                        }
                        onPress={() => {
                          setShareCodeDialog(true);
                        }}
                        checked={shareCodeCheckValue}
                        checkedIcon={
                          <Image
                            style={{
                              height: 25,
                              width: 25,
                              tintColor: '#6084d0',
                            }}
                            source={imagepath.radiochecked}
                          />
                        }
                        uncheckedIcon={
                          <Image
                            style={{
                              height: 25,
                              width: 25,
                              tintColor: '#6084d0',
                            }}
                            source={imagepath.radiounchecked}
                          />
                        }
                        containerStyle={{
                          backgroundColor: colors.transparent,
                          borderWidth: 0,
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      width: '100%',
                      height: 50,
                      marginTop: 10,
                      flexDirection: 'row',
                      paddingHorizontal: 8,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <MainButton
                        fontSize={16.5}
                        backgroundColor={colors.gray}
                        style={{
                          width: '95%',
                          height: 40,
                          borderRadius: 8,

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
                          fontFamily: fontFamily.MontserratMedium,
                        }}
                        onPress={() => {
                          gotoNext(true);
                        }}
                        title={'Store Pickup'}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <MainButton
                        fontSize={16.5}
                        backgroundColor={colors.primaryButtonColor}
                        style={{
                          width: '95%',

                          borderRadius: 8,
                          height: 40,
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
                          fontFamily: fontFamily.MontserratMedium,
                        }}
                        onPress={() => {
                          gotoNext(false);
                        }}
                        title={'Delivery'}
                      />
                    </View>
                  </View>
                </View>
              ) : null}
            </>
          }
          renderItem={({item, index}) =>
            renderCartItems(item, index)
          }></FlatList>
      </View>
    );
  };

  const gotoNext = async storeCheckoutCheck => {
    let data = cartList.map(data => ({...data, enable: true}));
    if (data.length > 0) {
      updateUserDetails({
        prop: 'cartDetails',
        value: {
          data,
          shareCode,
          shareCodeCheckValue,
          storeCheckoutCheck,
          vendorData: null,
          totalValue,
        },
      });

      if (storeCheckoutCheck) {
        CartNavigation.navigate('Mapscreen');
      } else {
        updateUserDetails({prop: 'transactionId', value: null});
        CartNavigation.navigate('DeliveryDetails');
      }
    } else {
      toast.show(textContent.Cart.select_to_continue);
    }
  };

  return (
    <SafeAreaView
      style={styles.maincontainer(colors)}
      keyboardShouldPersistTaps={'always'}
      scrollEnabled={false}>
      <Dialog
        visible={shareCodeDialog}
        onTouchOutside={() => {
          setShareCodeDialog(false);
          setShareCode('');
          setShareCodeCheckValue(false);
        }}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          padding: 0,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
            width: '100%',
            // height: '100%',
            marginBottom: normalize(35),
            paddingHorizontal: 20,
            paddingTop: 10,
            // paddingBottom: 20,
          }}>
          <View style={{width: '100%'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(18),
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.Cart.share_code}
            </Text>
          </View>
          <View style={{width: '95%'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(16),
                marginTop: normalize(20),
                marginBottom: normalize(8),
                letterSpacing: 0.5,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.Cart.enter_share_code}
            </Text>
          </View>
          <View
            style={{
              width: '100%',

              justifyContent: 'center',
            }}>
            <View
              style={{
                borderRadius: 12,
                backgroundColor: colors.searchBarColor,
                elevation: 4,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}>
              <TextInput
                style={{
                  width: '95%',
                  height: normalize(47),
                  color: colors.primaryTextColor,
                  paddingLeft: normalize(10),
                  fontSize: normalize(14),
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                }}
                placeholder={''}
                value={shareCode}
                onChangeText={text => {
                  setShareCodeCheckValue(false);
                  setShareCode(text);
                }}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
            {shareCodeError ? (
              <Text
                style={{
                  marginLeft: 10,
                  marginTop: 5,
                  width: '100%',
                  fontFamily: fontFamily.MontserratRegular,
                  color: colors.red,
                  fontSize: 12,
                }}>
                {textContent.Cart.share_code_error}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              marginTop: normalize(30),
            }}>
            <View
              style={{
                flex: 1,
                // height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  minWidth: '90%',
                  height: normalize(40),
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.premiumGray,
                  backgroundColor: colors.secondaryBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                }}
                onPress={() => {
                  setShareCodeDialog(false);
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.Cart.cancel}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,

                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  minWidth: '90%',
                  height: normalize(40),
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
                onPress={() => {
                  checkShareCodeCheck(shareCode);
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.black,
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.Cart.apply}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Dialog>

      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.Cart.search_text
        }
      />

      {renderPage()}

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
    paddingBottom: Platform.OS == 'ios' ? 20 : 55,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(CartScreen);
