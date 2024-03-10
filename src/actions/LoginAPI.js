import {Alert} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';
import {
  USERREGISTER,
  USERLOGIN,
  FORGOTPASSWORD,
  DELETEUSERACCOUNT,
  TERMSANDCONDITIONS,
  USERGENERATEOTP,
  GENERATEOTPFORREGISTRATION,
  COMPAREEMAILANDOTP,
  SENDTWILLOOTP,
  COMPARETWILLOOTP,
} from './_apiUrls';

const userLogin = async jsonData => {
  return instance
    .post(USERLOGIN, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const forgotPassword = async jsonData => {
  return instance
    .post(FORGOTPASSWORD, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const termsAndConditions = async () => {
  return instance
    .get(TERMSANDCONDITIONS)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const userGenerateOtp = async () => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {userId: value};
  return instance
    .post(USERGENERATEOTP, jsonData)

    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const userRegistrationWhatsAppOTP = async jsonData => {
  return instance
    .post(
      SENDTWILLOOTP,
      jsonData,
      jsonData?.bearer
        ? {
            headers: {
              Authorization: `bearer ${jsonData.bearer}`,
            },
          }
        : {headers: {}},
    )

    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const compareTwilloOTP = async jsonData => {
  return instance
    .post(
      COMPARETWILLOOTP,
      jsonData,
      jsonData?.bearer
        ? {
            headers: {
              Authorization: `bearer ${jsonData.bearer}`,
            },
          }
        : {headers: {}},
    )

    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const generateUserRegistrationOTP = async email => {
  let jsonData = {email};
  return instance
    .post(GENERATEOTPFORREGISTRATION, jsonData)

    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const registrationOTPValidation = async jsonData => {
  return instance
    .post(COMPAREEMAILANDOTP, jsonData)

    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const deleteAccount = async otp => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {otp: otp, id: value};

  return instance
    .post(DELETEUSERACCOUNT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const userRegister = async jsonData => {
  return instance
    .post(USERREGISTER, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

export {
  userLogin,
  forgotPassword,
  termsAndConditions,
  userGenerateOtp,
  userRegister,
  deleteAccount,
  generateUserRegistrationOTP,
  registrationOTPValidation,
  userRegistrationWhatsAppOTP,
  compareTwilloOTP,
};
