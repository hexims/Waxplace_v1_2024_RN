import React, {useEffect, useMemo, useRef, useState} from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import {normalize} from '../components/NormalizeFonts';
import imagepath from '../utils/Images';
import RNFS from 'react-native-fs';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import ProgressLoader from '../components/ProgressLoader';
import {ScrollView} from 'react-native-gesture-handler';
import {Dialog} from 'react-native-simple-dialogs';
import ModalSelector from '../components/ModalSelectorInput';

import _ from 'lodash';
import ImagePicker from 'react-native-image-crop-picker';

import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {updateUserDetails} from '../redux/actions/UserAction';
import {connect} from 'react-redux';

import {
  changeToFloat,
  changeToNumber,
  checkPostalCodeInSpain,
} from '../actions/HelperFunctions';

import {
  addTokensToUser,
  profileDetails,
  saleProductFeatureStatus,
} from '../actions/UserAPI';
import {
  addSaleVendorProduct,
  editSaleVendorProduct,
  getCategories,
  saveImageToServer,
} from '../actions/SaleFlowAPI';

import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import ToggleWeight from '../components/selectWeight';
import {Dimensions} from 'react-native';
import {getImage} from '../actions/GenericAPI';

import {useKeyboard} from '../utils/UseKeyBoard';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {CardBottomSheet} from '../components/CardBottomSheet';
import {useIsFocused} from '@react-navigation/native';
import {checkPostalCodeCorreosDelivarable} from '../actions/_correosCalculations';
import {checkNearbyPostalCodes} from '../actions/_CorreosAPI';
import {FlatList} from 'react-native';
import ImageSelection from '../components/ImageSelection';

const CreateSaleProduct = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const isFocused = useIsFocused();
  const toast = useToast();

  const [albumName, setAlbumName] = useState('');
  const [artist, setArtist] = useState('');
  const [label, setLabel] = useState('');
  const [year, setYear] = useState('');
  const [categoriesArray, setCategoriesArray] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    categoryId: '',
    categoryName: '',
  });

  const [mediaConditionList, setMediaConditionList] = useState([
    {key: 1, label: 'Mint'},
    {key: 2, label: 'Near Mint'},
    {key: 3, label: 'Very Good +'},
    {key: 4, label: 'Very Good'},
    {key: 5, label: 'Fair'},
  ]);

  const [sleveConditionList, setSleveConditionList] = useState([
    {key: 1, label: 'Perfect'},
    {key: 2, label: 'Good'},
    {key: 3, label: 'Fair'},
    {key: 4, label: 'No sleeve'},
  ]);
  const [mediaCondition, setMediaCondition] = useState('Mint');
  const [sleveCondition, setSleveCondition] = useState('Perfect');
  const [cost, setCost] = useState('');
  const [currentTrack, setCurrentTrack] = useState('');
  const [trackArray, setTrackArray] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [weightValue, setWeightValue] = useState({
    weight: '300',
    volume: '400',
  });
  const [notes, setNotes] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [options, setOptions] = useState(false);
  const [profile, setProfile] = useState({});
  const [saleProductId, setSaleProductId] = useState('');
  const [paymentStarted, setPaymentStarted] = useState(false);
  //Token data
  const [token, setToken] = useState({
    token10: false,
    token20: false,
    token30: true,
  });

  const settingToken = data => {
    setToken(prevState => ({...prevState, ...data}));
  };

  const [purchaseTokens, setPurchaseTokens] = useState(0);
  const [isPopUp, setIsPopup] = useState(false);
  const [featureActive, setFeatureActive] = useState(false);
  const [featureWithSubscription, setFeatureWithSubscription] = useState(false);
  const [featureWithTokens, setFeatureWithTokens] = useState(false);
  const [featurePopup, setFeaturePopup] = useState(false);

  const [cameraPickDialog, setCameraPickDialog] = useState(false);
  const [extra, setExtra] = useState(0);
  const [selectedImageArray, setSelectedImageArray] = useState(
    new Array(8).fill(''),
  );
  const [selectedImagePos, setSelectedImagePos] = useState(0);
  const [hide, setHide] = useState(false);
  const scrollViewRef = useRef();
  const maxSize = 400 * 1024; // 400 KB

  useEffect(() => {
    mountFunction();
    return () => {
      setFeatureActive(false);
      setFeatureWithSubscription(false);
      setFeatureWithTokens(false);
      updateUserDetails({prop: 'spinner', value: false});
    };
  }, []);

  useEffect(() => {
    if (route?.params?.selectedAlbumDetails) {
      setAlbumName(route?.params?.selectedAlbumDetails?.albumName);
      setArtist(route?.params?.selectedAlbumDetails?.artist);
      setLabel(route?.params?.selectedAlbumDetails?.label);
      setYear(route?.params?.selectedAlbumDetails?.year);
      setMediaCondition(route?.params?.selectedAlbumDetails?.mediaCondition);
      setSleveCondition(route?.params?.selectedAlbumDetails?.sleveCondition);
      setCost(route?.params?.selectedAlbumDetails?.cost);
      setTrackArray(
        route?.params?.selectedAlbumDetails?.tracks?.map(item =>
          item.track ? item.track : item,
        ),
      );
      setVideoUrl(route?.params?.selectedAlbumDetails?.videoUrl);
      setNotes(route?.params?.selectedAlbumDetails?.notes);
      setSelectedImageArray(prevArray => [
        ...route?.params?.selectedAlbumDetails?.images?.map(value => value),
        ...prevArray.slice(route?.params?.selectedAlbumDetails?.images.length),
      ]);
      setPostalCode(route?.params?.selectedAlbumDetails?.postalCode);
    }
  }, [route?.params?.selectedAlbumDetails]);

  useEffect(() => {
    if (isPopUp) {
      setIsPopup(false);
      setProfile(userReducer?.profileDetails);
      setPurchaseTokens(userReducer?.profileDetails?.purchaseTokens);
      if (!userReducer.profileDetails?.isSubscribed) {
        if (!featurePopup || userReducer?.profileDetails?.purchaseTokens == 0) {
          setFeatureWithSubscription(true);
          setFeaturePopup(true);
        } else if (userReducer?.profileDetails?.purchaseTokens > 0) {
          setFeatureActive(true);
        } else {
          HomeNavigation?.navigate('Collections');
          ProfileNavigation?.navigate('Collections');
        }
      } else {
        if (userReducer?.profileDetails?.purchaseTokens > 0) {
          setFeatureActive(true);
        } else {
          setFeatureWithTokens(true);
        }
      }
    }
  }, [isPopUp]);

  useEffect(() => {
    if (userReducer?.transactionCompleted && paymentStarted) {
      updateUserDetails({prop: 'transactionCompleted', value: false});
      setIsPopup(true);
    }
  }, [userReducer?.transactionCompleted]);

  const handleScroll = event => {
    const maxScrollable =
      event.nativeEvent.contentSize.height -
      event.nativeEvent.layoutMeasurement.height;
    if (event.nativeEvent.contentOffset.y >= maxScrollable) {
      setHide(true);
    } else {
      setHide(false);
    }
  };

  const changeSaleProductFeatureStatus = saleProductId => {
    saleProductFeatureStatus(saleProductId, true)
      .then(response => {
        if (response.status == 'success') {
          setFeatureActive(false);
          HomeNavigation?.navigate('Collections');
          ProfileNavigation?.navigate('Collections');
          toast.show(response.message);
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {});
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      cropping: true,
      width: 300,
      height: 300,
      compressImageQuality: 0.7,
    }).then(image => {
      updateUserDetails({prop: 'spinner', value: true});
      setCameraPickDialog(false);

      let imageFileName = image.path.split('/').pop();

      RNFS.exists(image.path)
        .then(exists => {
          let imageFile = {
            uri: image.path,
            type: image.mime,
            name: imageFileName,
            size: image.size,
          };
          let jsonData = {image: imageFile};

          saveImageToServer(jsonData)
            .then(result => {
              if (result.status == 'success') {
                insertImage(result?.filename);
              } else {
                toast.show(textContent.general.general_error);
              }
              updateUserDetails({prop: 'spinner', value: false});
            })
            .catch(err => {
              updateUserDetails({prop: 'spinner', value: false});
              toast.show(textContent.general.general_error);
            });
        })
        .catch(error => {});
    });
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
      width: 300,
      height: 300,
      compressImageQuality: 0.7,
    }).then(image => {
      updateUserDetails({prop: 'spinner', value: true});
      let imageFileName = image.path.split('/').pop();

      let imageFile = {
        uri: image.path,
        type: image.mime,
        name: imageFileName,
        size: image.size,
      };

      setCameraPickDialog(false);
      RNFS.exists(image.path)
        .then(exists => {
          let jsonData = {image: imageFile};

          saveImageToServer(jsonData)
            .then(result => {
              if (result.status == 'success') {
                insertImage(result?.filename);
              } else {
                toast.show(textContent.general.general_error);
              }
              updateUserDetails({prop: 'spinner', value: false});
            })
            .catch(err => {
              updateUserDetails({prop: 'spinner', value: false});
              toast.show(textContent.general.general_error);
            });
        })
        .catch(error => {});
    });
  };

  const insertImage = imageName => {
    // Make a copy of the array
    const newArray = [...selectedImageArray];

    newArray.splice(selectedImagePos, 1, imageName);

    // Update the state with the modified array
    setSelectedImageArray(newArray);
    setExtra(extra + 1);
  };

  const mountFunction = () => {
    if (
      !route?.params?.selectedAlbumDetails &&
      userReducer?.profileDetails.postalCode
    ) {
      setPostalCode(userReducer?.profileDetails.postalCode);
    }
    getCategories()
      .then(response => {
        let categoriesArray = [];
      
        response.categories.map(res => {
          if (route?.params?.selectedAlbumDetails?.category?._id == res?._id) {
            setSelectedCategory({
              categoryId: res._id,
              categoryName: res.name,
            });
          }
          categoriesArray.push({
            key: res._id,
            label: res.name,
          });
        });
        if (
          selectedCategory?.categoryName == '' &&
          !route?.params?.selectedAlbumDetails?.category?._id
        ) {
          setSelectedCategory({
            categoryId: response.categories[0]._id,
            categoryName: response.categories[0].name,
          });
        }

        setCategoriesArray(categoriesArray);
      })
      .catch(error => {});

    profileDetails()
      .then(response => {
        if (response.status == 'success') {
          setProfile(response.user);

          setPurchaseTokens(response.user.purchaseTokens);
        }
      })
      .catch(error => {});
  };

  const hhmmssToSeconds = str => {
    let arr = str.split(':').map(Number);

    if (arr?.length == 3) {
      return arr[0] * 3600 + arr[1] * 60 + arr[2];
    } else {
      return arr[0] * 60 + arr[1];
    }
  };

  const secondsToHHMMSS = secondsData => {
    let hours = parseInt(secondsData / 3600, 10);
    let minutes = parseInt((secondsData / 60) % 60, 10);
    let seconds = parseInt((secondsData % 3600) % 60, 10);
    if (hours !== 0) {
      return [hours, minutes, seconds]
        .map(function (i) {
          return i.toString()?.length === 2 ? i : '0' + i;
        })
        .join(':');
    } else {
      return [minutes, seconds]
        .map(function (i) {
          return i.toString()?.length === 2 ? i : '0' + i;
        })
        .join(':');
    }
  };

  const getDuration = trackList => {
    let totalDuration = 0;
    trackList.map(val => {
      totalDuration += hhmmssToSeconds(val.duration);
    });
    return secondsToHHMMSS(totalDuration);
  };

  const isValidURL = string => {
    let res = string.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    );
    return res !== null;
  };

  const tokenUpdation = async (tokens, type, paymentIntent) => {
    if (token.token10 == true) {
      tokens = 10;
    } else if (token.token20 == true) {
      tokens = 20;
    } else if (token.token30 == true) {
      tokens = 30;
    }

    if (tokens !== 0) {
      updateUserDetails({prop: 'spinner', value: true});
      let jsonData = {
        tokens: tokens,
        type,
      };

      addTokensToUser(jsonData)
        .then(response => {
          if (response.status == 'success') {
            setProfile(response.user);

            updateUserDetails({prop: 'spinner', value: false});
            setPurchaseTokens(response.user.purchaseTokens);
            updateUserDetails({prop: 'cardDetails', value: null});
            updateUserDetails({prop: 'transactionId', value: null});
            setTimeout(() => {
              setFeatureActive(true);
            }, 100);
            toast.show(
              response?.message
                ? response?.message
                : textContent.general.general_error,
            );
          } else {
            if (!userReducer?.profileDetails?.isSubscribed) {
              setFeatureWithSubscription(true);
            } else {
              setFeatureWithTokens(true);
            }

            updateUserDetails({prop: 'spinner', value: false});
            toast.show(
              response?.message
                ? response?.message
                : textContent.general.general_error,
            );
          }
        })
        .catch(error => {
          if (!userReducer?.profileDetails?.isSubscribed) {
            setFeatureWithSubscription(true);
          } else {
            setFeatureWithTokens(true);
          }

          updateUserDetails({prop: 'spinner', value: false});
        });
    } else {
      toast.show('Select tokens');
    }
  };

  const addTokensUser = async tokens => {
    if (profile?.balance >= tokens) {
      tokenUpdation(tokens, 'wallet', null);
    } else {
      updateUserDetails({
        prop: 'paymentBottomSheet',
        value: {
          visible: true,
          type: 'purchaseToken',
          amount: tokens,
        },
      });
    }
  };

  const addSaleProduct = async () => {
    let city = '';
    let newVideoUrl = '';

    if (albumName == '') {
      toast.show(textContent.CreateSaleProduct.alert_albumName);
      return;
    }
    if (artist == '') {
      toast.show(textContent.CreateSaleProduct.alert_artist);
      return;
    }
    if (label == '') {
      toast.show(textContent.CreateSaleProduct.alert_label);
      return;
    }
    if (year == '' && isValidYear(year)) {
      toast.show(textContent.CreateSaleProduct.alert_year);
      return;
    }

    if (cost == '' || !/^-?\d+(\.\d{1,2})?$/.test(cost)) {
      toast.show(textContent.CreateSaleProduct.alert_cost);
      return;
    }
    if (!selectedCategory.categoryId) {
      toast.show(textContent.CreateSaleProduct.alert_category);
      return;
    }
    if (videoUrl !== '' && !isValidURL(videoUrl)) {
      toast.show(textContent.CreateSaleProduct.alert_videourl);
      return;
    }
    if (videoUrl !== '' && isValidURL(videoUrl)) {
      newVideoUrl = videoUrl?.startsWith('http')
        ? videoUrl
        : `http://${videoUrl}`;
    }

    let postalCodeCheck = checkPostalCodeInSpain(postalCode);
    if (postalCode == '' || !postalCodeCheck) {
      toast.show(textContent.EditProfile.alert_postalcode);
      return;
    }

    const islandsPattern = /^(07|35|38|51|52)\d{3}$/;
    if (postalCode == '' || islandsPattern.test(postalCode)) {
      toast.show(textContent.Registration.alert_postalcode_islands);
      return;
    }
    let correosDelivarable = await checkNearbyPostalCodes(postalCode);

    if (postalCode == '' || correosDelivarable.length == 0) {
      toast.show(textContent.CreateSaleProduct.alert_correos_postalCode);
      return;
    } else {
      city = correosDelivarable[0].city;
    }

    if (notes == '') {
      toast.show(textContent.CreateSaleProduct.alert_notes);
      return;
    }

    if (notes == '') {
      toast.show(textContent.CreateSaleProduct.alert_notes);
      return;
    }

    if (notes.length > 1000) {
      toast.show(textContent.CreateSaleProduct.alert_notes_length);
      return;
    }

    if (trackArray.length == 0) {
      toast.show(textContent.CreateSaleProduct.alert_tracks);
      return;
    }

    if (selectedImageArray[0] == '' || selectedImageArray[1] == '') {
      toast.show(textContent.CreateSaleProduct.alert_images);
      return;
    }
    // if (barcode == '' && !options) {
    //   toast.show( 'Enter album name');
    //   return;
    // }

    let jsonData = {
      albumName,
      artist,
      label,
      year,
      cost,
      category: selectedCategory.categoryId,
      mediaCondition,
      sleveCondition,
      videoUrl: newVideoUrl,
      notes,
      postalCode: postalCode,
      city,
      tracks: JSON.stringify(trackArray),
      volume_weight: JSON.stringify(weightValue),
      images: JSON.stringify(selectedImageArray.filter(x => x !== '')),
      // addedType: !options ? 'normal' : 'white label',
      //barcode: '12345678',
      //userReducer?.barcode,
    };
    if (route?.params?.from == 'Collections') {
      jsonData = {
        ...jsonData,
        id: route?.params?.selectedAlbumDetails?._id,
        isFeature: route?.params?.selectedAlbumDetails?.isFeatured,
      };
      editSaleVendorProduct(jsonData)
        .then(result => {
          if (result.status == 'success') {
            if (route?.params?.selectedAlbumDetails?.isFeatured) {
              ProfileNavigation?.navigate('Collections');
            } else {
              toast.show(result.message);

              if (purchaseTokens > 0) {
                setPaymentStarted(true);
                setIsPopup(true);

                setSaleProductId(route?.params?.selectedAlbumDetails?._id);
                settingToken({
                  token10: false,
                  token20: false,
                  token30: true,
                });

                setCameraPickDialog(false);
              } else {
                setPaymentStarted(true);
                setIsPopup(true);

                setSaleProductId(route?.params?.selectedAlbumDetails?._id);
                settingToken({
                  token10: false,
                  token20: false,
                  token30: true,
                });

                setCameraPickDialog(false);
              }
            }
          } else {
            if (result.message) {
              alert('', result.message);
            } else {
              toast.show(textContent.general.general_error);
            }
          }
        })
        .catch(err => {});
    } else {
      jsonData = {...jsonData, isFeature: false};
      if (
        route?.params?.selectedAlbumDetails &&
        route?.params?.selectedAlbumDetails?.barCode
      ) {
        jsonData = {
          ...jsonData,
          barCode: route?.params?.selectedAlbumDetails?.barCode,
        };
      }
      addSaleVendorProduct(jsonData)
        .then(result => {
          if (result.status == 'success') {
            toast.show(result.message);
            if (purchaseTokens > 0) {
              setPaymentStarted(true);
              setIsPopup(true);

              setSaleProductId(result.newData._id);
              settingToken({
                token10: false,
                token20: false,
                token30: true,
              });

              setCameraPickDialog(false);
            } else {
              setPaymentStarted(true);
              setIsPopup(true);

              setSaleProductId(result.newData._id);
              settingToken({
                token10: false,
                token20: false,
                token30: true,
              });

              setCameraPickDialog(false);
            }
          } else {
            if (result.message) {
              alert('', result.message);
            } else {
              toast.show(textContent.general.general_error);
            }
          }
        })
        .catch(err => {});
    }
  };

  const GetImages = () => {
    const RenderImageView = React.memo(
      ({index}) => {
        const isDisabled = !(
          index === 0 ||
          index === 1 ||
          selectedImageArray[index - 1] !== ''
        );

        return (
          <View
            key={`image_${index}`}
            style={{
              width: Dimensions.get('window').width / 4 - 5,
              marginBottom: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              disabled={isDisabled}
              onPress={() => {
                setSelectedImagePos(index);
                setCameraPickDialog(true);
              }}>
              <View
                style={[
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  {borderRadius: 12, overflow: 'hidden'},
                ]}>
                <Image
                  style={{height: 70, width: 70}}
                  source={
                    selectedImageArray[index] !== ''
                      ? getImage(selectedImageArray[index])
                      : imagepath.addPic
                  }
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Text
                style={{
                  fontFamily: fontFamily.MontserratRegular,
                  color: colors.primaryTextColor,
                  fontSize: 13,
                }}>
                {index === 0 ? textContent.CreateSaleProduct.principal : ''}
              </Text>
            </View>
          </View>
        );
      },
      (prevProps, nextProps) => {
        // Compare the content of selectedImageArray
        return (
          prevProps.selectedImageArray.length ===
            nextProps.selectedImageArray.length &&
          prevProps.selectedImageArray[index] ===
            nextProps.selectedImageArray[index]
        );
      },
    );

    return (
      <View style={styles.container}>
        {[...Array(8)].map((_, index) => (
          <RenderImageView key={`image_${index}`} index={index} />
        ))}
      </View>
    );
  };

  // const GetImages = React.memo(
  //   ({selectedImageArray}) => {
  //     console.log('Component Rerendered')
  //     return (
  //       <View style={styles.container}>
  //         {[...Array(8)].map((_, index) => (
  //           <View
  //             style={{
  //               width: Dimensions.get('window').width / 4 - 5,
  //               marginBottom: 15,
  //               alignItems: 'center',
  //               justifyContent: 'center',
  //             }}>
  //             <TouchableOpacity
  //               disabled={
  //                 !(
  //                   index == 0 ||
  //                   index == 1 ||
  //                   selectedImageArray[index - 1] !== ''
  //                 )
  //               }
  //               key={index}
  //               onPress={() => {
  //                 setSelectedImagePos(index);
  //                 setCameraPickDialog(true);
  //               }}>
  //               <View
  //                 style={[
  //                   {
  //                     // width: '100%',
  //                     justifyContent: 'center',
  //                     alignItems: 'center',
  //                   },
  //                   selectedImageArray[index] &&
  //                     selectedImageArray[index] !== '' && {
  //                       borderRadius: 12,
  //                       overflow: 'hidden',
  //                     },
  //                 ]}>
  //                 <Image
  //                   style={[
  //                     {height: 70, width: 70},
  //                     !selectedImageArray[index] &&
  //                       selectedImageArray[index] == '' && {
  //                         tintColor: colors.primaryTextColor,
  //                       },
  //                   ]}
  //                   source={
  //                     selectedImageArray[index] &&
  //                     selectedImageArray[index] !== ''
  //                       ? getImage(selectedImageArray[index])
  //                       : imagepath.addPic
  //                   }
  //                 />
  //               </View>
  //             </TouchableOpacity>
  //             <View
  //               style={{
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 marginTop: 5,
  //               }}>
  //               <Text
  //                 style={{
  //                   fontFamily: fontFamily.MontserratRegular,
  //                   color: colors.primaryTextColor,
  //                   fontSize: 13,
  //                 }}>
  //                 {index == 0 ? textContent.CreateSaleProduct.principal : ''}
  //               </Text>
  //             </View>
  //           </View>
  //         ))}
  //       </View>
  //     );
  //   },
  //   (prevProps, nextProps) => {
  //     // Compare the content of selectedImageArray
  //     return (
  //       prevProps.selectedImageArray.length === nextProps.selectedImageArray.length &&
  //       prevProps.selectedImageArray.every(
  //         (value, index) => value === nextProps.selectedImageArray[index]
  //       )
  //     );
  //   }
  // );

  // const GetImages = ({ selectedImageArray, setSelectedImagePos, setCameraPickDialog }) => {
  //     console.log('Component Rerendered', selectedImageArray);

  //     const renderImageView = (index) => {
  //       const isDisabled =
  //         !(index === 0 || index === 1 || selectedImageArray[index - 1] !== '');

  //       return (
  //         <View
  //           key={`image_${index}`}
  //           style={{
  //             width: Dimensions.get('window').width / 4 - 5,
  //             marginBottom: 15,
  //             alignItems: 'center',
  //             justifyContent: 'center',
  //           }}
  //         >
  //           <TouchableOpacity
  //             disabled={isDisabled}
  //             onPress={() => {
  //               setSelectedImagePos(index);
  //               setCameraPickDialog(true);
  //             }}
  //           >
  //             <View
  //               style={[
  //                 {
  //                   // width: '100%',
  //                   justifyContent: 'center',
  //                   alignItems: 'center',
  //                 },
  //                 selectedImageArray[index] && selectedImageArray[index] !== ''
  //                   ? { borderRadius: 12, overflow: 'hidden' }
  //                   : {
  //                     tintColor: colors.primaryTextColor,
  //                   },
  //               ]}
  //             >
  //               <Image
  //                 style={{ height: 70, width: 70 }}
  //                 source={
  //                   selectedImageArray[index] && selectedImageArray[index] !== ''
  //                     ? getImage(selectedImageArray[index])
  //                     : imagepath.addPic
  //                 }
  //               />
  //             </View>
  //           </TouchableOpacity>
  //           <View
  //             style={{
  //               justifyContent: 'center',
  //               alignItems: 'center',
  //               marginTop: 5,
  //             }}
  //           >
  //             <Text
  //               style={{
  //                 fontFamily: fontFamily.MontserratRegular,
  //                 color: colors.primaryTextColor,
  //                 fontSize: 13,
  //               }}
  //             >
  //               {index === 0 ? textContent.CreateSaleProduct.principal : ''}
  //             </Text>
  //           </View>
  //         </View>
  //       );
  //     };

  //     return (
  //       <View style={styles.container}>
  //         {[...Array(8)].map((_, index) => renderImageView(index))}
  //       </View>
  //     );
  //   };

  function arePropsEqual(prevProps, nextProps) {
    // Compare the props and return true if they are equal, false otherwise.
    // For your case, you can use the array comparison logic here.

    return (
      prevProps.selectedImageArray.length ===
        nextProps.selectedImageArray.length &&
      prevProps.selectedImageArray.every(
        (value, index) => value === nextProps.selectedImageArray[index],
      )
    );
  }
  const isValidYear = year => {
    const yearRegex = /^[0-9]{4}$/;
    return yearRegex.test(year);
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={featureWithSubscription}
        onTouchOutside={() => {
          setFeatureWithSubscription(false);
          HomeNavigation?.navigate('Collections');
          ProfileNavigation?.navigate('Collections');
        }}
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
              height: 180,
              top: 0,
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            resizeMethod={'resize'}
            source={imagepath.headerblack}
            resizeMode="stretch"></ImageBackground>
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
              {textContent.CreateSaleProduct.feature_item}
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
              {textContent.CreateSaleProduct.upgrade}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginVertical: normalize(10),
                width: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <Image
                style={{
                  width: normalize(37),
                  height: normalize(37),
                  marginRight: normalize(7),
                  alignSelf: 'center',
                  tintColor: colors.primaryTextColor,
                }}
                source={imagepath.token1}></Image>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.grayShadeThree,
                  fontSize: normalize(16),

                  letterSpacing: 1,
                  textAlign: 'center',
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {textContent.CreateSaleProduct.appear_tokens}
              </Text>
            </View>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(23),
                alignSelf: 'center',
                marginVertical: 10,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratBold,
                lineHeight: normalize(25),
              }}>
              {textContent.CreateSaleProduct.twentfour_hour}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                color: colors.grayShadeThree,
                fontSize: normalize(16),
                letterSpacing: 1,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratBold,
                marginTop: normalize(7),
              }}>
              {textContent.CreateSaleProduct.feature_vinyl}
            </Text>
            <TouchableOpacity
              style={{
                marginBottom: -15,
                paddingHorizontal: normalize(15),
                alignSelf: 'center',
                marginTop: normalize(15),
                height: normalize(40),
                width: '90%',
                borderRadius: normalize(10),
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
                setFeatureWithSubscription(false);
                updateUserDetails({
                  prop: 'paymentBottomSheet',
                  value: {
                    visible: true,
                    type: 'subscription',
                    amount: 5,
                  },
                });
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
                    fontSize: normalize(16),
                    fontFamily: fontFamily.MontserratBold,
                    letterSpacing: 1,
                  }}>
                  {textContent.CreateSaleProduct.button_text_one}
                </Text>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: colors.black,
                    fontSize: normalize(16),
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {` ${textContent.CreateSaleProduct.pm}`}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{width: '100%', justifyContent: 'center'}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '90%',

                marginBottom: normalize(10),
                alignSelf: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flex: 3,
                  height: 1,
                  borderBottomWidth: 1,
                  borderColor: colors.gray,
                }}></View>
              <View style={{flex: 1.5}}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: normalize(20),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratBold,
                    textAlign: 'center',

                    lineHeight: normalize(25),
                  }}>
                  {textContent.CreateSaleProduct.or}
                </Text>
              </View>
              <View
                style={{
                  flex: 3,
                  height: 1,
                  borderBottomWidth: 1,
                  borderColor: colors.gray,
                }}></View>
            </View>
            <Text
              style={{
                marginTop: 5,
                marginBottom: normalize(10),
                color: colors.primaryTextColor,
                fontSize: normalize(20),
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratBold,
                textAlign: 'center',

                lineHeight: normalize(25),
              }}>
              {textContent.CreateSaleProduct.purchase_tokens}
            </Text>
            <View
              style={{
                height: '15%',
                width: '90%',
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: normalize(15),
              }}>
              <View
                style={{
                  flex: 1,
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      token.token10 == true
                        ? darkMode
                          ? colors.gray + '90'
                          : colors.lightGreen
                        : darkMode
                        ? colors.blackShadeOne
                        : colors.secondaryBackground,
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '85%',
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    height: normalize(30),
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    settingToken({
                      token10: true,
                      token20: false,
                      token30: false,
                    });
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      alignSelf: 'center',
                      fontSize: normalize(13),
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.CreateSaleProduct.ten_tokens}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.primaryTextColor,
                    marginTop: normalize(3),
                  }}>
                  {''}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      token.token20 == true
                        ? darkMode
                          ? colors.gray + '90'
                          : colors.lightGreen
                        : darkMode
                        ? colors.blackShadeOne
                        : colors.secondaryBackground,
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '85%',
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    height: normalize(30),
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    settingToken({
                      token10: false,
                      token20: true,
                      token30: false,
                    });
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      alignSelf: 'center',
                      fontSize: normalize(14),
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.CreateSaleProduct.twenty_tokens}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.gray,
                    marginTop: normalize(3),
                  }}>
                  {textContent.CreateSaleProduct.save28}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      token.token30 == true
                        ? darkMode
                          ? colors.gray + '90'
                          : colors.lightGreen
                        : darkMode
                        ? colors.blackShadeOne
                        : colors.secondaryBackground,
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '85%',
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    height: normalize(30),
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    settingToken({
                      token10: false,
                      token20: false,
                      token30: true,
                    });
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      alignSelf: 'center',
                      fontSize: normalize(14),
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.CreateSaleProduct.thirty_tokens}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.gray,
                    marginTop: normalize(3),
                  }}>
                  {textContent.CreateSaleProduct.save39}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                paddingVertical: normalize(5),
                paddingHorizontal: normalize(15),
                alignSelf: 'center',
                marginTop: 15,
                marginBottom: 35,
                height: normalize(40),
                width: '90%',
                borderRadius: normalize(10),
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
                let tokens = 0;
                if (token.token10 == true) {
                  tokens = 10;
                } else if (token.token20 == true) {
                  tokens = 20;
                } else if (token.token30 == true) {
                  tokens = 30;
                }
                setFeatureWithSubscription(false);
                addTokensUser(tokens);
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.black,
                  fontSize: normalize(16),
                  fontFamily: fontFamily.MontserratBold,
                  letterSpacing: 1,
                }}>
                {textContent.CreateSaleProduct.button_text_two}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={featureWithTokens}
        onTouchOutside={() => {
          setFeatureWithTokens(false);
          HomeNavigation?.navigate('Collections');
          ProfileNavigation?.navigate('Collections');
        }}
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
              {textContent.CreateSaleProduct.feature_item}
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
              {textContent.CreateSaleProduct.upgrade}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: normalize(20),
                width: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <Image
                style={{
                  width: normalize(37),
                  height: normalize(37),
                  marginRight: normalize(7),
                  alignSelf: 'center',
                  tintColor: colors.primaryTextColor,
                }}
                source={imagepath.token1}></Image>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.grayShadeThree,
                  fontSize: normalize(16),

                  letterSpacing: 1,
                  textAlign: 'center',
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {textContent.CreateSaleProduct.appear_tokens}
              </Text>
            </View>
          </View>
          <View
            style={{width: '100%', justifyContent: 'center', paddingBottom: 5}}>
            <Text
              style={{
                marginTop: 5,
                marginBottom: normalize(10),
                color: colors.primaryTextColor,
                fontSize: normalize(23),
                alignSelf: 'center',
                fontFamily: fontFamily.MontserratBold,
                textAlign: 'center',

                lineHeight: normalize(25),
              }}>
              {textContent.CreateSaleProduct.purchase_tokens}
            </Text>
            <View
              style={{
                height: '15%',
                width: '90%',
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: normalize(15),
              }}>
              <View
                style={{
                  flex: 1,
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      token.token10 == true
                        ? darkMode
                          ? colors.gray + '90'
                          : colors.lightGreen
                        : darkMode
                        ? colors.blackShadeOne
                        : colors.secondaryBackground,
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '85%',
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    height: normalize(30),
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    settingToken({
                      token10: true,
                      token20: false,
                      token30: false,
                    });
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      alignSelf: 'center',
                      fontSize: normalize(13),
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.CreateSaleProduct.ten_tokens}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.primaryTextColor,
                    marginTop: normalize(3),
                  }}>
                  {''}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      token.token20 == true
                        ? darkMode
                          ? colors.gray + '90'
                          : colors.lightGreen
                        : darkMode
                        ? colors.blackShadeOne
                        : colors.secondaryBackground,
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '85%',
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    height: normalize(30),
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    settingToken({
                      token10: false,
                      token20: true,
                      token30: false,
                    });
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      alignSelf: 'center',
                      fontSize: normalize(14),
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.CreateSaleProduct.twenty_tokens}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.gray,
                    marginTop: normalize(3),
                  }}>
                  {textContent.CreateSaleProduct.save28}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      token.token30 == true
                        ? darkMode
                          ? colors.gray + '90'
                          : colors.lightGreen
                        : darkMode
                        ? colors.blackShadeOne
                        : colors.secondaryBackground,
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '85%',
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    height: normalize(30),
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    settingToken({
                      token10: false,
                      token20: false,
                      token30: true,
                    });
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      alignSelf: 'center',
                      fontSize: normalize(14),
                      fontFamily: fontFamily.MontserratMedium,
                      letterSpacing: 1,
                    }}>
                    {textContent.CreateSaleProduct.thirty_tokens}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    alignSelf: 'center',
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.gray,
                    marginTop: normalize(3),
                  }}>
                  {textContent.CreateSaleProduct.save39}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                paddingVertical: normalize(5),
                paddingHorizontal: normalize(15),
                alignSelf: 'center',
                marginTop: normalize(30),
                marginBottom: 15,
                height: normalize(40),
                width: '90%',
                borderRadius: normalize(10),
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
                let tokens = 0;
                if (token.token10 == true) {
                  tokens = 10;
                } else if (token.token20 == true) {
                  tokens = 20;
                } else if (token.token30 == true) {
                  tokens = 30;
                }
                setFeatureWithTokens(false);
                addTokensUser(tokens);
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.black,
                  fontSize: normalize(16),
                  fontFamily: fontFamily.MontserratBold,
                  letterSpacing: 1,
                }}>
                {textContent.CreateSaleProduct.button_text_two}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={featureActive}
        onTouchOutside={() => {
          setFeatureActive(false);
          HomeNavigation?.navigate('Collections');
          ProfileNavigation?.navigate('Collections');
        }}
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
              {textContent.CreateSaleProduct.feature_item}
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
              {textContent.CreateSaleProduct.upgrade}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: normalize(20),
                //width: '100%',
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
                  {purchaseTokens}
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
                {textContent.CreateSaleProduct.tokens_available}
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
                if (purchaseTokens > 0) {
                  changeSaleProductFeatureStatus(saleProductId);
                } else {
                  toast.show(textContent.CreateSaleProduct.insufficient_tokens);
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
                  {textContent.CreateSaleProduct.button_text_three}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={cameraPickDialog}
        onTouchOutside={() => setCameraPickDialog(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          width: '90%',
          backgroundColor: colors.secondaryBackground,

          alignSelf: 'center',
        }}>
        <View
          style={{
            borderRadius: 10,

            alignItems: 'center',

            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: '100%',
              justifyContent: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  openCamera();
                }, 1000);
              } else {
                openCamera();
              }
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.CreateSaleProduct.camera}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: normalize(15),
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  pickImage();
                }, 1000);
              } else {
                pickImage();
              }
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.CreateSaleProduct.gallery}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={false}
        placeHolderCondition={
          route?.params?.from == 'Collections'
            ? textContent.CreateSaleProduct.edit_album
            : textContent.CreateSaleProduct.add_album
        }
        showCart={false}
      />
      <View
        style={{
          width: '100%',
          flex: 1,
          paddingBottom: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 9,
            width: '100%',
            paddingHorizontal: 5,
            backgroundColor: fontFamily.bgColor,
          }}>
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 100}}>
            <View style={{flex: 1, width: '100%'}}>
              <View style={{alignItems: 'center'}}>
                {/* <GetImages/> */}
                <View style={{height: 205, width: '100%', marginTop: 20}}>
                  <View style={{flex: 1, width: '100%', flexDirection: 'row'}}>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        pos={0}
                        image={selectedImageArray[0]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[0] == ''}
                        pos={1}
                        image={selectedImageArray[1]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[1] == ''}
                        pos={2}
                        image={selectedImageArray[2]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[2] == ''}
                        pos={3}
                        image={selectedImageArray[3]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                  </View>
                  <View style={{flex: 1, width: '100%', flexDirection: 'row'}}>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[3] == ''}
                        pos={4}
                        image={selectedImageArray[4]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[4] == ''}
                        pos={5}
                        image={selectedImageArray[5]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[5] == ''}
                        pos={6}
                        image={selectedImageArray[6]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                    <View style={{flex: 1, width: '100%'}}>
                      <ImageSelection
                        disabled={selectedImageArray[6] == ''}
                        pos={7}
                        image={selectedImageArray[7]}
                        setSelectedImagePos={pos => {
                          setSelectedImagePos(pos);
                        }}
                        setCameraPickDialog={() => {
                          setCameraPickDialog(true);
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={{paddingHorizontal: 15}}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 10,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.albumName}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                  }}>
                  <View style={{flex: 4, height: '100%'}}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 18,
                        letterSpacing: 1,
                        // paddingLeft: 5,
                        color: colors.primaryTextColor,
                        alignSelf: 'center',
                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={albumName}
                      onChangeText={value => {
                        setAlbumName(value);
                      }}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.artist}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                  }}>
                  <View style={{flex: 4, height: '100%'}}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 18,
                        letterSpacing: 1,
                        //   paddingLeft: 5,
                        color: colors.primaryTextColor,
                        alignSelf: 'center',
                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={artist}
                      onChangeText={value => {
                        setArtist(value);
                      }}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.label}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                  }}>
                  <View style={{flex: 4, height: '100%'}}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 18,
                        letterSpacing: 1,
                        //  paddingLeft: 5,
                        color: colors.primaryTextColor,
                        alignSelf: 'center',
                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={label}
                      onChangeText={value => {
                        setLabel(value);
                      }}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>

                <View
                  style={{width: '100%', flexDirection: 'row', marginTop: 15}}>
                  <View style={{width: '40%'}}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 12,
                        alignSelf: 'flex-start',
                        marginLeft: 10,
                        // marginTop: 12,
                        fontFamily: fontFamily.MontserratMedium,
                      }}>
                      {textContent.CreateSaleProduct.year}
                    </Text>
                    <View
                      style={{
                        width: '100%',
                        marginTop: 7,
                        height: 45,
                        alignItems: 'center',
                        alignContent: 'center',
                        paddingLeft: 5,
                        backgroundColor: colors.searchBarColor,
                        borderWidth: 1,
                        borderColor: colors.borderColor + '90',
                        borderRadius: 8,
                      }}>
                      <TextInput
                        style={{
                          width: '100%',
                          height: '100%',
                          fontSize: 18,

                          letterSpacing: 1,
                          color: colors.primaryTextColor,
                          alignSelf: 'center',
                          fontFamily: fontFamily.MontserratRegular,
                          backgroundColor: colors.transparent,
                        }}
                        value={year}
                        keyboardType={'numeric'}
                        onChangeText={value => {
                          setYear(changeToNumber(value));
                        }}
                        placeholderTextColor={
                          colors.primaryTextColor
                        }></TextInput>
                    </View>
                  </View>
                  <View style={{width: '60%', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 12,
                        alignSelf: 'flex-start',
                        marginLeft: 18,
                        // marginTop: 12,
                        fontFamily: fontFamily.MontserratMedium,
                      }}>
                      {textContent.CreateSaleProduct.category}
                    </Text>
                    <View
                      style={{
                        width: '95%',
                        marginTop: 7,
                        // marginLeft: 10,
                        height: 45,
                        //    alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-end',
                        paddingLeft: 5,
                        alignContent: 'center',
                        backgroundColor: colors.searchBarColor,
                        borderWidth: 1,
                        borderColor: colors.borderColor + '90',
                        borderRadius: 8,
                      }}>
                      <ModalSelector
                        colors={colors}
                        data={categoriesArray}
                        listType={'FLATLIST'}
                        style={{width: '100%'}}
                        initValue={
                          textContent.CreateSaleProduct.select_categories
                        }
                        searchText={textContent.general.search}
                        supportedOrientations={['landscape']}
                        accessible={true}
                        scrollViewAccessibilityLabel={'Scrollable options'}
                        cancelButtonAccessibilityLabel={'Cancel Button'}
                        onChange={item => {
                          setSelectedCategory({
                            categoryId: item.key,
                            categoryName: item.label,
                          });
                        }}>
                        <View
                          style={{
                            height: '100%',
                            width: '100%',
                            justifyContent: 'center',
                          }}>
                          <Text
                            numberOfLines={1}
                            ellipsizeMode={'tail'}
                            style={{
                              // width: '100%',
                              //  height: '100%',
                              color: colors.primaryTextColor,
                              paddingHorizontal: 8,
                              fontFamily: fontFamily.MontserratRegular,
                              fontSize: 16,
                              letterSpacing: 0.5,
                              backgroundColor: colors.transparent,
                            }}>
                            {selectedCategory?.categoryName}
                          </Text>
                        </View>
                      </ModalSelector>
                    </View>
                  </View>
                </View>
                <View
                  style={{width: '100%', flexDirection: 'row', marginTop: 15}}>
                  <View style={{width: '50%'}}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 12,
                        alignSelf: 'flex-start',
                        marginLeft: 10,
                        // marginTop: 12,
                        fontFamily: fontFamily.MontserratMedium,
                      }}>
                      {textContent.CreateSaleProduct.mediacondition}
                    </Text>
                    <View
                      style={{
                        width: '95%',
                        marginTop: 7,
                        // marginLeft: 10,
                        height: 45,
                        //    alignItems: 'center',
                        justifyContent: 'center',
                        //  paddingLeft: 5,
                        alignContent: 'center',
                        backgroundColor: colors.searchBarColor,
                        borderWidth: 1,
                        borderColor: colors.borderColor + '90',
                        borderRadius: 8,
                      }}>
                      <ModalSelector
                        colors={colors}
                        search={false}
                        data={mediaConditionList}
                        listType={'FLATLIST'}
                        style={{width: '100%'}}
                        initValue={
                          textContent.CreateSaleProduct.select_categories
                        }
                        searchText={textContent.general.search}
                        supportedOrientations={['landscape']}
                        accessible={true}
                        scrollViewAccessibilityLabel={'Scrollable options'}
                        cancelButtonAccessibilityLabel={'Cancel Button'}
                        onChange={item => {
                          setMediaCondition(item.label);
                        }}>
                        <View
                          style={{
                            height: '100%',
                            width: '100%',
                            justifyContent: 'center',
                          }}>
                          <Text
                            numberOfLines={1}
                            ellipsizeMode={'tail'}
                            style={{
                              //width: '100%',
                              //  height: '100%',
                              color: colors.primaryTextColor,
                              paddingHorizontal: 8,
                              fontFamily: fontFamily.MontserratRegular,
                              fontSize: 16,
                              letterSpacing: 0.5,
                              backgroundColor: colors.transparent,
                            }}>
                            {mediaCondition}
                          </Text>
                        </View>
                      </ModalSelector>
                    </View>
                  </View>
                  <View style={{width: '50%', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontSize: 12,
                        alignSelf: 'flex-start',
                        marginLeft: 14,
                        // marginTop: 12,
                        fontFamily: fontFamily.MontserratMedium,
                      }}>
                      {textContent.CreateSaleProduct.sleevecondition}
                    </Text>
                    <View
                      style={{
                        width: '95%',
                        marginTop: 7,
                        // marginLeft: 10,
                        height: 45,
                        //    alignItems: 'center',
                        justifyContent: 'center',
                        //   paddingLeft: 5,
                        alignContent: 'center',
                        backgroundColor: colors.searchBarColor,
                        borderWidth: 1,
                        borderColor: colors.borderColor + '90',
                        borderRadius: 8,
                      }}>
                      <ModalSelector
                        colors={colors}
                        search={false}
                        data={sleveConditionList}
                        listType={'FLATLIST'}
                        style={{width: '100%'}}
                        initValue={
                          textContent.CreateSaleProduct.select_categories
                        }
                        searchText={textContent.general.search}
                        supportedOrientations={['landscape']}
                        accessible={true}
                        scrollViewAccessibilityLabel={'Scrollable options'}
                        cancelButtonAccessibilityLabel={'Cancel Button'}
                        onChange={item => {
                          setSleveCondition(item.label);
                        }}>
                        <View
                          style={{
                            height: '100%',
                            width: '100%',
                            justifyContent: 'center',
                          }}>
                          <Text
                            numberOfLines={1}
                            ellipsizeMode={'tail'}
                            style={{
                              //width: '100%',
                              //  height: '100%',
                              color: colors.primaryTextColor,
                              paddingHorizontal: 8,
                              fontFamily: fontFamily.MontserratRegular,
                              fontSize: 16,
                              letterSpacing: 0.5,
                              backgroundColor: colors.transparent,
                            }}>
                            {sleveCondition}
                          </Text>
                        </View>
                      </ModalSelector>
                    </View>
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.cost}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      height: '100%',
                      paddingLeft: 15,
                      paddingRight: -2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      style={{
                        height: 14,
                        width: 14,
                        tintColor: colors.primaryTextColor,
                      }}
                      source={imagepath.euro}
                      resizeMode={'contain'}
                    />
                  </View>
                  <View style={{flex: 4, height: '100%', paddingLeft: 5}}>
                    <TextInput
                      style={{
                        // width: '95%',
                        height: '100%',
                        fontSize: 18,
                        letterSpacing: 1,

                        color: colors.primaryTextColor,
                        //  alignSelf: 'center',
                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={cost.replace('.', ',')}
                      onChangeText={value => {
                        setCost(changeToFloat(value).replace(',', '.'));
                      }}
                      keyboardType={'numeric'}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.tracks}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                  }}>
                  <View style={{flex: 4, height: '100%'}}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 16,
                        letterSpacing: 1,
                        paddingLeft: 15,
                        color: colors.primaryTextColor,

                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={currentTrack}
                      onChangeText={value => {
                        setCurrentTrack(value);
                      }}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                  <View
                    style={{
                      height: '100%',
                      width: 45,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        if (currentTrack !== '') {
                          setTrackArray([...trackArray, currentTrack]);
                          setCurrentTrack('');
                        }
                      }}
                      style={{zIndex: 1500}}>
                      <Image
                        style={{
                          height: 22,
                          width: 22,
                          tintColor: colors.primaryTextColor,
                        }}
                        source={imagepath.plus}
                        resizeMode={'contain'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {trackArray.map((value, index) => {
                  return (
                    <View
                      style={{
                        width: '100%',
                        height: 45,
                        marginTop: 15,
                        marginBottom: index == trackArray.length - 1 ? 15 : 0,
                        alignItems: 'center',
                        alignContent: 'center',
                        backgroundColor: colors.searchBarColor,
                        borderWidth: 1,
                        borderColor: colors.borderColor + '90',
                        borderRadius: 8,
                        flexDirection: 'row',
                      }}>
                      <View
                        style={{
                          flex: 4,
                          height: '100%',
                          justifyContent: 'center',
                        }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode={'tail'}
                          style={{
                            width: '100%',
                            //  height: '100%',
                            fontSize: 18,
                            letterSpacing: 1,
                            paddingLeft: 15,
                            color: colors.primaryTextColor,

                            fontFamily: fontFamily.MontserratRegular,
                            backgroundColor: colors.transparent,
                          }}>
                          {value}
                        </Text>
                      </View>
                      <View
                        style={{
                          height: '100%',
                          width: 45,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            setTrackArray(
                              trackArray.filter((item, i) => i !== index),
                            );
                          }}
                          style={{zIndex: 1500}}>
                          <Image
                            style={{
                              height: 22,
                              width: 22,
                              tintColor: colors.primaryTextColor,
                            }}
                            source={imagepath.minus}
                            resizeMode={'contain'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.videourl}
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                  }}>
                  <View style={{flex: 4, height: '100%'}}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 18,
                        letterSpacing: 1,
                        paddingLeft: 15,
                        color: colors.primaryTextColor,
                        textAlign: 'left',
                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={videoUrl}
                      onChangeText={value => {
                        setVideoUrl(value);
                      }}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 10,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.EditProfile.postalcode}
                </Text>
                <View
                  style={{
                    width: '100%',
                    marginTop: 7,
                    // marginLeft: 10,
                    height: 45,
                    alignItems: 'center',
                    alignContent: 'center',
                    borderRadius: 8,
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                  }}>
                  <TextInput
                    style={{
                      width: '95%',
                      height: '100%',
                      fontSize: 18,
                      //  paddingLeft: 12,
                      letterSpacing: 1,
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratRegular,
                      alignSelf: 'center',
                      backgroundColor: colors.transparent,
                    }}
                    keyboardType={'number-pad'}
                    value={postalCode}
                    //  placeholder={'Last Name'}
                    onChangeText={value => setPostalCode(changeToNumber(value))}
                    placeholderTextColor={colors.primaryTextColor}></TextInput>
                </View>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                    marginLeft: 10,
                    marginTop: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {textContent.CreateSaleProduct.notes}
                </Text>
                <View
                  style={{
                    width: '100%',
                    // height: 45,
                    marginTop: 7,
                    alignItems: 'center',
                    alignContent: 'center',
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                    borderRadius: 8,
                    flexDirection: 'row',
                    marginBottom: 15,
                  }}>
                  <View style={{flex: 4, height: '100%'}}>
                    <TextInput
                      style={{
                        height: 'auto',
                        minHeight: 100,
                        width: '75%',
                        fontFamily: fontFamily.MontserratRegular,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        backgroundColor: colors.transparent,
                        textAlignVertical: 'top',
                        padding: 15,
                        justifyContent: 'flex-start',
                        color: colors.primaryTextColor,
                      }}
                      numberOfLines={4}
                      multiline={true}
                      value={notes}
                      onChangeText={value => {
                        setNotes(value);
                      }}
                      blurOnSubmit={false}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>

                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 20,
                    width: '100%',
                    marginTop: 10,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: fontFamily.MontserratMedium,
                      color: colors.gray,
                    }}>
                    {textContent.CreateSaleProduct.sizeweight}
                  </Text>
                </View>

                <ToggleWeight
                  colors={colors}
                  onSelect={value => {
                    let data =
                      value == 0
                        ? {weight: '300', volume: '400'}
                        : value == 1
                        ? {weight: '400', volume: '500'}
                        : {weight: '500', volume: '600'};
                    setWeightValue(data);
                  }}
                />

                <TouchableOpacity
                  style={{
                    marginTop: 25,
                    width: '100%',
                    height: 50,
                    backgroundColor: colors.primaryButtonColor,
                    borderRadius: 15,
                    justifyContent: 'center',

                    alignItems: 'center',
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
                    addSaleProduct();
                  }}>
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: 18,
                      letterSpacing: 1,
                      fontFamily: fontFamily.MontserratMedium,
                      alignSelf: 'center',
                    }}>
                    {textContent.CreateSaleProduct.button_text_five}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
  }),
  container: {
    marginTop: 15,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: Dimensions.get('window').width,
    height: 200,
  },

  image: {
    width: '50%',
    height: 100,
  },
  textAreaContainer: colors => ({
    width: '100%',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: Platform.OS == 'ios' ? '50%' : 0,
    borderWidth: 1,
    borderColor: colors.premiumGray + '80',
    backgroundColor: colors.searchBarColor,
  }),
  textArea: colors => ({
    height: 150,
    width: '75%',
    fontFamily: fontFamily.MontserratRegular,
    fontSize: 16,
    letterSpacing: 0.5,
    backgroundColor: colors.transparent,

    paddingLeft: 10,
    justifyContent: 'flex-start',
  }),
  checkbox: {
    alignSelf: 'center',
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(CreateSaleProduct);
