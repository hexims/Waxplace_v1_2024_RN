import moment from 'moment';
import React, {useCallback, useLayoutEffect, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import ImgToBase64 from 'react-native-image-base64';
import {getImage} from '../../actions/GenericAPI';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
import {saveReturnChat} from '../../actions/ReturnAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../../utils/textContent';

export const ImageBubble = ({
  _id,
  currentMessage,
  updateWaxbot,
  updateUserDetails,
  userReducer,
  removeChat,
  returnId,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [showContine, setShowContinue] = useState(true);
  const [image, setImage] = useState(
    currentMessage.default ? {uri: currentMessage.image} : '',
  );
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {}, []);

  const openCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
      width: 300,
      height: 300,
      compressImageQuality: 0.7,
    }).then(image => {
      //   let imageFileName = image.path.split(
      //     'react-native-image-crop-picker/',
      //   )[1];
      ImgToBase64.getBase64String(image.path)
        .then(base64String => {
          const source = {uri: 'data:image/jpeg;base64,' + base64String};
          setImage(source);
          setImageFile(image);
        })
        .catch(err => {});
    });
  };

  const renderData = item => {
    return (
      <View style={{width: '100%', backgroundColor: colors.transparent}}>
        {!image == '' ? (
          <View
            style={{
              width: '99%',
              alignSelf: 'center',
              marginBottom: 2,
              height: 250,
              borderRadius: 10,
              backgroundColor: colors.secondaryBackground,
              paddingTop: 10,
              paddingBottom: 10,
              paddingHorizontal: 10,
            }}>
            <Image style={{height: '100%', width: '100%'}} source={image} />
          </View>
        ) : (
          <TouchableOpacity
            style={{
              width: '99%',
              alignSelf: 'center',
              marginBottom: 2,
              height: 250,
              borderRadius: 10,
              backgroundColor: colors.secondaryBackground,
              paddingTop: 5,
              paddingBottom: 10,
              paddingHorizontal: 10,
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  openCamera();
                }, 1000);
                return;
              }
              openCamera();
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

        {showContine && !currentMessage.default && (
          <View style={{flexDirection: 'row'}}>
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
                  if (imageFile) {
                    let jsonData = {
                      image: {
                        uri: imageFile.path,
                        type: imageFile.mime,
                        name: imageFile.path.split('/').pop(),
                      },
                      returnId: userReducer.selectedAlbum.returnId,
                      userName:
                        userReducer?.profileDetails.firstName +
                        ' ' +
                        userReducer?.profileDetails?.lastName,
                    };
                    saveReturnChat(jsonData)
                      .then(result => {
                        if (result?.filename) {
                          setShowContinue(false);
                          const newValue = {
                            type: 'image',
                            value: result?.filename,
                            user: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                            timeStamp: new Date().getTime(),
                          };
                          userReducer?.firebasedb
                            .ref(`messages/${returnId}/`)
                            .push(newValue);
                        }
                      })
                      .catch(err => {});
                  } else {
                    toast.show('Please select an Image');
                  }
                }}>
                <View
                  style={{
                    paddingVertical: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Image
                    source={imagepath.check}
                    resizeMode="contain"
                    style={{
                      height: 13,
                      width: 13,
                      tintColor: colors.blue,
                      marginRight: 5,
                      marginTop: 2,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.blue,
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.confirm}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
                  removeChat();

                  setImage('');
                }}>
                <View
                  style={{
                    paddingVertical: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.red,
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.chatBot.cancel}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{width: '85%', marginTop: 10, marginRight: 3}}>
      <View
        style={{
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.transparent,
        }}>
        {renderData(currentMessage.data)}
      </View>
    </View>
  );
};
