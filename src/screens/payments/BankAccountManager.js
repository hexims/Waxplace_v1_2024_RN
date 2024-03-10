import React, {useState, useContext, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import {getCode} from 'iso-3166-1-alpha-2';
import {LiteCreditCardInput} from 'react-native-credit-card-input';

import {DarkModeContext} from '../../components/DarkModeContext';
import textContent from '../../utils/textContent';
import fontFamily from '../../utils/FontFamily';
import ModalSelector from '../../components/ModalSelectorInput';
import imagepath from '../../utils/Images';
import Radio from '../../components/RadioButton';
import {
  getCitiesOfSelectedCountry,
  getCountriesList,
} from '../../actions/SaleFlowAPI';
import {
  createBankAccount,
  createPayout,
  deActivateBankAccount,
  getBankAccountDetails,
} from '../../actions/_MangoPay';
import {CardManager} from '../../components/CardManager';
import {MainButton} from '../../components/MainButton';
import {useToast} from 'react-native-toast-notifications';
import ProgressLoader from '../../components/ProgressLoader';
import {
  deleteUserBankAccount,
  deletUserAccountOfUser,
  saveBankAccount,
} from '../../actions/UserAPI';
// import {saveCard, getCards} from '../api/cardApi';
import {useKeyboard} from '../../utils/UseKeyBoard';
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const BankAccountManager = ({userReducer, updateUserDetails}) => {
  const toast = useToast();
  const [selectedCard, setSelectedCard] = useState(0);
  const {darkMode, colors} = useContext(DarkModeContext);
  const [cardData, setCardData] = useState({});
  const [cvv, setCvv] = useState('');
  const [cardList, setCardList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  //USER INFO
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Spain');
  const [cityList, setCityList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [PostalCode, setPostalCode] = useState('');

  //iban
  const [iban, setIban] = useState('');

  //USA
  const [aba, setAba] = useState('');

  //CA
  const [branchCode, setBranceCode] = useState('');
  const [institutionNumber, setInstitutionNumber] = useState('');
  const [bankName, setBankName] = useState('');

  //GB
  const [sortCode, setSortCode] = useState('');

  //Common Bank Type Data
  const [accountNumber, setAccountNumber] = useState('');
  const [bic, setBic] = useState('');

  const typesList = [
    {index: 0, label: 'IBAN', value: 'iban'},
    {index: 0, label: 'Unites States', value: 'us'},
    {index: 0, label: 'Canada', value: 'ca'},
    {index: 0, label: 'Britain', value: 'gb'},
    {index: 0, label: 'Others', value: 'other'},
  ];
  const [selectedType, setSelectedType] = useState({
    index: 0,
    label: 'IBAN',
    value: 'iban',
  });

  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (userReducer?.profileDetails.selectRegisterBankInfo) {
      getBankAccountDetails(
        userReducer,
        userReducer?.profileDetails.selectRegisterBankInfo?.bankAccountId,
      )
        .then(res => {
          setCardList([{id: 1, data: res?.data}]);
        })
        .catch(err => {});
    } else {
      setCardList([]);
    }
  }, [userReducer?.profileDetails]);

  useEffect(() => {
    getCountriesList(userReducer?.userDetails?.bearer, false)
      .then(response => {
        setCountryList(
          response.map(value => {
            return {label: value._id};
          }),
        );
      })
      .catch(error => {});
  }, []);

  useEffect(() => {
    if (country !== '') {
      getCitiesOfSelectedCountry(country, userReducer?.userDetails?.bearer)
        .then(response => {
          setCityList(
            response
              .map(value => ({label: value.name})) // map to new array of objects with label property
              .filter((value, index, self) => {
                return (
                  index === self.findIndex(obj => obj.label === value.label)
                ); // keep only the first occurrence of each label
              }),
          );
        })
        .catch(error => {});
    }
  }, [country]);

  const cardSelection = (item, index) => {
    setCvv('');
    updateUserDetails({
      prop: 'selectedCardDetails',
      value: {
        cardNumber: item.cardNumber,
        cardHolderName: item.cardHolderName,
        expiryDate: item.expiryDate,
        cvv: null,
        CardId: item.validCardId,
        isNewCard: false,
      },
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setSelectedCard(index);
  };

  const handleSaveCard = async () => {
    const card = {
      cardNumber: cardData.number,
      cardHolderName: cardData.name,
      expirationMonth: cardData.expiry.split('/')[0],
      expirationYear: cardData.expiry.split('/')[1],
      cvv: cardData.cvc,
    };
    // await saveCard(card); // save card to API
    const updatedCardList = []; // await getCards(); // retrieve updated list of cards from API
    setCardList(updatedCardList); // update local card list state
    setCardData({}); // reset card data input
  };

  const handleCardInputChange = formData => {
    if (selectedCard !== -1) {
      setSelectedCard(-1);
    }

    setCardData({
      cardHolderName: userName,
      cardNumber: formData.values.number,
      expiryDate: `${formData.values.expiry.split('/')[0]}${
        formData.values.expiry.split('/')[1]
      }`,
      cvv: formData.values.cvc,
      isNewCard: true,
    }); // update local card data state
    const card = {
      cardHolderName: userName,
      cardNumber: formData.values.number,
      expiryDate: `${formData.values.expiry.split('/')[0]}${
        formData.values.expiry.split('/')[1]
      }`,
      cvv: formData.values.cvc,
      isNewCard: true,
    };

    updateUserDetails({prop: 'selectedCardDetails', value: card});
  };

  const handleRemoveAccount = item => {
    Alert.alert(
      'Remove Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            updateUserDetails({prop: 'spinner', value: true});
            
            deActivateBankAccount(userReducer, item.data.Id)
              .then(res => {
                if (res?.data?.Active == false) {
                  deleteUserBankAccount()
                    .then(result => {
                      if (result?.data?.status == 'success') {
                        updateUserDetails({
                          prop: 'profileDetails',
                          value: result?.data?.user,
                        });
                      } else {
                        toast.show(textContent.general.general_error);
                      }
                      updateUserDetails({prop: 'spinner', value: false});
                    })
                    .catch(error => {
                      toast.show(textContent.general.general_error);
                      updateUserDetails({prop: 'spinner', value: false});
                    });
                } else {
                  toast.show(textContent.general.general_error);
                }
                updateUserDetails({prop: 'spinner', value: false});
              })
              .catch(err => {
                toast.show(textContent.general.general_error);
                updateUserDetails({prop: 'spinner', value: false});
              });
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = ({item, index}) => {
    
    return (
      <TouchableOpacity
        style={styles.cardContainer(colors)}
        onPress={() => cardSelection(item, index)}>
        <View style={{flex: 6, justifyContent: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Radio selected={selectedCard === index} />
            <View>
              <Text
                style={[styles.cardNumber, {color: colors.primaryTextColor}]}>
                {item?.data?.OwnerName}
              </Text>
              <Text
                style={[
                  styles.cardExpiration,
                  {color: colors.primaryTextColor},
                ]}>
                Bank Type: {item?.data?.Type}
              </Text>
              <Text
                style={[
                  styles.cardExpiration,
                  {color: colors.primaryTextColor},
                ]}>
                {item?.data?.Tag == 'iban'
                  ? 'IBAN:  *********' + item?.data?.IBAN.slice(-4)
                  : item?.data?.Tag == 'us'
                  ? 'Acc No:  *****' + item?.data?.AccountNumber.slice(-4)
                  : item?.data?.Tag == 'ca'
                  ? 'Acc No:  *****' + item?.data?.AccountNumber.slice(-4)
                  : item?.data?.Tag == 'gb'
                  ? 'Acc No:  *****' + item?.data?.AccountNumber.slice(-4)
                  : item?.data?.Tag == 'other'
                  ? 'Acc No:  *****' + item?.data?.AccountNumber.slice(-4)
                  : ''}
              </Text>
              <Text
                style={[
                  styles.cardExpiration,
                  {color: colors.primaryTextColor},
                ]}>
                {item?.data?.Tag == 'iban'
                  ? 'BIC:  ****' + item?.data?.BIC.slice(-4)
                  : item?.data?.Tag == 'us'
                  ? 'ABA:  *****' + item?.data?.ABA.slice(-4)
                  : item?.data?.Tag == 'ca'
                  ? 'BRANCH CODE:  ****' + item?.data?.BranchCode.slice(-3)
                  : item?.data?.Tag == 'gb'
                  ? 'SORTCODE:  ****' + item?.data?.SortCode.slice(-2)
                  : item?.data?.Tag == 'other'
                  ? 'Acc No:  ***' + item?.data?.BIC.slice(-3)
                  : ''}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            margin: 5,
          }}>
          <TouchableOpacity onPress={() => handleRemoveAccount(item)}>
            <Image
              style={{
                width: 22,
                height: 22,
                tintColor: colors.primaryTextColor + 'aa',
              }}
              source={imagepath.trash}></Image>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <Text style={styles.emptyText(colors)}>No accounts available</Text>
  );

  const renderIban = () => {
    return (
      <View style={{width: '100%'}}>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'IBAN'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={iban}
            //  placeholder={'Last Name'}
            onChangeText={value => setIban(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'BIC'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={bic}
            //  placeholder={'Last Name'}
            onChangeText={value => setBic(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
      </View>
    );
  };

  const renderUS = () => {
    return (
      <View style={{width: '100%'}}>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Account Number'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={accountNumber}
            //  placeholder={'Last Name'}
            onChangeText={value => setAccountNumber(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'ABA'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={aba}
            //  placeholder={'Last Name'}
            onChangeText={value => setAba(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
      </View>
    );
  };

  const renderCA = () => {
    return (
      <View style={{width: '100%'}}>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Account Number'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={accountNumber}
            //  placeholder={'Last Name'}
            onChangeText={value => setAccountNumber(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Branch Code'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={branchCode}
            //  placeholder={'Last Name'}
            onChangeText={value => setBranceCode(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Institution Number'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={institutionNumber}
            //  placeholder={'Last Name'}
            onChangeText={value => setInstitutionNumber(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
      </View>
    );
  };

  const renderGB = () => {
    return (
      <View style={{width: '100%'}}>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Account Number'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={accountNumber}
            //  placeholder={'Last Name'}
            onChangeText={value => setAccountNumber(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Sort Code'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={sortCode}
            //  placeholder={'Last Name'}
            onChangeText={value => setSortCode(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
      </View>
    );
  };

  const renderOthers = () => {
    return (
      <View style={{width: '100%'}}>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'Account Number'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={accountNumber}
            //  placeholder={'Last Name'}
            onChangeText={value => setAccountNumber(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 12,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {'BIC'}
        </Text>
        <View
          style={{
            width: '100%',
            marginTop: 7,
            // marginLeft: 10,
            height: 45,
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: colors.searchBarColor,
            borderWidth: 1,
            borderColor: colors.borderColor + '90',
            borderRadius: 8,
          }}>
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 18,
              paddingLeft: 10,
              letterSpacing: 1,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratRegular,
              alignSelf: 'center',
              backgroundColor: colors.transparent,
            }}
            value={bic}
            //  placeholder={'Last Name'}
            onChangeText={value => setBic(value)}
            placeholderTextColor={colors.primaryTextColor}></TextInput>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: useKeyboard(),
        paddingTop: 10,
        alignItems: 'center',
      }}
      style={styles.maincontainer(colors)}>
      <View style={styles.cardListContainer(colors)}>
        <View
          style={{
            marginTop: 5,

            width: '100%',
            paddingHorizontal: 15,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratMedium,
              fontSize: 13,
            }}>
            LINKED ACCOUNTS
          </Text>
        </View>
        <FlatList
          style={{flex: 1, width: '100%', marginTop: 10}}
          contentContainerStyle={{
            paddingTop: 2,
            paddingBottom: cardList.length == 0 ? 25 : 10,
            // paddingHorizontal: 10,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          data={cardList}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          keyExtractor={item => item.id.toString()}
        />
      </View>
      <View
        style={{
          // backgroundColor: colors.cardColor,
          padding: 10,
          borderRadius: 10,
          // marginBottom: 10,

          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
        }}>
        <View
          style={{
            width: '100%',
            marginBottom: 20,
            justifyContent: 'center',

            paddingLeft: 10,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratMedium,
              fontSize: 16,
            }}>
            {'ADD ACCOUNT'}
          </Text>
        </View>

        <View
          style={{
            width: '100%',
            marginBottom: 3,
            justifyContent: 'center',
            paddingLeft: 10,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratBold,
              fontSize: 14,
            }}>
            {'USER INFORMATION'}
          </Text>
        </View>

        <View style={{width: '100%'}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {'Name'}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
              borderRadius: 8,
            }}>
            <TextInput
              style={{
                width: '100%',
                height: '100%',
                fontSize: 18,
                paddingLeft: 10,
                letterSpacing: 1,
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
                backgroundColor: colors.transparent,
              }}
              value={name}
              //  placeholder={'Last Name'}
              onChangeText={value => setName(value)}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {'Address'}
          </Text>
          <View style={styles.textAreaContainer(colors)}>
            <TextInput
              value={address}
              style={styles.textArea(colors)}
              underlineColorAndroid="transparent"
              onChangeText={value => setAddress(value)}
              placeholderTextColor={colors.primaryTextColor}
              numberOfLines={10}
              multiline={true}
            />
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {'Country'}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
              borderRadius: 8,
            }}>
            <TextInput
              style={{
                width: '100%',
                height: '100%',
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                paddingLeft: 10,
                fontSize: 16,
                letterSpacing: 0.5,
                backgroundColor: colors.transparent,
                paddingLeft: 10,
              }}
              editable={false}
              placeholder={country !== '' ? country : ''}
              placeholderTextColor={colors.primaryTextColor}
              value={country}
            />
            {/* {(countryList?.length > 0 || country !== '') && (
              <ModalSelector
              
                colors={colors}
                listType={Platform.OS == 'android' ? 'FLATLIST' : ''}
                initialNumToRender={10}
                data={countryList}
                style={{width: '100%'}}
                initValue="Select Country"
                searchText="Search..."
                supportedOrientations={['landscape']}
                accessible={true}
                scrollViewAccessibilityLabel={'Scrollable options'}
                cancelButtonAccessibilityLabel={'Cancel Button'}
                onChange={item => {
                  setCountry(item.label);
                  setCity('');
                }}>
                <TextInput
                  style={{
                    width: '100%',
                    height: '100%',
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    paddingLeft: 10,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    backgroundColor: colors.transparent,
                    paddingLeft: 10,
                  }}
                  editable={false}
                  placeholder={country !== '' ? country : ''}
                  placeholderTextColor={colors.primaryTextColor}
                  value={country}
                />
              </ModalSelector>
            )} */}
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {'City'}
          </Text>
          <View
            style={{
              width: '100%',
              height: 45,
              marginTop: 7,
              alignItems: 'center',
              alignContent: 'center',
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
              borderRadius: 8,
              flexDirection: 'row',
            }}>
            {(cityList?.length > 0 || city !== '') && (
              <ModalSelector
                colors={colors}
                listType={'FLATLIST'}
                initialNumToRender={10}
                data={cityList}
                style={{width: '100%'}}
                initValue="Select City"
                searchText="Search..."
                supportedOrientations={['landscape']}
                accessible={true}
                scrollViewAccessibilityLabel={'Scrollable options'}
                cancelButtonAccessibilityLabel={'Cancel Button'}
                onChange={item => {
                  setCity(item.label);
                }}>
                <TextInput
                  style={{
                    width: '100%',
                    height: '100%',
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    paddingLeft: 10,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    backgroundColor: colors.transparent,
                    paddingLeft: 10,
                  }}
                  editable={false}
                  placeholder={city !== '' ? city : ''}
                  placeholderTextColor={colors.primaryTextColor}
                  value={city}
                />
              </ModalSelector>
            )}
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {'Postal Code'}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
              borderRadius: 8,
            }}>
            <TextInput
              style={{
                width: '100%',
                height: '100%',
                fontSize: 18,
                paddingLeft: 10,
                letterSpacing: 1,
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
                backgroundColor: colors.transparent,
              }}
              value={PostalCode}
              //  placeholder={'Last Name'}
              onChangeText={value => setPostalCode(value)}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View>
          <View
            style={{
              width: '100%',
              marginTop: 25,
              marginBottom: 3,
              justifyContent: 'center',
              paddingLeft: 10,
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratBold,
                fontSize: 14,
              }}>
              {'BANK DETAILS'}
            </Text>
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {'Select Bank Type'}
          </Text>

          <View
            style={{
              width: '100%',
              marginTop: 7,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor + '90',
              borderRadius: 8,
            }}>
            <ModalSelector
              colors={colors}
              search={false}
              data={typesList}
              listType={'FLATLIST'}
              style={{width: '100%'}}
              initValue={
                textContent.payments.BankAccountManager.select_bank_type
              }
              searchText={textContent.general.search}
              supportedOrientations={['landscape']}
              accessible={true}
              scrollViewAccessibilityLabel={'Scrollable options'}
              cancelButtonAccessibilityLabel={'Cancel Button'}
              onChange={item => {
                setSelectedType(item);
              }}>
              <TextInput
                editable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: 18,
                  paddingLeft: 10,
                  letterSpacing: 1,
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                }}
                value={selectedType.label}
                placeholderTextColor={colors.primaryTextColor}
              />
            </ModalSelector>
          </View>
          {selectedType.value == 'iban' ? renderIban() : null}
          {selectedType.value == 'us' ? renderUS() : null}
          {selectedType.value == 'ca' ? renderCA() : null}
          {selectedType.value == 'gb' ? renderGB() : null}
          {selectedType.value == 'other' ? renderOthers() : null}
        </View>
      </View>
      <MainButton
        onPress={() => {
          if (!userReducer?.profileDetails.selectRegisterBankInfo) {
            if (name == '') {
              toast.show(
                textContent.payments.BankAccountManager.alert_username,
              );
              return;
            }

            if (address == '') {
              toast.show(textContent.payments.BankAccountManager.alert_address);
              return;
            }

            if (country == '') {
              toast.show(textContent.payments.BankAccountManager.alert_country);
              return;
            }

            if (city == '') {
              toast.show(textContent.payments.BankAccountManager.alert_city);
              return;
            }

            if (PostalCode == '') {
              toast.show(
                textContent.payments.BankAccountManager.alert_postalcode,
              );
              return;
            }
            if (selectedType.value == 'iban') {
              if (iban == '') {
                toast.show(textContent.payments.BankAccountManager.alert_iban);
                return;
              }
              if (bic == '') {
                toast.show(textContent.payments.BankAccountManager.alert_bic);
                return;
              }
            } else if (selectedType.value == 'us') {
              if (accountNumber == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_account_number,
                );
                return;
              }
              if (aba == '') {
                toast.show(textContent.payments.BankAccountManager.alert_aba);
                return;
              }
            } else if (selectedType.value == 'ca') {
              if (branchCode == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_branch_code,
                );
                return;
              }
              if (institutionNumber == '') {
                toast.show(
                  textContent.payments.BankAccountManager
                    .alert_institution_number,
                );
                return;
              }
              if (accountNumber == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_account_number,
                );
                return;
              }
              if (bankName == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_bankname,
                );
                return;
              }
            } else if (selectedType.value == 'gb') {
              if (sortCode == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_sortcode,
                );
                return;
              }
              if (accountNumber == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_account_number,
                );
                return;
              }
            } else {
              if (bic == '') {
                toast.show(textContent.payments.BankAccountManager.alert_bic);
                return;
              }
              if (accountNumber == '') {
                toast.show(
                  textContent.payments.BankAccountManager.alert_account_number,
                );
                return;
              }
            }

            let typeApi = 'other';
            let jsonData = {
              OwnerAddress: {
                AddressLine1: address,

                City: city,
                Region: city,
                PostalCode: PostalCode,
                Country: getCode(country),
              },
              OwnerName: name,
              Tag: selectedType.value,
            };

            if (selectedType.value == 'iban') {
              typeApi = 'iban/';
              jsonData = {...jsonData, IBAN: iban, BIC: bic};
            } else if (selectedType.value == 'us') {
              typeApi = 'us/';
              jsonData = {
                ...jsonData,
                AccountNumber: accountNumber,
                ABA: aba,
              };
            } else if (selectedType.value == 'ca') {
              typeApi = 'ca/';
              jsonData = {
                ...jsonData,
                BranchCode: branchCode,
                InstitutionNumber: institutionNumber,
                AccountNumber: accountNumber,
                BankName: bankName,
              };
            } else if (selectedType.value == 'gb') {
              typeApi = 'gb/';
              jsonData = {
                ...jsonData,
                SortCode: sortCode,
                AccountNumber: accountNumber,
              };
            } else {
              jsonData = {
                ...jsonData,
                Country: getCode(country),
                BIC: bic,
                AccountNumber: accountNumber,
              };
            }
            updateUserDetails({prop: 'spinner', value: true});
            createBankAccount(jsonData, userReducer, typeApi)
              .then(result => {
                if (result?.data?.Active) {
                  jsonData = {
                    bankAccountId: result?.data?.Id,
                  };
                  saveBankAccount(jsonData)
                    .then(res => {
                      if (res?.data?.status == 'success') {
                        updateUserDetails({
                          prop: 'profileDetails',
                          value: {
                            ...userReducer.profileDetails,
                            selectRegisterBankInfo: jsonData,
                          },
                        });
                        toast.show(res?.data?.message);
                      } else {
                        toast.show(textContent.general.general_error);
                      }
                      updateUserDetails({prop: 'spinner', value: false});
                    })
                    .catch(errror => {
                      toast.show(textContent.general.general_error);
                      updateUserDetails({prop: 'spinner', value: false});
                    });
                } else {
                  toast.show(textContent.general.general_error);
                  updateUserDetails({prop: 'spinner', value: false});
                }
              })
              .catch(err => {
                toast.show(textContent.general.general_error);
                updateUserDetails({prop: 'spinner', value: false});
              });
          } else {
            toast.show(textContent.payments.BankAccountManager.account_exists);
          }
        }}
        style={{
          height: 45,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 15,
          marginBottom: 20,
          marginTop: 30,
         // marginRight: 15,
          paddingHorizontal: 10,
          width: '95%',
        }}
        fontSize={18}
        title={textContent.payments.BankAccountManager.save_account}
      />

      <ProgressLoader
        visible={userReducer.spinner}
        isHUD={true}
        isModal={true}
        color={colors.spinner}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    width: '100%',
    backgroundColor: colors.primaryBackground,
    // alignItems: 'center',
  }),
  textAreaContainer: colors => ({
    width: '100%',
    justifyContent: 'center',
    borderRadius: 16,
    marginTop: 7,
    marginBottom: 0,
    backgroundColor: colors.searchBarColor,
    borderWidth: 1,
    borderColor: colors.borderColor + '90',
    borderRadius: 8,
  }),
  textArea: colors => ({
    height: 100,
    width: '75%',
    fontFamily: fontFamily.MontserratRegular,
    fontSize: 16,
    letterSpacing: 0.5,
    backgroundColor: colors.transparent,
    textAlignVertical: 'top',
    color: colors.primaryTextColor,
    paddingLeft: 10,
    justifyContent: 'flex-start',
  }),
  container: colors => ({
    width: '95%',

    backgroundColor: colors.cardColor,
    paddingHorizontal: 7.5,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: colors.shadowColor,
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    elevation: 2,
  }),
  label: colors => ({
    marginTop: -2.5,
    color: colors.inactiveColor,
    fontSize: 11,
    fontFamily: fontFamily.MontserratRegular,
    letterSpacing: 0.8,
  }),
  inputContainer: {
    marginVertical: 10,
  },

  input: colors => ({
    backgroundColor: colors.searchBarColor,
    borderRadius: 5,
    // borderWidth: 0.5,
    borderColor: colors.inactiveColor,
    marginRight: 5,
    paddingVertical: 5,
    paddingLeft: 10,
    fontSize: 14,
    color: colors.primaryTextColor,
    maxWidth: 250,
    // marginVertical: 5,
  }),

  cardListContainer: colors => ({
    flex: 1,
    width: '100%',
    backgroundColor: colors.tranparent,
  }),
  cardHeader: colors => ({
    color: colors.primaryTextColor,
    fontFamily: fontFamily.MontserratMedium,
    fontSize: 16,
    marginBottom: 10,
  }),
  cardContainer: colors => ({
    flexDirection: 'row',
    backgroundColor: colors.cardColor,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: colors.shadowColor,
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '95%',
    alignSelf: 'center',
  }),
  cardNumber: {
    fontSize: 14,
    fontFamily: fontFamily.MontserratRegular,
    marginBottom: 5,
  },
  cardExpiration: {
    fontSize: 13,
    fontFamily: fontFamily.MontserratRegular,
    marginBottom: 5,
  },
  cardCvv: {
    fontSize: 13,
    fontFamily: fontFamily.MontserratRegular,
  },
  emptyText: colors => ({
    fontSize: 14,
    fontFamily: fontFamily.MontserratRegular,
    color: colors.primaryTextColor,
    textAlign: 'center',
    marginTop: 20,
  }),
});
