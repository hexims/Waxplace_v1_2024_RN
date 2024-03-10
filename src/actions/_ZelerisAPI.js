import {Alert} from 'react-native';
import axios from 'axios';
import {toXML} from 'jstoxml';
import {decode} from 'html-entities';
import XMLParser from 'react-xml-parser';
import {removeEmptyFromJSON} from './HelperFunctions';

const SHIPMENTURL = 'https://wscli.zeleris.com';
const PICKUPAPICALL = '/RCOPeticion.asmx';
const SHIPMENTAPICALL = '/EXPPeticion.asmx';
const TRACKINGAPICALL = '/EXPDatos.asmx';
const CHECKINGAPICALL = '/RCODatos.asmx';
const CALCULATIONAPICALL = '/EComPortal.asmx';

const ShipmentParameters = {
  //PICKUP REQUESTS
  newPickupRequest: 'SolicitarRecogida',
  postCodeInfo: 'InfoCodigoPostal',
  includeReferenceByDelegationForPickup: 'IncluirReferenciaRCO',
  includeReferenceByTrackingNumberForPickup: 'IncluirReferenciaNSeg',
  includeNewDestinationByDelegationForPickup: 'IncluirDestinoRCO',
  includeNewDestinationByTrackingNumberForPickup: 'IncluirDestinoNSeg',
  cancelPickupByDelegationForPickup: 'AnularRCO',
  cancelPickupByTrackingNumberForPickup: 'AnularNSeg',
  cancelDestinationByDelegationForPickup: 'AnularDestinoRCO',
  cancelDestinationByTrackingNumberForPickup: 'AnularDestinoNSeg',
  //SHIPMENT REQUESTS
  newShipmentRequest: 'DocumentarExpedicionADV',
  includeNewPackageForExistingShipment: 'DocumentarBultoNSeg',
  includeNewPackageForExistingShipmentExpedition: 'DocumentarBultoEXP',
  cancelShipment: 'AnularNSeg',
  cancelShipmentExpedition: 'AnularEXP',
  //SHIPMENT AND PICKUP TRACKING REQUESTS
  summaryInfoByCustomerCodeShipmentRef: 'ResumenRef',
  summaryInfoByShipmentTrackingNumber: 'ResumenNSeg',
  summaryInfoEXPByDelegationAndExpedionCode: 'ResumenEXP',
  proformaInvoicesByCustomerCodeShipmentRef: 'ProformaRef',
  proformaInvoicesByShipmentTrackingNumber: 'ProformaNSeg',
  proformaInvoicesEXPByDelegationAndExpedionCode: 'ProformaEXP',
  proformaInvoicesByCustomerCodeShipmentRefToEmail: 'ProformaEMailRef',
  proformaInvoicesByShipmentTrackingNumberToEmail: 'ProformaEMailNSeg',
  proformaInvoicesEXPByDelegationAndExpedionCodeToEmail: 'ProformaEMailEXP',
  summaryInfoByCustomerCodeShipmentRefSecond: 'PODRef',
  ElectronciProofByShipmentTrackingNumber: 'PODNSeg',
  summaryInfoEXPByDelegationAndExpedionCodeSecond: 'PODEXP',
  validatePostalCode: 'InfoCodigoPostal',
  historyOfShipmentByCustomerCodeShipmentRef: 'HistorialRef',
  historyOfShipmentByShipmentTrackingNumber: 'HistorialNSeg',
  historyOfEXPByDelegationAndExpedionCode: 'HistorialEXP',
  labelOfShipmentByCustomerCodeShipmentRef: 'EtiquetaRef',
  labelOfShipmentByCustomerCodeShipmentRef: 'EtiquetaNSeg',
  labelOfEXPByDelegationAndExpedionCode: 'EtiquetaEXP',
  calculateShipmentCost: 'Valora',
};

const instance = axios.create({
  baseURL: SHIPMENTURL,
  timeout: 10000,
});

const shipmentApiRequest = async (requestApi, rawData, heading) => {
  let requestParams = '';
  if (heading == 'Valora') {
    requestParams = rawData;
  } else {
    requestParams = convertXml(rawData);
  }

  let xmlData = `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <${heading} xmlns="https://wscli.zeleris.com/">
      ${requestParams.data.replace(' ', '')}
      </${heading}>
      </soap12:Body>
    </soap12:Envelope>`;
  
  return instance
    .post(requestApi, xmlData, {
      headers: {
        'Content-Type': 'application/soap+xml;charset=utf-8',
        //  'Content-Length': requestParams.length,
      },
    })
    .then(({data}) => {
      //
      return decode(data);
    })
    .catch(error => {
      Alert.alert('', 'Something went wrong');
      
     throw error;
    });
};

const convertXml = jsonData => {
  let result = [];
  let keys = Object.keys(jsonData);
  keys.forEach(function (key) {
    if (key !== 'appendData') {
      result.push({[key]: jsonData[key]});
    }
  });

  let length = result.length;
  let data = toXML(result);

  if (jsonData?.appendData && jsonData?.appendData.length > 0) {
    jsonData?.appendData.forEach(element => {
      data = data.concat(element);
    });
  }

  return {length, data};
};

const pickupRequest = async (jsonData, heading) => {
  return shipmentApiRequest(PICKUPAPICALL, jsonData, heading);
};

const shipmentRequest = async (jsonData, heading) => {
  return shipmentApiRequest(SHIPMENTAPICALL, jsonData, heading);
};

const trackingRequest = async (jsonData, heading) => {
  return shipmentApiRequest(TRACKINGAPICALL, jsonData, heading);
};

const checkRequest = async (jsonData, heading) => {
  return shipmentApiRequest(CHECKINGAPICALL, jsonData, heading);
};

const calculationRequest = async (jsonData, heading) => {
  return shipmentApiRequest(CALCULATIONAPICALL, jsonData, heading);
};

// <!=================================== MAIN FUNCTIONALITY ====================================!>

const calculationRequestProcess = async (heading, jsonData, userReducer) => {
  let rawData = {
    data: `<docIn><![CDATA[<Body><InfoCuenta>
 ${
   convertXml(
     removeEmptyFromJSON({
       Usuario: userReducer.shipmentDetails.usuario,
       Clave: userReducer.shipmentDetails.clave,
       CodRemitente: userReducer.shipmentDetails.codigo_rte,
       CpOri: jsonData.CpOri,
     }),
   ).data
 }
</InfoCuenta>
<DatosDestino>
${
  convertXml(
    removeEmptyFromJSON({
      Pais: jsonData.Pais,
      Codpos: jsonData.Codpos,
    }),
  ).data
}
</DatosDestino>
<DatosServicio>
${
  convertXml(
    removeEmptyFromJSON({
      Bultos: jsonData.Bultos,
      Kilos: jsonData.Kilos,
      Volumen: jsonData.Volumen,
      Servicio: jsonData.Servicio,
      Reembolso: jsonData.Reembolso,
      ValorSeguro: jsonData.ValorSeguro,
    }),
  ).data
}
</DatosServicio>
</Body>]]>
</docIn>`,
  };

  return calculationRequest(rawData, heading)
    .then(result => {
    
      return new XMLParser().parseFromString(result);
    })
    .catch(err => {
      
      return err;
    });
};

// CREATE SHIPMENT REQUEST FUNCTION
const shipmentRequestProcess = async (heading, jsonData, userReducer) => {
  let rawData = '';
  
  if (heading == 'DocumentarExpedicionADV') {
    rawData = {
      usuario: userReducer.shipmentDetails.usuario,
      clave: userReducer.shipmentDetails.clave,
      docIn: `<![CDATA[<Body><DatosRemitente>
 ${
   convertXml(
     removeEmptyFromJSON({
       CodRemitente: jsonData.DatosRemitente.CodRemitente,
       NifRemi: jsonData.DatosRemitente.NifRemi,
       Nombre: jsonData.DatosRemitente.Nombre,
       Direccion: jsonData.DatosRemitente.Direccion,
       Codpos: jsonData.DatosRemitente.Codpos,
       Poblacion: jsonData.DatosRemitente.Poblacion,
       Contacto: jsonData.DatosRemitente.Contacto,
       Telefono: jsonData.DatosRemitente.Telefono,
     }),
   ).data
 }
</DatosRemitente>
<DatosDestinatario>
${
  convertXml(
    removeEmptyFromJSON({
      NifCons: jsonData.DatosDestinatario.NifCons,
      Nombre: jsonData.DatosDestinatario.Nombre,
      Direccion: jsonData.DatosDestinatario.Direccion,
      Pais: jsonData.DatosDestinatario.Pais,
      Codpos: jsonData.DatosDestinatario.Codpos,
      Poblacion: jsonData.DatosDestinatario.Poblacion,
      Contacto: jsonData.DatosDestinatario.Contacto,
      Telefono1: jsonData.DatosDestinatario.Telefono1,
      Telefono2: jsonData.DatosDestinatario.Telefono2,
      Email: jsonData.DatosDestinatario.Email,
      CodPunto: jsonData.DatosDestinatario.CodPunto,
    }),
  ).data
}
</DatosDestinatario>
<DatosServicio>
${
  convertXml(
    removeEmptyFromJSON({
      CodFac: jsonData.DatosServicio.CodFac,
      Referencia: jsonData.DatosServicio.Referencia,
      Bultos: jsonData.DatosServicio.Bultos,
      Kilos: jsonData.DatosServicio.Kilos,
      Volumen: jsonData.DatosServicio.Volumen,
      Servicio: jsonData.DatosServicio.Servicio,
      Reembolso: jsonData.DatosServicio.Reembolso,
      ValorSeguro: jsonData.DatosServicio.ValorSeguro,
      ValorAduana: jsonData.DatosServicio.ValorAduana,
      Mercancia: jsonData.DatosServicio.Mercancia,
      TipoGastosAduana: jsonData.DatosServicio.TipoGastosAduana,
      TipoAvisoEntrega: jsonData.DatosServicio.TipoAvisoEntrega,
      TipoPortes: jsonData.DatosServicio.TipoPortes,
      TipoReembolso: jsonData.DatosServicio.TipoReembolso,
      DAS: jsonData.DatosServicio.DAS,
      GS: jsonData.DatosServicio.GS,
      Identicket: jsonData.DatosServicio.Identicket,
      FechaEA: jsonData.DatosServicio.FechaEA,
      Observaciones: jsonData.DatosServicio.Observaciones,
      TramoE: jsonData.DatosServicio.TramoE,
    }),
  ).data
}
</DatosServicio>
</Body>]]>`,
    };
  } else {
    rawData = {
      ...userReducer.shipmentDetails,
      ...removeEmptyFromJSON(jsonData),
    };
  }

  return shipmentRequest(rawData, heading)
    .then(result => {
     
      return new XMLParser().parseFromString(result);
    })
    .catch(err => {
      
      return err;
    });
};

// SHIPMENT REQUEST TRACKING

const checkShipmentTracking = async (heading, jsonData, userReducer) => {
  // let data = removeEmptyFromJSON(jsonData);

  // return trackingRequest(
  //   {
  //     usuario: userReducer.shipmentDetails.usuario,
  //     clave: userReducer.shipmentDetails.clave,
  //     ...data,
  //   },
  //   heading,
  // )
  //   .then(result => {

  //     return new XMLParser().parseFromString(result);
  //   })
  //   .catch(err => {
  //     
  //     return err;
  //   });
};

// CHECK REQUEST MISC DATAS

const checkRequestData = async (heading, jsonData, userReducer) => {
  let data = removeEmptyFromJSON(jsonData);

  return checkRequest(
    {
      ...userReducer.shipmentDetails,
      ...data,
    },
    heading,
  )
    .then(result => {
    
      return new XMLParser().parseFromString(result);
    })
    .catch(err => {
      
      return err;
    });
};

const pickupRequestProcess = async (heading, jsonData, userReducer) => {
  let data = removeEmptyFromJSON(jsonData);

  return pickupRequest(
    {
      ...userReducer.shipmentDetails,
      ...data,
    },
    heading,
  )
    .then(result => {
  

      return new XMLParser().parseFromString(result);
    })
    .catch(err => {
      
      return err;
    });
};

export {
  convertXml,
  ShipmentParameters,
  pickupRequest,
  shipmentRequest,
  trackingRequest,
  checkRequest,
  shipmentRequestProcess,
  checkShipmentTracking,
  checkRequestData,
  pickupRequestProcess,
  calculationRequestProcess,
};
