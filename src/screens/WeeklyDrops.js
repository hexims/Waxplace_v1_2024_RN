import React, {useEffect, useState} from 'react';

import * as HomeNavigation from '../router/_HomeNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {
  View,
  Dimensions,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  BackHandler,
} from 'react-native';

const {width, height} = Dimensions.get('window');
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

import {Dialog} from 'react-native-simple-dialogs';

import _ from 'lodash';
import moment from 'moment';

import ReadMore from '@fawazahmed/react-native-read-more';
import TrackPlayer from 'react-native-track-player';

import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage, getImageFullPath} from '../actions/GenericAPI';
import {
  archiveWeeklyDropsData,
  getRecentWeeklyDrops,
  profileDetails,
  sendWeeklyDropRequest,
} from '../actions/UserAPI';

import {getRandomPromotions} from '../actions/HomePageAPI';
import {BASEURL} from '../actions/_apiUrls';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';

const WeeklyDrops = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [musicList, setMusicList] = useState([]);
  const [noInternet, setNoInternet] = useState(false);
  const [weeklyDropData, setWeeklyDropData] = useState([]);
  const [recentWeelyDrop, setRecentWeelyDrop] = useState([]);
  const [randomPromotions, setRandomPromotions] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [cartLength, setCartLength] = useState(0);
  const [weeklyDialog, setWeeklyDialog] = useState(false);
  const [waxDropsData, setWaxDropsData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [usermessage, setUserMessage] = useState('');
  const [functionCall, setFunctionCall] = useState('');

  const [audioRecorderPlayer, setAudioRecorderPlayer] = useState(
    new AudioRecorderPlayer(),
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const backAction = () => {
      HomeNavigation.reset('HomeScreen');
      return true;
    };

    // Add the event listener for the back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Add playback finished listener
    audioRecorderPlayer.addPlayBackListener(e => {
      if (e.currentPosition === e.duration) {
        // Audio playback finished
        setIsPlaying(false);

        let data = [];
        weeklyDropData?.map((value, idx) => {
          data.push({...value, play: false});
        });

        setWeeklyDropData(data);
      }
    });

    return () => {
      // Remove playback finished listener on component unmount
    };
  }, []);

  const handleAudioAction = async (action, audioPath) => {
    try {
      switch (action) {
        case 'PLAY':
          await audioRecorderPlayer.startPlayer(audioPath.replace(/\s/g,''));
          setIsPlaying(true);
          break;
        case 'PAUSE':
          await audioRecorderPlayer.pausePlayer();
          setIsPlaying(false);
          break;
        case 'STOP':
          await audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
          break;
      }
    } catch (err) {}
  };

  useEffect(() => {
    mountFunction();
  }, []);

  useEffect(() => {
    if (functionCall == 'setData') {
      getRecentDropsData();
    }
  }, [functionCall]);

  const archiveWeeklyDrop = (data, item) => {
    let jsonData = {
      weeklyDropId: waxDropsData?._id,
    };

    archiveWeeklyDropsData(jsonData)
      .then(response => {
        if (response.status === 'success') {
          HomeNavigation.navigate('MusicPlayer', {
            data,
            index: item.id,
          });
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {});
  };

  const sendRequestforweeklydrop = () => {
    if (!usermessage) {
      toast.show(textContent.WeeklyDrop.alert_message);

      return;
    }

    let jsonData = {
      message: usermessage,
    };

    sendWeeklyDropRequest(jsonData)
      .then(response => {
        if (response.status === 'success') {
          setWeeklyDialog(false);
          toast.show(response.message);
        } else {
          toast.show(textContent.general.general_error);
        }
      })
      .catch(error => {});
  };

  const mountFunction = () => {
    setWaxDropsData(route?.params?.data);

    profileDetails().then(response => {
      let cartLength = response.user.cart?.length;
      global.cartvalue = cartLength;

      setCartLength(cartLength);
    });

    let jsonData = {
      type: 'weeklyDrop',
    };

    getRandomPromotions(jsonData)
      .then(response => {
        setRandomPromotions(response.result);
        setFunctionCall('setData');
      })
      .catch(error => {});
  };

  const searchFunction = text => {
    let data = [];
    data = weeklyDropData.filter(value => {
      if (value?.type !== 'banner') {
        if (
          value?.songName.toLowerCase().includes(text.toLowerCase()) ||
          value?.duration.toString().toLowerCase().includes(text.toLowerCase())
        ) {
          return value;
        }
      }
    });
    let searchList = [];
    let id = 0;
    let bannerPos = [3];
    let bPosId = 0;
    let bannerId = 1;
    let banners = 0;
    data.forEach(element => {
      searchList.push({...element});
      id++;
      if (bannerId == bannerPos[bPosId] && randomPromotions?.length > 0) {
        if (bPosId == bannerPos?.length - 1) {
          bPosId = bannerPos?.length - 1;
        } else {
          bPosId++;
        }
        bannerId = 1;

        searchList.push({
          type: 'banner',
          id,
          bannerPosition: banners % randomPromotions?.length,
        });

        banners++;
        id++;
      } else {
        bannerId++;
      }
    });

    setSearchList(searchList);
  };

  const getRecentDropsData = () => {
    getRecentWeeklyDrops()
      .then(response => {
        let recentWeelyDrop = [];

        let id = 0;
        let bannerPos = [1, 4];
        let bPosId = 0;
        let bannerId = 1;
        let banners = 0;
        //
        let data = response.weeklyDrops.filter(item => !item.activeDrop);
        data?.map(element => {
          if (bannerId == bannerPos[bPosId] && randomPromotions?.length > 0) {
            if (bPosId == bannerPos?.length - 1) {
              bPosId = bannerPos?.length - 1;
            } else {
              bPosId++;
            }
            bannerId = 1;

            recentWeelyDrop.push({
              type: 'banner',
              id,
              bannerPosition: banners % randomPromotions?.length,
            });

            banners++;
            id++;
          } else {
            bannerId++;
          }

          recentWeelyDrop.push({...element, type: 'recentdrops', id});
          id++;
        });

        setRecentWeelyDrop(recentWeelyDrop);
      })
      .catch(error => {});

    let weeklyDropData = [];
    let id = 0;

    let data = route?.params?.data.weeklyDropList;
    data.forEach(element => {
      weeklyDropData.push({...element, type: 'weeklydrops', id});
    });

    setWeeklyDropData(weeklyDropData);
    setSearchList(weeklyDropData);
  };

  const getDuration = data => {
    let seconds = 0;
    data?.map(value => {
      if (value?.minutes?.toString().includes('.')) {
        seconds +=
          parseInt(value?.minutes?.toString().split('.')[0]) * 60 +
          parseInt(value?.minutes?.toString().split('.')[1]) * 10;
      } else {
        seconds += parseInt(value?.minutes) * 60;
      }
    });
    return new Date(seconds * 1000)
      .toISOString()
      .substr(11, 8)
      .replace(/^[0:]+/, '');
  };

  const renderWeeklyDropsListItem = (item, index) => {
    return (
      <View
        style={{
          width: '100%',
          alignSelf: 'center',
          marginTop: 10,
          height: 125,
          borderRadius: 10,
          backgroundColor: colors.cardColor,
          elevation: 4,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,

          flexDirection: 'row',
        }}>
        <View
          style={{
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: 125,
            height: 125,
          }}>
          <Image
            style={{
              width: 115,
              height: 115,
              alignSelf: 'center',

              borderRadius: 10,
              backgroundColor: colors.bgGray,
            }}
            source={getImage(item.image)}></Image>
        </View>
        <View
          style={{
            width: '65%',
            height: '100%',
            paddingLeft: 5,
            paddingRight: 10,
            paddingVertical: 5,
          }}>
          <View style={{flex: 1.2, width: '100%', justifyContent: 'center'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratBold,
                fontSize: 18,
              }}>
              {item.artistName}
            </Text>
          </View>
          <View style={{flex: 1, width: '100%', justifyContent: 'center'}}>
            <Text
              style={{
                marginTop: 1.5,
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratMedium,
                fontSize: 14,
              }}>
              {moment(item.created_At).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View style={{flex: 2.5, width: '100%', justifyContent: 'center'}}>
            <Text
              numberOfLines={3}
              style={{
                marginTop: 1.5,
                color: colors.primaryTextColor,
                fontSize: 13,
                textAlign: 'left',
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {item.description ? item.description : ''}
            </Text>
          </View>
          <View style={{flex: 1, width: '100%', justifyContent: 'center'}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
                letterSpacing: 1,
              }}>
              {item.weeklyDropList?.length +
                ' Tracks - ' +
                getDuration(item.weeklyDropList)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPlaylistItem = (item, index) => {
    return (
      <View
        style={[
          {width: '100%', height: 100, marginTop: 5},
          darkMode && {backgroundColor: colors.cardColor},
        ]}>
        <View
          style={{
            width: '100%',
            height: 100,
            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: 1,
              height: '100%',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 18,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {index + 1}
            </Text>

            <View
              style={{
                position: 'absolute',
                height: '75%',
                alignSelf: 'center',
                borderColor: colors.gray,
                borderLeftWidth: 1,
                right: 0,
              }}></View>
          </View>
          <View
            style={{
              flex: 3,
              height: '100%',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',

              flexDirection: 'row',
            }}>
            <View style={{width: '75%', marginLeft: 10, flexDirection: 'row'}}>
              <Text
                numberOfLines={1}
                style={{
                  maxWidth: '75%',
                  color: colors.primaryTextColor,
                  fontSize: 16,
                  fontFamily: fontFamily.MontserratBold,
                  marginLeft: 10,
                }}>
                {item.songName}
              </Text>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 16,
                  fontFamily: fontFamily.MontserratBold,
                  marginLeft: 10,
                }}>
                {''}- {getDuration([item])}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              height: '100%',
              // justifyContent: 'center',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={() => {
                let data = [];
                weeklyDropData?.map((value, idx) => {
                  if (index == idx) {
                    data.push({...value, play: isPlaying ? false : true});
                  } else {
                    data.push({...value, play: false});
                  }
                });

                setWeeklyDropData(data);
                if (isPlaying) {
                  handleAudioAction('PAUSE');
                } else {
                  handleAudioAction('STOP');

                  handleAudioAction('PLAY', BASEURL + item.audioName);
                }
              }}>
              <Image
                style={{
                  width: 35,
                  height: 35,
                  alignSelf: 'center',
                  tintColor: colors.primaryTextColor,
                }}
                source={item?.play ? imagepath.pause : imagepath.play}></Image>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderWeeklyDropsList = (item, index) => {
    if (item.type !== 'banner') {
      return (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: item.type == 'recentdrops' ? 10 : 0,
            }}>
            {item.type == 'recentdrops'
              ? renderWeeklyDropsListItem(item, index)
              : renderPlaylistItem(item, index)}
          </View>
        </View>
      );
    } else if (randomPromotions?.length !== 0) {
      return (
        <TouchableOpacity
          style={{
            flex: 1,
            width: '100%',
            marginTop: index == 0 ? 25 : 15,
            marginBottom: 5,
            alignItems: 'center',
            width: '100%',
            height: width / 3.2,
            backgroundColor: colors.premiumGrayOne,
          }}
          onPress={() => {
            handleBannerPress(randomPromotions[item.bannerPosition]);
          }}>
          {Array.isArray(randomPromotions) && randomPromotions?.length > 0 && (
            <Image
              resizeMode="contain"
              style={{
                width: width,
                height: width / 3.2,
                alignSelf: 'center',
                justifyContent: 'center',
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                elevation: 2,
              }}
              source={
                randomPromotions[item?.bannerPosition]?.image
                  ? getImage(randomPromotions[item?.bannerPosition]?.image)
                  : imagepath.bigsale
              }></Image>
          )}
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  const handleBannerPress = async selectedPromotion => {
    if (selectedPromotion.isUrl == 'url') {
      let url = selectedPromotion.url;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
        }
      });
    } else if (
      selectedPromotion.isUrl == 'profile' ||
      selectedPromotion.isUrl == 'route'
    ) {
      let seller = selectedPromotion.saleProductId;
      if (seller?.businessName) {
        let distanceFromCurrentLocation = await getLocation(seller);
        HomeNavigation.navigate('StoreDetails', {
          vendorData: seller,
          distance: distanceFromCurrentLocation,
        });
      } else {
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

  const playMusic = async item => {
    // Set up the player
    await TrackPlayer.setupPlayer();

    // Add a track to the queue
    await TrackPlayer.add({
      id: 'trackId',
      url: getImageFullPath(item.audio),
      title: 'Track Title',
      artist: 'Track Artist',
      artwork: imagepath.play_button,
    });

    // Start playing it
    await TrackPlayer.play();
  };

  const renderPage = () => {
    return (
      <View
        style={{
          width: '100%',
          paddingTop: 15,
          paddingBottom: 70,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={['']}
          contentContainerStyle={{paddingBottom: 80, paddingTop: 2}}
          style={{width: '100%'}}
          ListHeaderComponent={
            <>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  backgroundColor: colors.primaryBackground,
                  paddingTop: 15,

                  borderRadius: 18,
                  elevation: 4,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                }}>
                <View
                  style={{
                    width: '100%',
                    marginTop: 5,
                    alignSelf: 'center',
                    flexDirection: 'row',
                    paddingRight: 15,
                    paddingLeft: 10,
                  }}>
                  <View
                    style={{
                      width: '35%',
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 10,
                        alignSelf: 'center',
                        overflow: 'hidden',
                        elevation: 4,
                        shadowColor: colors.shadowColor,
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.22,
                        shadowRadius: 2.22,
                      }}>
                      <Image
                        resizeMode={'cover'}
                        style={{
                          height: '100%',
                          width: '100%',
                          borderRadius: 10,
                          backgroundColor: colors.bgGray,
                        }}
                        source={getImage(waxDropsData?.image)}></Image>
                    </View>
                  </View>
                  <View
                    style={{
                      width: '65%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      paddingLeft: 5,
                    }}>
                    <View style={{width: '100%'}}>
                      <Text
                        style={{
                          color: colors.primaryTextColor,
                          fontFamily: fontFamily.MontserratBold,
                          marginLeft: 5,
                          fontSize: 18,
                        }}>
                        {textContent.WeeklyDrop.weekly_drop}
                      </Text>
                      <View style={{paddingRight: 28}}>
                        <Text
                          style={{
                            color: colors.primaryTextColor,
                            fontSize: 13.5,

                            fontFamily: fontFamily.MontserratRegular,
                            fontWeight: '600',

                            marginLeft: 5,
                          }}>
                          {textContent.WeeklyDrop.weekly_drop_message}
                        </Text>
                      </View>
                      <View
                        style={{
                          marginTop: 2,
                          width: '100%',
                          alignItems: 'center',
                          alignContent: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            color: colors.primaryTextColor,
                            fontSize: 13,
                            fontWeight: 'bold',
                            marginLeft: 5,
                            fontFamily: fontFamily.MontserratRegular,
                            letterSpacing: 0.5,
                          }}>
                          {waxDropsData?.weeklyDropList?.length +
                            ' Tracks ' +
                            getDuration(waxDropsData?.weeklyDropList)}
                        </Text>

                        <TouchableOpacity
                          disabled={true}
                          style={{
                            width: 25,
                            height: 25,
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                          }}
                          onPress={() =>
                            HomeNavigation.navigate('ProfileWeeklyDrops')
                          }>
                          <Image
                            style={{
                              width: 25,
                              height: 25,
                              tintColor: colors.primaryTextColor,
                            }}
                            source={imagepath.calenderimg}></Image>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    width: '93%',
                    alignSelf: 'center',
                    marginTop: 20,
                    paddingRight: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 18,
                      fontFamily: fontFamily.MontserratBold,
                    }}>
                    {waxDropsData?.artistName}
                  </Text>

                  <ReadMore
                    seeLessStyle={{
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratBold,
                    }}
                    seeMoreStyle={{
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratBold,
                    }}
                    numberOfLines={3}
                    style={{
                      marginTop: 2,
                      color: colors.primaryTextColor,
                      fontSize: 13,
                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    {waxDropsData?.description}
                  </ReadMore>
                </View>

                <FlatList
                  listKey={(item, index) => `_key${index.toString()}`}
                  data={searchText == '' ? weeklyDropData : searchList}
                  contentContainerStyle={{paddingVertical: 10}}
                  style={{marginTop: 30}}
                  renderItem={({item, index}) =>
                    renderWeeklyDropsList(item, index)
                  }></FlatList>
              </View>
              <View style={{width: '100%', alignSelf: 'center', marginTop: 25}}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 18.5,
                    marginLeft: 15,
                    fontFamily: fontFamily.MontserratBold,
                  }}>
                  {textContent.WeeklyDrop.recent_drops}
                </Text>
                {recentWeelyDrop?.length > 0 ? (
                  <FlatList
                    listKey={(item, index) => `_key${index.toString()}`}
                    data={recentWeelyDrop}
                    style={{marginTop: -5}}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({item, index}) =>
                      renderWeeklyDropsList(item, index)
                    }></FlatList>
                ) : null}
              </View>
            </>
          }
          renderItem={({item, index}) => <View></View>}></FlatList>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={weeklyDialog}
        onTouchOutside={() => setWeeklyDialog(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,
          // height: '40%',
          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'flex-start',
        }}>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            marginTop: 10,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              alignSelf: 'center',
              fontSize: 20,
              textAlign: 'center',
              fontFamily: fontFamily.MontserratBold,
              letter: 1,
            }}>
            {textContent.WeeklyDrop.want_weekly_drops}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 13,
              textAlign: 'center',
              letterSpacing: 1,
              fontFamily: fontFamily.MontserratRegular,
              marginVertical: 5,
            }}>
            {textContent.WeeklyDrop.weekly_drop_message}
          </Text>

          <View style={{marginTop: 15}}>
            <TextInput
              style={styles.textInput(colors)}
              underlineColorAndroid="transparent"
              placeholder={'Tell us about your favourite music'}
              onChangeText={value => setUserMessage(value)}
              placeholderTextColor={colors.primaryTextColor}
              numberOfLines={10}
              multiline={true}
            />
          </View>

          <TouchableOpacity
            style={{
              width: '50%',
              alignSelf: 'center',
              marginTop: 15,
              height: 40,
              justifyContent: 'center',
              borderRadius: 20,
              backgroundColor: colors.primaryButtonColor,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
            onPress={() => sendRequestforweeklydrop()}>
            <Text
              style={{
                color: colors.black,
                fontSize: 17,
                letterSpacing: 1,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
              }}>
              {textContent.WeeklyDrop.button_text}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>

      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        conditions={true}
        searchText={searchText}
        onBackPress={() => {
          HomeNavigation.reset('HomeScreen');
        }}
        searchFunction={text => {
          setSearchText(text);

          changeTextDebouncer(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.WeeklyDrop.search_text
        }
      />

      {renderPage()}

      <TouchableOpacity
        style={{position: 'absolute', right: 0, top: '15%'}}
        onPress={() => setWeeklyDialog(true)}>
        <Image
          style={{width: 55, height: 95}}
          source={imagepath.weeklyadd}></Image>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  textAreaContainer: colors => ({
    width: '100%',
    padding: 5,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: fontFamily.premiumGrayOne,
    shadowOffset: {width: 0, height: 2},
    shadowColor: colors.shadowColor,
    shadowOpacity: 0.2,
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginTop: 10,
  }),
  textArea: colors => ({
    height: 150,
    width: '75%',
    fontFamily: fontFamily.MontserratRegular,
    paddingLeft: 10,
    justifyContent: 'flex-start',
  }),
  textInput: colors => ({
    fontFamily: fontFamily.MontserratRegular,
    fontSize: 16,
    height: 150,
    padding: 10,
    backgroundColor: colors.primaryBackground,
    borderColor: colors.premiumGrayOne,
    color: colors.primaryTextColor,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(WeeklyDrops);
