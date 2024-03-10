import {Alert} from 'react-native';
import persistStorage from '../redux/store/persistStore';
import {instance} from './GenericAPI';
import XMLParser from 'react-xml-parser';
import {
  GETCATEGORIES,
  SAVECATEGORIES,
  ADDSALEPRODUCT,
  ADDALBUM,
  GETCOUNTRIES,
  GETCITIESBYCOUNTRIES,
  GETALBUMBYBARCODE,
  ADDSHIPPINGDETAILS,
  CANCELSHIPMENT,
} from './_apiUrls';
import {
  calculationRequestProcess,
  checkShipmentTracking,
  pickupRequestProcess,
  ShipmentParameters,
  shipmentRequestProcess,
} from './_ZelerisAPI';

const calculateShipmentCost = async (jsonData, userReducer) => {
  return calculationRequestProcess(
    ShipmentParameters.calculateShipmentCost,
    jsonData,
    userReducer,
  )
    .then(result => {
      return result;
    })
    .catch(err => {
      return err;
    });
};

const createNewShipment = async (
  jsonData,
  userReducer,
  updateUserDetails,
  item,
) => {
  return shipmentRequestProcess(
    ShipmentParameters.newShipmentRequest,
    jsonData,
    userReducer,
  )
    .then(result => {
      return result;
    })
    .catch(err => {});
};

const addShipmentDetails = async jsonData => {
  return instance
    .put(ADDSHIPPINGDETAILS, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {
      throw error;
    });
};

const trackOrder = async (jsonData, userReducer) => {
  return checkShipmentTracking(
    ShipmentParameters.summaryInfoByShipmentTrackingNumber,
    jsonData,
    userReducer,
  )
    .then(result => {
      return result;
    })
    .catch(err => {
      return err;
    });
};

const cancelShipment = async (jsonData, userReducer) => {
  let value = persistStorage.getState().userDetails.userId;

  jsonData = {...jsonData, id: value};
  return instance
    .post(CANCELSHIPMENT, jsonData)
    .then(({data}) => {
      return data;
    })
    .catch(error => {});
};

const printParcelPDF = async (jsonData, userReducer) => {
  return checkShipmentTracking(
    ShipmentParameters.labelOfShipmentByCustomerCodeShipmentRef,
    jsonData,
    userReducer,
  )
    .then(result => {
      return result;
    })
    .catch(err => {
      return err;
    });
};

const shipmentTracking = async (jsonData, userReducer) => {
  return checkShipmentTracking(
    ShipmentParameters.summaryInfoByCustomerCodeShipmentRef,
    jsonData,
    userReducer,
  )
    .then(result => {
      // return result;
      let data = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
     <soap:Body>
     <EtiquetaNSegResponse xmlns="https://wscli.zeleris.com/"><EtiquetaNSegResult>
     <resumenexp>
       <expedicion>
         <datos_generales>
           <nseg>0E635A64066153555F</nseg>
           <origen>028</origen>
           <destino>003</destino>
           <fecha>19/05/2022</fecha>
           <expedicion>14210925</expedicion>
           <referencia>28J200203052</referencia>
           <bultos>1</bultos>
           <kilos>4</kilos>
           <kilos_vol>4</kilos_vol>
           <vol>0,015</vol>
           <servicio>3</servicio>
           <desc_servicio>ZLR DIA SIGUIENTE</desc_servicio>
           <reembolso>0,00</reembolso>
           <valor_seguro>0,00</valor_seguro>
           <num_recogida>028-4383257</num_recogida>
         </datos_generales>
         <datos_remitente>
           <nombre>ZELERIS CENTRAL</nombre>
           <direccion>C/ RONDA SUR, 1. PI LOS ALMENDROS</direccion>
           <codpos>28850</codpos>
           <poblacion>TORREJON DE ARDOZ</poblacion>
           <codcli>002801328</codcli>
           <faccli>002801328</faccli>
         </datos_remitente>
         <datos_consignatario>
           <nifdni/>
           <nombre>PLATAFORMA - ALICANTE</nombre>
           <direccion>P.I. PLA DE LA VALLONGA C/ TRUENO PAR. 140-141-142 NAVE 13-14</direccion>
           <codpos>03113</codpos>
           <poblacion>ALICANTE</poblacion>
           <codcli>000399999</codcli>
           <faccli>000399999</faccli>
         </datos_consignatario>
         <datos_contacto>
           <contacto>ENRIQUE TONDA</contacto>
           <telefon1>638032664</telefon1>
           <telefon2>965106944</telefon2>
           <observ>ETIQUETADORA GROEL</observ>
         </datos_contacto>
         <datos_envio>
           <mercan>ETIQUETADORA</mercan>
           <valor_aduana>0,00</valor_aduana>
           <cita>TODO EL DIA</cita>
           <empresarial>0</empresarial>
           <fecha_ea/>
           <fecha_asignaci>20/05/2022 09:20</fecha_asignaci>
           <g_sup>0</g_sup>
           <das>0</das>
         </datos_envio>
         <datos_situacion>
           <situacion>ENTREGADA</situacion>
           <f_finalizacion>20/05/2022 12:00</f_finalizacion>
           <f_incidencia/>
           <cod_incidencia/>
           <desc_incidencia/>
           <cod_reparto>E</cod_reparto>
           <desc_reparto>ENTREGADO</desc_reparto>
           <tipo_doc_entrega>DNI</tipo_doc_entrega>
           <num_doc_entrega/>
         </datos_situacion>
         <datos_economicos>
           <tipo_portes>P</tipo_portes>
           <tipo_reemb>P</tipo_reemb>
           <portes>4,10</portes>
           <comreemb>0,00</comreemb>
           <seguro>0,00</seguro>
         </datos_economicos>
         <datos_auxiliares>
           <aux1/>
           <aux2/>
           <aux3/>
           <aux4/>
           <aux5/>
         </datos_auxiliares>
       </expedicion>
     </resumenexp>
     </EtiquetaNSegResult></EtiquetaNSegResponse>
     </soap:Body></soap:Envelope>`;

      return new XMLParser().parseFromString(data);
    })
    .catch(err => {
      return err;
    });
};

const createNewPickup = async (jsonData, userReducer) => {
  return pickupRequestProcess(
    ShipmentParameters.newPickupRequest,
    jsonData,
    userReducer,
  )
    .then(result => {
      return result;
    })
    .catch(err => {
      return err;
    });
};

const cancelExistingPickup = async (jsonData, userReducer) => {
  return pickupRequestProcess(
    ShipmentParameters.cancelPickupByTrackingNumberForPickup,
    jsonData,
    userReducer,
  )
    .then(result => {
      return result;
    })
    .catch(err => {
      return err;
    });
};

export {
  calculateShipmentCost,
  createNewShipment,
  trackOrder,
  cancelShipment,
  printParcelPDF,
  createNewPickup,
  cancelExistingPickup,
  addShipmentDetails,
  shipmentTracking,
};
