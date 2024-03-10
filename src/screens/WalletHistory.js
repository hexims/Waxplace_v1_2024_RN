import React, {useEffect, useState, useContext} from 'react';

import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';

import moment from 'moment';

import _ from 'lodash';

import {Dialog} from 'react-native-simple-dialogs';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import persistStorage from '../redux/store/persistStore';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getWalletHistory} from '../actions/UserAPI';

import {SortView} from '../components/SortView';
import {getSortedArray} from '../actions/HelperFunctions';
import {DarkModeContext} from '../components/DarkModeContext';
import {normalize} from '../components/NormalizeFonts';
import {MainButton} from '../components/MainButton';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {useKeyboard} from '../utils/UseKeyBoard';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {createPayout} from '../actions/_MangoPay';
import {useSocket} from '../actions/Socket';

const WalletHistory = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const socket = useSocket();
  const toast = useToast();
  const [walletList, setWalletList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [topupDialog, setTopUpDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [functionCall, setFunctionCall] = useState('');
  const [data, setData] = useState([
    {
      title: 'Today',
      data: [],
    },
    {
      title: 'Last Week',
      data: [],
    },
    {
      title: 'All Data',
      data: [],
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSection, setCurrentSection] = useState(['Today', 'Last Week']);
  const [extra, setExtra] = useState(0);
  const [reload, setReload] = useState(true);
  const [initial, setInitial] = useState(true);

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
    sectionHeader: {
      height: 30,
      width: '100%',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    sectionHeaderText: {
      fontSize: 16,
      fontFamily: fontFamily.MontserratMedium,
      color: colors.primaryTextColor,
    },
    loadMoreButton: {
      height: 100,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadMoreButtonIcon: {
      height: 35,
      width: 35,
      tintColor: colors.primaryTextColor,
    },
  });

  useEffect(() => {
    if (socket) {
      socket?.on(
        `user_withdrawal_balance_${userReducer?.profileDetails?._id}`,
        data => {
          if (data?.status == 'failed') {
            toast.show(data.message);
          }
          if (data?.status == 'success') {
            setTopUpDialog(false);
            setWithdrawAmount('');
            toast.show(data.message);
            setWalletList([]);
            setCurrentPage(1);
            setHasMore(true);
            setReload(true);
            if (data?.user) {
              updateUserDetails({prop: 'profileDetails', value: data?.user});
            }

            updateUserDetails({prop: 'transactionId', value: null});
          }
        },
      );
    }
  }, [socket]);

  useEffect(() => {
    getWalletHistory(currentPage)
      .then(response => {
        setInitial(false);
        setData([
          {
            title: 'Today',
            data: response[0].data,
          },
          {
            title: 'Last Week',
            data: response[1].data,
          },
          {
            title: 'All Data',
            data: response[2].data,
          },
        ]);
        setReload(false);
      })
      .catch(err => {
        setReload(false);
      });
  }, []);

  useEffect(() => {
    if (reload) {
      getWalletHistory(currentPage)
        .then(response => {
          setData([
            {
              title: 'Today',
              data: response[0].data,
            },
            {
              title: 'Last Week',
              data: response[1].data,
            },
            {
              title: 'All Data',
              data: response[2].data,
            },
          ]);
        })
        .catch(err => {});
    }
  }, [reload]);

  useEffect(() => {
    if (functionCall == 'getWalletHistory') {
      getWalletHistoryData();
    }
  }, [functionCall]);

  const handleLoadMore = async () => {
    setCurrentPage(currentPage + 1);

    getWalletHistory(currentPage + 1)
      .then(response => {
        if (response[2].data.length == 0) {
          setHasMore(false);
          //return;
        }
        setCurrentSection(['Today', 'Last Week', 'All Data']);

        setData([
          data[0],
          data[1],
          {
            title: 'All Data',
            data: [...data[2].data, ...response[2].data],
          },
        ]);
        setExtra(extra + 1);
      })
      .catch(err => {});
  };

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const getWalletHistoryData = () => {
    getWalletHistory()
      .then(response => {
        if (Array.isArray(response)) {
          setWalletList(response);
          setExtra(extra + 1);
        } else {
          toast.show(textContent.general.general_error);
        }
      })
      .catch(error => {
        toast.show(textContent.general.general_error);
      });
  };

  const renderItem = (item, index) => {
    let image =
      item.transationType == 'debit'
        ? item.status == 'Withdrawal'
          ? imagepath.withdraw
          : imagepath.waxswaplogo
        : item.transationType == 'credit'
        ? imagepath.credit
        : imagepath.credit;
    return (
      <View
        style={{
          width: '100%',

          alignItems: 'center',
          alignContent: 'center',
          flexDirection: 'row',
          marginVertical: 10,
          backgroundColor: colors.cardColor,
          height: 62,
          borderRadius: 12,

          elevation: 3,
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
            flex: 1.3,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={image}
            style={{height: 35, width: 35, tintColor: colors.primaryTextColor}}
            resizeMode={'contain'}
          />
        </View>
        <View
          style={{
            flex: 3,
            height: '100%',

            justifyContent: 'center',
            paddingLeft: 10,
          }}>
          <View
            style={{
              flex: 1,

              paddingBottom: 2,
              justifyContent: 'flex-end',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: fontFamily.MontserratMedium,
                color: colors.primaryTextColor,
              }}>
              {item.status}
            </Text>
          </View>
          <View
            style={{
              flex: 1,

              paddingTop: 2,
              justifyContent: 'flex-start',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: fontFamily.MontserratMedium,
                color: colors.primaryTextColor,
              }}>
              {moment(item.createdAt).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 2,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontSize: 22,
              fontFamily: fontFamily.MontserratMedium,
              color: colors.primaryTextColor,
            }}>
            {`${item.transationType == 'credit' ? '+' : '-'}`}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: fontFamily.MontserratMedium,
              color: colors.primaryTextColor,
            }}>
            {`\u20AC${getPrice(
              item.status == 'Withdrawal' ||
                item.status == 'Add Token' ||
                item.status == 'Purchased'
                ? item.withdrawalAmount
                : item.soldAmount,
            )}`}
          </Text>
        </View>
      </View>
    );
  };

  const withDrawToBankAccount = () => {
    if (userReducer?.profileDetails?.selectRegisterBankInfo?.bankAccountId) {
      if (parseFloat(userReducer?.profileDetails?.balance) > 5) {
        let jsonData = {
          Tag: JSON.stringify({
            type: 'withdrawal',
            amount: withdrawAmount,
            userId: userReducer?.profileDetails?._id,
          }),
          DebitedFunds: {
            Currency: 'EUR',
            Amount: withdrawAmount * 100,
          },
          Fees: {
            Currency: 'EUR',
            Amount: 0,
          },
          BankAccountId:
            userReducer?.profileDetails?.selectRegisterBankInfo?.bankAccountId,

          BankWireRef: userReducer?.profileDetails?._id,
          PayoutModeRequested: 'STANDARD',
        };

        createPayout(jsonData)
          .then(result => {
            if (result.data.Status == 'CREATED') {
              // toast.show(textContent.WalletHistory.withdrawal_message);
            } else {
              //  toast.show(textContent.general.general_error);
            }
            setTopUpDialog(false);
          })
          .catch(err => {
            toast.show(textContent.general.general_error);
          });
      } else {
        toast.show(textContent.general.general_error);
      }
    } else {
      setTopUpDialog(false);
      toast.show(textContent.WalletHistory.update_kyc_bank_account);
    }
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', height: '100%'}}>
        <SortView
          marginBottom={0}
          visible={walletList.length > 0}
          setFilterType={type => {
            getSortedArray(walletList, type, persistStorage).then(result => {
              setWalletList(result);
              setExtra(extra + 1);
            });
          }}
        />
        <View
          style={{
            marginTop: 20,
            height: 40,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 20,
          }}>
          <TouchableOpacity
            onPress={() => {
              setTopUpDialog(true);
            }}
            style={{
              //   height: 35,
              //width: 130,
              borderRadius: 18,
              elevation: 3,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              backgroundColor: colors.cardColor,
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              flexDirection: 'row',
              padding: 4,
            }}>
            <View
              style={{
                justifyContent: 'center',
                marginLeft: 5,
                marginVertical: 3,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: fontFamily.MontserratMedium,
                  color: colors.primaryTextColor,
                }}>
                {textContent.WalletHistory.withdraw_funds}
              </Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                source={imagepath.withdraw}
                style={{
                  height: 20,
                  width: 20,
                  marginHorizontal: 8,
                  tintColor: colors.primaryTextColor,
                }}
                resizeMode={'contain'}
              />
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{marginTop: 15}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: useKeyboard() + 40,
            paddingHorizontal: 10,
          }}>
          <FlatList
            data={data[0].data}
            keyExtractor={(item, index) => item + index}
            renderItem={({item, index}) => renderItem(item, index)}
            ListHeaderComponent={() => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{data[0].title}</Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View
                style={{
                  height: 100,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {!initial ? (
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratRegular,
                      fontSize: 14,
                    }}>
                    {textContent.WalletHistory.empty_text_today}
                  </Text>
                ) : (
                  <ActivityIndicator size={'small'} color={colors.spinner} />
                )}
              </View>
            )}
          />

          <FlatList
            data={data[1].data}
            keyExtractor={(item, index) => item + index}
            renderItem={({item, index}) => renderItem(item, index)}
            ListHeaderComponent={() => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{data[1].title}</Text>
              </View>
            )}
            ListFooterComponent={() =>
              currentSection.includes('All Data') ? null : initial ? null : (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => handleLoadMore()}>
                  <View>
                    <Image
                      source={imagepath.reload}
                      style={styles.loadMoreButtonIcon}
                    />
                  </View>
                </TouchableOpacity>
              )
            }
            ListEmptyComponent={() => (
              <View
                style={{
                  height: 100,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {!initial ? (
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratRegular,
                      fontSize: 14,
                    }}>
                    {textContent.WalletHistory.empty_text_last_week}
                  </Text>
                ) : (
                  <ActivityIndicator size={'small'} color={colors.spinner} />
                )}
              </View>
            )}
          />

          {currentSection.includes('All Data') && (
            <FlatList
              data={data[2].data}
              keyExtractor={(item, index) => item + index}
              renderItem={({item, index}) => renderItem(item, index)}
              ListHeaderComponent={() => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{data[2].title}</Text>
                </View>
              )}
              ListEmptyComponent={() => (
                <View
                  style={{
                    height: 100,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {!initial && (
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontFamily: fontFamily.MontserratRegular,
                        fontSize: 14,
                      }}>
                      {textContent.WalletHistory.empty_text_all_data}
                    </Text>
                  )}
                </View>
              )}
              onEndReachedThreshold={0.01}
              onEndReached={
                currentSection.includes('All Data') && hasMore
                  ? handleLoadMore
                  : null
              }
            />
          )}
        </ScrollView>
      </View>
    );
  };

  const renderWalletList = (item, index) => {
    return (
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 8,
          paddingTop: 5,
          paddingHorizontal: 10,
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

          marginTop: 5,
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
            OrderID
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
            Amount
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,

              fontFamily: fontFamily.MontserratMedium,
            }}>
            {item.payedAmount.toFixed(2)}
          </Text>
        </View>
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
            Type
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              color:
                item.transationType.toUpperCase() == 'CREDIT'
                  ? colors.primaryButtonColor
                  : colors.notificationColor,
              fontSize: 16,

              fontFamily: fontFamily.MontserratMedium,
            }}>
            {item.transationType.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <Dialog
        visible={topupDialog}
        onTouchOutside={() => setTopUpDialog(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 12,
          padding: 0,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View
          style={{
              height: 320,
            width: '100%',
            borderRadius: 10,
            backgroundColor: colors.secondaryBackground,
            marginTop: normalize(10),
            paddingHorizontal: normalize(20),
          }}>
          <View
            style={{
              //  flex: 1.5,
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(22),
                fontWeight: 'bold',
                alignSelf: 'center',
                letterSpacing: 1,
              }}>
              {textContent.WalletHistory.withdraw}
            </Text>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: normalize(17),
                letterSpacing: 1,
                textAlign: 'center',
                fontFamily: fontFamily.MontserratRegular,
                paddingHorizontal: normalize(20),
                marginTop: normalize(12),
              }}>
              {textContent.WalletHistory.withdraw_message}
            </Text>
          </View>
          <View
            style={{
              //  flex: 1.5,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15,
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 12,
                fontFamily: fontFamily.MontserratMedium,
                alignSelf: 'flex-start',
              }}>
              {textContent.WalletHistory.amount}
            </Text>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
               
                marginTop: 7,

                height: 50,
                backgroundColor: colors.searchBarColor,
                borderWidth: 1,
                borderColor: colors.borderColor + '90',
                borderRadius: 8,
              }}>
              <TextInput
                value={withdrawAmount}
                onChangeText={text => {
                  setWithdrawAmount(text);
                }}
                placeholderTextColor={colors.primaryTextColor}
                style={{
                  width: '100%',
                  height: '100%',
                  color: colors.primaryTextColor,
                  paddingLeft: 10,
                  fontFamily: fontFamily.MontserratRegular,
                  fontSize: 16,
                  letterSpacing: 0.5,
                  backgroundColor: colors.transparent,
                }}></TextInput>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: Platform.OS == 'ios' ? 40 : 25,
            }}>
            <MainButton
              style={{
                width: '90%',
                alignSelf: 'center',
                height: normalize(40),
                borderRadius: 10,
                justifyContent: 'center',
                backgroundColor: colors.primaryButtonColor,
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
              textStyle={{
                color: colors.black,
                paddingVertical: 2,
                fontFamily: fontFamily.MontserratBold,
              }}
              onPress={() => {
                if (
                  withdrawAmount <= userReducer?.profileDetails?.balance &&
                  withdrawAmount > 0
                ) {
                  withDrawToBankAccount();
                } else {
                  toast.show(textContent.WalletHistory.invalid_withdrawal);
                }
              }}
              fontSize={14.5}
              title={textContent.WalletHistory.button_text}
            />
          </View>
        </View>
      </Dialog>
      <SearchBar
        searchEnabled={false}
        cartValue={userReducer.cartLength}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
          setFunctionCall('changeTextDebouncer');
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.WalletHistory.search_text
        }
      />

      {renderPage()}
    </SafeAreaView>
  );
};

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(WalletHistory);
