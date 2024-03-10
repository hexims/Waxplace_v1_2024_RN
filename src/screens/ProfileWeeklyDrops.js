import React, {useEffect, useState} from 'react';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';

import {Dialog} from 'react-native-simple-dialogs';

import moment from 'moment';
import _ from 'lodash';

import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage} from '../actions/GenericAPI';
import {
  archiveWeeklyDropsData,
  recentProfileWeeklyDrops,
  sendWeeklyDropRequest,
} from '../actions/UserAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {isMatch} from '../actions/HelperFunctions';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';

const ProfileWeeklyDrops = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [weeklyDialog, setWeeklyDialog] = useState(false);
  const [initial, setInitial] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [usermessage, setUserMessage] = useState('');
  const [recentWeeklyDrop, setRecentWeeklyDrop] = useState([]);
  const [functionCall, setFunctionCall] = useState('');
  useEffect(() => {
    mountFunction();
  }, []);

  useEffect(() => {}, [functionCall]);

  const sendRequestforweeklydrop = () => {
    if (!usermessage) {
      toast.show(textContent.ProfileWeeklyDrops.alert_message);

      return;
    }

    let jsonData = {message: usermessage};

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

  const archiveWeeklyDrop = item => {
    BottomNavigation.navigate({name: 'HOME', merge: true});
    HomeNavigation.navigate('WeeklyDrops', {
      from: 'Profile',
      data: item,
    });

    let jsonData = {
      weeklyDropId: item._id,
    };

    archiveWeeklyDropsData(jsonData)
      .then(response => {
        if (response.status === 'success') {
        } else {
          toast.show(response.message);
        }
      })
      .catch(error => {});
  };

  const mountFunction = () => {
    recentProfileWeeklyDrops()
      .then(response => {
        if (response?.weeklyDropArr) {
          setRecentWeeklyDrop(response?.weeklyDropArr);
        } else {
          toast.show(textContent.general.general_error);
        }
        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const renderPage = () => {
    return (
      <>
        <SearchBar
          cartValue={userReducer.cartLength}
          searchEnabled={true}
          searchText={searchText}
          searchFunction={text => {
            setSearchText(text);
          }}
          placeHolderCondition={
            searchText !== '' ? '' : textContent.ProfileWeeklyDrops.search_text
          }
          onBackPress={() => {
            ProfileNavigation.pop();
          }}
        />
        <View
          style={{
            width: '100%',
          }}>
          <FlatList
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
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <Text
                  style={{
                    marginVertical: 10,
                    color: colors.primaryTextColor + 'cc',
                    fontSize: 18,
                    fontFamily: fontFamily.MontserratBold,
                    alignSelf: 'center',
                    letterSpacing: 1,
                  }}>
                  {textContent.ProfileWeeklyDrops.weekly_drop}
                </Text>
              </>
            }
            data={recentWeeklyDrop}
            contentContainerStyle={{paddingBottom: 150}}
            style={{marginTop: 10}}
            renderItem={({item, index}) => {
              let date = moment(item.created_At).format('DD/MM/YY').toString();

              if (
                !isMatch(
                  item,
                  ['artistName', 'description', 'totalDuration', 'noOfTracks'],
                  searchText,
                ) &&
                !date
                  .toString()
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              ) {
                return null;
              }

              return (
                <TouchableOpacity
                  disabled={true}
                  style={{
                    width: '95%',
                    alignSelf: 'center',
                    marginVertical: 5,
                    height: 115,
                    backgroundColor: colors.secondaryBackground,
                    borderRadius: 10,
                    elevation: 4,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    flexDirection: 'row',
                  }}
                  onPress={() => {
                    archiveWeeklyDrop(item);
                  }}>
                  <View
                    style={{
                      padding: 5,
                      alignContent: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      style={{
                        width: 100,
                        height: 100,
                        alignSelf: 'center',
                        height: '100%',
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
                      alignItems: 'flex-start',
                    }}>
                    <View style={{width: '100%'}}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: colors.primaryTextColor,
                          fontFamily: fontFamily.MontserratBold,
                          fontSize: 18,
                          width: '92%',
                        }}>
                        {item.artistName}
                      </Text>
                      <Text
                        style={{
                          marginTop: 1,
                          color: colors.primaryTextColor,
                          fontFamily: fontFamily.MontserratMedium,
                          fontSize: 13,
                        }}>
                        {moment(item.created_At).format('DD/MM/YYYY')}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          marginVertical: 1.5,
                          color: colors.primaryTextColor,
                          fontSize: 14,
                          fontWeight: '500',
                          textAlign: 'left',
                          fontFamily: fontFamily.MontserratRegular,
                        }}>
                        {item.description ? item.description : ''}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        position: 'absolute',
                        bottom: 0,
                        paddingLeft: 5,
                        paddingBottom: 8,
                      }}>
                      <Text
                        style={{
                          color: colors.primaryTextColor,
                          fontSize: 14,
                          fontFamily: fontFamily.MontserratMedium,
                          letterSpacing: 0.5,
                        }}>
                        {(item.noOfTracks ? item.noOfTracks : '0') +
                          ' Tracks ' +
                          (item.totalDuration ? item.totalDuration : '00:00')}
                      </Text>
                    </View>
                  </View>
                  {item.isWeekly ? (
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        width: '100%',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                        padding: 12,
                      }}>
                      <Image
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                        }}
                        resizeMode="contain"
                        source={imagepath.dropstar}></Image>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            }}></FlatList>
        </View>
      </>
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
            {textContent.ProfileWeeklyDrops.weekly_drops_title}
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
            {textContent.ProfileWeeklyDrops.weekly_drops_message}
          </Text>

          <View style={{marginTop: 15}}>
            <TextInput
              style={styles.textInput(colors)}
              underlineColorAndroid="transparent"
              placeholder={
                textContent.ProfileWeeklyDrops.weekly_drops_placeholder
              }
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
              {textContent.ProfileWeeklyDrops.button_text}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>

      {renderPage()}
      <TouchableOpacity
        style={{position: 'absolute', right: 0, top: '11%'}}
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
    width: '100%',
    backgroundColor: colors.primaryBackground,
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

export default connect(mapStateToProps, {updateUserDetails})(
  ProfileWeeklyDrops,
);
