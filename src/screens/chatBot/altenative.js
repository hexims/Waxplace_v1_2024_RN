import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import * as BottomNavigation from '../../router/_BottomNavigation';
import * as HomeNavigation from '../../router/_HomeNavigation';
import * as ProfileNavigation from '../../router/_ProfileNavigation';
import {updateUserDetails} from '../../redux/actions/UserAction';
import {DarkModeContext} from '../../components/DarkModeContext';
import { useContext } from 'react';
import imagepath from '../../utils/Images';
import {Dialog} from 'react-native-simple-dialogs';
import { SafeAreaView } from 'react-native';
import fontFamily from '../../utils/FontFamily';
// Define Message class with properties for each message type
class Message {
  constructor(id, type, text, createdAt, user, image, audio, quickReplies) {
    this.id = id;
    this.type = type;
    this.text = text;
    this.createdAt = createdAt;
    this.user = user;
    this.image = image;
    this.audio = audio;
    this.quickReplies = quickReplies;
  }
}

// Define functional component for text messages
const TextMessage = ({message}) => {
  return (
    <View
      style={
        message.user.id === 1
          ? styles.sentMessageContainer
          : styles.receivedMessageContainer
      }>
      <Image style={styles.avatar} source={{uri: message.user.avatar}} />
      <View style={styles.messageContainer}>
        <View style={styles.message}>
          <Text style={styles.messageText}>{message.text}</Text>
          <Text style={styles.messageTime}>
            {message.createdAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Define functional component for image messages
const ImageMessage = ({message}) => {
  return (
    <View
      style={
        message.user.id === 1
          ? styles.sentMessageContainer
          : styles.receivedMessageContainer
      }>
      <Image style={styles.avatar} source={{uri: message.user.avatar}} />
      <View style={styles.messageContainer}>
        <View style={styles.message}>
          <Image style={styles.image} source={{uri: message.image}} />
          <Text style={styles.messageTime}>
            {message.createdAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Define functional component for audio messages
const AudioMessage = ({message}) => {
  return (
    <View
      style={
        message.user.id === 1
          ? styles.sentMessageContainer
          : styles.receivedMessageContainer
      }>
      <Image style={styles.avatar} source={{uri: message.user.avatar}} />
      <View style={styles.messageContainer}>
        <View style={styles.message}>
          <TouchableOpacity style={styles.audioButton}>
            <Text style={styles.audioButtonText}>Play Audio</Text>
          </TouchableOpacity>
          <Text style={styles.messageTime}>
            {message.createdAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Define functional component for quick reply messages
const QuickReplyMessage = ({message}) => {
  return (
    <View
      style={
        message.user.id === 1
          ? styles.sentMessageContainer
          : styles.receivedMessageContainer
      }>
      <Image style={styles.avatar} source={{uri: message.user.avatar}} />
      <View style={styles.messageContainer}>
        <View style={styles.message}>
          <Text style={styles.messageText}>{message.text}</Text>
          <View style={styles.quickRepliesContainer}>
            {message.quickReplies.map(reply => (
              <TouchableOpacity style={styles.quickReplyButton} key={reply}>
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.messageTime}>
            {message.createdAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ChatScreen = ({navigation, userReducer, updateUserDetails, route}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recievedMessages, setRecievedMessages] = useState([]);
  const [filesDialog, setFilesDialog] = useState(false);
  const [recordDialog, setRecordDialog] = useState(false);
  const [showInputToolBar, setShowInputToolBar] = useState(false);
  const [returnId, setReturnId] = useState(null);
  let dbRef = null;
  const {darkMode, colors} = useContext(DarkModeContext);

  useEffect(() => {
    BottomNavigation.navigationRef?.setParams({hide: true});

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
              if (
                BottomNavigation?.navigationRef?.getCurrentRoute()?.name ==
                'HOME'
              ) {
                HomeNavigation.pop();
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
    // Initialize messages
    setMessages([
      new Message(
        1,
        'text',
        'Hello! How can I assist you today?',
        new Date(),
        {id: 2, name: 'John Doe', avatar: 'https://picsum.photos/id/1/200/300'},
        null,
        null,
        null,
      ),
      new Message(
        2,
        'text',
        'I need some help with my account.',
        new Date(),
        {id: 1, name: 'Jane Doe', avatar: 'https://picsum.photos/id/2/200/300'},
        null,
        null,
        null,
      ),
      new Message(
        3,
        'quick-reply',
        'Sure, I can help with that. Which of the following do you need help with?',
        new Date(),
        {id: 2, name: 'John Doe', avatar: 'https://picsum.photos/id/1/200/300'},
        null,
        null,
        ['Reset password', 'Update billing information', 'Cancel account'],
      ),
      new Message(
        4,
        'text',
        'I need to reset my password.',
        new Date(),
        {id: 1, name: 'Jane Doe', avatar: 'https://picsum.photos/id/2/200/300'},
        null,
        null,
        null,
      ),
      new Message(
        5,
        'text',
        'No problem, I can help with that. Please provide your email address.',
        new Date(),
        {id: 2, name: 'John Doe', avatar: 'https://picsum.photos/id/1/200/300'},
        null,
        null,
        null,
      ),
    ]);
  }, []);

  const handleSend = () => {
    if (inputText) {
      const newMessage = new Message(
        messages.length + 1,
        'text',
        inputText,
        new Date(),
        {id: 1, name: 'Jane Doe', avatar: 'https://picsum.photos/id/2/200/300'},
        null,
        null,
        null,
      );
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const renderItem = ({item}) => {
    switch (item.type) {
      case 'text':
        return <TextMessage message={item} />;
      case 'image':
        return <ImageMessage message={item} />;
      case 'audio':
        return <AudioMessage message={item} />;
      case 'quick-reply':
        return <QuickReplyMessage message={item} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
      
      <FlatList
        style={styles.messagesContainer}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message here"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    topBar: {
      height: 64,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    topBarText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    messagesContainer: {
      flex: 1,
    },
    sentMessageContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginVertical: 8,
      marginHorizontal: 16,
    },
    receivedMessageContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
      marginVertical: 8,
      marginHorizontal: 16,
    },
    messageText: {
      color: '#fff',
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: '#d8d8d8',
    },
    input: {
      flex: 1,
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      padding: 8,
      marginRight: 8,
    },
  });

  const mapStateToProps = state => ({
    userReducer: state.userReducer,
  });
  
  export default connect(mapStateToProps, {updateUserDetails})(ChatScreen);
