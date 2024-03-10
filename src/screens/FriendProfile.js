import React, {useEffect, useState, useContext} from 'react';

import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';

import _ from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage} from '../actions/GenericAPI';
import {SortView} from '../components/SortView';
import {isMatch} from '../actions/HelperFunctions';
import {addProductToUserCart} from '../actions/PurchaseFlowAPI';
import {
  profileDetails,
  addFriendToUser,
  getUserSaleProducts,
  removeFriendForUser,
} from '../actions/UserAPI';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const FriendProfile = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [saleProductsList, setSaleProductsList] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [userData, setUserData] = useState(null);
  const [extra, setExtra] = useState(0);
  const [initial, setInitial] = useState(true);
  const [sortValue, setSortValue] = useState('newest');

  useEffect(() => {
    updateUserDetails({
      prop: 'showFriendProfile',
      value: {toggle: false, params: {}},
    });
    setSaleProductsList([]);
    mountFunction();
  }, [sortValue]);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const addToCart = saleProductId => {
    let jsonData = {saleProductId: saleProductId};
    addProductToUserCart(jsonData)
      .then(response => {
        if (response.message) {
          toast.show(response.message);
        }
      })
      .catch(error => {});
  };

  const mountFunction = () => {
    setInitial(true);
    setUserData(route?.params?.userData);

    profileDetails()
      .then(response => {
        if (response.status == 'success') {
          let friends = response.user.friends;

          friends.some(value => {
            if (value._id == route?.params?.userData?._id) {
              setIsFriend(true);
              return;
            }
          });
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {});

    getUserSaleProducts(route?.params?.userData?._id, sortValue)
      .then(response => {
        let saleProductsList = [];
        if (Array.isArray(response.saleProducts)) {
          response.saleProducts.map(res => {
            saleProductsList.push({
              ...res,
            });
          });
        }

        setSaleProductsList(saleProductsList);

        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const addtoFriends = () => {
    if (!isFriend) {
      let jsonData = {sellerId: route?.params?.userData._id};

      addFriendToUser(jsonData)
        .then(response => {
          if (response.status === 'success') {
            setIsFriend(true);
            //toast.show( response.message);
          } else {
            toast.show(response.message);
          }
        })
        .catch(error => {});
    } else {
      let jsonData = {sellerId: route?.params?.userData._id};
      removeFriendForUser(jsonData)
        .then(response => {
          if (response.status === 'success') {
            setIsFriend(false);
          } else {
            toast.show(response.message);
          }
        })
        .catch(error => {});
    }
  };

  const rendersalesItem = (item, index) => {
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
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 2,

          borderRadius: 10,
          backgroundColor: colors.cardColor,
          elevation: 4,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          marginTop: 10,
          flexDirection: 'row',
        }}>
        <View
          style={{
            padding: 10,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            style={{
              width: 105,
              height: 105,
              borderRadius: 10,
              alignSelf: 'center',
              backgroundColor: colors.secondaryBackground,
            }}
            source={
              item.thumbnailImage
                ? {...getImage(item.thumbnailImage)}
                : {...getImage(item?.images[0])}
            }
          />
        </View>
        <View style={{flex: 4}}>
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
                  color: colors.grayShadeThree,
                  fontSize: 18,
                  marginTop: 3,
                  fontFamily: fontFamily.MontserratRegular,
                  marginLeft: 8,
                }}>
                {item.artist}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeTwo,

                  fontSize: 13,
                  fontFamily: fontFamily.MontserratRegular,

                  marginLeft: 8,
                  letterSpacing: 0.5,
                }}>
                {item.albumName}
              </Text>

              <View style={{}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    color: colors.grayShadeTwo,
                    fontSize: 13,
                    marginLeft: 8,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item.label ? item.label + ',' : ''}
                  {item.year ? item.year : '2020'}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 2,
                height: '100%',
                paddingRight: 12,
                paddingTop: 10,
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                overflow: 'hidden',
              }}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={{
                  color: darkMode
                    ? colors.grayShadeThree
                    : colors.blackShadeOne,
                  fontSize: 16,
                  fontFamily: fontFamily.MontserratMedium,
                  marginTop: 2,
                }}>
                {`\u20AC${getPrice(parseFloat(item.cost ? item.cost : 0))}`}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 1.7,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View style={{flex: 1, height: '100%'}}>
              {item.mediaCondition ? (
                <View style={{}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 8,
                      color: colors.grayShadeOne,
                    }}>
                    {textContent.FriendProfile.media_condition}:{' '}
                    {item.mediaCondition}
                  </Text>
                </View>
              ) : null}
              {item.sleveCondition ? (
                <View style={{}}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.MontserratRegular,
                      marginLeft: 8,
                      color: colors.grayShadeOne,
                    }}>
                    {textContent.FriendProfile.sleeve_condition}:{' '}
                    {item.sleveCondition}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{flex: 1, height: '100%'}}>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  backgroundColor: colors.primaryButtonColor,
                  height: '75%',
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
                  addToCart(item._id);
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: colors.black,
                    fontSize: 11.5,
                    fontFamily: fontFamily.MontserratMedium,
                    textAlign: 'center',
                  }}>
                  {textContent.FriendProfile.button_text_one}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPage = () => {
    return (
      <View
        ediges={['top']}
        style={{width: '100%', height: '100%', position: 'relative'}}>
        <SearchBar
          backgroundColor={colors.searchBarColor + 'cc'}
          cartValue={userReducer.cartLength}
          searchEnabled={true}
          searchText={searchText}
          searchFunction={text => {
            setSearchText(text);
          }}
          placeHolderCondition={
            searchText !== '' ? '' : textContent.FriendProfile.search_text
          }
        />
        <FlatList
          data={saleProductsList}
          extraData={extra}
          ListFooterComponent={
            <>
              {initial && (
                <ActivityIndicator
                  size={'small'}
                  style={{marginTop: '15%'}}
                  color={colors.spinner}
                />
              )}
            </>
          }
          ListHeaderComponent={
            <>
              <View>
                <ImageBackground
                  source={getImage(
                    userData && userData.background_image
                      ? userData.background_image
                      : null,
                  )}
                  style={{
                    width: '100%',
                    height: 230,
                    backgroundColor: colors.bgGray,
                  }}>
                  <Image
                    style={{
                      width: '100%',
                      height: 60,
                      position: 'absolute',
                      bottom: 0,
                      tintColor: colors.primaryBackground,
                    }}
                    source={imagepath.bg_curve}></Image>
                </ImageBackground>

                <View
                  style={{
                    width: 100,
                    height: 100,
                    position: 'absolute',
                    bottom: 10,
                    marginBottom: -50,
                    alignSelf: 'center',
                  }}>
                  <FastImage
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 5,
                      borderColor: colors.secondaryBackground,
                      position: 'absolute',
                      backgroundColor: darkMode
                        ? colors.primaryBackground
                        : colors.bgGray,
                      bottom: 10,
                      alignSelf: 'center',
                    }}
                    source={
                      userData && userData.profile_image
                        ? {...getImage(userData.profile_image)}
                        : null
                    }
                  />
                </View>
              </View>

              <View
                style={{
                  width: '90%',
                  alignSelf: 'center',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    width: '100%',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 22,
                      letterSpacing: 1,
                      marginTop: 25,
                      fontWeight: '300',
                    }}>
                    {(userData && userData.firstName
                      ? userData.firstName
                      : '') +
                      ' ' +
                      (userData && userData.lastName ? userData.lastName : '')}
                  </Text>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      width: '95%',
                      alignSelf: 'center',
                      letterSpacing: 1,
                      fontSize: 15,
                      textAlign: 'center',
                      marginTop: 5,
                      fontWeight: '400',
                    }}>
                    {userData && userData.profileInfo
                      ? userData.profileInfo
                      : ''}
                  </Text>
                </View>
                <View style={{position: 'absolute', right: 0, top: 5}}>
                  <TouchableOpacity
                    onPress={() => {
                      addtoFriends();
                    }}>
                    <Image
                      style={{
                        width: isFriend ? 35 : 45,
                        height: isFriend ? 35 : 45,
                        marginRight: 5,
                        marginTop: 10,
                        alignSelf: 'flex-end',
                      }}
                      source={
                        isFriend ? imagepath.wishlistimage : imagepath.heart
                      }></Image>
                  </TouchableOpacity>
                </View>
              </View>
              <SortView
                hideDistance={true}
                marginBottom={10}
                // visible={saleProductsList.length > 0}
                setFilterType={type => {
                  setSortValue(type);
                }}
              />
            </>
          }
          showsVerticalScrollIndicator={false}
          style={{
            marginTop: 10,
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: -1,
          }}
          contentContainerStyle={{paddingBottom: 100}}
          renderItem={({item, index}) =>
            rendersalesItem(item, index)
          }></FlatList>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.maincontainer(colors)}>
      {renderPage()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(FriendProfile);
