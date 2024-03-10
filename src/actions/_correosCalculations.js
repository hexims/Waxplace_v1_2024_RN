const axios = require('axios');
const {Alert} = require('react-native');

const isPortuguesePostalCode = postalCode => {
  const regex = /^[0-9]{4}-[0-9]{3}$/;
  return regex.test(postalCode);
};

export const checkPostalCodeCorreosDelivarable = async postalCode => {
  try {
   
    const url = `https://api1.correos.es/digital-services/searchengines/api/v1/suggestions?text=${postalCode}`;
   // console.log(url)
    const response = await axios.get(url);
  //  console.log(response, 'coreos postalCode');
    const suggestions = response?.data?.suggestions;
    if (suggestions && suggestions.length > 0) {
      const suggestion = suggestions[0];
      const addressParts = suggestion.text.split(',');
      const province = addressParts[2].trim();
      if (addressParts[0].trim() !== postalCode) {
        return false;
      }
      return true;
    } else {
      // if (isPortuguesePostalCode(postalCode) == true) {
      //   return 'Portugal';
      // }
      return false;
    }
  } catch (error) {
    // throw 'errors';
    return false;
  }
};

const areNeighbouringProvinces = (originProvince, destinationProvince) => {
  // Define an object that maps each province to its neighbouring provinces
  const neighbouringProvinces = {
    Álava: ['Burgos', 'Gipuzkoa', 'La Rioja'],
    Albacete: ['Alicante', 'Ciudad Real', 'Cuenca', 'Jaén', 'Murcia'],
    Alicante: ['Albacete', 'Murcia', 'Valencia'],
    Almería: ['Granada', 'Murcia'],
    Asturias: ['Cantabria', 'León', 'Lugo', 'Ourense'],
    Ávila: [
      'Cáceres',
      'Madrid',
      'Salamanca',
      'Segovia',
      'Toledo',
      'Valladolid',
      'Zamora',
    ],
    Badajoz: ['Cáceres', 'Ciudad Real', 'Huelva', 'Sevilla'],
    Barcelona: ['Girona', 'Lleida', 'Tarragona'],
    Burgos: ['Álava', 'La Rioja', 'Palencia'],
    Cáceres: ['Ávila', 'Badajoz', 'Salamanca', 'Toledo'],
    Cádiz: ['Huelva', 'Málaga', 'Sevilla'],
    Cantabria: ['Asturias', 'Burgos', 'León', 'Palencia'],
    Castellón: ['Tarragona', 'Teruel', 'Valencia'],
    'Ciudad Real': ['Albacete', 'Badajoz', 'Cuenca', 'Jaén', 'Toledo'],
    Córdoba: ['Jaén', 'Sevilla'],
    Cuenca: [
      'Albacete',
      'Ciudad Real',
      'Guadalajara',
      'Madrid',
      'Teruel',
      'Toledo',
    ],
    Girona: ['Barcelona', 'Lleida'],
    Granada: ['Almería', 'Jaén', 'Málaga'],
    Guadalajara: ['Cuenca', 'Madrid', 'Segovia', 'Soria', 'Teruel', 'Zaragoza'],
    Guipúzcoa: ['Álava', 'Navarra'],
    Huelva: ['Badajoz', 'Cádiz', 'Sevilla'],
    Huesca: ['Lérida', 'Navarra', 'Soria', 'Zaragoza'],
    Jaén: ['Albacete', 'Ciudad Real', 'Córdoba', 'Granada', 'Sevilla'],
    León: ['Asturias', 'Cantabria', 'Palencia', 'Salamanca', 'Zamora'],

    Lleida: ['Barcelona', 'Girona', 'Huesca', 'Tarragona', 'Zaragoza'],
    'La Rioja': ['Álava', 'Burgos', 'Navarra'],
    Lugo: ['Asturias', 'Ourense', 'Pontevedra'],
    Madrid: ['Ávila', 'Cuenca', 'Guadalajara', 'Segovia', 'Toledo'],
    Málaga: ['Cádiz', 'Granada', 'Sevilla'],
    Murcia: ['Albacete', 'Alicante', 'Almería'],
    Navarra: ['Guipúzcoa', 'Huesca', 'La Rioja', 'Zaragoza'],
    Ourense: ['Asturias', 'Lugo', 'Pontevedra', 'Zamora'],
    Palencia: ['Burgos', 'Cantabria', 'León', 'Valladolid'],
    Pontevedra: ['Lugo', 'Ourense'],
    Salamanca: ['Ávila', 'Badajoz', 'Cáceres', 'León', 'Zamora'],
    'Santa Cruz de Tenerife': ['Las Palmas'],
    Segovia: ['Ávila', 'Guadalajara', 'Madrid', 'Soria', 'Valladolid'],
    Sevilla: [
      'Badajoz',
      'Cádiz',
      'Córdoba',
      'Granada',
      'Huelva',
      'Jaén',
      'Málaga',
    ],
    Soria: ['Guadalajara', 'Huesca', 'Segovia', 'Teruel', 'Zaragoza'],
    Tarragona: [
      'Barcelona',
      'Castellón',
      'Lleida',
      'Teruel',
      'Valencia',
      'Zaragoza',
    ],
    Teruel: [
      'Castellón',
      'Cuenca',
      'Guadalajara',
      'Huesca',
      'Soria',
      'Tarragona',
      'Zaragoza',
    ],
    Toledo: ['Ávila', 'Ciudad Real', 'Cuenca', 'Madrid'],
    Valencia: ['Alicante', 'Castellón'],
    Valladolid: ['Ávila', 'León', 'Palencia', 'Segovia', 'Zamora'],
    Zamora: ['Ávila', 'León', 'Ourense', 'Salamanca', 'Valladolid'],
    Zaragoza: ['Huesca', 'Lleida', 'Navarra', 'Soria', 'Tarragona', 'Teruel'],
  };

  // Check if the destination province is in the list of neighbouring provinces of the origin province
  return neighbouringProvinces[originProvince]?.includes(destinationProvince);
};

const isWithinPeninsulaAndAndorra = (
  originProvince,
  destinationProvince = null,
) => {
  const mainlandProvinces = [
    'A Coruña',
    'Álava',
    'Albacete',
    'Alicante',
    'Almería',
    'Asturias',
    'Ávila',
    'Badajoz',
    'Barcelona',
    'Burgos',
    'Cáceres',
    'Cádiz',
    'Cantabria',
    'Castellón',
    'Ciudad Real',
    'Córdoba',
    'Cuenca',
    'Girona',
    'Granada',
    'Guadalajara',
    'Gipuzkoa',
    'Huelva',
    'Huesca',
    'Jaén',
    'León',
    'Lleida',
    'La Rioja',
    'Lugo',
    'Madrid',
    'Málaga',
    'Murcia',
    'Navarra',
    'Ourense',
    'Palencia',
    'Pontevedra',
    'Salamanca',
    'Segovia',
    'Sevilla',
    'Soria',
    'Tarragona',
    'Teruel',
    'Toledo',
    'Valencia',
    'Valladolid',
    'Bizkaia',
    'Zamora',
    'Zaragoza',
    'Andorra',
  ];
  if (destinationProvince == null) {
    return mainlandProvinces.includes(originProvince);
  }
  return (
    mainlandProvinces.includes(originProvince) &&
    mainlandProvinces.includes(destinationProvince)
  );
};

const isBalearicIslandsCeutaOrMelilla = (
  originProvince,
  destinationProvince = null,
) => {
  const balearicIslands = ['Islas Baleares'];
  const ceutaAndMelilla = ['Ceuta', 'Melilla'];
  let destinationIsBalearicOrCeutaMelilla;
  const originIsBalearicOrCeutaMelilla =
    balearicIslands.includes(originProvince) ||
    ceutaAndMelilla.includes(originProvince);
  if (destinationProvince !== null) {
    destinationIsBalearicOrCeutaMelilla =
      balearicIslands.includes(destinationProvince) ||
      ceutaAndMelilla.includes(destinationProvince);
  }

  if (destinationProvince == null) {
    return originIsBalearicOrCeutaMelilla;
  }

  return originIsBalearicOrCeutaMelilla && destinationIsBalearicOrCeutaMelilla;
};

const isBalearicIslandsCeutaOrMelillaForSingle = province => {
  const balearicCeutaMelillaProvinces = ['Islas Baleares', 'Ceuta', 'Melilla'];

  return balearicCeutaMelillaProvinces.includes(province);
};

const isCanaryIslands = province => {
  const canaryIslandsProvinces = ['Las Palmas', 'Santa Cruz de Tenerife'];

  return canaryIslandsProvinces.includes(province);
};

const isValidShipmentBetweenCanaryIslandsAndMainlandAndBalearicIslandsCeutaOrMelilla =
  (originProvince, destinationProvince) => {
    if (
      isCanaryIslands(originProvince) &&
      isWithinPeninsulaAndAndorra(destinationProvince)
    ) {
      return true;
    } else if (
      isWithinPeninsulaAndAndorra(originProvince) &&
      isCanaryIslands(destinationProvince)
    ) {
      return true;
    } else if (
      isWithinPeninsulaAndAndorra(originProvince) &&
      isBalearicIslandsCeutaOrMelillaForSingle(destinationProvince)
    ) {
      return true;
    } else {
      return false;
    }
  };

const isCanaryIslandsToCanaryIslands = (
  originProvince,
  destinationProvince,
) => {
  let result =
    (originProvince === 'Santa Cruz de Tenerife' &&
      destinationProvince === 'Santa Cruz de Tenerife') ||
    (originProvince === 'Las Palmas' && destinationProvince === 'Las Palmas');

  return result;
};

export const getShippingZone = async (
  originPostalCode,
  destinationProvince,
) => {
  const originProvince = await getProvinceFromPostalCode(originPostalCode);

  if (originProvince == null && destinationProvince == null) {
    Alert.alert('Invalid buyer and seller postalcodes');
    return;
  }

  if (originProvince == null) {
    Alert.alert('Invalid seller postalcode');
    return;
  }

  if (destinationProvince == null) {
    Alert.alert('Invalid buyer postalcode');
    return;
  }
  if (destinationProvince !== 'Portugal') {
    if (
      originProvince === destinationProvince &&
      !isCanaryIslandsToCanaryIslands(originProvince, destinationProvince) &&
      !isBalearicIslandsCeutaOrMelilla(originProvince, destinationProvince)
    ) {
      return 'zoneOne';
    } else if (areNeighbouringProvinces(originProvince, destinationProvince)) {
      return 'zoneTwo';
    } else if (
      isWithinPeninsulaAndAndorra(originProvince, destinationProvince)
    ) {
      return 'zoneThree';
    } else if (
      isBalearicIslandsCeutaOrMelilla(originProvince, destinationProvince)
    ) {
      return 'zoneFour';
    } else if (
      isValidShipmentBetweenCanaryIslandsAndMainlandAndBalearicIslandsCeutaOrMelilla(
        originProvince,
        destinationProvince,
      )
    ) {
      return 'zoneFive';
    } else if (
      isCanaryIslandsToCanaryIslands(originProvince, destinationProvince)
    ) {
      return 'zoneSix';
    } else {
      return 'zoneThree';
    }
  } else {
    if (isWithinPeninsulaAndAndorra(originProvince)) {
      return 'zoneSeven';
    } else if (isBalearicIslandsCeutaOrMelilla(originProvince)) {
      return 'zoneEight';
    } else {
      return 'zoneFive';
    }
  }
};

export const getProvinceFromPostalCode = postalCode => {
  const postalCodeMappings = {
    '01': 'Álava',
    '02': 'Albacete',
    '03': 'Alicante',
    '04': 'Almería',
    '05': 'Ávila',
    '06': 'Badajoz',
    '07': 'Baleares',
    '08': 'Barcelona',
    '09': 'Burgos',
    10: 'Cáceres',
    11: 'Cádiz',
    12: 'Castellón',
    13: 'Ciudad Real',
    14: 'Córdoba',
    15: 'La Coruña',
    16: 'Cuenca',
    17: 'Gerona',
    18: 'Granada',
    19: 'Guadalajara',
    20: 'Guipúzcoa',
    21: 'Huelva',
    22: 'Huesca',
    23: 'Jaén',
    24: 'León',
    25: 'Lérida',
    26: 'La Rioja',
    27: 'Lugo',
    28: 'Madrid',
    29: 'Málaga',
    30: 'Murcia',
    31: 'Navarra',
    32: 'Orense',
    33: 'Asturias',
    34: 'Palencia',
    35: 'Las Palmas',
    36: 'Pontevedra',
    37: 'Salamanca',
    38: 'Santa Cruz de Tenerife',
    39: 'Cantabria',
    40: 'Segovia',
    41: 'Sevilla',
    42: 'Soria',
    43: 'Tarragona',
    44: 'Teruel',
    45: 'Toledo',
    46: 'Valencia',
    47: 'Valladolid',
    48: 'Vizcaya',
    49: 'Zamora',
    50: 'Zaragoza',
    51: 'Ceuta',
    52: 'Melilla',
  };

  const postalCodePrefix = postalCode.substr(0, 2);
  return postalCodeMappings[postalCodePrefix] || 'Unknown';
};
// if (
//   resumen == 'Preregistrado' ||
//   resumen == 'Entregado' ||
//   resumen === 'Admitido' ||
//   resumen === 'No admitido' ||
//   resumen === 'Alta en la unidad de reparto' ||
//   resumen === 'En tránsito' ||
//   resumen ===
//     'En proceso de entrega. El envío ya se encuentra en la localidad de destino y será entregado en breve.' ||
//   resumen === 'Envo pendiente de ser recogido en Oficina Postal' ||
//   resumen === 'Retenido en Aduana' ||
//   resumen === 'No entregado' ||
//   resumen ===
//     'Finalizada tramitación de importación - Envío entregado destinatario' ||
//   resumen === 'En trámite de importación - Emitido aviso al Destinatario'
// ) {
//   if (resumen === 'Entregado') {
//
//   }
//   if (resumen === 'Preregistrado') {
//
//   } else if (resumen === 'Admitido') {
//
//   } else if (resumen === 'Alta en la unidad de reparto') {
//
//   } else if (
//     resumen ===
//     'En proceso de entrega. El envío ya se encuentra en la localidad de destino y será entregado en breve.'
//   ) {
//
//   } else if (resumen === 'En tránsito') {
//
//   } else if (resumen === 'Envo pendiente de ser recogido en Oficina Postal') {
//
//   } else if (resumen === 'Retenido en Aduana') {
//
//   } else if (
//     resumen === 'En trámite de importación - Emitido aviso al Destinatario'
//   ) {
//
//   } else if (resumen === 'No admitido') {
//
//   } else if (resumen === 'No entregado') {
//
//   }
// } else if (
//   resumen === 'Desestacionado' ||
//   resumen === 'Reetiquetado' ||
//   resumen === 'En proceso de devolución' ||
//   resumen ===
//     'Finalizada tramitación de importación - Devuelto por no completarse la tramitación' ||
//   resumen == 'Entregado al remitente'
// ) {
//   if (resumen == 'Entregado al remitente') {
//
//   } else if (resumen === 'Desestacionado') {
//
//   } else if (resumen === 'Reetiquetado') {
//
//   } else if (resumen === 'En proceso de devolución') {
//
//   } else if (resumen === 'Entregado al remitente') {
//
//   } else if (
//     resumen ===
//     'Finalizada tramitación de importación - Devuelto por no completarse la tramitación'
//   ) {
//
//   } else if (resumen === 'En proceso de devolución') {
//
//   } else if (
//     resumen ===
//     'Finalizada tramitación de importación - Envío entregado destinatario'
//   ) {
//
//   }
// } else {
//
// }
