import React, { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { View, Text, Alert, Keyboard, AppState, TouchableOpacity, } from 'react-native';
import * as CartNavigation from '../router/_CartNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useToast } from 'react-native-toast-notifications';
import { useSocket } from '../actions/Socket';
import { decodeCvv, profileDetails } from '../actions/UserAPI';
import {
  checkPayInStatus,
  createRecurringData,
  directPayment,
  handleSecureModeRedirectUrl,
  recurringDirectPaymentCIT,
  registerCard,
} from '../actions/_MangoPay';
import fontFamily from '../utils/FontFamily';
import textContent from '../utils/textContent';
import { CardManager } from './CardManager';
import { DarkModeContext } from './DarkModeContext';
import { MainButton } from './MainButton';
import ProgressLoader from './ProgressLoader';
import { ScrollView } from 'react-native-gesture-handler';
import { VirtualizedList } from '../components/VirtualizedList'
import { Image } from 'react-native';
import imagepath from '../utils/Images';

export const CardBottomSheet = ({
  userReducer,
  updateUserDetails,

  onPaymentStarted = () => { },
}) => {
  const { darkMode, colors } = useContext(DarkModeContext);
  const socket = useSocket();
  const toast = useToast();
  const [isKeyBoard, setIsKeyBoard] = useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = useState(null);
  const [cardHolderName, setCardHolderName] = useState('');
  const [amount, setAmount] = useState(0);
  const [spinner, setSpinner] = useState(false)

  const hasPurchaseTokenListener = useRef(false);
  const hasSubscriptionListener = useRef(false);
  const hasPurchaseAlbumListener = useRef(false);




  useEffect(() => {
    if (!userReducer?.paymentBottomSheet?.visible) {
      setSelectedCardDetails(null);
      setCardHolderName('')
    }

    if (userReducer?.paymentBottomSheet?.amount) {
      setAmount(userReducer?.paymentBottomSheet?.amount);
    }
  }, [userReducer?.paymentBottomSheet]);

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
      updateUserDetails({
        prop: 'paymentBottomSheet',
        value: { amount: null, visible: false, type: null },
      });

      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const resetPaymentState = () => {
      setSpinner(false)
      updateUserDetails({ prop: 'transactionId', value: null });
      updateUserDetails({ prop: 'transactionId', value: null });
    };

    const purchaseTokenListener = data => {

      resetPaymentState();
      if (data?.status === 'failed') {
        toast.show(data?.message);
      } else if (data?.status === 'success') {
        toast.show(data?.message);
        updateUserDetails({ prop: 'profileDetails', value: data?.user });
        updateUserDetails({ prop: 'transactionCompleted', value: true });
        updateUserDetails({
          prop: 'paymentBottomSheet',
          value: { amount: null, visible: false, type: null },
        });
      }


    };

    const subscriptionListener = data => {
      resetPaymentState();

      if (data?.status === 'failed') {
        toast.show(data?.message);
      } else if (data?.status === 'success') {
        toast.show(data.message);
        updateUserDetails({ prop: 'profileDetails', value: data?.user });
        updateUserDetails({ prop: 'transactionCompleted', value: true });
        updateUserDetails({
          prop: 'paymentBottomSheet',
          value: { amount: null, visible: false, type: null },
        });

      }


    };

    const purchaseAlbumListener = data => {
      resetPaymentState();
      if (data?.status == 'failed') {
        toast.show(data.message);

      } else if (data?.status == 'success') {
        toast.show(textContent.Checkout.purchase_successful);
        updateUserDetails({ prop: 'currentOrderDetails', value: data?.data });
        updateUserDetails({ prop: 'transactionCompleted', value: true });

        updateUserDetails({
          prop: 'paymentBottomSheet',
          value: { amount: null, visible: false, type: null },
        });
        if (CartNavigation?.cartNavigationRef?.isReady()) {
          CartNavigation.reset('OrderDetails');
        } else {
          BottomNavigation.reset('HOME');
        }
      }


    };

    if (socket?.connected && userReducer?.profileDetails?._id) {
      const userId = userReducer?.profileDetails?._id;
      const purchaseTokenEvent = `user_purchase_token_${userId}`;
      const subscriptionEvent = `user_subscription_${userId}`;
      const purchaseAlbumEvent = `user_purchase_album_${userId}`;

      const hasPurchaseTokenListener = socket
        .listeners(purchaseTokenEvent)
        .includes(purchaseTokenListener);
      const hasSubscriptionListener = socket
        .listeners(subscriptionEvent)
        .includes(subscriptionListener);
      const hasPurchaseAlbumListener = socket
        .listeners(purchaseAlbumEvent)
        .includes(purchaseAlbumListener);

      if (!hasPurchaseTokenListener) {
        socket.on(purchaseTokenEvent, purchaseTokenListener);
      }
      if (!hasSubscriptionListener) {
        socket.on(subscriptionEvent, subscriptionListener);
      }
      if (!hasPurchaseAlbumListener) {
        socket.on(purchaseAlbumEvent, purchaseAlbumListener);
      }
    }

    return () => {
      updateUserDetails({ prop: 'transactionCompleted', value: false });

      if (socket?.connected && userReducer?.profileDetails?._id) {
        const userId = userReducer?.profileDetails?._id;
        const purchaseTokenEvent = `user_purchase_token_${userId}`;
        const subscriptionEvent = `user_subscription_${userId}`;
        const purchaseAlbumEvent = `user_purchase_album_${userId}`;

        const hasPurchaseTokenListener = socket
          .listeners(purchaseTokenEvent)
          .includes(purchaseTokenListener);
        const hasSubscriptionListener = socket
          .listeners(subscriptionEvent)
          .includes(subscriptionListener);
        const hasPurchaseAlbumListener = socket
          .listeners(purchaseAlbumEvent)
          .includes(purchaseAlbumListener);
        if (hasPurchaseTokenListener) {
          socket.off(purchaseTokenEvent, purchaseTokenListener);
        }
        if (hasSubscriptionListener) {
          socket.off(subscriptionEvent, subscriptionListener);
        }
        if (hasPurchaseAlbumListener) {
          socket.off(purchaseAlbumEvent, purchaseAlbumListener);
        }
      }
    };
  }, [socket?.connected, userReducer?.profileDetails?._id]);

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Add an event listener to AppState change
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
      console.log('App state changed:', nextAppState);

      // Perform actions based on the app state change
      switch (nextAppState) {
        case 'active':
          // App is in the foreground




          setSpinner(false)

          break;
        case 'background':




          break;
        case 'inactive':
          // App is transitioning between foreground and background (iOS only)
          break;
        default:
          break;
      }
    };
    AppState.addEventListener('change', handleAppStateChange);


    // Clean up the listener when the component is unmounted
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    if (userReducer?.transactionId) {

      setSpinner(true)
      updateUserDetails({ prop: 'transactionId', value: null });

    } else {
      setTimeout(() => { setSpinner(false) }, 3000)
    }

  }, [userReducer?.transactionId])

  const handlePayment = async paymentType => {
    try {

      let orderId = userReducer?.paymentBottomSheet?.orderId
      let amount = userReducer?.paymentBottomSheet?.amount




      const isNewCard = selectedCardDetails?.isNewCard;
      let cardDetails = {};
      let CardId = selectedCardDetails?.CardId;

      if (isNewCard) {
        const cardRegistrationResponse = await registerCard(
          userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId,
          selectedCardDetails,
          cardHolderName,
        );

        if (
          cardRegistrationResponse?.ResultCode === '000000' &&
          cardRegistrationResponse?.Status === 'VALIDATED' &&
          cardRegistrationResponse?.CardId
        ) {
          CardId = cardRegistrationResponse?.CardId;

          cardDetails = {
            registrationData: '',
            validCardId: cardRegistrationResponse?.CardId,
            mangoPaycardId: cardRegistrationResponse?.Id,
            cardHolderName,
          };
        } else {
          Alert.alert('', cardRegistrationResponse?.ResultMessage);
          setSpinner(false)
          return;
        }
      } else {
        cardDetails = {
          validCardId: selectedCardDetails?.CardId,
        };
      }

      const Tag = {
        userId: userReducer?.profileDetails?._id,
        ...cardDetails,
      };

      let response;
      switch (paymentType) {
        case 'subscription':
          Tag.type = 'subscription';
          const recurringDataResult = await createRecurringData(
            userReducer,
            amount,
            CardId,
          );

          if (recurringDataResult.status === 200) {

            Tag.subscriptionId = recurringDataResult.data.Id;

            response = await recurringDirectPaymentCIT(
              recurringDataResult?.data?.Id,
              amount,
              Tag,
            );

          } else {
            response = { data: { Status: 'FAILED' } };
          }
          break;

        case 'purchaseToken':
          Tag.type = 'purchaseToken';
          Tag.tokens = amount;
          response = await directPayment(
            userReducer,
            amount,
            CardId,
            Tag,
          );
          break;

        case 'purchaseAlbum':
          Tag.type = 'purchaseAlbum';
          Tag.orderId = orderId;
          response = await directPayment(
            userReducer,
            amount,
            CardId,
            Tag,
            'WAXPLACE_WALLET',
          );
          break;

        default:
          throw new Error('Invalid payment type');
      }

      if (
        response?.data?.Status === 'SUCCEEDED' ||
        response?.data?.Status === 'CREATED' ||
        response?.data?.Status === 'FAILED'
      ) {
        if (
          (response?.data?.SecureModeRedirectURL ||
            response?.data?.SecureModeReturnURL) &&
          response?.data?.Status !== 'FAILED'
        ) {


          handleSecureModeRedirectUrl(
            response?.data?.SecureModeRedirectURL ||
            response?.data?.SecureModeReturnURL,
          );
        } else {
          setSpinner(false)
          Alert.alert('', response?.data?.ResultMessage);
        }
      } else {

        Alert.alert('', textContent.general.card_failed);
      }
    } catch (error) {
      Alert.alert('', textContent.general.general_error);
      setSpinner(false)
    }
  };

  const subscriptionHandler = async () => {
    await handlePayment('subscription');
  };

  const purchaseTokenHandler = async () => {
    await handlePayment('purchaseToken');
  };

  const purchaseAlbumHandler = async () => {
    await handlePayment('purchaseAlbum');
  };

  if (!userReducer?.paymentBottomSheet?.visible) {
    return null;
  }
  return (
    <View style={{ height: '100%', width: '100%', backgroundColor: colors.black + '90', position: 'absolute', bottom: 0, justifyContent: 'flex-end' }}>
      <View style={{ height: '100%', width: '100%', backgroundColor: colors.primaryBackground, }}>
        <View
          style={{
            marginTop: 25,
            width: '100%',
            paddingHorizontal: 15,

            flexDirection: 'row',
            height: 50,
          }}>
          <View style={{ flex: 3, height: '100%', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: fontFamily.MontserratRegular,
                color: colors.primaryTextColor,
                //  marginLeft: 35,
                letterSpacing: 2,
              }}>
              {'Payment Options'}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
            <TouchableOpacity
              style={{ padding: 5, alignSelf: 'flex-end', }}
              onPress={() => {
                if (spinner) {
                  Alert.alert('', 'Payment is in processing. Cancelling can cause issues to current Payment\nDo wish to continue?', [
                    {
                      text: textContent.chatBot.cancel,
                      onPress: () => { },
                      style: 'cancel',
                    },
                    {
                      text: textContent.chatBot.confirm,
                      onPress: () => {
                        updateUserDetails({
                          prop: 'paymentBottomSheet',
                          value: { amount: null, visible: false, type: null },
                        });
                        setSpinner(false)
                      },
                    },
                  ]);
                  return;
                }
                updateUserDetails({
                  prop: 'paymentBottomSheet',
                  value: { amount: null, visible: false, type: null },
                });
              }}>
              <Image
                source={imagepath.cross}
                style={{ height: 22, width: 22, tintColor: colors.primaryTextColor }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <VirtualizedList>
          <CardManager
            userReducer={userReducer}
            updateUserDetails={updateUserDetails}
            selectedCardDetails={data => {

              setSelectedCardDetails(data);
            }}
            setCardHolderName={data => {
              setCardHolderName(data);
            }}
          />
        </VirtualizedList>
        <View style={{ width: '100%', marginRight: 15, alignItems: 'center', justifyContent: 'center', paddingVertical: 15 }}>
          <MainButton
            style={{
              height: 45,
              width: '80%',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 9,
              paddingHorizontal: 5,
            }}
            fontSize={18}
            spinner={spinner}
            onPress={() => {

              if (selectedCardDetails) {
                if (selectedCardDetails?.isNewCard && cardHolderName == '') {
                  toast.show('Card NickName Required')
                  return;
                }
                setSpinner(true)

                if (userReducer?.paymentBottomSheet?.type == 'subscription') {
                  subscriptionHandler();
                } else if (
                  userReducer?.paymentBottomSheet?.type == 'purchaseToken'
                ) {
                  purchaseTokenHandler();
                } else if (
                  userReducer?.paymentBottomSheet?.type == 'purchaseAlbum'
                ) {
                  purchaseAlbumHandler();
                }
              } else {
                Alert.alert('', textContent.general.card_failed);
              }
            }}
            title={`Pay \u20AC${amount}`}
          />
        </View>
        {/* <View style={{ marginRight: 10, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <MainButton
              style={{
                height: 35,
                width: 150,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 9,
                paddingHorizontal: 5,
              }}
              backgroundColor={colors.inactiveColor}
              fontSize={16}
              disabled={spinner}
              onPress={() => {

              }}
              title={`Cancel`}
            />
          </View> */}

      </View>
    </View>
  );
};

// let timer;

//     const handleSocketNotFired = () => {
//       console.log(socket, 'aaaaaaaaaaaaaaaaa');
//       if (userReducer?.transactionId) {
//         checkPayInStatus(userReducer.transactionId)
//           .then(result => {
//             console.log(result);
//             if (result.status === 200 && result?.data) {
//               const data = JSON.parse(result?.data?.Tag);

//               if (data.type === 'subscription') {
//                 handleSubscriptionStatus(result);
//               } else if (data.type === 'purchaseToken') {
//                 handlePurchaseTokenStatus(result);
//               } else if (data.type === 'purchaseAlbum') {
//                 handlePurchaseAlbumStatus(result);
//               }
//             } else {
//               handlePaymentFailure();
//             }
//           })
//           .catch(handlePaymentFailure);
//       }
//     };

//     const handleSubscriptionStatus = result => {
//       if (result.data.Status === 'SUCCEEDED') {
//         profileDetails()
//           .then(result => {
//             if (result?.user) {
//               updateUserDetails({
//                 prop: 'profileDetails',
//                 value: result?.user,
//               });
//               updateUserDetails({
//                 prop: 'transactionCompleted',
//                 value: true,
//               });
//             }
//           })
//           .catch(() => {});

//         toast.show(result.data.ResultMessage);
//         resetPaymentState();
//       } else {
//         handlePaymentFailure(result.data.ResultMessage);
//       }
//     };

//     const handlePurchaseTokenStatus = result => {
//       if (result.data.Status === 'SUCCEEDED') {
//         toast.show(result.data.ResultMessage);
//         profileDetails()
//           .then(result => {
//             if (result?.user) {
//               updateUserDetails({
//                 prop: 'profileDetails',
//                 value: result?.user,
//               });
//             }
//             updateUserDetails({
//               prop: 'transactionCompleted',
//               value: true,
//             });
//           })
//           .catch(() => {});

//         resetPaymentState();
//       } else {
//         handlePaymentFailure(result.data.ResultMessage);
//       }
//     };

//     const handlePurchaseAlbumStatus = result => {
//       if (result.data.Status === 'SUCCEEDED') {
//         profileDetails()
//           .then(result => {
//             if (result?.user) {
//               updateUserDetails({
//                 prop: 'profileDetails',
//                 value: result?.user,
//               });
//             }
//           })
//           .catch(() => {});

//         toast.show(textContent.Checkout.purchase_successful);

//         BottomNavigation.reset('HOME');

//         resetPaymentState();
//       } else {
//         toast.show(result.data.ResultMessage);
//         resetPaymentState();
//       }
//     };
// const handlePaymentFailure = errorMessage => {
//   updateUserDetails({prop: 'spinner', value: false});
//   updateUserDetails({prop: 'transactionId', value: null});
//   Alert.alert('', errorMessage || textContent?.general.general_error);
// };
