import {Alert, PermissionsAndroid, Platform} from 'react-native';
import sortByDistance from 'sort-by-distance';
import Geolocation from 'react-native-geolocation-service';
import {openSettings} from 'react-native-permissions';
import {getDistance, getPreciseDistance} from 'geolib';
import {addToWishlist, removeFromWishlist} from './PurchaseFlowAPI';
import textContent from '../utils/textContent';
// const jwt = require('jsonwebtoken');

export const checkPostalCodeInSpain = postalCode => {
  const regex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/; // Spanish postal code regex pattern
  return regex.test(postalCode);

  // const apiEndpoint = `https://api.zippopotam.us/ES/${postalCode}`;
  // try {
  //   const response = await fetch(apiEndpoint);
  //   const data = await response.json();
  //   if (response.ok && data.country === 'Spain') {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // } catch (error) {
  //   const regex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/; // Spanish postal code regex pattern
  //   return regex.test(postalCode);
  // }
};

export const removeEmptyFromJSON = obj => {
  return Object.entries(obj).reduce(
    (a, [k, v]) => (v == '' ? a : ((a[k] = v), a)),
    {},
  );
};

export const getFilterName = type => {
  if (type == 'default') {
    return '';
  } else if (type == 'distance') {
    return textContent.HelperFunctions.distance;
  } else if (type == 'lowTohigh') {
    return textContent.HelperFunctions.price_low_high;
  } else if (type == 'highTolow') {
    return textContent.HelperFunctions.price_high_low;
  } else if (type == 'newest') {
    return textContent.HelperFunctions.newest;
  }
};

export const getSortedArray = async (dataArray, type, persistStorage) => {
  let result = [];

  if (type == 'default') {
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
  } else if (type === 'lowTohigh') {
    result = dataArray.sort((a, b) => a.price - b.price);
  } else if (type === 'highTolow') {
    result = dataArray.sort((a, b) => b.price - a.price);
  } else if (type === 'newest') {
    result = dataArray.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  return result;
};

export const changeToNumber = text => {
  return text.replace(/[^\d]/g, '').trim();
};

export const changeToFloat = text => {
  return text.replace(/[^0-9,]/g, '').trim();
};

export const changeWishList = (
  callback,
  _id,
  isWishList,
  userReducer,
  updateUserDetails,
) => {
  if (!isWishList) {
    addToWishlist(_id)
      .then(response => {
        if (response.status === 'success') {
          callback(true);
        } else {
          Alert.alert('', response.message);
        }
      })
      .catch(error => {});
  } else {
    removeFromWishlist(_id)
      .then(response => {
        if (response.status === 'success') {
          callback(false);
        } else {
          Alert.alert('', response.message);
        }
      })
      .catch(error => {});
  }
};

export const getPrice = number => {
  let num = number;
  let n = num?.toFixed(2);
  let replaceString = n.toString().replace('.', ',');

  return replaceString;
};

export const hasLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const hasPermission = await hasLocationPermissionIOS();
    return hasPermission;
  }

  if (Platform.OS === 'android' && Platform.Version < 23) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'WAXPLACE',
      message: textContent.HelperFunctions.permission_message,
    },
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
  }

  return false;
};

const hasLocationPermissionIOS = async () => {
  const openSetting = () => {
    Linking.openSettings().catch(() => {
      Alert.alert(textContent.HelperFunctions.unable_open_settings);
    });
  };
  const status = await Geolocation.requestAuthorization('whenInUse');

  if (status === 'granted') {
    return true;
  }

  if (status === 'denied') {
    Alert.alert(textContent.HelperFunctions.location_enable, [
      {
        text: 'OK',
        onPress: () => {
          openSetting().catch(() => {
            Alert.alert(textContent.HelperFunctions.unable_open_settings);
          });
        },
      },
    ]);
  }

  if (status === 'disabled') {
    Alert.alert(textContent.HelperFunctions.location_enable_one, '', [
      {text: textContent.HelperFunctions.goto_settings, onPress: openSetting},
      {text: textContent.HelperFunctions.dont_use_location, onPress: () => {}},
    ]);
  }

  return false;
};

export const getLocation = async seller => {
  let distanceFromCurrentLocation = 0;
  if (!(await hasLocationPermission())) {
    return;
  }

  Geolocation.getCurrentPosition(
    position => {
      const currentLongitude = parseFloat(position.coords.longitude);
      //getting the Longitude from the location json
      const currentLatitude = parseFloat(position.coords.latitude);

      const opts = {
        yName: 'latitude',
        xName: 'longitude',
      };
      const origin = {
        longitude: currentLongitude,
        latitude: currentLatitude,
      };

      let distance =
        getDistance(
          {latitude: seller.latitude, longitude: seller.longitude},
          {
            latitude: currentLatitude,
            longitude: currentLongitude,
          },
        ) / 1000;

      if (distance > 100) {
        distanceFromCurrentLocation = distance.toFixed(0);
      } else if (distance > 10) {
        distanceFromCurrentLocation = distance.toFixed(2);
      } else {
        distanceFromCurrentLocation = distance.toFixed(3);
      }

      return distanceFromCurrentLocation;
    },
    error => {
      return 0;
    },
    {
      accuracy: {
        android: 'high',
        ios: 'best',
      },
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      distanceFilter: 0,
      forceRequestLocation: true,
      showLocationDialog: false,
    },
  );
};

export const isMatch = (data, filterKeys, filterValue) => {
  for (let i = 0; i < filterKeys.length; i++) {
    const key = filterKeys[i];

    if (
      typeof data === 'object' &&
      data !== null &&
      data.hasOwnProperty(key) &&
      data[key]?.toString()?.toLowerCase().includes(filterValue.toLowerCase())
    ) {
      return true;
    }
    for (const prop in data) {
      if (
        data.hasOwnProperty(prop) &&
        typeof data[prop] === 'object' &&
        data[prop] !== null
      ) {
        if (isMatch(data[prop], [key], filterValue)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isMainlandSpain = postalCode => {
  // Define the postal code patterns for mainland Spain and the islands of Spain
  const mainlandPattern = /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
  const islandsPattern = /^(07|35|38|51|52)\d{3}$/;

  // Check if the postal code matches the patterns for mainland Spain or the islands of Spain
  if (postalCode == null) {
    return false;
  } else if (mainlandPattern.test(postalCode)) {
    return true; // Postal code corresponds to mainland Spain
  } else if (islandsPattern.test(postalCode)) {
    return false; // Postal code corresponds to the islands of Spain
  } else {
    return false; // Postal code format is not recognized or is invalid
  }
};

export const isCustomsCorreosShipment = (postalCode1, postalCode2) => {
  // Define the postal code patterns for mainland Spain and the islands of Spain
  // const mainlandPattern = /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
  const spainishPattern = /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
  const mainlandPattern = /^(?!0[7]|3[58]|5[12])\d{5}$/;
  const islandsPattern = /^(07|35|38|51|52)\d{3}$/;

  // Check if either postal code matches the pattern for the islands of Spain
  const isPostalCode1Island = islandsPattern.test(postalCode1);
  const isPostalCode2Island = islandsPattern.test(postalCode2);
  if (
    !spainishPattern.test(postalCode1) ||
    !spainishPattern.test(postalCode2)
  ) {
    return null;
  }
  if (isPostalCode1Island && isPostalCode2Island) {
    return false; // Both postal codes belong to the islands of Spain
  } else if (
    mainlandPattern.test(postalCode1) &&
    mainlandPattern.test(postalCode2)
  ) {
    return false; // Both postal codes correspond to mainland Spain
  } else {
    return true; // Postal code format is not recognized, or they belong to different locations
  }
};

export const ValidateSpanishID = (function () {
  'use strict';

  var DNI_REGEX = /^(([KLM]\d{7})|(\d{8}))([A-Z])$/;
  var CIF_REGEX = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/;
  var NIE_REGEX = /^[XYZ]\d{7,8}[A-Z]$/;

  var ValidateSpanishID = function (str) {
    // Ensure upcase and remove whitespace
    str = str.toUpperCase().replace(/\s/, '');

    var valid = false;
    var type = spainIdType(str);

    switch (type) {
      case 'dni':
        valid = validDNI(str);
        break;
      case 'nie':
        valid = validNIE(str);
        break;
      case 'cif':
        valid = validCIF(str);
        break;
    }

    return {
      type: type,
      valid: valid,
    };
  };

  var spainIdType = function (str) {
    if (str.match(DNI_REGEX)) {
      return 'dni';
    }
    if (str.match(CIF_REGEX)) {
      return 'cif';
    }
    if (str.match(NIE_REGEX)) {
      return 'nie';
    }
  };

  var validDNI = function (dni) {
    var dni_letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    if (dni[0].match(/[KLM]/)) {
      dni = dni.substr(1);
    }
    var letter = dni_letters.charAt(parseInt(dni, 10) % 23);

    return letter == dni.charAt(dni.length - 1);
  };

  var validNIE = function (nie) {
    // Change the initial letter for the corresponding number and validate as DNI
    var nie_prefix = nie.charAt(0);

    switch (nie_prefix) {
      case 'X':
        nie_prefix = 0;
        break;
      case 'Y':
        nie_prefix = 1;
        break;
      case 'Z':
        nie_prefix = 2;
        break;
    }

    return validDNI(nie_prefix + nie.substr(1));
  };

  var validCIF = function (cif) {
    var match = cif.match(CIF_REGEX);
    var letter = match[1],
      number = match[2],
      control = match[3];

    var even_sum = 0;
    var odd_sum = 0;
    var last_digit = 0;
    var n;

    for (var i = 0; i < number.length; i++) {
      n = parseInt(number.charAt(i), 10);

      // Odd positions (Even index equals to odd position. i=0 equals first position)
      if (i % 2 === 0) {
        // Odd positions are multiplied first.
        n *= 2;

        // If the multiplication is bigger than 10 we need to adjust
        odd_sum += n < 10 ? n : n - 9;

        // Even positions
        // Just sum them
      } else {
        even_sum += n;
      }
    }

    last_digit = parseInt((even_sum + odd_sum).toString().slice(-1), 10);

    var control_digit = last_digit != 0 ? 10 - last_digit : last_digit;
    var control_letter = 'JABCDEFGHI'.substr(control_digit, 1);

    // Control must be a digit
    if (letter.match(/[ABEH]/)) {
      return control == control_digit;

      // Control must be a letter
    } else if (letter.match(/[PQSW]/)) {
      return control == control_letter;

      // Can be either
    } else {
      return control == control_digit || control == control_letter;
    }
  };

  return ValidateSpanishID;
})();

const isValidURL = url => {
  // Regular expression pattern for URL validation
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // Protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // Query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // Fragment locator

  // Check if the provided URL matches the pattern
  return pattern.test(url);
};

// const iosBundleId = "com.hexims.stokeapp";

// export const validateIdentityToken = async (identityToken, isDev) => {
//  try {
//    const clientID = iosBundleId;
//    const { header } = jwt.decode(identityToken, { complete: true });
//    const applePublicKey = await getAppleIdentityPublicKey(header.kid);
//    const jwtClaims = jwt.verify(identityToken, applePublicKey, { algorithms: 'RS256' });
//    if (jwtClaims.iss !== APPLE_IDENTITY_URL) throw new Error('Apple identity token wrong issuer: ' + jwtClaims.iss);
//    if (jwtClaims.aud !== clientID) throw new Error('Apple identity token wrong audience: ' + jwtClaims.aud);
//    if (jwtClaims.exp < moment.utc().unix()) throw new Error('Apple identity token expired');
//    return jwtClaims;
//  } catch (err) {
//    ...
//    return null;
//  }
// }
