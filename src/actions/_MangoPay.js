import axios from 'axios';
import qs from 'qs';
import mangoPay from 'mangopay-cardregistration-js-kit';
import { Alert, Dimensions, Platform } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';
import { Linking } from 'react-native';
import { types } from 'credit-card-type';
import RNFetchBlob from 'rn-fetch-blob';
import store from '../redux/store';
import { err } from 'react-native-svg/lib/typescript/xml';
import { getMangoPayAuthToken } from './UserAPI';

const MANGOPAY_CLIENT_ID =
  store.getState().userReducer?.mangoPayDetails?.CLIENT_ID; //'waxplacetest';

const MANGOPAY_URL =
  store.getState().userReducer?.mangoPayDetails?.API_BASE_URL; //https://api.sandbox.mangopay.com/v2.01/
const MANGOPAYBASEURL = `${MANGOPAY_URL}/${MANGOPAY_CLIENT_ID}/`;


const MANGOPAY_API_KEY =
  store.getState().userReducer?.mangoPayDetails?.MANGOPAY_APIKEY; //'0FRmOuKabqN4P6Q8EtPWmAaEtn1V0C4M9uwOL375RDz4HNPHZW';

const MANGOPAY_WAXPLACE_USER_ID =
  store.getState().userReducer?.mangoPayDetails?.WAXPLACE_AUTHOR_ID; //'177928992';
const MANGOPAY_WAXPLACE_WALLET_ID =
  store.getState().userReducer?.mangoPayDetails?.WAXPLACE_WALLET_ID; //'177929373';

const MANGOPAY_FEES_WAXPLACE_ID =
  store.getState().userReducer?.mangoPayDetails?.PROFIT_WAXPLACE_ID; //'192537972';
const MANGOPAY_FEES_WAXPLACE_WALLET_ID =
  store.getState().userReducer?.mangoPayDetails?.PROFIT_WAXPLACE_WALLET_ID; //'192538801';

//SANDBOX API

//PRODUCTION API
// const MANGOPAYBASEURL = `https://api.mangopay.com/v2.01/${MANGOPAY_CLIENT_ID}/`;

const CREATENATURALUSER = 'users/natural/';
const CREATELEGALUSER = 'users/legal';
const CREATEWALLET = 'wallets/';
const CREATECARD = 'cardregistrations';
const DIRECTPAYIN = 'payins/card/direct/';
const RECURINGPAYIN = 'recurringpayinregistrations';
const RECURRINGPAYINCIT = 'payins/recurring/card/direct';
const CHECKTRANSACTIONS = 'transactions/';
const PAYOUTTOBANKACCOUNT = 'payouts/bankwire/';
const CREATEHOOKS = 'hooks/';
const PAYINS = 'payins/';
const TRANSFERS = 'transfers/';

const mangopayInstance = axios.create({
  baseURL: MANGOPAYBASEURL,
  timeout: 6000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});



mangopayInstance.interceptors.request.use(
  async config => {
    try {
      let response = await getMangoPayAuthToken()
      console.log(response)
      let access_token = response?.result?.access_token
      config.headers.Authorization = `Bearer ${access_token}`;
      return config;
    } catch (error) {
      throw error
    }

  },
  error => {
    return Promise.reject(error);
  },
);



mangopayInstance.interceptors.response.use(
  response => {
    console.log(response?.request?.responseURL, response);
    return response;
  },
  error => {
    console.log(error?.response)
    return Promise.reject(error);
  }
);


// Define a function that handles the SecureModeRedirectUrl
export const handleSecureModeRedirectUrl = url => {
  // Use the Linking module to open the URL in the user's browser
  Linking.openURL(url);
};

const createNaturalUser = async jsonData => {
  // WAXPLACE USER PAVAL "166973818"
  try {
    const response = await mangopayInstance.post(CREATENATURALUSER, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const updateNaturalUser = async (jsonData, id) => {
  // WAXPLACE USER PAVAL "166973818"
  try {
    const response = await mangopayInstance.put(
      CREATENATURALUSER + id,
      jsonData,
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const createMangopayTransfer = async jsonData => {
  // WAXPLACE USER PAVAL "166973818"
  try {
    const response = await mangopayInstance.post(TRANSFERS, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const createWalletWaxPlace = async () => {
  //WAXPLACE "166968810" WALLET ID "166971706"
  //   let jsonData = {
  //     HeadquartersAddress: {
  //       AddressLine1: 'Plazuela do Porto 87',
  //       City: 'BARCELONA',
  //       Region: 'BARCELONA',
  //       PostalCode: '08001',
  //       Country: 'ES',
  //     },
  //     LegalPersonType: 'BUSINESS',
  //     Name: 'WAXPLACE Ltd',
  //     LegalRepresentativeAddress: {
  //       AddressLine1: 'Plazuela do Porto 87',
  //       City: 'BARCELONA',
  //       Region: 'BARCELONA',
  //       PostalCode: '08001',
  //       Country: 'ES',
  //     },
  //     LegalRepresentativeBirthday: 1463496101,
  //     LegalRepresentativeCountryOfResidence: 'ES',
  //     LegalRepresentativeNationality: 'ES',
  //     LegalRepresentativeEmail: 'contact@waxplace.co',
  //     LegalRepresentativeFirstName: 'Dani',
  //     LegalRepresentativeLastName: 'Burrio',
  //     Email: 'contact@waxplace.co',
  //     Tag: 'WAXPLACE ADMIN',
  //     CompanyNumber: '781634110',
  //     TermsAndConditionsAccepted: true,
  //     UserCategory: 'OWNER',
  //   };
  //   try {
  //     const response = await mangopayInstance.post(CREATELEGALUSER, jsonData);
  //
  //   } catch (error) {
  //
  //   }
  //   let jsonData = {
  //     Owners: ['166968810'],
  //     Description: 'WAXPLACE WALLET ACCOUNT',
  //     Currency: 'EUR',
  //     Tag: 'WAXPLACE ADMIN',
  //   };
  //   try {
  //     const response = await mangopayInstance.post(CREATEWALLET, jsonData);
  //
  //   } catch (error) {
  //
  //   }
};

const registerCard = async (UserId, selectedCardDetails, cardHolderName) => {
  let jsonData = {
    UserId, //'166973818',
    Currency: 'EUR',
    Tag: 'aaaa',
  };

  try {
    const response = await mangopayInstance.post(CREATECARD, jsonData);

    try {
      let cardRegisterData = {
        Id: response.data.Id,
        cardRegistrationURL: response.data.CardRegistrationURL,
        preregistrationData: response.data.PreregistrationData,
        accessKey: response.data.AccessKey,
      };

      let parts = MANGOPAY_URL.split('/');
      let baseURL = `${parts[0]}//${parts[2]}`;

      mangoPay.cardRegistration.baseURL = baseURL;
      mangoPay.cardRegistration.clientId = MANGOPAY_CLIENT_ID;
      mangoPay.cardRegistration.init(cardRegisterData);

      let cardData = {
        cardNumber: selectedCardDetails.cardNumber.replace(/\s+/g, ''),
        cardType: 'CB_VISA_MASTERCARD',
        cardExpirationDate: selectedCardDetails.expiryDate,
        cardCvx: selectedCardDetails.cvv,
      };

      const result = await new Promise((resolve, reject) => {
        mangoPay.cardRegistration.registerCard(
          cardData,
          cardRegistration => {
            resolve(cardRegistration);
          },
          error => {
            reject(error);
          },
        );
      });
      if (result) {
        return result;
      } else {
        throw new Error('Payment server error');
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const getBrowserInfo = async () => {
  const browserInfo = {
    AcceptHeader: '*/*',
    JavaEnabled: false,
    Language: 'en-US',
    ColorDepth: 24,
    TimeZoneOffset: new Date().getTimezoneOffset(),
    UserAgent: Platform.OS + '/' + Platform.Version,
    JavascriptEnabled: true,
  };
  if (Platform.OS === 'ios') {
    const screenPixelRatio = window.devicePixelRatio || 1;
    const { height, width } = Dimensions.get('screen');
    browserInfo.ScreenHeight = parseInt(height * screenPixelRatio);
    browserInfo.ScreenWidth = parseInt(width * screenPixelRatio);
  } else if (Platform.OS === 'android') {
    const { height, width } = Dimensions.get('window');
    browserInfo.ScreenHeight = parseInt(height);
    browserInfo.ScreenWidth = parseInt(width);
  }

  return new Promise((resolve, reject) => {
    NetworkInfo.getIPAddress().then(ip => {
      resolve({
        IpAddress: ip,
        BrowserInfo: browserInfo,
      });
    });
  });
};

const directPayment = async (
  userReducer,
  price,
  cardId,
  Tag = { type: '' },
  type = 'FEES_WALLET',
) => {
  let CreditedUserId;
  let CreditedWalletId;

  if (type == 'FEES_WALLET') {
    CreditedUserId = MANGOPAY_FEES_WAXPLACE_ID;
    CreditedWalletId = MANGOPAY_FEES_WAXPLACE_WALLET_ID;
  } else {
    CreditedUserId = MANGOPAY_WAXPLACE_USER_ID;
    CreditedWalletId = MANGOPAY_WAXPLACE_WALLET_ID;
  }

  const jsonData = {
    AuthorId: userReducer.profileDetails.paymentDetails.mangopayCustomerId,
    CreditedUserId,
    CreditedWalletId,
    DebitedFunds: {
      Currency: 'EUR',
      Amount: price * 100,
    },
    Fees: {
      Currency: 'EUR',
      Amount: 0,
    },
    SecureModeReturnURL: 'waxplace://deeplink',
    CardId: cardId,
    SecureMode: 'NO_CHOICE',
    StatementDescriptor: 'April2023',

    Tag: JSON.stringify(Tag),
    ...(await getBrowserInfo()),
  };

  try {
    const response = await mangopayInstance.post(DIRECTPAYIN, jsonData);
    console.log(response)
    return response;
  } catch (error) {
    console.log(error?.response)
    throw error;
  }
};

const checkTransaction = async (transcationId, userReducer) => {
  try {
    const response = await mangopayInstance.get(
      'cards/' +
      userReducer.selectedCardDetails.CardId +
      '/' +
      CHECKTRANSACTIONS,
    );

    if (response.headers['x-number-of-pages'] > 1) {
      try {
        const result = await mangopayInstance.get(
          'cards/' +
          userReducer.selectedCardDetails.CardId +
          '/' +
          CHECKTRANSACTIONS +
          `?page=${response.headers['x-number-of-pages']}&per_page=10`,
        );

        return result;
      } catch (error) {
        throw error;
      }
    } else {
      return response;
    }
  } catch (error) {
    throw error;
  }
};

//RECURING PAYMENTS

const createRecurringData = async (userReducer, amount, CardId) => {
  let jsonData = {
    AuthorId: userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId,
    CardId: CardId,
    CreditedUserId: MANGOPAY_FEES_WAXPLACE_ID,
    CreditedWalletId: MANGOPAY_FEES_WAXPLACE_WALLET_ID,
    FirstTransactionDebitedFunds: {
      Currency: 'EUR',
      Amount: amount * 100,
    },
    FirstTransactionFees: {
      Currency: 'EUR',
      Amount: 0,
    },
    Frequency: 'Monthly',
    // FixedNextAmount: true,
    // FractionedPayment: false,
    // FreeCycles: 1,
  };
  try {

    const response = await mangopayInstance.post(RECURINGPAYIN, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const recurringDirectPaymentCIT = async (
  RecurringPayinRegistrationId,
  price,
  Tag = { type: '' },
) => {
  const jsonData = {
    RecurringPayinRegistrationId,
    DebitedFunds: {
      Currency: 'EUR',
      Amount: price * 100,
    },
    Fees: {
      Currency: 'EUR',
      Amount: 0,
    },
    SecureModeReturnURL: 'waxplace://deeplink',

    SecureMode: 'NO_CHOICE',
    StatementDescriptor: 'April2023',

    Tag: JSON.stringify(Tag),

    ...(await getBrowserInfo()),
  };

  try {

    const response = await mangopayInstance.post(RECURRINGPAYINCIT, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const createBankAccount = async (jsonData, userReducer, type) => {
  try {
    const response = await mangopayInstance.post(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/bankaccounts/${type}`,
      jsonData,
    );

    return response;
  } catch (error) {

    throw error;
  }
};

const getBankAccountDetails = async (userReducer, bankAccountId) => {
  try {
    const response = await mangopayInstance.get(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/bankaccounts/${bankAccountId}/`,
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const getMangoPayCardsList = async userReducer => {
  try {
    const response = await mangopayInstance.get(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/cards?Active=true`,
    );

    return response;
  } catch (error) {

    throw error;
  }
};

const deActivateBankAccount = async (userReducer, bankAccountId) => {
  try {
    const response = await mangopayInstance.put(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/bankaccounts/${bankAccountId}/`,
      { Active: false },
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const deActivateCard = async cardId => {
  try {
    const response = await mangopayInstance.put(`cards/${cardId}/`, {
      Active: false,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const deActivateSubscription = async userReducer => {
  try {
    const response = await mangopayInstance.put(
      `recurringpayinregistrations/${userReducer?.profileDetails?.subscriptionId}/`,
      {
        Status: 'ENDED',
        CardId: userReducer?.profileDetails?.subscriptionActiveOnCardId,
      },
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const createKycDocument = async (type, userReducer) => {
  //..types
  //  IDENTITY_PROOF
  //ADDRESS_PROOF
  //REGISTRATION_PROOF
  //ARTICLES_OF_ASSOCIATION
  //SHAREHOLDER_DECLARATION

  try {
    let jsonData = { Type: type };
    const response = await mangopayInstance.post(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/kyc/documents/`,
      jsonData,
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const uploadKycDocument = async (jsonData, kycDocumentId, userReducer) => {
  try {
    const response = await mangopayInstance.post(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/kyc/documents/${kycDocumentId}/pages/`,
      jsonData,
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const submitKycDocument = async (kycDocumentId, userReducer) => {
  try {
    const response = await mangopayInstance.put(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/kyc/documents/${kycDocumentId}`,
      {
        Status: 'VALIDATION_ASKED',
      },
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const checkKycDocument = async (kycDocumentId, userReducer) => {
  try {
    const response = await mangopayInstance.get(
      `users/${userReducer?.profileDetails?.paymentDetails?.mangopayCustomerId}/kyc/documents/${kycDocumentId}/`,
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const createPayout = async jsonData => {
  try {
    jsonData = {
      ...jsonData,
      AuthorId: MANGOPAY_WAXPLACE_USER_ID,
      DebitedWalletId: MANGOPAY_WAXPLACE_WALLET_ID,
    };
    const response = await mangopayInstance.post(PAYOUTTOBANKACCOUNT, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const createMangoPayHooks = async jsonData => {
  try {
    const response = await mangopayInstance.post(CREATEHOOKS, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const checkPayInStatus = async Id => {
  try {
    const response = await mangopayInstance.get(PAYINS + Id);

    return response;
  } catch (error) {
    throw error;
  }
};

export {
  createNaturalUser,
  updateNaturalUser,
  createWalletWaxPlace,
  registerCard,
  directPayment,
  checkTransaction,
  createRecurringData,
  recurringDirectPaymentCIT,
  createBankAccount,
  createKycDocument,
  uploadKycDocument,
  submitKycDocument,
  checkKycDocument,
  createPayout,
  deActivateBankAccount,
  getBankAccountDetails,
  createMangoPayHooks,
  checkPayInStatus,
  createMangopayTransfer,
  deActivateCard,
  deActivateSubscription,
  getMangoPayCardsList,
};
