import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  useContext,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Image,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import {Input, Button, Avatar} from 'react-native-elements';
import {GiftedChat} from 'react-native-gifted-chat';
import {QuickReplies} from 'react-native-gifted-chat/lib/QuickReplies';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dialog} from 'react-native-simple-dialogs';
import {connect} from 'react-redux';
import {BASEURL} from '../../actions/_apiUrls';
import {updateUserDetails} from '../../redux/actions/UserAction';
import persistStorage from '../../redux/store/persistStore';
import RenderComponents from './_RenderComponents';
import * as BottomNavigation from '../../router/_BottomNavigation';
import * as CartNavigation from '../../router/_CartNavigation';
import * as ProfileNavigation from '../../router/_ProfileNavigation';
import imagepath from '../../utils/Images';
import fontFamily from '../../utils/FontFamily';
import {getUserChatData, saveReturnChat} from '../../actions/ReturnAPI';
import {shipmentTracking} from '../../actions/ShipmentAPI';
import moment from 'moment';
import ProgressLoader from '../../components/ProgressLoader';
import {DarkModeContext} from '../../components/DarkModeContext';
import textContent from '../../utils/textContent';

const ChatScreen = ({navigation, userReducer, updateUserDetails, route}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [messages, setMessages] = useState([]);
  const [recievedMessages, setRecievedMessages] = useState([]);
  const [filesDialog, setFilesDialog] = useState(false);
  const [recordDialog, setRecordDialog] = useState(false);
  const [showInputToolBar, setShowInputToolBar] = useState(false);
  const [returnId, setReturnId] = useState(null);
  let dbRef = null;
  let giftedRef = useRef(null);

  useEffect(() => {
    updateUserDetails({prop: 'isChatScreen', value: true});
    getCurrentStatus();
    BottomNavigation.navigationRef?.setParams({hide: true});
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.primaryBackground,
      },
      headerTintColor: colors.primaryTextColor,
      headerLeft: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{
              width: 40,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              BottomNavigation.navigationRef?.setParams({hide: false});
              if (CartNavigation?.cartNavigationRef?.isReady()) {
                CartNavigation.pop();
              } else {
                ProfileNavigation.pop();
              }
            }}>
            <Image
              style={[
                {height: 22, width: 22},
                darkMode && {tintColor: colors.grayShadeOne},
              ]}
              source={imagepath.back}
            />
          </TouchableOpacity>
          <View
            style={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="contain"
              style={[
                {height: 30, width: 30},
                darkMode && {tintColor: colors.grayShadeOne},
              ]}
              source={imagepath.waxplacelogo}
            />
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={{}}>
          <TouchableOpacity
            style={{
              width: 40,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              setFilesDialog(true);
            }}>
            <Image
              resizeMode="contain"
              style={[
                {height: 22, width: 22},
                darkMode && {tintColor: colors.grayShadeOne},
              ]}
              source={imagepath.threedots}
            />
          </TouchableOpacity>
        </View>
      ),
      title: 'WAXPLACE',
    });
    return () => {
      updateUserDetails({prop: 'isChatScreen', value: false});
      if (dbRef) {
        dbRef.off();
      }
      backHandler.remove();
      BottomNavigation.navigationRef?.setParams({hide: false});
    };
  }, []);

  useEffect(() => {
    giftedRef.scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (returnId && dbRef == null) {
      dbRef = userReducer?.firebasedb?.ref(`messages/${returnId}`);

      dbRef.on('value', snapshot => {
        if (snapshot.val()) {
          const newMessages = Object.values(snapshot.val());
          const messagesArray = Array.from(newMessages);

          let addMessage = [];
          let length = 1;

          messagesArray.reverse().map((val) => {


            if (val.user == 'support') {
              addMessage.push({
                _id: length++,
                type: 'TEXT',
                createdAt: val.timeStamp,
                text: val.value,
                user: {
                  _id: 2,
                  name: 'WaxPlace Bot',
                  avatar: darkMode
                    ? imagepath.waxplacelogoWhite
                    : imagepath.waxplacelogo,
                },
              });
            } else {
              if (val.type == 'audio') {
                addMessage.push({
                  _id: length++,
                  type: 'AUDIO',
                  default: true,
                  audio: BASEURL + val.value,
                  createdAt: val.timeStamp,
                  user: {
                    _id: 1,
                    name: 'WaxPlace Bot',
                    avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                  },
                });
              } else if (val.type == 'image') {
                addMessage.push({
                  _id: length++,
                  type: 'IMAGE',
                  image: BASEURL + val.value,
                  default: true,
                  createdAt: val.timeStamp,
                  user: {
                    _id: 1,
                    name: 'WaxPlace Bot',
                    avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                  },
                });
              } else {
                addMessage.push({
                  _id: length++,
                  type: 'TEXT',
                  text: val.value,
                  createdAt: val.timeStamp,

                  user: {
                    _id: 1,
                    name: 'WaxPlace Bot',
                    avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                  },
                });
              }
            }
          });

          if (messages?.length == 1) {
            addMessage.push({
              _id: length++,
              type: 'INFO',
              createdAt: new Date(),
              text: textContent.chatBot.return_request_placed,
            });
          }


          addMessage.push(messages[0]);

          

          setRecievedMessages(addMessage);
          if (messages[0]?.quickReplies?.values[1]?.enable) {
            setMessages(addMessage);
          }
          // if(messagesArray.length==3){
          //   addAudio()
          // }
        } else {
          let addMessage = [];
          let length = 1;
          addMessage.push(messages[0]);

          setRecievedMessages(addMessage);
          if (messages[0]?.quickReplies?.values[1]?.enable) {
            setMessages(addMessage);
          }
        }
      });
    }
  }, [returnId]);

  const backAction = () => {
    BottomNavigation.navigationRef?.setParams({hide: false});
    if (CartNavigation?.cartNavigationRef?.isReady()) {
      CartNavigation.pop();
    } else {
      ProfileNavigation.pop();
    }
    return true;
  };

  const signOut = () => {
    useLayoutEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <View style={{marginLeft: 20}}>
            <Avatar
              rounded
              source={{
                uri:
                  BASEURL + persistStorage.getState().userDetails.profile_image,
              }}
            />
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={{
              marginRight: 10,
            }}
            onPress={signOut}>
            <AntDesign name="logout" size={24} color="black" />
          </TouchableOpacity>
        ),
      });
    }, [navigation]);
  };

  useEffect(() => {
    setMessages([
      {
        _id: 0,
        index: 0,
        text: '',
        initial: true,
        type: 'QUICKREPLIES',
        createdAt: new Date(),
        updated: false,
        sent: false,
        // Mark the message as received, using two tick
        received: true,
        // Mark the message as pending with a clock loader
        pending: false,
        quickReplies: {
          type: 'radio', // or 'checkbox',
          keepIt: true,

          values: [
            {
              title: 'TRACK ORDER',
              enable: false,
              _id: 1,
            },
            {
              title: 'RETURN ORDER',
              enable: false,
              _id: 2,
            },
            {
              title: 'CANCEL ORDER',
              enable: false,
              _id: 3,
            },
          ],
        },
        user: {
          _id: 2,
          name: 'WaxPlace Bot',
          avatar: darkMode
            ? imagepath.waxplacelogoWhite
            : imagepath.waxplacelogo,
        },
      },
    ]);
  }, []);

  const updateWaxbot = messageData => {
    setMessages([
      {
        _id: 0,

        text: 'first',
        initial: false,
        type: 'QUICKREPLIES',
        createdAt: new Date(),
        updated: false,
        sent: false,
        // Mark the message as received, using two tick
        received: true,
        // Mark the message as pending with a clock loader
        pending: false,
        quickReplies: {
          type: 'radio', // or 'checkbox',
          keepIt: true,

          values: [
            {
              title: 'TRACK ORDER',
              enable: false,
              _id: 1,
            },
            {
              title: 'RETURN ORDER',
              enable: false,
              _id: 2,
            },
            {
              title: 'CANCEL ORDER',
              enable: false,
              _id: 3,
            },
          ],
        },
        user: {
          _id: 2,
          name: 'WaxPlace Bot',
          avatar: darkMode
            ? imagepath.waxplacelogoWhite
            : imagepath.waxplacelogo,
        },
      },
    ]);
  };

  const getCurrentStatus = async () => {
    let jsonData = {
      nseg: 'asd',
    };
    shipmentTracking(jsonData, userReducer)
      .then(result => {
        let data = {
          f_finalizacion: result.getElementsByTagName('num_recogida')[0].value,
          situacion: result.getElementsByTagName('situacion')[0].value,
          f_incidencia: result.getElementsByTagName('f_incidencia')[0].value,
          cod_incidencia:
            result.getElementsByTagName('cod_incidencia')[0].value,
          desc_incidencia:
            result.getElementsByTagName('desc_incidencia')[0].value,
          cod_reparto: result.getElementsByTagName('cod_reparto')[0].value,
          desc_reparto: result.getElementsByTagName('desc_reparto')[0].value,
        };
      })
      .catch(err => {});
  };

  const addAudio = async () => {
    setMessages(previousMessages => {
      let length = previousMessages.length;

      return [
        {
          _id: length,
          data: userReducer?.currentOrderDetails,
          type: 'AUDIO',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'WaxPlace Bot',
            avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
          },
        },
      ].concat(previousMessages);
    });
  };

  const addImage = async () => {
    setMessages(previousMessages => {
      //  let previousMessages = previousMessage.reverse();
      let length = previousMessages.length;

      return [
        {
          _id: length,
          data: userReducer?.currentOrderDetails,
          type: 'IMAGE',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'WaxPlace Bot',
            avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
          },
        },
      ].concat(previousMessages);
    });
  };
  const removeChat = () => {
    let messageList = messages.slice(1);
    setMessages(messageList);
  };

  const onQuickReply = async quickReply => {
    quickReply?.quickReplies?.values.map(val => {
      if (val.enable == true) {
        if (val._id == 1) {
          let length = messages.length - 1;
          setShowInputToolBar(false);
          let addMessage = [];
          if (
            userReducer.selectedAlbum.orderStatus.toUpperCase() ==
            'ORDER PLACED'
          ) {
            addMessage.push({
              _id: 1,
              text: textContent.chatBot.shipment_not_yet_created,
              type: 'INFO',
              createdAt: new Date(),
            });
          } else {
            addMessage.push({
              _id: 1,
              data: userReducer?.currentOrderDetails,
              type: 'TRACKING',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'WaxPlace Bot',
                avatar: darkMode
                  ? imagepath.waxplacelogoWhite
                  : imagepath.waxplacelogo,
              },
            });
          }

          addMessage.push({
            ...quickReply,
            updated: true,
          });

          setMessages(addMessage);
        }
        if (val._id == 2) {
          let length = 1;
          setShowInputToolBar(true);
          if (userReducer.selectedAlbum.isReturn) {
            // updateChat();
            if (returnId == null) {
              let addMessage = [];
              addMessage.push({
                ...quickReply,
                updated: true,
              });
              setMessages(addMessage);
              setReturnId(userReducer?.selectedAlbum?.returnId);
            } else {
              setMessages(recievedMessages);
            }
          } else {
            // if (userReducer.currentOrderDetails.isStorePickup) {
            //   let addMessage = [];
            //   addMessage.push({
            //     _id: length++,
            //     text: textContent.chatBot.return_store_info,
            //     type: 'INFO',
            //     createdAt: new Date(),
            //   });
            //   addMessage.push({
            //     _id: length++,
            //     ...quickReply,
            //     updated: true,
            //   });

            //   setMessages(addMessage);
            // } else
            {
              if (
                userReducer.selectedAlbum.orderStatus.toUpperCase() ==
                  'DELIVERED' ||
                userReducer.selectedAlbum.orderStatus.toUpperCase() ==
                  'RETURN APPROVED'
              ) {
                if (
                  moment(
                    moment(new Date()).valueOf() -
                      moment(
                        userReducer.selectedAlbum.orderStatusDate,
                      ).valueOf(),
                  ).valueOf() < 86400000 &&
                  userReducer.selectedAlbum.orderStatus.toUpperCase() ==
                    'DELIVERED'
                ) {
                  let addMessage = [];

                  addMessage.push({
                    _id: length++,
                    data: userReducer?.selectedAlbum,
                    type: 'RETURNDETAILS',
                    createdAt: new Date(),
                    user: {
                      _id: 1,
                      name: 'WaxPlace Bot',
                      avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
                    },
                  });
                  addMessage.push({
                    _id: length++,
                    ...quickReply,
                    updated: true,
                  });
                  setMessages(addMessage);
                } else {
                  let addMessage = [];

                  addMessage.push({
                    _id: length++,
                    text: textContent.chatBot.return_24,
                    type: 'INFO',
                    createdAt: new Date(),
                  });
                  addMessage.push({
                    _id: length++,
                    ...quickReply,
                    updated: true,
                  });
                  setMessages(addMessage);
                }
              } else if (
                userReducer.selectedAlbum.orderStatus.toUpperCase() ==
                'RETURN DENIED'
              ) {
                let addMessage = [];

                addMessage.push({
                  _id: length++,
                  text: textContent.chatBot.return_rejected,
                  type: 'INFO',
                  createdAt: new Date(),
                });
                addMessage.push({
                  _id: length++,
                  ...quickReply,
                  updated: true,
                });
                setMessages(addMessage);
              } else if (
                userReducer.selectedAlbum.orderStatus.toUpperCase() ==
                  'ORDER ACCEPTED' ||
                userReducer.selectedAlbum.orderStatus.toUpperCase() ==
                  'ORDER PLACED'
              ) {
                let addMessage = [];

                addMessage.push({
                  _id: length++,
                  text: textContent.chatBot.return_before_delivery,
                  type: 'INFO',
                  createdAt: new Date(),
                });
                addMessage.push({
                  _id: length++,
                  ...quickReply,
                  updated: true,
                });
                setMessages(addMessage);
              }
            }
          }
        }
        if (val._id == 3) {
          let length = messages.length - 1;
          setShowInputToolBar(false);
          let addMessage = [];

          addMessage.push({
            _id: 1,
            data: userReducer?.selectedAlbum,
            type: 'CANCELSHIPMENT',
            createdAt: new Date(),
            user: {
              _id: 1,
              name: 'WaxPlace Bot',
              avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
            },
          });
          addMessage.push({
            ...quickReply,
            updated: true,
          });
          setMessages(addMessage);
        }
      }
    });
  };
  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      style={[
        {flex: 1},
        ,
        darkMode && {backgroundColor: colors.primaryBackground},
      ]}>
      <Dialog
        visible={filesDialog}
        onTouchOutside={() => setFilesDialog(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
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
              addImage();
              setFilesDialog(false);
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 18,
                alignSelf: 'center',
              }}>
              CAMERA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 16,
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              addAudio();
              setFilesDialog(false);
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 18,
                alignSelf: 'center',
              }}>
              RECORD AUDIO
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>

      <Dialog
        visible={recordDialog}
        onTouchOutside={() => setRecordDialog(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
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
            onPress={() => openCamera()}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 18,
                alignSelf: 'center',
              }}>
              CAMERA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 16,
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => pickImage()}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 18,
                alignSelf: 'center',
              }}>
              RECORD AUDIO
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>

      <GiftedChat
        ref={ref => {
          giftedRef = ref;
        }}
        wrapInSafeArea={false}
        inverted={true}
        messages={messages}
        showAvatarForEveryMessage={true}
        onSend={messages => {
          const newValue = {
            type: 'text',
            value: messages[0].text,
            user: `${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
            timeStamp: new Date().getTime(),
          };
          userReducer?.firebasedb.ref(`messages/${returnId}/`).push(newValue);
        }}
        showUserAvatar={true}
        alwaysShowSend={true}
        // isTyping={true}
        //containerStyle={{backgroundColor: colors.premiumGrayOne}}
        textInputStyle={{
          color: colors.black,
          fontFamily: fontFamily.MontserratRegular,
          fontSize: 16,
        }}
        placeholderTextColor={colors.gray}
        placeholder="Type your queries.."
        updateUserDetails={updateUserDetails}
        renderInputToolbar={
          showInputToolBar && userReducer?.selectedAlbum?.isReturn
            ? null
            : () => (
                <View style={{}}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: fontFamily.MontserratMedium,
                      alignSelf: 'center',
                      color: colors.primaryTextColor,
                    }}>
                    {textContent.chatBot.chat_disabled}
                  </Text>
                </View>
              )
        }
        renderBubble={props => (
          <RenderComponents
            giftedChatProps={{...props}}
            userReducer={userReducer}
            onQuickReply={onQuickReply}
            updateWaxbot={updateWaxbot}
            addAudio={addAudio}
            addImage={addImage}
            isReturn={userReducer?.selectedAlbum?.isReturn}
            updateUserDetails={updateUserDetails}
            removeChat={() => removeChat()}
            returnId={returnId}
            returnInitiated={() => {
              // let addMessage = [];
              // addMessage.push(messages[messages.length - 1]);
              // setMessages(addMessage);
              // setReturnId(userReducer?.selectedAlbum?.returnId);
              if (ProfileNavigation?.profileNavigationRef?.isReady()) {
                ProfileNavigation.pop();
              } else {
                HomeNavigation.pop();
              }
            }}
          />
        )}
        user={{
          _id: 1,
          name: 'React Native',
          avatar: `https://ui-avatars.com/api/?background=eb0e71&color=FFF&name=${userReducer?.profileDetails?.firstName} ${userReducer?.profileDetails?.lastName}`,
        }}
      />

      <ProgressLoader
        visible={userReducer.spinner}
        isHUD={true}
        isModal={true}
        color={colors.spinner}
      />
    </SafeAreaView>
  );
};

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(ChatScreen);
