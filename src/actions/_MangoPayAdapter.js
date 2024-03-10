import React, {useState} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';
import mangoPay from 'mangopay-cardregistration-js-kit';

const CardRegistrationScreen = () => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardType: '',
    cardExpirationDate: '',
    cardCvx: '',
  });

  const handleCardNumberChange = value => {
    setCardData({...cardData, cardNumber: value});
  };

  const handleCardTypeChange = value => {
    setCardData({...cardData, cardType: value});
  };

  const handleCardExpirationDateChange = value => {
    setCardData({...cardData, cardExpirationDate: value});
  };

  const handleCardCvxChange = value => {
    setCardData({...cardData, cardCvx: value});
  };

  const handleRegisterCard = async () => {
    try {
      // Initialize card registration object
      const cardRegisterData = {
        Id: '166928686', //user 166931691 wallet 166931766
        cardRegistrationURL: 'https://homologation-webpayment.payline.com/webpayment/getToken',
        preregistrationData: '_nfGWK2M2AY-H3lgOikqrC6k7LPTFg6Z3va0D935PvyEU4b4BAwejrw4zT_j86oA2ddFLVXdicolcUIkv_kKEA',
        accessKey: '1X0m87dmM2LiwFgxPLBJ',
      };
      mangoPay.cardRegistration.init(cardRegisterData);

      // Register card
      const response = await new Promise((resolve, reject) => {
        mangoPay.cardRegistration.registerCard(
          cardData,
          cardRegistration => resolve(cardRegistration),
          error => reject(error),
        );
      });

      // Card registration succeeded
      Alert.alert('Success', 'Card has been registered');
    } catch (error) {
      // Card registration failed
      Alert.alert('Error', error.ResultMessage);
    }
  };

  return (
    <View>
      <Text>Card Number</Text>
      <TextInput
        value={cardData.cardNumber}
        onChangeText={handleCardNumberChange}
      />

      <Text>Card Type</Text>
      <TextInput
        value={cardData.cardType}
        onChangeText={handleCardTypeChange}
      />

      <Text>Expiration Date</Text>
      <TextInput
        value={cardData.cardExpirationDate}
        onChangeText={handleCardExpirationDateChange}
      />

      <Text>CVV</Text>
      <TextInput value={cardData.cardCvx} onChangeText={handleCardCvxChange} />

      <Button title="Register Card" onPress={handleRegisterCard} />
    </View>
  );
};

export default CardRegistrationScreen;
