import {Alert} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';
import {
  CANCELPREREGISTRATION,
  CREATECORREOSPREREGISTRATION,
  GETCORREOSLABEL,
  CREATECORREOSPICKUPREQUEST,
  CANCELCORREOSPICKUPREQUEST,
  CHECKNEARBYPOSTALCENTERS,
  CHECKDELIVERYPOSTALCODES,
  GETCURRENTCORREOSSHIPMENTSTATUS,
  ELECTRONICPROOFOFDELIVERY,
  GETZONEBASEDPRICE,
} from './_apiUrls';
import XMLParser from 'react-xml-parser';

const getZoneBasedPrice = async zoneInfo => {
  return instance
    .get(GETZONEBASEDPRICE + `?data=${zoneInfo}`)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const createCorreosPreRegistration = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  // let jsonData = {
  //   'soapenv:Envelope': {
  //     _attributes: {
  //       'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
  //       'xmlns:prer':
  //         'http://www.correos.es/iris6/services/preregistroetiquetas',
  //     },
  //     'soapenv:Header': {},
  //     'soapenv:Body': {
  //       'prer:PreregistroEnvio': {
  //         'prer:FechaOperacion': '23-01-2023 10:54:12',
  //         'prer:CodEtiquetador': '8DTG',
  //         'prer:NumContrato': '54055316',
  //         'prer:NumCliente': '81357204',
  //         'prer:Care': {},
  //         'prer:TotalBultos': '1',
  //         'prer:ModDevEtiqueta': '1',
  //         'prer:Remitente': {
  //           'prer:Identificacion': {
  //             'prer:Nombre': 'Paval',
  //             'prer:Apellido1': 'EP',
  //             'prer:Empresa': 'Infinity Records',
  //             'prer:PersonaContacto': 'Paval EP',
  //           },
  //           'prer:DatosDireccion': {
  //             'prer:Direccion': 'Calle del Gral Oraá 35, esc A, 2º, 4A',
  //             'prer:Numero': '22',
  //             'prer:Portal': '4A',
  //             'prer:Bloque': '35',
  //             'prer:Escalera': '2',
  //             'prer:Piso': '3',
  //             'prer:Puerta': '2234',
  //             'prer:Localidad': 'Madrid',
  //             'prer:Provincia': 'Madrid',
  //           },
  //           'prer:CP': '28017',
  //           'prer:Telefonocontacto': '666777888',
  //           'prer:Email': 'paval.appdev@gmail.com',
  //           'prer:DatosSMS': {
  //             'prer:NumeroSMS': '666777888',
  //             'prer:Idioma': '1',
  //           },
  //         },
  //         'prer:Destinatario': {
  //           'prer:Identificacion': {
  //             'prer:Nombre': 'Subham',
  //             'prer:Apellido1': 'Kumar',
  //             'prer:Apellido2': 'Dash',
  //             'prer:Empresa': 'Subham store',
  //             'prer:PersonaContacto': 'Subham Dash',
  //           },
  //           'prer:DatosDireccion': {
  //             'prer:Direccion': 'Carrer Balmes 155, 3º, 1ª',
  //             'prer:Numero': '155',
  //             'prer:Portal': '1',
  //             'prer:Bloque': '3',
  //             'prer:Escalera': '1',
  //             'prer:Piso': '',
  //             'prer:Puerta': '',
  //             'prer:Localidad': 'Barcelona',
  //             'prer:Provincia': 'Barcelona',
  //           },
  //           'prer:CP': '08001',
  //           'prer:Telefonocontacto': '666777888',
  //           'prer:Email': 'subham.dash@gmail.com',
  //           'prer:DatosSMS': {
  //             'prer:NumeroSMS': '666777888',
  //             'prer:Idioma': '1',
  //           },
  //         },
  //         'prer:Envio': {
  //           'prer:NumBulto': '1',
  //           'prer:CodProducto': 'S0132',
  //           'prer:ReferenciaCliente': '123-uuid-123',
  //           'prer:TipoFranqueo': 'FP',
  //           'prer:Pesos': {
  //             'prer:Peso': {
  //               'prer:TipoPeso': 'R',
  //               'prer:Valor': '300',
  //             },
  //           },
  //           'prer:ModalidadEntrega': 'ST',
  //           'prer:ValoresAnadidos': {
  //             'prer:PruebaEntrega': {
  //               'prer:Formato': '3',
  //               'prer:ReferenciaeAR': 'WAXPLACE',
  //             },
  //             'prer:IndImprimirEtiqueta': '1',
  //             'prer:IntentosDeEntrega': '2',
  //             // 'prer:EntregaSinFirmar': 'S', //for pAQ or international shipment
  //           },
  //           'prer:Observaciones1': 'ITS A TEST',
  //           'prer:InstruccionesDevolucion': 'D',
  //           'prer:Aduana': {
  //             'prer:TipoEnvio': '6',
  //             'prer:EnvioComercial': 'N',
  //             'prer:Factura': 'S',
  //           },
  //           'prer:PermiteEmbalaje': 'S',
  //         },
  //       },
  //     },
  //   },
  // };

  return instance
    .post(CREATECORREOSPREREGISTRATION, jsonData)
    .then(({data}) => {
      let returnData = {status: 'failed'};
      if (
        JSON.parse(data)['soapenv:Envelope']['soapenv:Body']
          ?.RespuestaPreregistroEnvio?.Bulto?.CodEnvio?._text
      ) {
        returnData = {
          status: 'success',
          codEnvio:
            JSON.parse(data)['soapenv:Envelope']['soapenv:Body']
              ?.RespuestaPreregistroEnvio?.Bulto?.CodEnvio?._text,
        };
      }

      return returnData;
    })
    .catch(error => {
      throw error;
    });
};

const cancelCorreosPreRegistration = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {
    'soapenv:Envelope': {
      _attributes: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:prer':
          'http://www.correos.es/iris6/services/preregistroetiquetas',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'prer:PeticionAnular': {
          'prer:Oid': '81357204',
          'prer:Eid': '54055316',
          'prer:codCertificado': 'PQ8DTG0710000390108001L',
        },
      },
    },
  };
  return instance
    .post(CANCELPREREGISTRATION, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const getCorreosLabel = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  // let jsonData = {
  //   'soapenv:Envelope': {
  //     _attributes: {
  //       'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
  //       'xmlns:prer':
  //         'http://www.correos.es/iris6/services/preregistroetiquetas',
  //     },
  //     'soapenv:Header': {},
  //     'soapenv:Body': {
  //       'prer:SolicitudEtiqueta': {
  //         'prer:FechaOperacion': '23-01-2023 10:54:12',
  //         'prer:CodEtiquetador': '8DTG',
  //         'prer:NumContrato': '54055316',
  //         'prer:NumCliente': '81357204',
  //         'prer:CodEnvio': 'PQ8DTG0710000390108001L',
  //         'prer:Care': {},
  //         'prer:ModDevEtiqueta': '2',
  //       },
  //     },
  //   },
  // };
  return instance
    .post(GETCORREOSLABEL, jsonData)
    .then(({data}) => {
      return data
      // let returnData = {status: 'failed'};
      // if (
      //   data['soapenv:Envelope']['soapenv:Body']?.RespuestaSolicitudEtiqueta
      //     ?.Bulto?.Etiqueta?.Etiqueta_pdf?.Fichero
      // ) {
      //   returnData = {
      //     status: 'success',
      //     pdf: data['soapenv:Envelope']['soapenv:Body']
      //       ?.RespuestaSolicitudEtiqueta?.Bulto?.Etiqueta?.Etiqueta_pdf?.Fichero
      //       ?._text,
      //   };
      // }

      // return returnData;
    })
    .catch(error => {
      throw error;
    });
};

const getCorreosCustomsDocument = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  // let jsonData = {
  //   'soapenv:Envelope': {
  //     _attributes: {
  //       'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
  //       'xmlns:prer':
  //         'http://www.correos.es/iris6/services/preregistroetiquetas',
  //     },
  //     'soapenv:Header': {},
  //     'soapenv:Body': {
  //       'prer:SolicitudEtiqueta': {
  //         'prer:FechaOperacion': '23-01-2023 10:54:12',
  //         'prer:CodEtiquetador': '8DTG',
  //         'prer:NumContrato': '54055316',
  //         'prer:NumCliente': '81357204',
  //         'prer:CodEnvio': 'PQ8DTG0710000390108001L',
  //         'prer:Care': {},
  //         'prer:ModDevEtiqueta': '2',
  //       },
  //     },
  //   },
  // };
  return instance
    .post(GETCORREOSLABEL, jsonData)
    .then(({data}) => {
      let returnData = {status: 'failed'};

      if (
        data['soapenv:Envelope']['soapenv:Body']
          ?.RespuestaSolicitudDocumentacionAduanera?.Fichero ||
        data['soapenv:Envelope']['soapenv:Body']
          ?.RespuestaSolicitudDocumentacionAduaneraCN23CP71?.Fichero
      ) {
        returnData = {
          status: 'success',
          pdf: data['soapenv:Envelope']['soapenv:Body']
            ?.RespuestaSolicitudDocumentacionAduanera
            ? data['soapenv:Envelope']['soapenv:Body']
                ?.RespuestaSolicitudDocumentacionAduanera?.Fichero?._text
            : data['soapenv:Envelope']['soapenv:Body']
                ?.RespuestaSolicitudDocumentacionAduaneraCN23CP71?.Fichero
                ?._text,
        };
      }

      return returnData;
    })
    .catch(error => {
      throw error;
    });
};

const createCorreosPickupRequest = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {
    'soapenv:Envelope': {
      _attributes: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:ser': 'http://www.correos.es/ServicioPuertaAPuertaBackOffice',
        'xmlns:ser1': 'http://www.correos.es/ServicioPuertaAPuerta',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'ser:SolicitudRegistroRecogida': {
          ReferenciaRelacionPaP: 'uuid',
          TipoOperacion: 'ALTA',
          FechaOperacion: '10-02-2023 11:38:50',
          NumContrato: '54055316',
          NumDetallable: '81357204',
          CodUsuario: 'contact@waxplace.co',
          'ser1:Recogida': {
            ReferenciaRecogida: 'uuid',
            FecRecogida: '10/02/2023',
            HoraRecogida: '11:38',
            CodAnexo: '091',
            NomNombreViaRec: 'StreetName',
            NomLocalidadRec: 'City',
            CodigoPostalRecogida: '08002',
            DesPersonaContactoRec: 'Paval',
            DesTelefContactoRec: '666777888',
            DesEmailContactoRec: 'pavalep@gmail.com',
            DesObservacionRec: 'Vinyl Records,Handle Carefully',
            NumEnvios: '1',
            NumPeso: '300',
            TipoPesoVol: '30',
            IndImprimirEtiquetas: 'N',
            IndDevolverCodSolicitud: 'S',
          },
        },
      },
    },
  };

  return instance
    .post(CREATECORREOSPICKUPREQUEST, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const cancelCorreosPickupRequest = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {
    'soapenv:Envelope': {
      _attributes: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:ser': 'http://www.correos.es/ServicioPuertaAPuertaBackOffice',
        'xmlns:ser1': 'http://www.correos.es/ServicioPuertaAPuerta',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'ser:AnulacionRecogidaPaPRequest': {
          FechaOperacion: '10-02-2023 11:38:50',
          NumContrato: '54055316',
          NumDetallable: '81357204',
          CodUsuario: 'contact@waxplace.co',
          CodSolicitud: 'SR2023011775132EH',
          ReferenciaRecogida: 'uuid',
        },
      },
    },
  };
  return instance
    .post(CANCELCORREOSPICKUPREQUEST, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const checkNearbyPostalCenters = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {
    'soapenv:Envelope': {
      _attributes: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:ejb': 'http://ejb.mauo.correos.es',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'ejb:homePaqOficinaConsultaCP': {
          'ejb:codigoPostal': '28050',
          'ejb:incluirAdyacentes': 'N',
        },
      },
    },
  };
  return instance
    .post(CHECKNEARBYPOSTALCENTERS, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};
const checkDeliveryPostalCodes = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {
    'soapenv:Envelope': {
      _attributes: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:ejb': 'http://ejb.mauo.correos.es',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'ejb:homePaqConsultaCP1': {
          'ejb:codigoPostal': '28010',
        },
      },
    },
  };

  return instance
    .post(CHECKDELIVERYPOSTALCODES, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const checkNearbyPostalCodes = async postalCode => {
  let value = persistStorage.getState().userDetails.userId;

  let jsonData = {
    'soapenv:Envelope': {
      _attributes: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:ejb': 'http://ejb.mauo.correos.es',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'ejb:homePaqOficinaConsultaCP': {
          'ejb:codigoPostal': postalCode.toString(),
          'ejb:incluirAdyacentes': 'S',
        },
      },
    },
  };

  console.log(jsonData)

  return instance
    .post(CHECKDELIVERYPOSTALCODES, jsonData)
    .then(({data}) => {
      if (data.status == 'success') {
        let value = JSON.parse(data.result)['soapenv:Envelope']['soapenv:Body']
          .homePaqOficinaRespuesta.listaHomePaqOficina.homePaqOficina;

        let extractedData = value.map(item => ({
          address: item?.direccion?._text,
          city: item?.descLocalidad?._text,
          unit: item?.desUnidad?._text,
          timing: item?.desHorario?._text,
          mobileNumber: item?.telefonoOficina?._text,
          postalCode: item?.CP?._text,
          coordinate: {
            latitude: item?.latitudWGS84?._text,
            longitude: item?.longitudWGS84?._text,
          },
        }));

        let filteredData = extractedData.filter(
          item => item.postalCode == postalCode.toString(),
        );

        if (filteredData.length > 0) {
          return filteredData;
        } else {
          return extractedData;
        }
      } else {
        return [];
      }
    })
    .catch(error => {
      return [];
    });
};

const getCurrentShipmentStatus = async codEnvio => {
  let value = persistStorage.getState().userDetails.userId;

  return instance
    .get(GETCURRENTCORREOSSHIPMENTSTATUS + codEnvio)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const electronicProofOfDelivery = async jsonData => {
  let value = persistStorage.getState().userDetails.userId;
  jsonData = {
    ...jsonData,
    ReferenciaRelacionPaP: value,
    ReferenciaRecogida: value,
  };
  return instance
    .post(ELECTRONICPROOFOFDELIVERY, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

function calculateShippingCost(
  weight,
  originPostalCode,
  destinationPostalCode,
  shippingMethod,
) {
  const distance = getDistance(originPostalCode, destinationPostalCode);
  const distanceCost = distance * 0.05;
  const baseRate = getBaseRate(weight);
  const originZone = getZone(originPostalCode);
  const destinationZone = getZone(destinationPostalCode);
  let additionalCost = 0;

  if (originZone !== destinationZone) {
    additionalCost += Math.min(Math.abs(originZone - destinationZone), 5);
  }

  additionalCost += shippingMethod === 'express' ? 2 : 0;

  if (originZone >= 3 && originZone <= 9) {
    if (destinationZone >= 3 && destinationZone <= 9) {
      additionalCost += getIslandRate(originZone, destinationZone);
    } else {
      additionalCost += getIslandRate(originZone, 0);
    }
  }

  return baseRate + additionalCost + distanceCost;
}

function getBaseRate(weight) {
  const zone = getZone(destinationPostalCode);
  const baseRates = [
    {weight: 1000, zones: [1], rate: 4.85},
    {weight: 2000, zones: [1], rate: 5.2},
    {weight: 3000, zones: [1, 2], rate: 5.85},
    {weight: 4000, zones: [1, 2], rate: 6.45},
    {weight: 5000, zones: [1, 2, 3], rate: 7.0},
    {weight: 6000, zones: [1, 2, 3], rate: 7.75},
    {weight: 7000, zones: [1, 2, 3, 4], rate: 8.25},
    {weight: 8000, zones: [1, 2, 3, 4], rate: 8.9},
    {weight: 9000, zones: [1, 2, 3, 4, 5], rate: 9.35},
    {weight: 10000, zones: [1, 2, 3, 4, 5], rate: 10.1},
    {weight: 15000, zones: [1, 2, 3, 4, 5, 6, 7], rate: 13.8},
    {weight: 20000, zones: [1, 2, 3, 4, 5, 6, 7], rate: 17.7},
  ];

  const matchedRate = baseRates.find(
    rate => rate.weight >= weight && rate.zones.includes(zone),
  );
  if (matchedRate) {
    return matchedRate.rate;
  } else {
    throw new Error(`No base rate found for weight ${weight}g to zone ${zone}`);
  }
}

function getZone(postalCode) {
  const zoneRules = [
    {zone: 1, regex: /^(01|02|03|04|05|06|07|08|09|39)/}, // Mainland Spain
    {
      zone: 2,
      regex:
        /^(10|12|19|22|23|26|27|28|29|30|31|32|33|34|36|37|38|40|41|42|43|44|45|46|47|48|49|50|51|52|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99)/,
    }, // Rest of Spain
    {zone: 3, regex: /^(07|35)/}, // Balearic Islands
    {zone: 4, regex: /^(35)/}, // Canary Islands
    {zone: 5, regex: /^(38)/}, // Canary Islands (La Gomera, El Hierro, La Palma)
    {zone: 6, regex: /^(35)/}, // Canary Islands (Tenerife)
    {zone: 7, regex: /^(35)/}, // Canary Islands (Gran Canaria, Fuerteventura, Lanzarote)
  ];
  const rule = zoneRules.find(({regex}) => regex.test(postalCode));
  return rule ? rule.zone : null;
}

async function getDistance(originPostalCode, destinationPostalCode) {
  const originAddress = await getAddressFromPostalCode(originPostalCode);
  const destinationAddress = await getAddressFromPostalCode(
    destinationPostalCode,
  );
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originAddress}&destinations=${destinationAddress}&key=${YOUR_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const distance = data.rows[0].elements[0].distance.value / 1000; // distance in km
  return distance;
}

async function getAddressFromPostalCode(postalCode) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${postalCode}|country:ES&key=${YOUR_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const address = data.results[0].formatted_address;
  return address;
}

function getIslandRate(destinationIsland, zone) {
  const rates = {
    1: {Mallorca: 1.5, Menorca: 1.5, Ibiza: 1.5, Formentera: 1.5},
    2: {Tenerife: 2, 'Gran Canaria': 2, Fuerteventura: 2, Lanzarote: 2},
    3: {'La Palma': 2.5, 'La Gomera': 2.5, 'El Hierro': 2.5},
  };

  return rates[zone][destinationIsland] || 1;
}

export {
  createCorreosPreRegistration,
  cancelCorreosPreRegistration,
  getCorreosLabel,
  getCorreosCustomsDocument,
  createCorreosPickupRequest,
  cancelCorreosPickupRequest,
  checkNearbyPostalCenters,
  checkDeliveryPostalCodes,
  checkNearbyPostalCodes,
  getCurrentShipmentStatus,
  electronicProofOfDelivery,
  getZoneBasedPrice,
};
