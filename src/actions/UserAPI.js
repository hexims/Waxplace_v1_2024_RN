import { Alert } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import persistStorage from '../redux/store/persistStore';
import { instance } from './GenericAPI';
import {
  GETPROFILEDETAILS,
  GETWISHLISTOFUSER,
  GETRECENTWEEKLYDROPS,
  ADDAMOUNTTOUSER,
  ADDTOKENTOUSER,
  CHANGESALEPRODUCTFEATURESTATUS,
  CHANGESALEPRODUCTENABLESTATUS,
  GETVENDORPRODUCTSALES,
  GETUSERPICKUPS,
  ADDFRIENDTOUSER,
  GETUSERSALEPRODUCTS,
  EDITUSERPROFILE,
  GETVENDORFILTERDATA,
  SUBSCRIBEUSER,
  GETVENDOREVENT,
  REMOVEFROMFRIEND,
  GETUSERORDERS,
  CHANGEPASSWORD,
  ARCHIVEWEEKLYDROP,
  GETRECENTPROFILEWEEKLYDROPS,
  CREATESUBSCRIPTION,
  WITHDRAWUSERBALANCE,
  UPDATEUSERSUBSCRIPTION,
  USERNAMECHECK,
  SENDWEEKLYDROPREQUEST,
  GETNOTIFICATIONS,
  REMOVENOTIFICATIONS,
  DELETEUSERACCOUNT,
  GETCOLLECTIONVALUE,
  WITHDRAWALREQUEST,
  UPDATEBALANCEUSER,
  BASEURL,
  GETWALLETHISTORY,
  GETUSERCART,
  GETUSERFRIENDS,
  GETVENDORDETAILS,
  SHARECODECHECK,
  SAVECREDITCARDS,
  DECODECVV,
  SENDKYCRESULTS,
  SAVEBANKACCOUNT,
  DELETECARD,
  DELETEUSERBANKACCOUNT,
  CANCELUSERSUBSCRIPTION,
  GETMANGOPAYAUTHTOKEN,
} from './_apiUrls';

const profileDetails = async (
  value = persistStorage.getState().userDetails.userId,
) => {
  let jsonData = { userId: value };
  return instance
    .post(GETPROFILEDETAILS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      //  Alert.alert('', 'Something went wrong');

      throw error;
    });
};

const getUserprofileDetails = async value => {
  let jsonData = { userId: value };
  return instance
    .post(GETPROFILEDETAILS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      //  Alert.alert('', 'Something went wrong');

      throw error;
    });
};

const vendorDetails = async email => {
  let jsonData = { email: email };
  return instance
    .post(GETVENDORDETAILS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      //  Alert.alert('', 'Something went wrong');

      throw error;
    });
};

const getUserCart = async (sortValue = 'newest') => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .get(GETUSERCART + value)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      //  Alert.alert('', 'Something went wrong');

      throw error;
    });
};

const editUserProfile = async jsonData => {
  let value = jsonData?.userId
    ? jsonData.userId
    : persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(
      EDITUSERPROFILE,
      jsonData,
      jsonData?.bearer
        ? {
          headers: {
            Authorization: `bearer ${jsonData.bearer}`,
          },
        }
        : { headers: {} },
    )
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const updateUserImage = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  const formData = [{ name: 'id', data: value }];

  if (jsonData.type == 'cover') {
    formData.push({
      name: 'imageTwo',
      filename: jsonData.type === 'cover' ? jsonData.bgImage.name : undefined,
      data:
        jsonData.type === 'cover'
          ? RNFetchBlob.wrap(jsonData.bgImage.uri)
          : undefined,
    });
  } else {
    formData.push({
      name: 'imageOne',
      filename:
        jsonData.type !== 'cover' ? jsonData.profileImage.name : undefined,
      data:
        jsonData.type !== 'cover'
          ? RNFetchBlob.wrap(jsonData.profileImage.uri)
          : undefined,
    });
  }

  try {
    const response = await RNFetchBlob.config({
      trusty: true,
      timeout: 10000, // adjust timeout as needed
    }).fetch(
      'POST',
      BASEURL + EDITUSERPROFILE,
      {
        Authorization:
          'Bearer ' + persistStorage.getState()?.userDetails?.bearer,
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
      formData,
    );

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

// const updateProfileImage = async jsonData => {
//   let value = persistStorage.getState().userDetails.userId;
//   let formData = new FormData();
//   if (jsonData.type == 'cover') {
//     formData.append('imageTwo', jsonData.bgImage);
//   } else {
//     formData.append('imageOne', jsonData.profileImage);
//   }

//   formData.append('id', value);

//   return fetch(BASEURL + EDITUSERPROFILE, {
//     method: 'POST',
//     body: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       Authorization: 'Bearer ' + persistStorage.getState()?.userDetails?.bearer,
//     },
//   })
//     .then(response => response.json())
//     .then(data => {
//       return data;
//     })
//     .catch(error => {
//       throw error;
//     });
// };

const getWalletHistory = async page => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .get(GETWALLETHISTORY + `?id=${value}&page=${page}&size=20`)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getUserSaleProducts = async (id, sortValue = 'newest') => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {};
  if (id) {
    jsonData = { ...jsonData, id, sortValue };
  } else {
    jsonData = { ...jsonData, id: value, sortValue };
  }

  return instance
    .post(GETUSERSALEPRODUCTS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const saleProductFeatureStatus = async (saleProductId, status) => {
  let jsonData = {
    id: saleProductId,
    status: status,
    isUser: true,
  };

  return instance
    .post(CHANGESALEPRODUCTFEATURESTATUS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const saleProductEnableStatus = async (saleProductId, status) => {
  let jsonData = {
    id: saleProductId,
    status: status,
    isUser: true,
  };

  return instance
    .post(CHANGESALEPRODUCTENABLESTATUS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const subscriptionUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(SUBSCRIBEUSER, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const addTokensToUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  if (jsonData.type == 'wallet') {
    return updateBalanceForUser(jsonData)
      .then(async result => {
        if (result.status == 'success') {
          return instance
            .post(ADDTOKENTOUSER, jsonData)
            .then(({ data }) => {
              return data;
            })
            .catch(error => {
              throw error;
            });
        } else {
          Alert.alert('', 'Something went wrong');
        }
      })
      .catch(err => {
        return err;
      });
  } else {
    return instance
      .post(ADDTOKENTOUSER, jsonData)
      .then(({ data }) => {
        return data;
      })
      .catch(error => {
        throw error;
      });
  }
};

const updateBalanceForUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(UPDATEBALANCEUSER, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const addFriendToUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(ADDFRIENDTOUSER, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const removeFriendForUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(REMOVEFROMFRIEND, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getUserOrders = async (sortValue = 'newest') => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {
    userId: value,
    sortValue,
  };
  return instance
    .post(GETUSERORDERS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getNotificationsOfUser = async () => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = { userId: value };

  return instance
    .post(GETNOTIFICATIONS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const removeFromNotifications = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, userId: value };

  return instance
    .post(REMOVENOTIFICATIONS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getPickupDataofUser = async () => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .get(GETUSERPICKUPS)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const userFieldCheck = async (jsonData, bearer = null) => {
  return instance
    .post(
      USERNAMECHECK,
      jsonData,
      bearer
        ? {
          headers: {
            Authorization: `bearer ${bearer}`,
          },
        }
        : { headers: {} },
    )
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const shareCodeCheckFunction = async jsonData => {
  return instance
    .post(
      SHARECODECHECK,
      jsonData,
      jsonData?.bearer
        ? {
          headers: {
            Authorization: `bearer ${jsonData.bearer}`,
          },
        }
        : { headers: {} },
    )
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const addAmountToUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(ADDAMOUNTTOUSER, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const createSubscription = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, userId: value };

  return instance
    .post(CREATESUBSCRIPTION, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const cancelUserSubscription = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, userId: value };

  return instance
    .post(CANCELUSERSUBSCRIPTION, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const withdrawUserBalance = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(WITHDRAWUSERBALANCE, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const updateSubscriptionForUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = { ...jsonData, id: value };

  return instance
    .post(UPDATEUSERSUBSCRIPTION, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getWishListofUser = async (searchValue = '', sortValue = 'newest') => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {
    userId: value,
    searchValue,
    sortValue,
  };

  return instance
    .post(GETWISHLISTOFUSER, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getUserFriendsList = async () => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .get(GETUSERFRIENDS + value)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const recentProfileWeeklyDrops = async () => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = { userId: value };

  return instance
    .post(GETRECENTPROFILEWEEKLYDROPS, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const sendWeeklyDropRequest = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  let email = persistStorage.getState().userDetails.email;

  jsonData = { ...jsonData, userId: value, email };

  return instance
    .post(SENDWEEKLYDROPREQUEST, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const archiveWeeklyDropsData = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, userId: value };

  return instance
    .post(ARCHIVEWEEKLYDROP, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const changePasswordOfUser = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = { ...jsonData, id: value };

  return instance
    .post(CHANGEPASSWORD, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const deletUserAccountOfUser = async () => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .delete(DELETEUSERACCOUNT + value)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getVendorProductSales = async (jsonData, sortValue = 'newest') => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = { ...jsonData, sortValue, userId: value };
  return instance
    .post(GETVENDORPRODUCTSALES, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getVendorEvent = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .post(GETVENDOREVENT, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getVendorFilterData = async (charc, vendorDetails) => {
  return instance
    .get(GETVENDORFILTERDATA + '?name=' + charc + '&id=' + vendorDetails._id)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getRecentWeeklyDrops = async () => {
  return instance
    .get(GETRECENTWEEKLYDROPS)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getCollectionValue = async () => {
  let value = persistStorage.getState().userDetails.userId;
  let jsonData = { userId: value };
  return instance
    .post(GETCOLLECTIONVALUE, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const sendWithdrawalRequest = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = { ...jsonData, id: value };
  return instance
    .post(WITHDRAWALREQUEST, jsonData)
    .then(({ data }) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const saveCrediCards = async jsonData => {
  try {
    const response = await instance.post(SAVECREDITCARDS);

    return response;
  } catch (error) {
    throw error;
  }
};

const decodeCvv = async jsonData => {
  try {
    let value = persistStorage.getState().userDetails.userId;
    jsonData = { ...jsonData, userId: value };

    const response = await instance.post(DECODECVV, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const sendKycDocumentResults = async jsonData => {
  try {
    let value = persistStorage.getState().userDetails.userId;
    jsonData = { ...jsonData, userId: value };

    const response = await instance.post(SENDKYCRESULTS, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const saveBankAccount = async jsonData => {
  try {
    let value = persistStorage.getState().userDetails.userId;
    jsonData = { ...jsonData, userId: value };

    const response = await instance.post(SAVEBANKACCOUNT, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const deleteCard = async jsonData => {
  try {
    let value = persistStorage.getState().userDetails.userId;
    jsonData = { ...jsonData, userId: value };

    const response = await instance.post(DELETECARD, jsonData);

    return response;
  } catch (error) {
    throw error;
  }
};

const deleteUserBankAccount = async () => {
  try {
    // let value = persistStorage.getState().userDetails.userId;
    // jsonData = {...jsonData, userId: value};

    const response = await instance.get(DELETEUSERBANKACCOUNT);

    return response;
  } catch (error) {
    throw error;
  }
};






const getMangoPayAuthToken = async () => {


  return instance
    .get(GETMANGOPAYAUTHTOKEN)
    .then(({ data }) => {
      console.log(data)
      return data;
    })
    .catch(error => {
      //  Alert.alert('', 'Something went wrong');
      console.log(error?.response)
      throw error;
    });
};


export {
  profileDetails,
  updateUserImage,
  editUserProfile,
  getUserSaleProducts,
  saleProductFeatureStatus,
  saleProductEnableStatus,
  subscriptionUser,
  addTokensToUser,
  addFriendToUser,
  removeFriendForUser,
  getUserOrders,
  getNotificationsOfUser,
  removeFromNotifications,
  getPickupDataofUser,
  userFieldCheck,
  addAmountToUser,
  createSubscription,
  cancelUserSubscription,
  withdrawUserBalance,
  updateSubscriptionForUser,
  getWishListofUser,
  sendWithdrawalRequest,
  recentProfileWeeklyDrops,
  sendWeeklyDropRequest,
  archiveWeeklyDropsData,
  changePasswordOfUser,
  deletUserAccountOfUser,
  getVendorProductSales,
  getVendorEvent,
  getVendorFilterData,
  getRecentWeeklyDrops,
  getCollectionValue,
  updateBalanceForUser,
  getWalletHistory,
  getUserCart,
  getUserFriendsList,
  vendorDetails,
  getUserprofileDetails,
  shareCodeCheckFunction,
  saveCrediCards,
  decodeCvv,
  sendKycDocumentResults,
  saveBankAccount,
  deleteCard,
  deleteUserBankAccount,
  getMangoPayAuthToken
};
