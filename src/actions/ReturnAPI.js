import {Alert} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';

import {
  BASEURL,
  RETURNSOLDPRODUCT,
  SAVERETURNCHATDATA,
  SENDPRODUCTRETURNREQUEST,
  GETRETURNCHATDATA,
} from './_apiUrls';

import store from '../redux/store';
import {UPDATE_USER_DETAILS} from '../redux/actions/types';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
// import {updateUserDetails} from '../redux/actions/UserAction';

const sendReturnRequest = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  let formData = new FormData();
  formData.append('userId', value);
  formData.append('orderId', jsonData.orderId);
  formData.append('saleProductId', jsonData.saleProductId);
  formData.append('sellerId', jsonData.sellerId);
  formData.append('returnForReason', jsonData.returnForReason);
  formData.append('amount', jsonData.amount);
  formData.append('image', {
    uri: jsonData.image.path,
    type: jsonData.image.mime,
    name: jsonData.image.path.split('/').pop(),
  });

  return fetch(BASEURL + SENDPRODUCTRETURNREQUEST, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + persistStorage.getState()?.userDetails?.bearer,
    },
  })
    .then(response => response.json())

    .then(data => {
      return data;
    })
    .catch(error => {});
};

const getOrderDetails = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, userId: value};

  return instance
    .post(GETUSERORDERDETIALS, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const returnAlbum = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  let formData = new FormData();
  formData.append('userId', value);
  formData.append('albumId', jsonData.albumId);
  formData.append('orderId', jsonData.orderId);
  formData.append('albumName', jsonData.albumName);
  formData.append('buyerName', jsonData.buyerName);
  formData.append('buyerEmail', jsonData.buyerEmail);
  formData.append('receiveDate', jsonData.receiveDate);
  formData.append('storePickUp', jsonData.storePickUp);
  formData.append('amount', jsonData.amount);
  formData.append('shippingCharge', jsonData.shippingCharge);
  formData.append('buyerTax', jsonData.buyerTax);
  formData.append('totalBuyerAmount', jsonData.totalBuyerAmount);
  formData.append('shippingDate', jsonData.shippingDate);
  formData.append('courier', jsonData.courier);
  formData.append('sellerName', jsonData.sellerName);
  formData.append('sellerEmail', jsonData.sellerEmail);
  formData.append('sellerTax', jsonData.sellerTax);
  formData.append('sellerTotalAmount', jsonData.sellerTotalAmount);
  formData.append('sellerId', jsonData.sellerId);
  formData.append('buyerId', jsonData.buyerId);
  formData.append('isReturn', true);

  formData.append('option', jsonData.option);

  return fetch(BASEURL + RETURNSOLDPRODUCT, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + persistStorage.getState()?.userDetails?.bearer,
    },
  })
    .then(response => response.json())
    .then(data => {
    
      return data;
    })
    .catch(error => {});
};

const saveReturnChat = async jsonData => {
  const value = persistStorage.getState().userDetails.userId;
  const headers = {
    Authorization: `Bearer ${persistStorage.getState()?.userDetails?.bearer}`,
  };

  const data = [
    {name: 'userName', data: jsonData.userName},
    {name: 'returnId', data: jsonData.returnId},
    {name: 'userId', data: value},
  ];

  if (jsonData?.audio) {
    const audioPath =
      Platform.OS == 'ios'
        ? jsonData.audio.uri
        : 'file://' + jsonData.audio.uri;
    const audioType = jsonData.audio.type;
    const audioName = audioPath.split('/').pop();
    data.push({
      name: 'audio',
      filename: audioName,
      type: audioType,
      data: RNFetchBlob.wrap(audioPath),
    });
  }

  if (jsonData?.image) {
    const imagePath =
      Platform.OS == 'ios'
        ? jsonData.image.uri
        : 'file://' + jsonData.image.uri;

    const imageType = jsonData.image.type;
    const imageName = imagePath.split('/').pop();

    data.push({
      name: 'image',
      filename: imageName,
      type: imageType,
      data: RNFetchBlob.wrap(imagePath),
    });
  }

  if (jsonData.messages) {
    data.push({name: 'messages', data: jsonData.messages});
  }

  try {

    const response = await RNFetchBlob.fetch(
      'POST',
      BASEURL + SAVERETURNCHATDATA,
      headers,
      data,
    );
    const responseData = await response.json();

    return responseData;
  } catch (error) {
    throw error;
  }
};

const getAllAppContents = async () => {
  return instance
    .get(GETAPPCONTENTS)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const getUserChatData = async () => {
  return instance
    .get(GETRETURNCHATDATA)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

export {
  sendReturnRequest,
  getOrderDetails,
  returnAlbum,
  saveReturnChat,
  getUserChatData,
};
