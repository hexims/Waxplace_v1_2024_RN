import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import moment from 'moment';
import _ from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getSortedArray, isMatch} from '../actions/HelperFunctions';
import {SortView} from '../components/SortView';
import {getUserOrders} from '../actions/UserAPI';
import {DarkModeContext} from '../components/DarkModeContext';
import {useKeyboard} from '../utils/UseKeyBoard';
import textContent from '../utils/textContent';

const MyPurchases = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [purchaseList, setPurchaseList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [initial, setInitial] = useState(true);
  const [extra, setExtra] = useState(0);
  const [sortValue, setSortValue] = useState('newest');

  useEffect(() => {
    setPurchaseList([]);
    loadPurchaseList();
  }, [userReducer?.reRenderOrderDetails, sortValue]);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const loadPurchaseList = () => {
    setInitial(true);
    getUserOrders(sortValue)
      .then(response => {
        if (Array.isArray(response?.orders)) {
          let purchaseList = [];

          response?.orders?.map(data => {
            purchaseList.push({
              ...data,
            });
          });

          setPurchaseList(purchaseList);
        }
        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
      });
  };

  const albumSearchCheck = albumDetails => {
    let k = 0;
    albumDetails.map((val, index) => {
      if (val.albumName.toLowerCase().includes(searchText.toLowerCase())) {
        k = 1;
      }
    });

    if (k == 0) {
      return false;
    } else {
      return true;
    }
  };

  const renderPurchaseList = (item, index) => {
    let date = moment(item.createdAt).format('DD/MM/YYYY hh:mm a').toString();

    let sellerTotal = parseFloat(item.totalPayment);

    if (
      !isMatch(item, ['orderId', 'label'], searchText) &&
      !albumSearchCheck(item.albumDetails) &&
      !date.includes(searchText) &&
      !getPrice(sellerTotal).toString().includes(searchText)
    ) {
      return null;
    }
    return (
      <TouchableOpacity
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 5,

          paddingBottom: 10,
          borderRadius: 10,
          backgroundColor: colors.cardColor,
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          paddingLeft: 15,
          paddingVertical: 10,
          marginTop: 5,
        }}
        onPress={() => {
          updateUserDetails({prop: 'currentOrderDetails', value: item});
          ProfileNavigation.navigate('OrderDetails');
        }}>
        <View
          style={{
            flexDirection: 'row',
            overflow: 'hidden',
            alignItems: 'center',
            marginTop: 5,
          }}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.grayShadeOne,
              fontSize: 14,
              fontFamily: fontFamily.MontserratRegular,
              width: 85,
            }}>
            {textContent.MyPurchases.orderid}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,

              fontFamily: fontFamily.MontserratMedium,
            }}>
            {item.orderId}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            overflow: 'hidden',
            alignItems: 'center',
            marginTop: 2,
          }}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              fontFamily: fontFamily.MontserratRegular,
              width: 85,
            }}>
            {textContent.MyPurchases.order_date}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,

              fontFamily: fontFamily.MontserratMedium,
            }}>
            {moment(item.createdAt).format('DD/MM/YYYY hh:mm a')}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            overflow: 'hidden',
            alignItems: 'center',
            marginTop: 5,
          }}>
          <View style={{height: '100%'}}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{
                color: colors.grayShadeOne,
                fontSize: 14,
                fontFamily: fontFamily.MontserratRegular,
                width: 85,
              }}>
              {textContent.MyPurchases.albums}
            </Text>
          </View>
          <View style={{width:300}}>
            {item.albumDetails
              // .slice(
              //   0,
              //   item.albumDetails.length > 3 ? 3 : item.albumDetails.length,
              // )
              .map((val, index) => {
                return (
                  <Text
                    ellipsizeMode="tail"
                    style={{
                     width:'100%',
                      color: colors.primaryTextColor,
                      fontSize: 16,
                      fontFamily: fontFamily.MontserratMedium,
                      marginBottom:
                        index == item.albumDetails.length - 1 ? 0 : 2,
                    }}>
                    {val.albumName}
                  </Text>
                );
              })}
          </View>
        </View>
        <View
          style={{
            borderBottomWidth: StyleSheet.hairlineWidth,
            width: '95%',
            marginVertical: 10,
            borderColor: colors.premiumGray + 'aa',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            overflow: 'hidden',
            alignItems: 'center',
            marginTop: 4,
          }}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.grayShadeOne,
              fontSize: 14,
              fontFamily: fontFamily.MontserratRegular,
              width: 85,
            }}>
            {textContent.MyPurchases.total}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.notificationColor,
              fontSize: 17,

              fontFamily: fontFamily.MontserratBold,
            }}>
            {`\u20AC${getPrice(sellerTotal)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', height: '100%'}}>
        <SortView
          hideDistance={true}
          initial={initial}
          marginBottom={0}
          setFilterType={type => {
            setSortValue(type);
          }}
        />
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
          data={purchaseList}
          extraData={extra}
          style={{marginTop: 10}}
          contentContainerStyle={{paddingBottom: useKeyboard() + 40}}
          renderItem={({item, index}) =>
            renderPurchaseList(item, index)
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
          searchText !== '' ? '' : textContent.MyPurchases.search_text
        }
        onBackPress={() => {
          ProfileNavigation.pop();
        }}
      />
      {renderPage()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  checkbox: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    padding: 2,
  },
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(MyPurchases);
