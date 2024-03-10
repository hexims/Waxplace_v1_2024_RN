import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import _ from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getImage} from '../actions/GenericAPI';

import {isMatch} from '../actions/HelperFunctions';
import {removeFriendForUser, getUserFriendsList} from '../actions/UserAPI';
import ProgressLoader from '../components/ProgressLoader';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import FastImage from 'react-native-fast-image';

const Friends = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [friendsList, setFriendsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [initial, setInitial] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    mountFunction();
  }, []);

  const removefromFriends = (sellerId, index) => {
    setSpinner(true);
    let jsonData = {sellerId: sellerId};
    removeFriendForUser(jsonData)
      .then(response => {
        if (response.status === 'success') {
          toast.show(response.message);
          friendsList.splice(index, 1);
        } else {
          toast.show(response.message);
        }
        setSpinner(false);
      })
      .catch(error => {
        setSpinner(false);
      });
  };

  const mountFunction = () => {
    getUserFriendsList()
      .then(response => {
        if (response?.friends) {
          setFriendsList(response.friends);
        } else {
          toast.show(textContent.general.general_error);
        }
        setInitial(false);
      })
      .catch(err => {
        setInitial(false);
      });
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', flex: 1}}>
        <FlatList
          ListFooterComponent={
            <>
              {initial && (
                <ActivityIndicator
                  size={'small'}
                  style={{marginTop: '15%'}}
                  color={colors.spinner}
                />
              )}
            </>
          }
          data={friendsList}
          extraData={extra}
          contentContainerStyle={{paddingBottom: 150}}
          style={{marginTop: 10}}
          renderItem={({item, index}) =>
            !isMatch(
              item,
              [
                'storeName',
                'firstName',
                'lastName',
                'storeInfo',
                'profileInfo',
              ],
              searchText,
            ) ? null : (
              <TouchableOpacity
                onPress={() => {
                  item.storeName
                    ? ProfileNavigation.navigate('StoreDetails', {
                        vendorData: item,
                      })
                    : ProfileNavigation.navigate('FriendProfile', {
                        userData: item,
                      });
                }}
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginBottom: 5,
                  height: 115,
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
                  marginTop: 5,
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    flex: 1.6,
                    height: '100%',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    paddingLeft: 5,
                  }}>
                  <FastImage
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      alignSelf: 'center',
                      backgroundColor: colors.bgGray,
                    }}
                    source={{
                      ...getImage(
                        item.profile_image ? item.profile_image : item.image,
                      ),
                    }}
                  />
                </View>
                <View style={{flex: 4, height: '100%'}}>
                  <View
                    style={{
                      flex: 3,
                      width: '100%',
                      flexDirection: 'row',
                    }}>
                    <View
                      style={{
                        flex: 4,
                        height: '100%',
                        overflow: 'hidden',
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          width: '100%',
                          justifyContent: 'center',
                        }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            color: colors.primaryTextColor,
                            fontSize: 18,

                            fontFamily: fontFamily.MontserratBold,
                            marginLeft: 8,
                          }}>
                          {item.storeName
                            ? item.storeName
                            : item.firstName + ' ' + item.lastName}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 2,
                          width: '100%',
                        }}>
                        <Text
                          numberOfLines={3}
                          style={{
                            color: colors.primaryTextColor,

                            fontSize: 13,
                            fontFamily: fontFamily.MontserratMedium,
                            marginLeft: 8,
                          }}>
                          {item.storeInfo
                            ? item.storeInfo == ''
                              ? 'WAXPLACE STORE'
                              : item.storeInfo
                            : item.profileInfo == ''
                            ? 'WAXPLACE USER'
                            : item.profileInfo}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 10,
                      }}>
                      <TouchableOpacity
                        style={{}}
                        onPress={() => removefromFriends(item._id, index)}>
                        <Image
                          style={[
                            {width: 30, height: 30},
                            darkMode && {tintColor: colors.primaryTextColor},
                          ]}
                          resizeMode={'contain'}
                          source={imagepath.remove_friend}></Image>
                      </TouchableOpacity>
                      <View style={{flex: 1, width: '100%'}}></View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }></FlatList>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.Friends.search_text
        }
      />

      {renderPage()}
      <ProgressLoader
        visible={spinner}
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
    justifyContent: 'center',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Friends);
