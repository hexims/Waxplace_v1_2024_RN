import React, { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { View, Text, Alert, Keyboard, AppState } from 'react-native';
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

export const CardBottomSheet = ({
  userReducer,
  updateUserDetails,
  paymentRef = useRef(null),
  onPaymentStarted = () => { },
}) => {
  const { darkMode, colors } = useContext(DarkModeContext);
  const socket = useSocket();
  const toast = useToast();
  const [isKeyBoard, setIsKeyBoard] = useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = useState(null);
  const [cardHolderName, setCardHolderName] = useState('');
  const [amount, setAmount] = useState(0);

  const hasPurchaseTokenListener = useRef(false);
  const hasSubscriptionListener = useRef(false);
  const hasPurchaseAlbumListener = useRef(false);




  useEffect(() => {
    if (userReducer?.paymentBottomSheet?.visible) {
      paymentRef.open();
    } else {
      paymentRef.close();
      if(userReducer?.transactionCompleted==false)
      {
        updateUserDetails({ prop: 'spinner', value: false });
        setTimeout(()=>{  updateUserDetails({ prop: 'spinner', value: false });},2000)
      }
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
      updateUserDetails({ prop: 'spinner', value: false });
      updateUserDetails({ prop: 'transactionId', value: false });
      updateUserDetails({
        prop: 'paymentBottomSheet',
        value: { amount: null, visible: false, type: null },
      });
   
    };

    const purchaseTokenListener = data => {
      
     
      if (data?.status === 'failed') {
        toast.show(data?.message);
      } else if (data?.status === 'success') {
        toast.show(data?.message);
        updateUserDetails({ prop: 'profileDetails', value: data?.user });
        updateUserDetails({ prop: 'transactionCompleted', value: true });
      }

      resetPaymentState();
    };

    const subscriptionListener = data => {
     
     
      if (data?.status === 'failed') {
        toast.show(data?.message);
      } else if (data?.status === 'success') {
        toast.show(data.message);
        updateUserDetails({ prop: 'profileDetails', value: data?.user });
        updateUserDetails({ prop: 'transactionCompleted', value: true });
       
      }

      resetPaymentState();
    };

    const purchaseAlbumListener = data => {
      
      if (data?.status == 'failed') {
        toast.show(data.message);
      
      } else if (data?.status == 'success') {
        toast.show(textContent.Checkout.purchase_successful);
        updateUserDetails({ prop: 'currentOrderDetails', value: data?.data });
        updateUserDetails({ prop: 'transactionCompleted', value: true });
      

        if (CartNavigation?.cartNavigationRef?.isReady()) {
          CartNavigation.reset('OrderDetails');
        } else {
          BottomNavigation.reset('HOME');
        }
      }

      resetPaymentState();
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

  // useEffect(() => {
  //   // Add an event listener to AppState change
  //   const handleAppStateChange = (nextAppState) => {
  //     setAppState(nextAppState);
  //     console.log('App state changed:', nextAppState);

  //     // Perform actions based on the app state change
  //     switch (nextAppState) {
  //       case 'active':
  //         // App is in the foreground



          
  //         updateUserDetails({ prop: 'spinner', value: true });
  //         setTimeout(() => { updateUserDetails({ prop: 'spinner', value: false }); }, 6000)

  //         break;
  //       case 'background':
       

  //           updateUserDetails({ prop: 'spinner', value: false });

  //         break;
  //       case 'inactive':
  //         // App is transitioning between foreground and background (iOS only)
  //         break;
  //       default:
  //         break;
  //     }
  //   };
  //   AppState.addEventListener('change', handleAppStateChange);


  //   // Clean up the listener when the component is unmounted
  //   return () => {
  //     AppState.removeEventListener('change', handleAppStateChange);
  //   };
  // }, [userReducer?.transactionCompleted]);

  useEffect(()=>{
  if(userReducer?.transactionId)
  {
    
    updateUserDetails({ prop: 'spinner', value: true });
  }

  },[userReducer?.transactionId])

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
          updateUserDetails({ prop: 'spinner', value: false });
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
          updateUserDetails({ prop: 'spinner', value: false });
          Alert.alert('', response?.data?.ResultMessage);
        }
      } else {

        Alert.alert('', textContent.general.card_failed);
      }
    } catch (error) {
      Alert.alert('', textContent.general.general_error);
      updateUserDetails({ prop: 'spinner', value: false });
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

  // if (userReducer?.spinner) {
  //   return null;
  // }
  return (
    <>
      <RBSheet
        ref={ref => (paymentRef = ref)}
        closeOnSwipeDown={true}
        onClose={() => {
          if (userReducer?.paymentBottomSheet?.type) {
            updateUserDetails({
              prop: 'paymentBottomSheet',
              value: { amount: null, visible: false, type: null },
            });
          }


        }}
        onOpen={() => {
          updateUserDetails({ prop: 'transactionCompleted', value: false });
        }}
        customStyles={{
          container: {
            backgroundColor: colors.primaryBackground,
            alignItems: 'center',
            width: '100%',
            paddingBottom: 15,
            height: isKeyBoard ? 300 : 600,
          },
        }}>
        <View
          style={{
            height: 60,
            width: '100%',
            justifyContent: 'center',

            paddingLeft: 15,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratMedium,

              fontSize: 16,
            }}>
            Payment Options
          </Text>
          <View style={{ position: 'absolute', right: 10 }}>
            <MainButton
              style={{
                height: 29,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                paddingHorizontal: 10,
              }}
              fontSize={16}
              onPress={() => {
                if (selectedCardDetails) {


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
        </View>
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
      </RBSheet>
    </>
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
