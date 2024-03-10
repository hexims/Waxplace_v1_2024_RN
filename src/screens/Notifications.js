import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {Dialog} from 'react-native-simple-dialogs';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import _, {initial} from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';

import {
  getNotificationsOfUser,
  removeFromNotifications,
} from '../actions/UserAPI';
import ProgressLoader from '../components/ProgressLoader';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';

const Notifications = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [searchList, setSearchList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [extra, setExtra] = useState(0);
  const [functionCall, setFunctionCall] = useState('');
  const [initial, setInitial] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    mountFunction();
  }, []);

  useEffect(() => {
    if (functionCall == 'changeTextDebouncer') {
      changeTextDebouncer(searchText);
    }
  }, [functionCall]);

  const changeTextDebouncer = useCallback(
    text => {
      searchFunction(text);
    },
    [searchText],
  );

  const searchFunction = text => {
    let searchList = [];
    searchList = notifications.filter(data => {
      if (
        getDate(data?.item?.createdAt).includes(text.toLowerCase()) ||
        data?.item?.message.toLowerCase().includes(text.toLowerCase())
      ) {
        return data;
      }
    });
    setFunctionCall('');
    setSearchList(searchList);
  };

  const mountFunction = () => {
    getNotificationsOfUser()
      .then(response => {
        if (response.result) {
          setNotifications(response.result);
          setSearchList(response.result);
        }
        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const removeNotifications = notifId => {
    updateUserDetails({prop: 'spinner', value: true});
    let jsonData = {_id: notifId};
    removeFromNotifications(jsonData)
      .then(response => {
        updateUserDetails({prop: 'spinner', value: false});
        setSearchList(response.result);
        setNotifications(response.result);
      })
      .catch(error => {
        updateUserDetails({prop: 'spinner', value: false});
        toast.show(textContent.general.general_error);
      });
  };

  const getDate = isoDate => {
    let date = new Date(isoDate);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dt = date.getDate();

    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }

    return dt + '-' + month + '-' + year;
  };

  const renderPage = () => {
    return (
      <View style={{height: '100%', width: '100%'}}>
        <View style={{marginTop: 5, width: '100%', alignItems: 'center'}}>
          <SwipeListView
            ListEmptyComponent={
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
            data={searchText !== '' ? searchList : notifications}
            contentContainerStyle={{
              width: '100%',
              alignItems: 'center',
              alignSelf: 'center',
              paddingBottom: 200,
              paddingTop: 3,
            }}
            style={{paddingBottom: 100}}
            keyExtractor={(item, index) => item?._id?.toString()}
            renderItem={(data, rowMap) => (
              <SwipeRow
                style={{
                  elevation: 4,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                }}
                disableRightSwipe={true}
                stopLeftSwipe={80}
                stopRightSwipe={-65}
                closeOnRowPress={true}
                rightActivationValue={-55}
                leftActivationValue={55}
                swipeToOpenPercent={'20%'}
                recalculateHiddenLayout={true}>
                <View
                  style={{
                    height: 70,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    alignSelf: 'flex-end',
                  }}></View>
                <View
                  style={{
                    height: 70,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 5,
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
                      width: '98%',
                      flexDirection: 'row',
                      borderRadius: 10,
                      backgroundColor: colors.secondaryBackground,

                      height: 65,
                      justifyContent: 'center',
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
                    <View
                      style={{
                        width: '95%',
                        alignSelf: 'center',
                        height: '90%',
                        flexDirection: 'row',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setCurrentMessage(data?.item?.message);
                          setShowMessage(true);
                        }}
                        style={{
                          width: '70%',
                          height: '100%',
                          alignContent: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingLeft: 10,
                        }}>
                        <Text
                          style={{color: colors.primaryTextColor}}
                          numberOfLines={2}>
                          {data?.item?.message}
                        </Text>
                      </TouchableOpacity>
                      <View
                        style={{
                          width: '30%',
                          height: '100%',
                          justifyContent: 'center',
                          alignContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: colors.primaryTextColor,
                            fontSize: 14,
                            fontFamily: fontFamily.MontserratRegular,
                            alignSelf: 'center',
                          }}>
                          {getDate(data?.item?.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </SwipeRow>
            )}
            renderHiddenItem={(data, rowMap) => (
              <View
                style={{
                  height: 70,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  alignSelf: 'flex-end',
                  marginRight: 4,
                  marginTop: 5,
                }}>
                <TouchableOpacity
                  style={{
                    height: 65,
                    width: 80,
                    backgroundColor: colors.secondaryBackground + '90',
                    justifyContent: 'center',
                    alignItems: 'center',

                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                  }}
                  onPress={() => {
                    removeNotifications(data?.item?._id);
                  }}>
                  <Image
                    style={{
                      borderRadius: 10,
                      height: 25,
                      width: 25,
                      alignSelf: 'center',
                      tintColor: colors.gray,
                    }}
                    source={imagepath.trash}></Image>
                </TouchableOpacity>
              </View>
            )}
            leftOpenValue={65}
            rightOpenValue={-65}
            previewRowKey={'0'}
            previewOpenValue={-40}
            previewOpenDelay={3000}
            disableRightSwipe={true}
            stopLeftSwipe={80}
            stopRightSwipe={-65}
            closeOnRowOpen={true}
            closeOnRowBeginSwipe={true}
            tension={20}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={false}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);

          setFunctionCall('changeTextDebouncer');
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.Notifications.search_text
        }
        onBackPress={() => {
          ProfileNavigation.pop();
        }}
      />
      <Dialog
        visible={showMessage}
        onTouchOutside={() => {
          setShowMessage(false);
        }}
        scrollEnabled={true}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          width: '90%',
          backgroundColor: colors.secondaryBackground,
          alignSelf: 'center',
          minHeight: 100,
          maxHeight: 350,
          paddingVertical: 10,
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            borderRadius: 10,
            width: '100%',
            // alignItems: 'center',
            height: '100%',
            // justifyContent: 'center',
            //  alignContent: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {currentMessage}
          </Text>
        </ScrollView>
      </Dialog>
      {renderPage()}
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
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Notifications);
