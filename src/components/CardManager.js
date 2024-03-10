import React, { useState, useContext, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';

import { LiteCreditCardInput } from 'react-native-credit-card-input';
import { deleteCard } from '../actions/UserAPI';
import { Keyboard, KeyboardEvent } from 'react-native';
import { DarkModeContext } from '../components/DarkModeContext';
import textContent from '../utils/textContent';
import fontFamily from '../utils/FontFamily';
import { useKeyboard } from '../utils/UseKeyBoard';
import imagepath from '../utils/Images';
import Radio from './RadioButton';
import { deActivateCard, getMangoPayCardsList } from '../actions/_MangoPay';
// import {saveCard, getCards} from '../api/cardApi';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const CardManager = ({
  userReducer,
  updateUserDetails,
  paymentMode = true,
  checkIsNewCard,
  saveCardData,
  cardInputWidth,
  setCardHolderName = data => { },
  selectedCardDetails = data => { },
}) => {
  const [selectedCard, setSelectedCard] = useState(!paymentMode ? 0 : -1);
  const { darkMode, colors } = useContext(DarkModeContext);
  const [cardData, setCardData] = useState(null);
  const [cvv, setCvv] = useState('');
  const [cardList, setCardList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});
  const [spinner, setSpinner] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyBoard, setIsKeyBoard] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setSpinner(true);
    getMangoPayCardsList(userReducer)
      .then(response => {
        if (response?.data && Array.isArray(response?.data)) {
          if (response.data.length > 0) {
            let data = [];
            response.data?.map((value, index) => {
              let cardHolderData =
                userReducer?.profileDetails?.paymentDetails?.mangopayCardId.find(
                  item => item?.validCardId === value?.Id,
                );
           
              data.push({
                id: index + 1,
                cardHolderName: 
                cardHolderData?.cardHolderName
                  ? cardHolderData?.cardHolderName
                  : 'WAXPLACE USER CARD',
                ...value,
                expanded: false,
              });
            });

            setCardList(data);
            setSpinner(false);
          } else {
            setCardList([]);
            setSpinner(false);
          }
        }
      })
      .catch(err => {
        Alert.alert('', textContent.general.general_error);
        setCardList([]);
        setSpinner(false);
      });
  }, [userReducer?.profileDetails?.paymentDetails?.mangopayCardId]);

  useEffect(() => {
    function onKeyboardDidShow(e) {
      setIsKeyBoard(true);
    }

    function onKeyboardDidHide() {
      setIsKeyBoard(false);
    }

    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardDidShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardDidHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const cardSelection = (item, index) => {
    selectedCardDetails({
      CardId: item.Id,
      isNewCard: false,
    });



    setSelectedCard(index);
  };

  const handleCardInputChange = formData => {
    setFormData(formData.values)
    let cardAlias =
      formData.values.number?.slice(0, 4) +
      ' **** **** ' +
      formData.values.number?.slice(-4);
    setCardData({
      cardNumber: formData.values.number,
      cardAlias,
      expiryDate: `${formData.values.expiry.split('/')[0]}${formData.values.expiry.split('/')[1]
        }`,
      cvv: formData.values.cvc,
      isNewCard: true,
    }); // update local card data state
    const card = {
      cardNumber: formData.values.number,
      cardAlias,
      expiryDate: `${formData.values.expiry.split('/')[0]}${formData.values.expiry.split('/')[1]
        }`,
      cvv: formData.values.cvc,
      isNewCard: true,
    };

    selectedCardDetails(card);
  };

  const handleRemoveCard = (index, cardNumber, item) => {
    Alert.alert(
      textContent.general.remove_card,
      textContent.general.remove_card_text,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            deActivateCard(item?.Id)
              .then(res => {
                if (res?.data?.Active == false) {
                  let jsonData = { validCardId: item?.Id };
                  deleteCard(jsonData)
                    .then(result => {
                      if (result?.data?.status == 'success') {
                        let data = [];

                        userReducer?.profileDetails?.paymentDetails?.mangopayCardId.map(
                          (val, idx) => {
                            if (idx != index) {
                              data.push(val);
                            }
                          },
                        );

                        updateUserDetails({
                          prop: 'profileDetails',
                          value: {
                            ...userReducer.profileDetails,
                            paymentDetails: {
                              ...userReducer?.profileDetails?.paymentDetails,
                              mangopayCardId: data,
                            },
                          },
                        });
                      } else {
                      }
                    })
                    .catch(error => { });
                } else {
                }
              })
              .catch(err => { });
          },
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.maincontainer(colors)}>
      {paymentMode && (
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



{/* 
          <View style={{ height: 30, width: '100%', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 15, marginTop: 5 }}>
            <TouchableOpacity style={{ padding: 5 }} onPress={() => {
              if (selectedCard == -1) {
                selectedCardDetails(null)
                setCardData(null)
              } else {
                setCardData(null)
              }
              setUserName('');
              setFormData({})
              setCardHolderName('');
            }}>
              <Text style={{ fontFamily: fontFamily.MontserratBold, color: colors.blue, fontSize: 16 }}>Reset Card</Text>
            </TouchableOpacity>
          </View> */}

          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              alignSelf: 'flex-start',

              marginBottom: 7,
              marginLeft: 5,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.general.card_info}
          </Text>


          <View style={styles.container(colors)}>
            <View style={styles.inputContainer}>
              <LiteCreditCardInput
                values={formData}
                color={colors.primaryTextColor}
                placeholderColor={colors.primaryTextColor}
                inputStyle={[
                  styles.input(colors),
                  cardInputWidth ? { width: cardInputWidth } : {},
                ]}
                onChange={handleCardInputChange}
              />
            </View>
          </View>
          <View style={{ width: '100%' }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 14,
                alignSelf: 'flex-start',
                marginLeft: 5,
                marginTop: 16,
                fontFamily: fontFamily.MontserratMedium,
              }}>
              {'Card Nickname'}
            </Text>
            <View
              style={{
                width: '98%',
                marginTop: 7,
                height: 50,
                alignItems: 'center',
                alignContent: 'center',
                backgroundColor: colors.searchBarColor,
                borderWidth: 0.6,
                borderColor: colors.borderColor + '50',
                borderRadius: 8,
              }}>
              <TextInput
                style={{
                  width: '95%',
                  height: '100%',
                  fontSize: 18,
                  paddingLeft: 12,
                  letterSpacing: 1,
                  color: colors.primaryTextColor,
                  alignSelf: 'center',
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                }}
                value={userName}
                //  placeholder={'First Name'}

                onChangeText={value => {
                  setUserName(value);
               
                  setCardHolderName(value);
                }}
                placeholderTextColor={colors.primaryTextColor}></TextInput>
            </View>
          </View>

        </View>
      )}




      <View style={styles.cardListContainer(colors)}>

        <View
          style={{
            marginTop: 25,
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
            {textContent.general.saved_cards}
          </Text>
        </View>

        <FlatList
          style={{ flex: 1, width: '100%', marginTop: 10 }}
          contentContainerStyle={{
            paddingTop: 2,
            //  paddingBottom: !paymentMode ? useKeyboard() : 20,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          data={cardList}
          renderItem={({ item, index }) => {
            return <TouchableOpacity
              style={styles.cardContainer(colors)}
              onPress={() => {
                if (selectedCard > -1 && index == selectedCard) {
                  setSelectedCard(-1)
                  selectedCardDetails(cardData);
                } else {
                  cardSelection(item, index)
                }


              }}>
              <View style={{ flex: 6, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Radio selected={selectedCard === index} />
                  <View>
                     <Text
                      style={[
                        styles.cardNumber,
                        { color: colors.primaryTextColor },
                      ]}>
                      {item?.cardHolderName}
                    </Text> 
                    <Text
                      style={[
                        styles.cardExpiration,
                        { color: colors.primaryTextColor },
                      ]}>
                      {item?.Alias}
                    </Text>
                    <Text
                      style={[
                        styles.cardExpiration,
                        { color: colors.primaryTextColor },
                      ]}>
                      Exp Date:{' '}
                      {item?.ExpirationDate?.substring(0, 2) +
                        '/' +
                        item?.ExpirationDate?.substring(2)}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  margin: 5,
                  // paddingTop: 6,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    handleRemoveCard(index, item?.cardNumber, item)
                  }>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: colors.primaryTextColor + 'aa',
                    }}
                    source={imagepath.trash}></Image>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            // return !isKeyBoard || selectedCard == index || !paymentMode ? (
            //   <TouchableOpacity
            //     style={styles.cardContainer(colors)}
            //     onPress={() => cardSelection(item, index)}>
            //     <View style={{ flex: 6, justifyContent: 'center' }}>
            //       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            //         <Radio selected={selectedCard === index} />
            //         <View>
            //           <Text
            //             style={[
            //               styles.cardNumber,
            //               { color: colors.primaryTextColor },
            //             ]}>
            //             {item?.cardHolderName}
            //           </Text>
            //           <Text
            //             style={[
            //               styles.cardExpiration,
            //               { color: colors.primaryTextColor },
            //             ]}>
            //             {item?.Alias}
            //           </Text>
            //           <Text
            //             style={[
            //               styles.cardExpiration,
            //               { color: colors.primaryTextColor },
            //             ]}>
            //             Exp Date:{' '}
            //             {item?.ExpirationDate?.substring(0, 2) +
            //               '/' +
            //               item?.ExpirationDate?.substring(2)}
            //           </Text>
            //         </View>
            //       </View>
            //     </View>
            //     <View
            //       style={{
            //         flex: 1,
            //         justifyContent: 'flex-start',
            //         alignItems: 'flex-end',
            //         margin: 5,
            //         paddingTop: 6,
            //       }}>
            //       <TouchableOpacity
            //         onPress={() =>
            //           handleRemoveCard(index, item?.cardNumber, item)
            //         }>
            //         <Image
            //           style={{
            //             width: 22,
            //             height: 22,
            //             tintColor: colors.primaryTextColor + 'aa',
            //           }}
            //           source={imagepath.trash}></Image>
            //       </TouchableOpacity>
            //     </View>
            //   </TouchableOpacity>
            // ) : null;
          }}
          ListEmptyComponent={() => {
            return (!isKeyBoard || selectedCard > -1 || !paymentMode) &&
              !spinner ? (
              <Text style={styles.emptyText(colors)}>No cards available</Text>
            ) : spinner ? (<ActivityIndicator
              size={'small'}
              style={{ marginTop: '10%' }}
              color={colors.spinner}
            />) : null
          }}
          keyExtractor={item => item.id.toString()}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    width: '100%',
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
  }),
  container: colors => ({
    width: '100%',

    backgroundColor: colors.cardColor,
    paddingHorizontal: 7.5,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: colors.shadowColor,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
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
    //borderWidth: 0.6,
    borderColor: colors.borderColor + '20',
    borderRadius: 8,
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '95%',
    alignSelf: 'center',
  }),
  cardNumber: {
    fontSize: 16,
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
