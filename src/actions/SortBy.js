import sortByDistance from 'sort-by-distance';

export const getSortedArray = (dataArray, type, persistStorage) => {
  let result;
  if (type == '') {
    result = dataArray;
  } else if (type === 'distance') {
    const opts = {
      yName: 'latitude',
      xName: 'longitude',
    };
    const origin = {
      longitude: persistStorage.getState()?.locationDetails?.currentLongitude,
      latitude: persistStorage.getState()?.locationDetails?.currentLatitude,
    };

    result = sortByDistance(origin, dataArray, opts);
  } else if (type === 'pricelow') {
    result = dataArray.sort((a, b) => a.price - b.price);
  } else if (type === 'pricehigh') {
    result = dataArray.sort((a, b) => b.price - a.price);
  } else if (type === 'newestfirst') {
    result = dataArray.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  return result;
};
