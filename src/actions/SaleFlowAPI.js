import {Alert} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';
import {
  GETCATEGORIES,
  SAVECATEGORIES,
  ADDSALEPRODUCT,
  ADDALBUM,
  GETCOUNTRIES,
  GETCITIESBYCOUNTRIES,
  GETALBUMBYBARCODE,
  GETSALESLIST,
  BASEURL,
  REJECTSALESORDER,
  ADDSALEVENDORPRODUCT,
  SAVEIMAGE,
  EDITSALEVENDORPRODUCT,
  SETDEFAULTPRODUCT,
  SALEPRODUCTCOPY,
  DELETESALEVENDORPRODUCT,
} from './_apiUrls';

const addSaleProduct = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, userId: value};

  return instance
    .post(ADDSALEPRODUCT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const setDefaultProduct = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {userId: value, ...jsonData};

  return instance
    .post(SETDEFAULTPRODUCT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const addSaleVendorProduct = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, sellerId: value};

  return instance
    .post(ADDSALEVENDORPRODUCT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const deleteSaleVendorProduct = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, sellerId: value};

  return instance
    .post(DELETESALEVENDORPRODUCT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const createSaleProductCopy = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, sellerId: value};

  return instance
    .post(SALEPRODUCTCOPY, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const editSaleVendorProduct = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, sellerId: value};

  return instance
    .put(EDITSALEVENDORPRODUCT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

// const saveImageToServer = async jsonData => {
//   let value = persistStorage.getState().userDetails.userId;
//   let formData = new FormData();
//   formData.append('image', jsonData.image);
//   formData.append('userId', value);

//
//   // let delay = 3500; // milliseconds
//   // let before = Date.now();
//   // while (Date.now() < before + delay) {}

//   return fetch(BASEURL + SAVEIMAGE, {
//     method: 'POST',
//     body: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       Accept: 'application/json',
//       Authorization: 'Bearer ' + persistStorage.getState()?.userDetails?.bearer,
//     },
//   })
//     .then(response => response.json())
//     .then(data => {
//
//       return data;
//     })
//     .catch(error => {
//
//      throw error;
//     });
// };

const saveImageToServer = async jsonData => {
  const value = persistStorage.getState().userDetails.userId;
  const image = jsonData.image;

  const formData = [
    {
      name: 'image',
      filename: image.name,
      data: RNFetchBlob.wrap(image.uri),
    },
    {name: 'userId', data: value},
  ];

  try {
    const response = await RNFetchBlob.config({
      trusty: true,
      timeout: 10000, // adjust timeout as needed
    }).fetch(
      'POST',
      BASEURL + SAVEIMAGE,
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

const getCategories = async () => {
  return instance
    .get(GETCATEGORIES)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const saveCategories = async clickedCategories => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {id: value, categories: JSON.stringify(clickedCategories)};

  return instance
    .post(SAVECATEGORIES, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getCountriesList = async (bearer = null, toggle = true) => {
  if (!toggle) {
    return [{_id: 'Spain'}];
  }
  return instance
    .get(
      GETCOUNTRIES,
      bearer
        ? {
            headers: {
              Authorization: `bearer ${bearer}`,
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

const getCitiesOfSelectedCountry = async (country, bearer = null) => {
  return instance
    .get(
      GETCITIESBYCOUNTRIES + `?country=${country}`,
      bearer
        ? {
            headers: {
              Authorization: `bearer ${bearer}`,
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

const addNewAlbum = async jsonData => {
  jsonData = {...jsonData, userId: value};

  return instance
    .post(ADDALBUM, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getAlbumByBarcode = async barCode => {
  let jsonData = {barCode};

  return instance
    .post(GETALBUMBYBARCODE, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const addAlbumData = async jsonData => {
  let formData = new FormData();
  formData.append('barCode', jsonData.barCode);
  formData.append('album', jsonData.album);
  formData.append('artist', jsonData.artist);
  formData.append('label', jsonData.label);
  formData.append('categories', jsonData.categories);
  formData.append('isFeature', jsonData.isFeature);

  formData.append('year', jsonData.year);
  formData.append('price', jsonData.price);
  formData.append('trackList', jsonData.trackList);
  formData.append('teamList', jsonData.teamList);
  formData.append('videoList', jsonData.videoList);
  formData.append('creditDetails', jsonData.creditDetails);
  formData.append('saleProductId', jsonData.saleProductId);
  formData.append('addedby', jsonData.addedby);
  formData.append('status', jsonData.status);
  formData.append('date', jsonData.date);
  formData.append('image', jsonData.image);
  formData.append('fileName', jsonData.fileName);

  return fetch(BASEURL + ADDALBUM, {
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
    .catch(error => {
      throw error;
    });
};

const getSalesList = async (sortValue = 'newest') => {
  let value = persistStorage.getState().userDetails.userId;
  let jsonData = {sellerId: value, sortValue};

  return instance
    .post(GETSALESLIST, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const rejectSalesOrder = async jsonData => {
  return instance
    .put(REJECTSALESORDER, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

export {
  addSaleProduct,
  getCategories,
  saveCategories,
  getCountriesList,
  getCitiesOfSelectedCountry,
  addNewAlbum,
  getAlbumByBarcode,
  addAlbumData,
  getSalesList,
  rejectSalesOrder,
  addSaleVendorProduct,
  deleteSaleVendorProduct,
  editSaleVendorProduct,
  saveImageToServer,
  setDefaultProduct,
  createSaleProductCopy,
};
