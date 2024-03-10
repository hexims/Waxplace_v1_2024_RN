import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  Dimensions,
  View,
  Text,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {getImage} from '../../actions/GenericAPI';
import AlbumItemComponent from '../../components/AlbumItem';
import {getLocation, modifyHomeData} from '../../actions/HelperFunctions';

import {
  getAll24HourAccess,
  getRandomPromotions,
  saleProductByCategories,
} from '../../actions/HomePageAPI';
import {normalize} from '../../components/NormalizeFonts';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
import {MainButton} from '../../components/MainButton';
import {SortView} from '../../components/SortView';
import {useContext} from 'react';
import {DarkModeContext} from '../../components/DarkModeContext';
import {useKeyboard} from '../../utils/UseKeyBoard';
import {FeaturedList} from './Featured';
import textContent from '../../utils/textContent';
import {debounce} from 'lodash';
import FastImage from 'react-native-fast-image';
import {useToast} from 'react-native-toast-notifications';
const WIDTH = Dimensions.get('window').width;

export const CategoryPage = ({
  userCategories,
  HomeNavigation,
  premium,
  exploreMore,
  userReducer,
  searchText,
  updateUserDetails,
  isHome,
  reloadValue,
  setHideComponent,
  hideComponent,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [extra, setExtra] = useState(0);
  const [number, setNumber] = useState(1);
  const [loadingEnabled, setLoadingEnabled] = useState(true);
  const [endReached, setEndReached] = useState(false);
  const [banners, setBanners] = useState([]);
  const [sortValue, setSortValue] = useState('newest');
  const [initial, setInitial] = useState(true);

  const flatListRef = useRef(null);

  const handleScroll = event => {
    const {contentOffset, layoutMeasurement, contentSize} = event.nativeEvent;
    const isEndReached =
      contentOffset.y + layoutMeasurement.height + 80 >= contentSize.height;
    if (isEndReached !== hideComponent) {
      setHideComponent(isEndReached);
    }
  };

  useEffect(() => {
    return () => {
      updateUserDetails({
        prop: 'categoryData',
        value: [
          [
            {type: 'banner', data: 'emptyLoader'},
            {type: 'banner', data: 'emptyLoader'},
          ],
          [
            {type: 'releases', data: 'emptyLoader'},
            {type: 'releases', data: 'emptyLoader'},
          ],
          [
            {type: 'releases', data: 'emptyLoader'},
            {type: 'releases', data: 'emptyLoader'},
          ],
        ],
      });
    };
  }, []);

  useEffect(() => {
    if (
      userReducer?.categoryData[0] &&
      userReducer?.categoryData[0][0] &&
      userReducer?.categoryData[0][0].data == 'emptyLoader'
    ) {
      flatListRef?.current?.scrollToOffset({offset: 0, animated: false});
    }
    setExtra(extra + 1);
  }, [userReducer?.categoryData]);

  useEffect(() => {
    if (number > 1) {
      setInitial(true);
    }
  }, [number]);

  // useEffect(() => {
  //   // Create a debounced version of the effect callback
  //   const debouncedEffect = debounce(() => {
  //     setExtra(0);
  //     setNumber(1);
  //     setLoadingEnabled(true);
  //     setEndReached(false);
  //     //  setBanners([]);
  //     if (searchText.length > 0) {
  //       updateUserDetails({
  //         prop: 'categoryData',
  //         value: [],
  //       });
  //     }

  //     if (userCategories.length > 0) {
  //       setInitial(true);
  //     }
  //   }, 800);

  //   // Invoke the debounced effect callback

  //   debouncedEffect();

  //   // Cleanup the debounced effect when the component unmounts or when dependencies change
  //   return () => {
  //     debouncedEffect.cancel();
  //   };
  // }, [searchText]);

  // useEffect(() => {
  //   if (reloadValue || !isHome) {
  //     setExtra(0);
  //     setNumber(1);
  //     setLoadingEnabled(true);
  //     setEndReached(false);
  //     //  setBanners([]);

  //     if (userCategories.length > 0) {
  //       setInitial(true);
  //     }
  //   }
  // }, [reloadValue]);

  const prevSearchText = useRef('');

  useEffect(() => {
    const effectCallback = () => {
      setExtra(0);
      setNumber(1);
      setLoadingEnabled(true);
      setEndReached(false);
      //  setBanners([]);
      if (searchText.length > 0) {
        updateUserDetails({
          prop: 'categoryData',
          value: [],
        });
      }

      if (userCategories.length > 0) {
        setInitial(true);
      }
    };

    if (searchText !== prevSearchText.current) {
      // Create a debounced version of the effect callback
      const debouncedEffect = debounce(effectCallback, 800);

      // Invoke the debounced effect callback
      debouncedEffect();

      // Cleanup the debounced effect when the component unmounts or when searchText changes
      return () => {
        debouncedEffect.cancel();
      };
    } else {
      // Call the effect immediately when reloadValue changes
      effectCallback();
    }

    // Update the previous value of searchText
    prevSearchText.current = searchText;
  }, [searchText, reloadValue]);

  useEffect(() => {
    if (initial && userCategories.length > 0) {
      getReleaseData();
      if (banners.length < 1) {
        getBannersData();
      }
    }
  }, [initial, userCategories]);

  useEffect(() => {
    if (userReducer?.categoryData.length > 0) {
      setExtra(0);
      setNumber(1);
      setLoadingEnabled(true);
      setEndReached(false);
      //setBanners([]);
      setInitial(true);
    }
    if (
      !initial &&
      userReducer?.categoryData[0] &&
      userReducer?.categoryData[0][0] &&
      userReducer?.categoryData[0][0]?.data !== 'emptyLoader'
    ) {
      updateUserDetails({
        prop: 'categoryData',
        value: [],
      });
    }
  }, [sortValue]);

  const getBannersData = useCallback(() => {
    if (banners.length == 0) {
      let jsonData = {type: 'home', category: JSON.stringify(userCategories)};
      getRandomPromotions(jsonData)
        .then(response => {
          setBanners(response.result.filter(value => value != null));
        })
        .catch(err => {});
    }
  }, [banners]);

  const getApiData = async () => {
    let data;
    if (premium) {
      let jsonData = {
        categories: '',
        size: 20,
        page: number,
        sortValue,
        searchText,
      };
      data = await getAll24HourAccess(jsonData);
    } else {
      let jsonData = {
        categories: JSON.stringify(userCategories),
        size: 20,
        page: number,
        sortValue,
        searchText,
      };

      data = await saleProductByCategories(jsonData);
    }

    return data;
  };

  const getReleaseData = () => {
    getApiData()
      .then(result => {
        if (Array.isArray(result)) {
          if (result.length < 20) {
            setEndReached(true);
          }

          const chunkedArray = result.reduce((acc, item, index) => {
            if (index % 2 === 0) {
              const chunk = result.slice(index, index + 2);
              if (chunk.length === 1) {
                chunk.push(null);
              }
              acc.push(chunk);
            }
            return acc;
          }, []);
          setLoadingEnabled(false);
          updateUserDetails({
            prop: 'categoryData',
            value:
              Array.isArray(userReducer?.categoryData[0]) &&
              userReducer?.categoryData[0][0].data == 'emptyLoader'
                ? chunkedArray
                : number == 1
                ? [...chunkedArray]
                : [...userReducer?.categoryData, ...chunkedArray],
          });
        } else {
          setLoadingEnabled(false);
        }
        setInitial(false);
      })
      .catch(err => {
        setLoadingEnabled(false);
        setInitial(false);
      });
  };
  function addHttpToUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url; // You can also use "https://" if needed
    }
    return url;
  }

  function isValidUrl(url) {
    // Regular expression for a valid URL with http:// or https://
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

    return urlPattern.test(url);
  }

  const onBannerPress = async selectedPromotion => {
    if (selectedPromotion.isUrl == 'url') {
      let url = addHttpToUrl(selectedPromotion.url);
      Linking.canOpenURL(url).then(supported => {
      

        if (supported) {
          Linking.openURL(url);
        } else {
          if (isValidUrl(url)) {
            Linking.openURL(url);
          } else {
            toast.show(textContent.homePage.not_openable);
          }
        }
      });
    } else if (
      selectedPromotion.isUrl == 'profile' ||
      selectedPromotion.isUrl == 'route'
    ) {
      let seller = selectedPromotion.vendorId ?? selectedPromotion?.userId;
      if (selectedPromotion?.vendorId) {
        let distanceFromCurrentLocation = await getLocation(seller);
        HomeNavigation.navigate('StoreDetails', {
          vendorData: seller,
          distance: distanceFromCurrentLocation,
        });
      } else if (selectedPromotion?.userId) {
        HomeNavigation?.navigate('FriendProfile', {
          userData: seller,
        });
      }
    } else if (
      selectedPromotion.isUrl == 'album' &&
      selectedPromotion.saleProductId
    ) {
      // updateUserDetails({
      //   prop: 'selectedAlbumId',
      //   value: selectedPromotion.saleProductId.albumId._id,
      // });
      HomeNavigation.navigate('AlbumDetails', {
        selectedAlbumId: selectedPromotion.saleProductId._id,
      });
    }
  };

  const renderItem = (item, index) => {
    const columns = item.map((val, idx) => {
      if (val == null) {
        return (
          <View
            style={{
              width: WIDTH / 2 - 5,
              justifyContent: 'center',
            }}
            key={idx}
          />
        );
      } else {
        return (
          <View
            style={{
              width: WIDTH / 2 - 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            key={idx}>
            <AlbumItemComponent
              saleProductIndex={idx}
              userReducer={userReducer}
              updateUserDetails={updateUserDetails}
              data={val}
              item={val}
              index={index}
              type={'categoryData'}
            />
          </View>
        );
      }
    });

    return (
      <>
        {(index == 0 || index % 2 == 0) &&
          item[index]?.data == 'emptyLoader' && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: index == 0 ? 0 : 0,
                marginBottom: 20,
              }}>
              <View
                style={{
                  width: '100%',
                  height: WIDTH / 3.2,
                  alignSelf: 'center',
                  justifyContent: 'center',

                  backgroundColor: colors.premiumGrayOne,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                  elevation: 2,
                }}>
                <View
                  style={{height: '100%', width: '100%', overflow: 'hidden'}}>
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
            </View>
          )}
        {(index == 0 || index % 10 == 0) &&
          item[index]?.data !== 'emptyLoader' &&
          searchText.length == 0 && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',

                justifyContent: 'center',
                marginTop: index == 0 ? 0 : 0,
                marginBottom: 20,
              }}
              onPress={() => {
                onBannerPress(banners[index % banners?.length]);
              }}>
              <View
                style={{
                  height: WIDTH / 3.2,
                  width: '100%',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.premiumGrayOne,
                  elevation: 4,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                }}>
                <FastImage
                  resizeMode={FastImage.resizeMode.contain} // Set resizeMode
                  style={{
                    width: WIDTH,
                    alignSelf: 'center',
                    height: WIDTH / 3.2,
                  }}
                  // defaultSource={getImage(
                  //   banners[index % banners?.length]?.image,
                  // )}
                  source={{
                    ...getImage(banners[index % banners?.length]?.image),
                    priority: FastImage.priority.normal, // Set the priority if needed
                  }}
                />
              </View>
            </TouchableOpacity>
          )}
        <View
          key={index}
          style={{
            width: Dimensions.get('window').width,
            flexDirection: 'row',
            marginBottom: 14,
            justifyContent: 'center',
          }}>
          {columns}
        </View>
      </>
    );
    //}
  };

  const footerComponent = () => {
    return (
      loadingEnabled == true && (
        <View style={{paddingVertical: 5, alignItems: 'center'}}>
          <ActivityIndicator color={colors.spinner} size={'small'} />
        </View>
      )
    );
  };
  return (
    <View>
      {(!isHome || searchText.length > 0) && (
        <SortView
          hideDistance={true}
          marginTop={8}
          marginBottom={16}
          visible={
            userReducer?.categoryData.length > 0 ||
            initial ||
            searchText.length > 0
          }
          setFilterType={type => {
            setSortValue(type);
          }}
        />
      )}
      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        ListHeaderComponent={
          <>
            {isHome && searchText.length == 0 && (
              <View style={{width: WIDTH, marginBottom: 15}}>
                <FeaturedList
                  updateUserDetails={updateUserDetails}
                  userCategories={userCategories}
                  HomeNavigation={HomeNavigation}
                  userReducer={userReducer}
                />
              </View>
            )}

            {premium && searchText.length == 0 && !isHome && (
              <View
                style={{
                  width: '100%',
                  marginTop: 10,
                  marginBottom: 20,
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    flex: 1.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,

                      letterSpacing: 1,
                      fontSize: normalize(24),
                      marginTop: 10,

                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.homePage.premium_items}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,

                      width: 147,
                      fontSize: normalize(30),
                      textAlign: 'center',
                      fontFamily: fontFamily.MontserratBold,
                    }}>
                    {textContent.homePage.premium_24}
                  </Text>
                </View>
              </View>
            )}
          </>
        }
        data={userReducer?.categoryData}
        contentContainerStyle={{
          alignItems: 'center',
          paddingBottom: useKeyboard() + (!isHome ? 140 : 90),
          //   paddingTop: 10,
        }}
        style={{width: '100%'}}
        extraData={extra}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => renderItem(item, index)}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (!loadingEnabled && !endReached) {
            setLoadingEnabled(true);
            setNumber(number + 1);
          }
        }}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={
          <>
            {searchText.length == 0 && !isHome && !loadingEnabled && (
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  alignItems: 'center',
                  paddingHorizontal: 15,
                  marginTop: 20,
                }}>
                <Image
                  style={{
                    marginTop: 20,
                    marginBottom: 18,
                    width: 160,
                    height: 145,
                  }}
                  resizeMode={'contain'}
                  source={imagepath.noItems}
                />

                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    fontFamily: fontFamily.MontserratMedium,
                    marginBottom: 30,
                    color: colors.primaryTextColor,
                  }}>
                  {textContent.homePage.empty_text}
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
                  title={textContent.homePage.button_text}
                  onPress={() => {
                    exploreMore();
                  }}
                />
              </View>
            )}
          </>
        }
      />
    </View>
  );
};
