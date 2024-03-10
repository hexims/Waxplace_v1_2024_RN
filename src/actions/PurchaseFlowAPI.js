import {Alert} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';

import {
  ADDTOWISHLIST,
  REMOVEFROMWISHLIST,
  ADDTOCOLLECTION,
  REMOVEFROMCOLLECTION,
  ADDPRODUCTTOUSERCART,
  REMOVEPRODUCTFROMUSERCART,
  GETVENDORLIST,
  PURCHASEALBUM,
  GETVENDORSBYFILTER,
  GETDATAWITHBARCODE,
  MAKECHECKOUTLOCK,
  MAKECHECKOUTUNLOCK,
  GETTAXPERCENT,
  GETINDIVIDUALALBUM,
  GETALBUMSBYBARCODE,
  SENDALBUMREPORT,
  SAVEUSERPICKUPINFO,
  GETORDERIDDETAILS,
} from './_apiUrls';

import store from '../redux/store';
import {UPDATE_USER_DETAILS} from '../redux/actions/types';
import {getUserCart} from './UserAPI';
// import {updateUserDetails} from '../redux/actions/UserAction';

const getIndividualAlbum = async saleId => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .get(GETINDIVIDUALALBUM + saleId + '/' + value)
    .then(({data}) => {
      if (data?.findAlbum) {
        data = {
          ...data,
          findAlbum: {...data.findAlbum, isWishList: data.isWishList},
        };
      }

      return data;
    })
    .catch(error => {});
};

const getAlbumsByBarcode = async (barcode, saleId) => {
  let value = persistStorage.getState().userDetails.userId;
  return instance
    .get(
      GETALBUMSBYBARCODE + `?barcode=${barcode}&id=${saleId}&sellerId=${value}`,
    )
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};


const getOrderIdDetails = async orderId => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {userId: value, orderId};

  return instance
    .post(GETORDERIDDETAILS, jsonData)
    .then(({data}) => {
    
      return data;
    })
    .catch(error => {});
};

const addToWishlist = async saleId => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {userId: value, saleProductId: saleId};

  return instance
    .post(ADDTOWISHLIST, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const sendAlbumReport = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {userId: value, ...jsonData};

  return instance
    .post(SENDALBUMREPORT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const removeFromWishlist = async saleId => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {userId: value, saleProductId: saleId};

  return instance
    .post(REMOVEFROMWISHLIST, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const addCollection = async releaseData => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {userId: value, releaseData: JSON.stringify(releaseData)};

  return instance
    .post(ADDTOCOLLECTION, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const removeCollection = async releaseData => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {userId: value, releaseId: releaseData.id};
  return instance
    .post(REMOVEFROMCOLLECTION, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const getDataWithBarcode = async barcodeData => {
  return instance
    .get(GETDATAWITHBARCODE + barcodeData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const addProductToUserCart = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, id: value};

  return instance
    .post(ADDPRODUCTTOUSERCART, jsonData)
    .then(({data}) => {
      if (data.status == 'success') {
        getUserCart()
          .then(response => {
            store.dispatch({
              type: UPDATE_USER_DETAILS,
              payload: {
                prop: 'cartLength',
                value: response?.findOne?.cart?.length,
              },
            });
          })
          .catch(err => {});
      }

      return data;
    })
    .catch(error => {});
};

const removeProductFromUserCart = async saleProductId => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {id: value, saleProductId};

  return instance
    .post(REMOVEPRODUCTFROMUSERCART, jsonData)
    .then(({data}) => {
      if (data.status == 'success') {
        store.dispatch({
          type: UPDATE_USER_DETAILS,
          payload: {prop: 'cartLength', value: data?.user?.cart?.length},
        });
      }

      return data;
    })
    .catch(error => {});
};

const getVendorList = async () => {
  return instance
    .get(GETVENDORLIST)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const getTaxPercent = async () => {
  return instance
    .get(GETTAXPERCENT)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const getVendorsByFilter = async char => {
  return instance
    .get(GETVENDORSBYFILTER + '?name=' + char)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const purchaseAlbum = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, userId: value};

  return instance
    .post(PURCHASEALBUM, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const makeAlbumLock = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {...jsonData, byUserLockId: value};
  return instance
    .put(MAKECHECKOUTLOCK, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const makeAlbumsUnLock = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {...jsonData, byUserLockId: value};
  return instance
    .put(MAKECHECKOUTUNLOCK, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const saveUserPickupInfo = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, buyerId: value};

  return instance
    .post(SAVEUSERPICKUPINFO, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

export {
  addToWishlist,
  removeFromWishlist,
  addCollection,
  removeCollection,
  getDataWithBarcode,
  addProductToUserCart,
  removeProductFromUserCart,
  getVendorList,
  getVendorsByFilter,
  purchaseAlbum,
  makeAlbumLock,
  makeAlbumsUnLock,
  getTaxPercent,
  getIndividualAlbum,
  getAlbumsByBarcode,
  sendAlbumReport,
  saveUserPickupInfo,
  getOrderIdDetails
};
