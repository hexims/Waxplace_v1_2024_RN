import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import fontFamily from '../utils/FontFamily';
import {normalize} from '../components/NormalizeFonts';
import imagepath from '../utils/Images';
import {CheckBox} from 'react-native-elements';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  FlatList,
  Platform,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
const {width, height} = Dimensions.get('window');
// Use iPhone6 as base size which is 375 x 667
const baseWidth = width;
const baseHeight = height;
const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);
import {Dialog} from 'react-native-simple-dialogs';
import _ from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage} from '../actions/GenericAPI';
import {SortView} from '../components/SortView';
import {isMatch} from '../actions/HelperFunctions';
import {connect} from 'react-redux';
import {
  profileDetails,
  getUserSaleProducts,
  saleProductEnableStatus,
  saleProductFeatureStatus,
} from '../actions/UserAPI';
import ProgressLoader from '../components/ProgressLoader';
import {DarkModeContext} from '../components/DarkModeContext';
import {useFocusEffect} from '@react-navigation/native';
import {useKeyboard} from '../utils/UseKeyBoard';
import ModalSelector from '../components/ModalSelectorInput';
import {
  createSaleProductCopy,
  deleteSaleVendorProduct,
  setDefaultProduct,
} from '../actions/SaleFlowAPI';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const options = [
  {label: 'All', value: 'all'},
  {label: 'Sub-section 1', value: 'sub1'},
  {label: 'Sub-section 2', value: 'sub2'},
  {label: 'Sub-section 3', value: 'sub3'},
];

const items = [
  {id: 1, name: 'Item 1', section: 'sub1'},
  {id: 2, name: 'Item 2', section: 'sub2'},
  {id: 3, name: 'Item 3', section: 'sub3'},
  {id: 4, name: 'Item 4', section: 'sub1'},
];

const Collections = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [onModalOpen, setOnModalOpen] = useState(false);
  const [feautrePopupActivate, setFeaturePopupActivate] = useState(false);
  const [feautrePopupDeActivate, setFeaturePopupDeActivate] = useState(false);
  const [collectionSelected, setCollectionSelected] = useState('');
  const [collectionIndex, setCollectionIndex] = useState('');
  const [profile, setProfile] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [initial, setInitial] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [functionCall, setFunctionCall] = useState('');
  const [collectionsArray, setCollectionsArray] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState('all');
  const [barCode, setBarCode] = useState('all');
  const [sortValue, setSortValue] = useState('newest');

  const [extra, setExtra] = useState(0);

  const [hideComponent, setHideComponent] = useState(false);

  const handleScroll = event => {
    const {contentOffset, layoutMeasurement, contentSize} = event.nativeEvent;
    const isEndReached =
      contentOffset.y + layoutMeasurement.height + 50 >= contentSize.height;

    setHideComponent(isEndReached);
  };

  useEffect(() => {
    const backAction = () => {
      if (BottomNavigation?.navigationRef?.getCurrentRoute()?.name == 'HOME') {
        HomeNavigation.popN(1);
      } else {
        ProfileNavigation.reset('Profilescreen');
      }
      return false;
    };

    // Add the event listener for the back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setCollectionsArray([]);
      mountFunction();

      return () => {};
    }, []),
  );

  useEffect(() => {
    if (!initial) {
      setCollectionsArray([]);
      mountFunction();
    }
  }, [sortValue]);

  const getcost = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const removeDuplicates = (array, key) => {
    let unique = {};
    let result = [];
    for (let i = 0; i < array.length; i++) {
      let value = array[i][key];
      if (!unique[value]) {
        unique[value] = true;
        result.push(array[i]);
      }
    }
    return result;
  };

  const getuserCollections = (reload = true) => {
    getUserSaleProducts(null, sortValue)
      .then(response => {
        if (response.status == 'success') {
          let collectionsArray = [];
          let optionsArray = [];
          optionsArray.push({
            key: 0,
            label: 'ALL',
            value: 'all',
            barCode: 'all',
          });
          response.saleProducts.map((res, index) => {
            if (res.isSold == false) {
              optionsArray.push({
                key: index + 1,
                label: res.albumName?.toUpperCase(),
                value: res.albumName,
                barCode: res?.barCode,
              });

              collectionsArray.push(res);
            }
          }),
            setOptions(
              removeDuplicates(optionsArray, 'barCode').map((value, index) => {
                return {...value, label: index + 1 + '. ' + value.label};
              }),
            );
          if (reload) {
            onValueChange('all', 'all');
          }

          setCollectionsArray(collectionsArray);
          setExtra(extra + 1);
        }
        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const mountFunction = () => {
    profileDetails().then(response => {
      setProfile(response.user);
    });

    getuserCollections(false);
  };

  const changeSaleProductFeatureStatus = (
    saleProductId,
    status,
    item,
    index,
  ) => {
    setSpinner(true);
    saleProductFeatureStatus(saleProductId, status)
      .then(response => {
        if (response?.status == 'success') {
          let cArray = collectionsArray;
          let featureStatus = item.isFeatured;
          setFeaturePopupActivate(false);
          setFeaturePopupDeActivate(false);
          if (featureStatus == false) {
            setProfile(prev => ({
              ...prev,
              purchaseTokens: prev.purchaseTokens - 1,
            }));
          }

          cArray.splice(index, 1, {
            ...item,
            tokenConsumed: featureStatus
              ? item.tokenConsumed
              : item.tokenConsumed + 1,
            isFeatured: !item.isFeatured,
          });
          setSpinner(false);
          setCollectionsArray(cArray);
          setExtra(extra + 1);

          toast.show(response.message);
        } else {
          setSpinner(false);
          toast.show(response.message);
        }
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const changeSaleProductEnableStatus = (
    saleProductId,
    status,
    item,
    index,
  ) => {
    setSpinner(true);
    saleProductEnableStatus(saleProductId, status)
      .then(response => {
        if (response.status == 'success') {
          let cArray = collectionsArray;
          cArray.splice(index, 1, {
            ...item,
            isEnabled: !item.isEnabled,
          });
          setSpinner(false);
          setCollectionsArray(cArray);
          setExtra(extra + 1);
        } else {
          setSpinner(false);
          toast.show(response.message);
        }
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const renderCollectionData = (item, index) => {
    if (
      !isMatch(
        item,
        [
          'artist',
          'albumName',
          'label',
          'mediaCondition',
          'sleveCondition',
          'year',
          'cost',
        ],
        searchText,
      ) ||
      (item.barCode !== barCode && selectedValue != 'all')
    ) {
      return null;
    }

    return (
      <View
        style={{
          width: '95%',
          flexDirection: 'row',
          borderRadius: 12,
          backgroundColor: colors.cardColor,
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          marginTop: 5,
          marginBottom: 5,
          flexDirection: 'row',
          alignSelf: 'center',
        }}>
        {(selectedValue !== 'all' || item.isDefault) && (
          <View
            style={{
              backgroundColor: colors.cardColor,
              borderRadius: 50,
              borderWidth: 0,
              position: 'absolute',
              zIndex: 1500,
              top: -3,
              left: -8,
              padding: 4,
            }}>
            <CheckBox
              disabled={selectedValue == 'all'}
              onPress={() => {
                if (!item.isDefault) {
                  let jsonData = {id: item?._id, barCode: item?.barCode};
                  setDefaultProduct(jsonData)
                    .then(response => {
                      if (response.status == 'success') {
                        setCollectionsArray(
                          collectionsArray.map((value, idx) => {
                            if (value.barCode == barCode) {
                              if (index == idx) {
                                return {...value, isDefault: true};
                              }
                              return {...value, isDefault: false};
                            } else {
                              return value;
                            }
                          }),
                        );
                      }
                    })
                    .catch(err => {});
                }
              }}
              checked={item?.isDefault}
              checkedIcon={
                <Image
                  style={{
                    height: 25,
                    width: 25,
                    tintColor: '#6084d0',
                    backgroundColor: colors.cardColor,
                    borderRadius: 15,
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
                    backgroundColor: colors.cardColor,
                    borderRadius: 15,
                  }}
                  source={imagepath.radiounchecked}
                />
              }
              containerStyle={{
                borderRadius: 50,
                borderWidth: 0,
                position: 'absolute',
                zIndex: 1500,
                // top: -3,
                // left: -8,
                padding: 4,
              }}
            />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            left: 5,
            bottom: 5,
            zIndex: 1500,
            borderRadius: 50,
            overflow: 'hidden',
            // padding: 5,
            backgroundColor: colors.cardColor,
          }}>
          <View style={{justifyContent: 'center', borderRadius: 50}}>
            <ImageBackground
              imageStyle={{tintColor: colors.primaryTextColor}}
              style={{
                width: 23.5,
                height: 23.5,

                margin: 5,
                //marginTop: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={imagepath.token_container}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.primaryTextColor,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item.tokenConsumed}
              </Text>
            </ImageBackground>
          </View>
        </View>
        <View style={{flex: 4}}>
          <View
            style={{
              width: '99%',

              paddingVertical: 6,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <FastImage
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                alignSelf: 'center',
                marginTop: 9,
                backgroundColor: colors.bgGray,
              }}
              source={{
                ...getImage(item.thumbnailImage ?? item.images[0]),
                priority: FastImage.priority.normal,
              }}
            />
          </View>
        </View>
        <View style={{flex: 5, paddingVertical: 10, paddingLeft: 1}}>
          <View
            style={{
              width: '100%',
              overflow: 'hidden',
              flexDirection: 'row',
            }}>
            <View style={{height: '100%'}}>
              <Text
                numberOfLines={2}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 17,
                  fontFamily: fontFamily.MontserratMedium,
                  maxWidth: 120,
                }}>
                {item.artist}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  ProfileNavigation.navigate('CreateSaleProduct', {
                    from: 'Collections',
                    selectedAlbumDetails: item,
                  });
                  HomeNavigation.navigate('CreateSaleProduct', {
                    from: 'Collections',
                    selectedAlbumDetails: item,
                  });
                }}
                style={{marginLeft: 3}}>
                <Image
                  source={imagepath.edit}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: colors.primaryTextColor,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              marginTop: 2,
              width: '100%',

              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.primaryTextColor,
                fontSize: 16,
                fontFamily: fontFamily.MontserratRegular,
                maxWidth: 130,
              }}>
              {item.albumName}
            </Text>
          </View>

          <View style={{marginTop: 2}}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.primaryTextColor,
                fontSize: 13.5,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {item.label ? item.label + ',' : ''}
              {item.year}
            </Text>
          </View>
          <View style={{marginTop: 8}}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.primaryTextColor,
                fontSize: 12,
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.Checkout.media_condition}: {item.mediaCondition}
            </Text>
          </View>
          <View style={{marginTop: 2}}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.primaryTextColor,
                fontSize: 12,
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.Collections.sleeve_condition}: {item.sleveCondition}
            </Text>
          </View>
        </View>
        <View style={{flex: 3, paddingRight: 4, paddingTop: 0}}>
          <View
            style={{
              flex: 3,
              width: '100%',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingRight: 5,
            }}>
            <TouchableOpacity
              onPress={() => {
                let jsonData = {productId: item?._id};
                deleteSaleVendorProduct(jsonData)
                  .then(result => {
                    if (result.status == 'success') {
                      getuserCollections(false);
                    }
                    toast.show(result?.message);
                  })
                  .catch(err => {});
              }}>
              <Image
                source={imagepath.trash}
                style={{
                  height: 22,
                  width: 22,
                  marginTop: 4,
                  tintColor: colors.primaryTextColor,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 2,
              width: '100%',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingRight: 5,
            }}>
            <Text
              style={{
                marginTop: 4,
                color: colors.primaryTextColor,
                fontSize: 17,
                fontFamily: fontFamily.MontserratBold,
              }}>
              {`\u20AC${getcost(parseFloat(item.cost))}`}
            </Text>
          </View>

          <View
            style={{
              flex: 1.2,
              width: '100%',
              alignItems: 'flex-end',
              flexDirection: 'row',
              marginTop: 3,
              paddingRight: 5,
            }}>
            <View
              style={{
                flex: 2,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,
                  // paddingLeft: 2,
                  marginRight: 4,
                }}>
                {textContent.Collections.for_sale}
              </Text>
            </View>

            <View
              style={{
                height: '100%',
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    '',
                    item.isEnabled
                      ? textContent.Collections.remove_sales
                      : textContent.Collections.add_sales,
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel',
                      },
                      {
                        text: 'OK',
                        onPress: () =>
                          changeSaleProductEnableStatus(
                            item._id,
                            item.isEnabled ? false : true,
                            item,
                            index,
                          ),
                      },
                    ],
                  );
                }}
                style={{
                  backgroundColor:
                    item.isEnabled == true ? 'green' : colors.red,
                  height: 18,
                  width: 18,
                  borderRadius: 3,
                  //  marginBottom: 2.5,
                }}></TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              marginVertical: 2,
              width: '100%',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                backgroundColor: colors.primaryButtonColor,
                height: 25,
                width: '120%',
                borderRadius: 3,
                marginBottom: 6,
                marginLeft: -25,
                marginTop: 12,
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
                setCollectionSelected(item);
                setCollectionIndex(index);

                if (item.isFeatured) {
                  setFeaturePopupDeActivate(true);
                } else {
                  setFeaturePopupActivate(true);
                }
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.black,
                  fontSize: 14,
                }}>
                {item.isFeatured
                  ? textContent.Collections.active
                  : textContent.Collections.feature_now}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const onValueChange = (value, barCode) => {
    setExtra(extra + 1);
    setSelectedValue(value);
    setBarCode(barCode);
    setSpinner(false);
    // setTimeout(() => {
    //   setSpinner(false);
    // }, 2);
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', height: '100%'}}>
        <View
          style={{
            alignSelf: 'center',
            width: '95%',
            marginTop: 15,
            // marginBottom: 7,
            // marginLeft: 10,
            height: 42,
            //    alignItems: 'center',
            justifyContent: 'center',
            // borderWidth: 0.6,
            // borderColor: colors.primaryTextColor,
            paddingLeft: 5,
            alignContent: 'center',
            borderRadius: 20,
            backgroundColor: colors.searchBarColor,
            flexDirection: 'row',
            borderColor: colors.premiumGrayOne + '50',
            elevation: 2,
            shadowColor: colors.shadowColor,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
          }}>
          <View
            style={{
              flex: 1,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                if (
                  BottomNavigation?.navigationRef?.getCurrentRoute()?.name ==
                  'HOME'
                ) {
                  HomeNavigation.popN(2);
                } else {
                  ProfileNavigation.reset('Profilescreen');
                }
              }}>
              <Image
                resizeMode="contain"
                source={imagepath.backwaxswap}
                style={{
                  width: 28,
                  height: 28,
                  marginLeft: 10,
                  marginRight: 5,
                  tintColor: colors.primaryTextColor,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{flex: 10, height: '100%'}}>
            <ModalSelector
              colors={colors}
              search={false}
              data={options}
              listType={'FLATLIST'}
              style={{width: '100%'}}
              initValue={textContent.Collections.select_categories}
              searchText={textContent.general.search}
              supportedOrientations={['landscape']}
              accessible={true}
              scrollViewAccessibilityLabel={'Scrollable options'}
              cancelButtonAccessibilityLabel={
                textContent.Collections.cancel_button
              }
              onModalOpen={() => {
                setOnModalOpen(true);
              }}
              onModalClose={() => {
                setSpinner(false);
                setOnModalOpen(false);
              }}
              onChange={item => {
                setSpinner(true);
                onValueChange(item.value, item.barCode);
              }}>
              <View
                style={{height: '100%', width: '100%', flexDirection: 'row'}}>
                <View
                  style={{
                    flex: 5,
                    height: '100%',
                    justifyContent: 'center',
                    paddingLeft: 5,
                  }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      //width: '100%',
                      //  height: '100%',
                      color: colors.primaryTextColor,
                      paddingLeft: 10,
                      fontFamily: fontFamily.MontserratRegular,
                      fontSize: 16,
                      letterSpacing: 0.5,
                      backgroundColor: colors.transparent,
                    }}>
                    {selectedValue.toUpperCase()}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    resizeMode="contain"
                    source={
                      onModalOpen ? imagepath.arrowup : imagepath.arrowdown
                    }
                    style={{
                      height: 16,
                      width: 16,
                      tintColor: colors.primaryTextColor,
                    }}
                  />
                </View>
              </View>
            </ModalSelector>
          </View>
        </View>
        <View style={{flexDirection: 'row', width: '100%', height: 45}}>
          <View style={{flex: 3, justifyContent: 'center'}}>
            <SortView
              hideDistance={true}
              initial={initial}
              marginBottom={0}
              setFilterType={type => {
                setSortValue(type);
              }}
            />
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            {selectedValue !== 'all' && (
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  //width: '100%',

                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingHorizontal: 15,
                  flexDirection: 'row',
                }}
                onPress={() => {
                  let jsonData = {
                    barCode,
                  };
                  createSaleProductCopy(jsonData)
                    .then(result => {
                      if (result.status == 'success') {
                        toast.show('Album copy created');
                        getuserCollections(false);
                      }
                    })
                    .catch(err => {});
                }}>
                <Image
                  resizeMode="contain"
                  source={imagepath.plus}
                  style={{
                    height: 22,
                    width: 22,
                    tintColor: colors.primaryTextColor,
                  }}
                />
                <Text
                  style={{
                    marginLeft: 5,
                    color: colors.primaryTextColor,
                    fontSize: 14,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.Collections.button_text_one}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlatList
          onScroll={handleScroll}
          keyExtractor={item => item._id.toString()}
          data={collectionsArray}
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
          extraData={extra}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: useKeyboard()}}
          style={{marginTop: 10}}
          renderItem={({item, index}) =>
            renderCollectionData(item, index)
          }></FlatList>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={feautrePopupActivate}
        onTouchOutside={() => setFeaturePopupActivate(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          padding: 0,
          paddingTop: -0.05,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          overflow: 'hidden',
          backgroundColor: colors.secondaryBackground,
          paddingBottom: normalize(20),
          width: '100%',
          alignSelf: 'center',
        }}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <ImageBackground
            style={{
              width: '100%',
              height: 200,
              top: 0,
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            resizeMethod={'resize'}
            source={imagepath.headerblack}
            resizeMode="cover"></ImageBackground>
          <View style={{width: '100%', alignItems: 'center'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(23),
                alignSelf: 'center',
                marginTop: 15,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratBold,
                lineHeight: normalize(25),
              }}>
              {textContent.Collections.feature_item}
            </Text>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(23),
                alignSelf: 'center',
                marginVertical: 5,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratMedium,
                lineHeight: normalize(25),
              }}>
              {textContent.Collections.upgrade}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: normalize(20),
                //  width: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <ImageBackground
                imageStyle={{tintColor: colors.primaryTextColor}}
                style={{
                  minHeight: normalize(37),
                  minWidth: normalize(37),
                  marginRight: normalize(7),
                  alignSelf: 'center',
                  justifyContent: 'center',
                  padding: 5,
                  zIndex: 15000,
                  margin: 5,
                }}
                resizeMode={'contain'}
                source={imagepath.token_container}>
                <Text
                  style={{
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primaryTextColor,
                    margin: 15,
                  }}>
                  {profile?.purchaseTokens}
                </Text>
              </ImageBackground>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.grayShadeThree,
                  fontSize: normalize(16),

                  letterSpacing: 1,
                  textAlign: 'center',
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {textContent.Collections.tokens_available}
              </Text>
            </View>
          </View>
          <View
            style={{width: '100%', justifyContent: 'center', paddingBottom: 5}}>
            <TouchableOpacity
              style={{
                paddingVertical: normalize(5),
                paddingHorizontal: normalize(15),
                alignSelf: 'center',
                width: '70%',
                marginTop: normalize(30),
                marginBottom: 1,
                height: normalize(40),
                borderRadius: 10,
                backgroundColor: colors.primaryButtonColor,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
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
                if (profile?.purchaseTokens < 1) {
                  toast.show('Insufficient tokens to feature the product');
                } else {
                  changeSaleProductFeatureStatus(
                    collectionSelected._id,
                    collectionSelected.isFeatured ? false : true,
                    collectionSelected,
                    collectionIndex,
                  );
                }
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: colors.black,
                    fontSize:
                      Platform.OS == 'ios' ? normalize(12) : normalize(14.5),
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Collections.button_text_two}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={feautrePopupDeActivate}
        onTouchOutside={() => setFeaturePopupDeActivate(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          padding: 0,
          paddingTop: -0.05,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          overflow: 'hidden',
          backgroundColor: colors.secondaryBackground,
          paddingBottom: normalize(20),
          width: '100%',
          alignSelf: 'center',
        }}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <ImageBackground
            style={{
              width: '100%',
              height: 200,
              top: 0,
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            resizeMethod={'resize'}
            source={imagepath.headerblack}
            resizeMode="cover"></ImageBackground>
          <View style={{width: '100%', alignItems: 'center'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(23),
                alignSelf: 'center',
                marginTop: 15,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratBold,
                lineHeight: normalize(25),
              }}>
              {textContent.Collections.unfeature_item}
            </Text>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(23),
                alignSelf: 'center',
                marginVertical: 5,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratMedium,
                lineHeight: normalize(25),
              }}>
              {textContent.Collections.deactivate}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: normalize(20),
                //   width: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <ImageBackground
                imageStyle={{tintColor: colors.primaryTextColor}}
                style={{
                  minHeight: normalize(37),
                  minWidth: normalize(37),
                  marginRight: normalize(7),
                  alignSelf: 'center',
                  justifyContent: 'center',
                  padding: 5,
                  zIndex: 15000,
                  margin: 5,
                }}
                resizeMode={'contain'}
                source={imagepath.token_container}>
                <Text
                  style={{
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primaryTextColor,
                    margin: 15,
                  }}>
                  {profile?.purchaseTokens}
                </Text>
              </ImageBackground>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.grayShadeThree,
                  fontSize: normalize(16),
                  marginVertical: 15,
                  letterSpacing: 1,
                  textAlign: 'center',
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {textContent.Collections.tokens_available}
              </Text>
            </View>
          </View>
          <View
            style={{width: '100%', justifyContent: 'center', paddingBottom: 5}}>
            <TouchableOpacity
              style={{
                paddingVertical: normalize(5),
                paddingHorizontal: normalize(15),
                alignSelf: 'center',
                width: '70%',

                marginTop: normalize(30),
                marginBottom: 1,
                height: normalize(40),
                borderRadius: 10,
                backgroundColor: colors.primaryButtonColor,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}
              onPress={() =>
                changeSaleProductFeatureStatus(
                  collectionSelected._id,
                  collectionSelected.isFeatured ? false : true,
                  collectionSelected,
                  collectionIndex,
                )
              }>
              <View
                style={{
                  alignSelf: 'center',
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: colors.black,
                    fontSize:
                      Platform.OS == 'ios' ? normalize(12) : normalize(14.5),
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.Collections.button_text_three}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      {renderPage()}
      <ProgressLoader
        visible={spinner}
        isHUD={true}
        isModal={true}
        color={colors.spinner}
      />

      {HomeNavigation?.homeNavigationRef?.isFocused() && !hideComponent && (
        <TouchableOpacity
          style={{position: 'absolute', right: 0, bottom: '11%'}}
          onPress={() => {
            updateUserDetails({
              prop: 'selectedAlbumDetails',
              value: null,
            });
            HomeNavigation.reset('CreateSaleProduct');
          }}>
          <Image
            style={{width: 55, height: 95}}
            source={imagepath.weeklyadd}></Image>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 35,
    width: '100%',
  },
  inputAndroid: {
    height: 35,
    width: '100%',
    paddingLeft: 10,
  },
});

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  checkbox: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    padding: 2,
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Collections);
