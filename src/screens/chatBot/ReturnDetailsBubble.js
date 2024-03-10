import moment from 'moment';
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useReducer,
  useContext,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {getImage} from '../../actions/GenericAPI';
import {returnAlbum, saveReturnChat} from '../../actions/ReturnAPI';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
import ImagePicker from 'react-native-image-crop-picker';

import RNFetchBlob from 'rn-fetch-blob';
import mime from 'mime';
import ImageResizer from 'react-native-image-resizer';
import {CheckBox} from 'react-native-elements';
import {DarkModeContext} from '../../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../../utils/textContent';
import {audioFunctionality} from './audioFunctionality';
import {AudioBubble} from './AudioBubble';

export const ReturnDetailsBubble = ({
  _id,
  currentMessage,
  updateWaxbot,
  addAudio,
  addImage,
  userReducer,
  updateChat,
  updateUserDetails,
  returnInitiated,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [showContinue, setShowContinue] = useState(true);
  const [options, setOptions] = useState(false);
  const [imageOne, setImageOne] = useState('');
  const [imageTwo, setImageTwo] = useState('');
  const [imageThree, setImageThree] = useState('');
  const [imageOneFile, setImageOneFile] = useState('');
  const [imageTwoFile, setImageTwoFile] = useState('');
  const [imageThreeFile, setImageThreeFile] = useState('');
  const [audioData, setAudioData] = useState({});
  const [audioPath, setAudioPath] = useState('');
  const [recordToggle, setRecordToggle] = useState(false);
  const [playbackToggle, setPlaybackToggle] = useState(false);
  const [play, setPlay] = useState(false);
  const [initial, setInitial] = useState(true);
  const [fileNames, setFileNames] = useState([]);
  const [audioUri, setAudioUri] = useState('');
  const maxSize = 400 * 1024; // 400 KB

  useEffect(() => {
    const dirs = RNFetchBlob.fs.dirs;

    const path = Platform.select({
      ios: `${dirs.CacheDir}/` + 'audio_' + new Date().getTime() + '.m4a',
      android: `${dirs.CacheDir}/` + 'audio_' + new Date().getTime() + '.mp3',
    });

    setAudioPath(path);
  }, []);

  audioFunctionality(
    audioPath,

    audioData,
    data => {
      setAudioData(data);
    },
    audioUri,
    data => {
      setAudioUri(data);
    },
    recordToggle,
    playbackToggle,
    play,
  );

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const openCamera = type => {
    const options = {
      cropping: true,
      width: 300,
      height: 300,
      compressImageQuality: 0.7,
    };

    const openCameraCallback = () => {
      ImagePicker.openCamera(options).then(image => {
        const source = {uri: image.path};
        saveImage(image, type - 1);

        switch (type) {
          case 1:
            setImageOne(source);
            setImageOneFile(image);
            break;
          case 2:
            setImageTwo(source);
            setImageTwoFile(image);
            break;
          default:
            setImageThree(source);
            setImageThreeFile(image);
            break;
        }
      });
    };
    if (Platform.OS === 'ios') {
      setTimeout(openCameraCallback, 1000);
    } else {
      openCameraCallback();
    }
  };

  const saveImage = (imageFile, position) => {
    updateUserDetails({prop: 'spinner', value: true});
    let jsonData = {
      image: {
        uri: imageFile.path,
        type: imageFile.mime,
        name: imageFile.path.split('/').pop(),
      },
      returnId: userReducer?.selectedAlbum?.returnId,
      userName:
        userReducer?.profileDetails?.firstName +
        ' ' +
        userReducer?.profileDetails?.lastName,
    };

    saveReturnChat(jsonData)
      .then(result => {
        if (result?.filename) {
          let files = fileNames;
          files[position] = result?.filename;
          setFileNames(files);
        }
        updateUserDetails({prop: 'spinner', value: false});
      })
      .catch(err => {
        updateUserDetails({prop: 'spinner', value: false});
      });
  };

  const saveAudio = returnId => {
    updateUserDetails({prop: 'spinner', value: true});

    let jsonData = {
      audio: {
        uri: Platform.OS == 'ios' ? audioUri : 'file:///' + audioPath,
        type: mime.getType(audioPath),
        name: audioPath.split('/').pop(),
      },
      returnId: returnId,
      userName:
        userReducer?.profileDetails.firstName +
        ' ' +
        userReducer?.profileDetails?.lastName,
    };

    saveReturnChat(jsonData)
      .then(result => {
        if (result?.filename) {
          let files = fileNames;
          files[3] = result?.filename;
          setFileNames(files);
        }
        updateUserDetails({prop: 'spinner', value: false});
      })
      .catch(err => {
        updateUserDetails({prop: 'spinner', value: false});
      });
  };

  const renderInitialQuestion = item => {
    return (
      <View style={{width: '100%', backgroundColor: colors.transparent}}>
        {!item.isReturn && (
          <View style={{width: '100%', marginBottom: 10, marginTop: 15}}>
            <Text
              numberOfLines={1}
              style={{
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.return_message}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingVertical: 10,
            backgroundColor: colors.cardColor,
            borderRadius: 12,
          }}>
          <View
            style={{
              flex: 1.3,
              height: '100%',
              // justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              paddingLeft: 10,
            }}>
            <Image
              style={{
                width: 90,
                height: 90,
                borderRadius: 10,
                alignSelf: 'center',
                backgroundColor: colors.bgGray,
              }}
              source={getImage(
                item?.albumId?.thumbnailImage ?? item.albumId?.images[0],
              )}></Image>
          </View>
          <View
            style={{
              flex: 3,
              height: '100%',
              paddingLeft: 3,
            }}>
            <View
              style={{
                marginTop: 5,
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
                  marginLeft: 5,
                }}>
                {item?.albumId?.albumName}
              </Text>
            </View>
            <View style={{width: '100%'}}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  marginLeft: 5,
                  fontFamily: fontFamily.MontserratRegular,
                  marginTop: 2,
                }}>
                {item?.albumId?.artist}
              </Text>
            </View>
            <View style={{width: '100%'}}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,
                  marginLeft: 5,
                  fontFamily: fontFamily.MontserratRegular,
                  marginTop: 2,
                }}>
                {item?.albumId?.label + ', ' + item?.albumId?.year}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            width: '99%',
            alignSelf: 'center',
            marginTop: 10,
            // height: 480,
            borderRadius: 10,
            backgroundColor: colors.cardColor,
            paddingTop: 5,
            paddingBottom: 10,
            // paddingHorizontal: 10,
          }}>
          <View style={{flex: 1, width: '100%'}}>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}>
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
                    {textContent.chatBot.wrong_product}
                  </Text>
                }
                onPress={() => {
                  setOptions(!options);
                }}
                checked={!options}
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
                  paddingVertical: 3,
                }}
              />
            </View>
          </View>
          <View style={{flex: 1, width: '100%'}}>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}>
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
                    {textContent.chatBot.damaged_product}
                  </Text>
                }
                onPress={() => {
                  setOptions(!options);
                }}
                checked={options}
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
                  paddingVertical: 3,
                }}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            backgroundColor: colors.transparent,
            marginVertical: 10,
          }}>
          {!imageOne == '' ? (
            <TouchableOpacity
              style={{
                width: '99%',
                alignSelf: 'center',
                marginBottom: 2,
                height: 250,
                borderRadius: 10,
                backgroundColor: colors.cardColor,
                paddingTop: 10,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                openCamera(1);
              }}>
              <Image
                style={{height: '100%', width: '100%'}}
                source={imageOne}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                width: '99%',
                alignSelf: 'center',
                marginBottom: 2,
                height: 250,
                borderRadius: 10,
                backgroundColor: colors.cardColor,
                paddingTop: 5,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                openCamera(1);
              }}>
              <View style={{flex: 1, width: '100%', justifyContent: 'center'}}>
                <View
                  style={{
                    paddingVertical: 5,
                  }}>
                  <Image
                    style={{
                      width: 70,
                      height: 70,
                      padding: 0,
                      alignSelf: 'center',
                      tintColor: colors.primaryTextColor,
                    }}
                    source={imagepath.imageplus}></Image>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                  }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 16,

                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.add_image}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            width: '100%',
            backgroundColor: colors.transparent,
            marginBottom: 10,
          }}>
          {!imageTwo == '' ? (
            <TouchableOpacity
              style={{
                width: '99%',
                alignSelf: 'center',
                marginBottom: 2,
                height: 250,
                borderRadius: 10,
                backgroundColor: colors.cardColor,
                paddingTop: 10,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                openCamera(2);
              }}>
              <Image
                style={{height: '100%', width: '100%'}}
                source={imageTwo}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                width: '99%',
                alignSelf: 'center',
                marginBottom: 2,
                height: 250,
                borderRadius: 10,
                backgroundColor: colors.cardColor,
                paddingTop: 5,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                openCamera(2);
              }}>
              <View style={{flex: 1, width: '100%', justifyContent: 'center'}}>
                <View
                  style={{
                    paddingVertical: 5,
                  }}>
                  <Image
                    style={{
                      width: 70,
                      height: 70,
                      padding: 0,
                      alignSelf: 'center',
                      tintColor: colors.primaryTextColor,
                    }}
                    source={imagepath.imageplus}></Image>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                  }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 16,

                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.add_image}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            width: '100%',
            backgroundColor: colors.transparent,
            marginBottom: 10,
          }}>
          {!imageThree == '' ? (
            <TouchableOpacity
              style={{
                width: '99%',
                alignSelf: 'center',
                marginBottom: 2,
                height: 250,
                borderRadius: 10,
                backgroundColor: colors.cardColor,
                paddingTop: 10,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                openCamera(3);
              }}>
              <Image
                style={{height: '100%', width: '100%'}}
                source={imageThree}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                width: '99%',
                alignSelf: 'center',
                marginBottom: 2,
                height: 250,
                borderRadius: 10,
                backgroundColor: colors.cardColor,
                paddingTop: 5,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                openCamera(3);
              }}>
              <View style={{flex: 1, width: '100%', justifyContent: 'center'}}>
                <View
                  style={{
                    paddingVertical: 5,
                  }}>
                  <Image
                    style={{
                      width: 70,
                      height: 70,
                      padding: 0,
                      alignSelf: 'center',
                      tintColor: colors.primaryTextColor,
                    }}
                    source={imagepath.imageplus}></Image>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                  }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 16,

                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.add_image}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            width: '99%',
            alignSelf: 'center',
            marginBottom: 2,
            // height: 480,
            borderRadius: 10,
            backgroundColor: colors.cardColor,
            paddingTop: 5,
            paddingBottom: 10,
            paddingHorizontal: 10,
          }}>
          <View style={{width: '100%', alignItems: 'center', marginTop: 3}}>
            <Text
              numberOfLines={1}
              style={{
                color: colors.gray,
                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.record_audio_complaint}
            </Text>
          </View>
          <View style={{width: '100%'}}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 5,
                marginTop: 5,
                flexDirection: 'row',
              }}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    backgroundColor: !playbackToggle
                      ? !recordToggle
                        ? colors.primaryButtonColor + '90'
                        : colors.red + '90'
                      : colors.lightGreen + '90',
                    width: '90%',
                    borderRadius: 10,

                    flexDirection: 'row',
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
                    if (playbackToggle) {
                      setPlay(!play);
                    } else {
                      if (recordToggle) {
                        setPlaybackToggle(true);
                      }
                      setRecordToggle(!recordToggle);
                    }
                  }}>
                  <View
                    style={{
                      //paddingLeft: 10,
                      // paddingRight: 2,
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
                        color: colors.black,
                        fontSize: 14,
                        fontFamily: fontFamily.MontserratBold,
                      }}>
                      {!playbackToggle
                        ? !recordToggle
                          ? 'RECORD'
                          : 'STOP'
                        : !play
                        ? 'PLAY'
                        : 'PAUSE'}
                    </Text>
                  </View>

                  <View
                    style={{
                      // paddingRight: 10,
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      paddingLeft: 5,
                    }}>
                    <Image
                      resizeMode="contain"
                      style={{
                        width: 16,
                        height: 16,
                        padding: 0,
                        alignSelf: 'center',
                      }}
                      source={
                        !playbackToggle
                          ? imagepath.record
                          : !play
                          ? imagepath.play
                          : imagepath.pause
                      }></Image>
                  </View>
                </TouchableOpacity>
              </View>
              {showContinue && (
                <View style={{flex: 1, alignItems: 'center'}}>
                  <TouchableOpacity
                    disabled={!showContinue}
                    style={{
                      justifyContent: 'center',
                      backgroundColor: showContinue
                        ? colors.premiumGrayOne
                        : colors.premiumGrayOne + '50',
                      width: '90%',
                      borderRadius: 10,

                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const dirs = RNFetchBlob.fs.dirs;

                      const path = Platform.select({
                        ios: 'audio_' + new Date().getTime() + '.m4a',
                        android:
                          `${dirs.CacheDir}/` +
                          'audio_' +
                          new Date().getTime() +
                          '.mp3',
                      });

                      setAudioPath(path);
                      setPlaybackToggle(false);
                      setRecordToggle(false);
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
                        {textContent.chatBot.discard}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          {/* <AudioBubble
            _id={_id}
            currentMessage={currentMessage}
            title={currentMessage.text}
            updateWaxbot={updateWaxbot}
            updateUserDetails={updateUserDetails}
            userReducer={userReducer}
            removeChat={() => {
              removeChat();
            }}
            callback={()=>{
              setPlaybackToggle
            }}
            // returnId={returnId}
          /> */}
        </View>
        {!item.isReturn ? (
          <View style={{flexDirection: 'row', width: '100%'}}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  width: '95%',
                  backgroundColor: colors.secondaryBackground,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  alignItems: 'center',
                }}
                onPress={() => {
                  if (
                    imageOneFile == '' ||
                    imageTwoFile == '' ||
                    imageThreeFile == ''
                  ) {
                    toast.show(textContent.chatBot.alert_image);
                    return;
                  }

                  if (!playbackToggle) {
                    toast.show(textContent.chatBot.alert_audio);
                    return;
                  }

                  if (item.orderStatus.toUpperCase() == 'DELIVERED') {
                    Alert.alert('', textContent.chatBot.alert_return, [
                      {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel',
                      },
                      {
                        text: 'Confirm',
                        onPress: () => {
                          updateUserDetails({prop: 'spinner', value: true});
                          let jsonData = {
                            albumId: item.albumId?._id,
                            orderId: userReducer?.currentOrderDetails?.orderId,
                            albumName: item.albumName,
                            buyerName:
                              userReducer?.currentOrderDetails
                                ?.buyerInformation[0].firstName,

                            buyerEmail:
                              userReducer?.currentOrderDetails
                                ?.buyerInformation[0].email,

                            receiveDate: moment(new Date()).toISOString(),
                            storePickUp: true,
                            amount: item.albumCost,
                            shippingCharge: item.shipmentCharge,
                            buyerTax:
                              userReducer?.currentOrderDetails?.buyerTax,
                            totalBuyerAmount:
                              userReducer?.currentOrderDetails?.totalPayment,
                            shippingDate: moment(new Date()).toISOString(),
                            courier: 'zeleris',
                            sellerName: item?.sellerId?.firstName
                              ? item?.sellerId?.firstName
                              : item?.sellerId?.storeName,
                            sellerEmail: item?.sellerId?.email,
                            sellerId: item.sellerId._id,
                            sellerTax:
                              userReducer?.currentOrderDetails?.sellerTax,
                            sellerTotalAmount: parseFloat(
                              parseFloat(item?.albumCost) -
                                (parseFloat(item?.albumCost) *
                                  parseFloat(
                                    userReducer?.currentOrderDetails?.sellerTax,
                                  )) /
                                  100,
                            ),
                            buyerId: userReducer?.profileDetails?._id,
                            option: options
                              ? 'Damaged product recieved from seller'
                              : 'Wrong product recieved from seller',
                          };

                          returnAlbum(jsonData)
                            .then(result => {
                            
                              if (result.status == 'success') {
                                let jsonData = {
                                  audio: {
                                    uri:
                                      Platform.OS == 'ios'
                                        ? audioUri
                                        : 'file:///' + audioPath,
                                    type: mime.getType(audioPath),
                                    name: audioPath.split('/').pop(),
                                  },
                                  returnId: result.returnId,
                                  userName:
                                    userReducer?.profileDetails.firstName +
                                    ' ' +
                                    userReducer?.profileDetails?.lastName,
                                };

                                saveReturnChat(jsonData)
                                  .then(response => {
                                    toast.show(result.message);
                                    let selectedAlbum = {
                                      ...userReducer?.selectedAlbum,
                                      isReturn: true,
                                      returnId: result.returnId,
                                      orderStatus: 'Return Initiated',
                                    };

                                    let albumDetails = [];
                                    userReducer?.currentOrderDetails?.albumDetails?.map(
                                      (val, idx) => {
                                        if (selectedAlbum.index == idx) {
                                          albumDetails.push(selectedAlbum);
                                        } else {
                                          albumDetails.push(val);
                                        }
                                      },
                                    );
                                    let newData =
                                      userReducer?.currentOrderDetails;
                                    delete newData.albumDetails;
                                    newData.albumDetails = albumDetails;
                                    updateUserDetails({
                                      prop: 'currentOrderDetails',
                                      value: newData,
                                    });

                                    updateUserDetails({
                                      prop: 'selectedAlbum',
                                      value: selectedAlbum,
                                    });

                                    updateUserDetails({
                                      prop: 'reRenderOrderDetails',
                                      value:
                                        userReducer?.reRenderOrderDetails + 1,
                                    });
                                    let files = fileNames;
                                    files[3] = response?.filename;
                                    files.map((value, index) => {
                                      if (index == 3) {
                                        const newValue = {
                                          type: 'audio',
                                          value: value,
                                          user: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                                          timeStamp: new Date().getTime(),
                                        };
                                        userReducer?.firebasedb
                                          .ref(
                                            `messages/${selectedAlbum?.returnId}/`,
                                          )
                                          .push(newValue);
                                      } else {
                                        const newValue = {
                                          type: 'image',
                                          value: value,
                                          user: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                                          timeStamp: new Date().getTime(),
                                        };
                                        userReducer?.firebasedb
                                          .ref(
                                            `messages/${selectedAlbum?.returnId}/`,
                                          )
                                          .push(newValue);
                                      }
                                    });
                                    returnInitiated();
                                  })
                                  .catch(err => {
                                    toast.show(result.message);
                                    let selectedAlbum = {
                                      ...userReducer?.selectedAlbum,
                                      isReturn: true,
                                      returnId: result.returnId,
                                      orderStatus: 'Return Initiated',
                                    };

                                    let albumDetails = [];
                                    userReducer?.currentOrderDetails?.albumDetails?.map(
                                      (val, idx) => {
                                        if (selectedAlbum.index == idx) {
                                          albumDetails.push(selectedAlbum);
                                        } else {
                                          albumDetails.push(val);
                                        }
                                      },
                                    );
                                    let newData =
                                      userReducer?.currentOrderDetails;
                                    delete newData.albumDetails;
                                    newData.albumDetails = albumDetails;
                                    updateUserDetails({
                                      prop: 'currentOrderDetails',
                                      value: newData,
                                    });

                                    updateUserDetails({
                                      prop: 'selectedAlbum',
                                      value: selectedAlbum,
                                    });

                                    updateUserDetails({
                                      prop: 'reRenderOrderDetails',
                                      value:
                                        userReducer?.reRenderOrderDetails + 1,
                                    });
                                    fileNames.map((value, index) => {
                                      if (index == 3) {
                                        const newValue = {
                                          type: 'audio',
                                          value: value,
                                          user: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                                          timeStamp: new Date().getTime(),
                                        };
                                        userReducer?.firebasedb
                                          .ref(
                                            `messages/${selectedAlbum?.returnId}/`,
                                          )
                                          .push(newValue);
                                      } else {
                                        const newValue = {
                                          type: 'image',
                                          value: value,
                                          user: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                                          timeStamp: new Date().getTime(),
                                        };
                                        userReducer?.firebasedb
                                          .ref(
                                            `messages/${selectedAlbum?.returnId}/`,
                                          )
                                          .push(newValue);
                                      }
                                    });
                                  });
                                  returnInitiated()
                              } else {
                              
                                toast.show(
                                  result?.message
                                    ? result?.message
                                    : textContent.general.general_error,
                                );
                              }
                              updateUserDetails({
                                prop: 'spinner',
                                value: false,
                              });
                            })
                            .catch(err => {
                              updateUserDetails({
                                prop: 'spinner',
                                value: false,
                              });
                              toast.show(textContent.general.general_error);
                            });
                        },
                      },
                    ]);
                  } else {
                    toast.show(textContent.chatBot.album_not_delivered);
                  }

                  // updateWaxbot();
                }}>
                <View
                  style={{
                    width: '100%',
                    paddingVertical: 10,
                    alignItems: 'center',
                    //flexDirection: 'row',
                    //paddingLeft: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.red,
                      fontSize: 14,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.confirm_return}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  width: '95%',
                  backgroundColor: colors.cardColor,
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
                    //   flexDirection: 'row',
                    //   paddingLeft: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.blue,
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.cancel}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={{marginVertical: 10, width: '100%', alignItems: 'center'}}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.grayShadeThree,

                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {textContent.chatBot.return_initialized}
            </Text>
          </View>
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
                color: colors.grayShadeOne,
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
        {renderInitialQuestion(currentMessage.data)}
      </View>
    </View>
  );
};
