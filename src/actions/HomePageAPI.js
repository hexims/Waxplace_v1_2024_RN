import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';
import {
  GETACTIVEWEEKLYDROP,
  GETRANDOMPROMOTIONS,
  GETAPPCONTENTS,
  GETSALEPRODUCTSBYCATEGORIES,
  GETFEATUREDITEMSBYCATEGORIES,
  GETALL24HOURACCESS,
  GETVENDORNOTIFICATION,
} from './_apiUrls';

const getRandomPromotions = async jsonData => {
  return instance
    .post(GETRANDOMPROMOTIONS, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const saleProductByCategories = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {
    ...jsonData,
    userId: value,
    searchValue: jsonData.searchText,
  };

  return instance
    .post(GETSALEPRODUCTSBYCATEGORIES, jsonData)
    .then(({data}) => {
      let _array = [];
      // if (data?.result?.length > 0) {
      //   data.result.map(value => {
      //     _array.push({...value
      //       //, isWishList: value.isWishList
      //     });
      //   });
      // }

      return data.result;
    })
    .catch(error => {
      throw error;
    });
};

const featuredItemsByCategories = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, userId: value};

  return instance
    .post(GETFEATUREDITEMSBYCATEGORIES, jsonData)
    .then(({data}) => {
      let _array = [];
      if (data?.result?.length > 0) {
        data.result.map(value => {
          _array.push({...value.data, isWishList: value.isWishList});
        });
      }

      return _array;
    })
    .catch(error => {
      throw error;
    });
};

const getAll24HourAccess = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, userId: value, searchValue: jsonData.searchText};

  return instance
    .post(GETALL24HOURACCESS, jsonData)
    .then(({data}) => {
      // let _array = [];
      // if (data?.result?.length > 0) {
      //   data.result.map(value => {
      //     _array.push({...value.data, isWishList: value.isWishList});
      //   });
      // }

      return data.result;
    })
    .catch(error => {});
};

const getAllAppContents = async () => {
  return instance
    .get(GETAPPCONTENTS)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const getAllActiveWeeklyDrops = async () => {
  return instance
    .get(GETACTIVEWEEKLYDROP)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const getVendorNotification = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, userId: value};

  return instance
    .post(GETVENDORNOTIFICATION, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      //  Alert.alert('', 'Something went wrong');
    });
};

export {
  getRandomPromotions,
  saleProductByCategories,
  featuredItemsByCategories,
  getAll24HourAccess,
  getAllAppContents,
  getAllActiveWeeklyDrops,
  getVendorNotification,
};
