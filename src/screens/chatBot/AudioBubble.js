import moment from 'moment';
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  userReducer,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import persistStorage from '../../redux/store/persistStore';
import {FlatList} from 'react-native-gesture-handler';
import {getImage} from '../../actions/GenericAPI';

import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import {PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import mime from 'mime';
import {saveReturnChat} from '../../actions/ReturnAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../../utils/textContent';
import {audioFunctionality} from './audioFunctionality';
export const AudioBubble = ({
  _id,
  currentMessage,
  updateWaxbot,
  userReducer,
  removeChat,
  returnId,
  callback=()=>{}
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [showContinue, setShowContinue] = useState(true);
  const [audioData, setAudioData] = useState({});
  const [audioPath, setAudioPath] = useState('');
  const [recordToggle, setRecordToggle] = useState(false);
  const [playbackToggle, setPlaybackToggle] = useState(false);
  const [play, setPlay] = useState(false);
  const [initial, setInitial] = useState(true);
  const [audioUri, setAudioUri] = useState('');

  useEffect(() => {
    if (!currentMessage.default) {
      const dirs = RNFetchBlob.fs.dirs;

      const path = Platform.select({
        ios: 'audio_' + new Date().getTime() + '.m4a',
        android: `${dirs.CacheDir}/` + 'audio_' + new Date().getTime() + '.mp3',
      });

      setAudioPath(path);
    } else {
      getRemoteAudio();
    }
  }, []);

  const getRemoteAudio = async () => {
    const fileRemoteUrl = currentMessage.audio;
    const token = persistStorage.getState().userDetails.bearer;

    const dirs = RNFetchBlob.fs.dirs;

    const path = Platform.select({
      ios: 'audio_' + new Date().getTime() + '.m4a',
      android: `${dirs.CacheDir}/` + 'audio_' + new Date().getTime() + '.mp3',
    });

    const res = await RNFetchBlob.config({
      fileCache: false,
      appendExt: Platform.OS == 'ios' ? 'm4a' : 'mp3',
      path,
    }).fetch('GET', fileRemoteUrl, {Authorization: `Bearer ${token}`});

    const internalUrl = `${
      Platform.OS === 'android' ? 'file://' : 'file://'
    }${res.path()}`;

    setAudioPath(internalUrl);
    setPlaybackToggle(true);
    setShowContinue(false);
  };

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

  const renderData = item => {
    return (
      <View style={{width: '100%', backgroundColor: colors.transparent}}>
        <View
          style={{
            width: '99%',
            alignSelf: 'center',
            marginBottom: 2,
            // height: 480,
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            paddingTop: 5,
            paddingBottom: 10,
            paddingHorizontal: 10,
          }}>
          <View style={{width: '100%'}}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 3,
                marginTop: 10,
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
                      backgroundColor: darkMode
                        ? colors.black + '50'
                        : showContinue
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
        </View>
        {showContinue && (
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
                  if (userReducer) {
                    if (playbackToggle) {
                      let jsonData = {
                        audio: {
                          uri:
                            Platform.OS == 'ios'
                              ? audioUri
                              : 'file:///' + audioPath,
                          type: mime.getType(audioPath),
                          name: audioPath.split('/').pop(),
                        },
                        returnId: userReducer?.selectedAlbum?.returnId,
                        userName:
                          userReducer?.profileDetails.firstName +
                          ' ' +
                          userReducer?.profileDetails?.lastName,
                      };
                      saveReturnChat(jsonData)
                        .then(result => {
                        
                            callback()
                        
                          if (result?.filename) {
                            setShowContinue(false);
                            const newValue = {
                              type: 'audio',
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
                      toast.show(textContent.chatBot.record_audio);
                    }
                  }
                }}>
                <View
                  style={{
                    width: '100%',
                    paddingVertical: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingLeft: 10,
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
