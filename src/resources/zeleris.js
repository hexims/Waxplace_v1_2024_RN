import React, {useEffect, useRef, useState, useCallback} from 'react';
import * as HomeNavigation from '../router/_HomeNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  Dimensions,
  FlatList,
  NativeModules,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  PermissionsAndroid,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

import persistStorage from '../redux/store/persistStore';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ShipmentParameters,
  pickupRequest,
  shipmentRequest,
  trackingRequest,
  convertXml,
} from '../actions/_ZelerisAPI';
import {removeEmptyFromJSON} from '../actions/HelperFunctions';

const PickupScreen = ({props, route, userReducer, updateUserDetails}) => {
  //CREATE PICKUP REQUEST VALUES
  const [createPickup, setCreatePickup] = useState({
    usuario: '', //User (provided) mandatory
    clave: '', //string 10 Password (provided) mandatory
    nombre: '', //string 40 Pickup Contact Name mandatory
    direccion: '', //string 40 Pickup Address mandatory
    poblacion: '', //string 40 Pickup City mandatory
    codpos: '', //string 7 Pickup Zip/Postal Code mandatory
    f_recogida: '', //string 10 Pickup Date format dd/MM/yyyy mandatory
    referencia: '', //string 20 Pickup Order Number / Id
    contacto: '', //string 40 Pickup Contact Person
    telefon1: '', //string 15 Pickup Phone Number
    email: '', //string 60 Email Address for Pickup Notification
    horario: '', //string 16 General Pickup Schedule
    horario_desde1: '', //string 5 First Pickup Time Interval: From (format hh:mm)
    horario_hasta1: '', //string 5 First Pickup Time Interval: To (format hh:mm)
    horario_desde2: '', //string 5 Second Pickup Time Interval: From (format hh:mm)
    horario_hasta2: '', //string 5 Second Pickup Time Interval: To (format hh:mm)
    observ: '', //string 120 Pickup Additional Information
    codpr: '', //string 15 Pickup Point Code
    solicitante: '', //string 40 Pickup Requester Name
    das: '', //string 1 Return Signed Delivery Note for shipments,included on pickup 2
    tipo_aviso: '', //string 1 Pickup's Notification Type 0 = No, 1 = SMS, 2 = EMAIL3
    empresarial: '', //string 1 Unused Field 2
    varios_dest: '', //string 1 Unused Field 2
    merc_vol: '', //string 1 Unused Field 2
    nec_camion: '', //string 1 Unused Field 2
    nec_trampilla: '', //string 1 Unused Field 2
    calle_peatonal: '', //string 1 Unused Field 2
    lim_horario: '', //string 1 Unused Field 2
    centro_com: '', //string 1 Unused Field 2
  });

  const settingCreatePickup = data => {
    setCreatePickup(prevState => ({...prevState, ...data}));
  };

  // ADD REFERENCE BY DELEGATION REQUEST VALUES
  const [includeReferenceByDelegation, setIncludeReferenceByDelegation] =
    useState({
      delegacion: '', //string 3 Zeleris Origin Code for Pickup X
      num_recogida: 0, //long 8 Pickup Number X
      referencia: '', //string 20 Additional Order Number/Id or Reference X
      bultos: '', //string 3 Package number. Numeric Format
      kilos: '', //string 7 Package weight. Format ###0,00
      servicio: '', //string 2 Unused Field
    });

  const settingIncludeReferenceByDelegation = data => {
    setIncludeReferenceByDelegation(prevState => ({...prevState, ...data}));
  };

  // ADD REFERENCE BY TRACKING NO REQUEST VALUES
  const [
    includeReferenceByTrackingNumber,
    setIncludeReferenceByTrackingNumber,
  ] = useState({
    nseg: '', //string 18 Zeleris Pickup Tracking number X
    referencia: '', //string 20 Additional Order Number/Id or Reference X
    bultos: '', //string 3 Package number. Numeric Format
    kilos: '', //string 7 Package weight. Format ###0,00
    servicio: '', //string 2 Unused Field
  });

  const settingIncludeReferenceByTrackingNumber = data => {
    setIncludeReferenceByTrackingNumber(prevState => ({...prevState, ...data}));
  };

  //  ADD DESTINATION BY DELEGATION REQUEST VALUES
  const [
    includeNewDestinationByDelegation,
    setIncludeNewDestinationByDelegation,
  ] = useState({
    delegacion: '', //string 3 Zeleris Origin Code for Pickup X
    num_recogida: 0, //long 8 Pickup Number X
    nifdni: '', //string 20 Recipient Identity Card (N.I.F. / D.N.I.)
    nombre: '', //string 40 Recipient Name X
    direccion: '', //string 80 Recipient Address X
    poblacion: '', //string 40 Recipient City X
    pais: '', //string 2 Recipient ISO County Code 4
    codpos: '', //string 7 Recipient Zip / Postal Code X
    contacto: '', //string 40 Recipient Contact Name
    telefon1: '', //string 15 Recipient Phone Number 1
    telefon2: '', //string 15 Recipient Phone Number 2
    email: '', //string 60 Email Address for Delivery Notification.
    observ: '', //string 40 Delivery Additional Information
    referencia: '', //string 20 Order Number / Id
    bultos: '', //string 3 Total Packages. Numeric Format X
    kilos: '', //string 6 Total Weight 5 X
    vol: '', //string 6 Dimensions in m3(h x w x l). Numeric format.Used comma as decimal point
    tipo_portes: '', //string 1 Shipping Charge - P = Sender, D = Recipient
    tipo_reemb: '', //string 1 C.O.D Charge - P = Sender, D = Recipient
    servicio: '', //string 2 Courier Service Code X
    reembolso: '', //string 13 Cash On Delivery Amount. Numeric format.Used comma as decimal pointX
    valor_seguro: '', //string 13 Insurance Value. Numeric format. Used comma as decimal point X
    mercan: '', //string 20 Content Description
    valor_aduana: '', //string 7 Customs Declared Value. Numeric format.Used comma as decimal point X
    gastos_aduana: '', //string 1 Incoterms. 0 = DDU, 1 = DDP X
    das: '', //string 1 Return Signed Delivery Note. 0 – No, 1 - Yes 6
    tipo_aviso: '', //string 1 Delivery's Notification Type.0 = No, 1 = SMS, 2 = EMAIL 7
  });

  const settingIncludeNewDestinationByDelegation = data => {
    setIncludeNewDestinationByDelegation(prevState => ({
      ...prevState,
      ...data,
    }));
  };

  // ADD DESTIANTION BY TRACKING NO REQUEST VALUES
  const [
    includeNewDestinationByTrackingNumber,
    setIncludeNewDestinationByTrackingNumber,
  ] = useState({
    nseg: '', //string 18 Zeleris Pickup Tracking number X
    nifdni: '', //string 20 Recipient Identity Card (N.I.F. / D.N.I.)
    nombre: '', //string 40 Recipient Name X
    direccion: '', //string 80 Recipient Address X
    poblacion: '', //string 40 Recipient City X
    pais: '', //string 2 Recipient ISO County Code 8
    codpos: '', //string 7 Recipient Zip / Postal Code X
    contacto: '', //string 40 Recipient Contact Name
    telefon1: '', //string 15 Recipient Phone Number 1
    telefon2: '', //string 15 Recipient Phone Number 2
    email: '', //string 60 Email Address for Delivery Notification
    observ: '', //string 40 Delivery Additional Information
    referencia: '', //string 20 Order Number / Id
    bultos: '', //string 3 Total Packages. Numeric Format X
    kilos: '', //string 6 Total Weight 9 X
    vol: '', //string 6 Dimensions in m3(h x w x l). Numeric format.Used comma as decimal point
    tipo_portes: '', //string 1 Shipping Charge - P = Sender, D = Recipient X
    tipo_reemb: '', //string 1 C.O.D Charge - P = Sender, D = Recipient X
    servicio: '', //string 2 Courier Service Code X
    reembolso: '', //string 13 Cash On Delivery Amount. Numeric format.Used comma as decimal point X
    valor_seguro: '', //string 13 Insurance Value. Numeric format. Used comma as decimal point X
    mercan: '', //string 20 Content Description
    valor_aduana: '', //string 7 Customs Declared Value. Numeric format.Used comma as decimal point X
    gastos_aduana: '', //string 1 Incoterms. 0 = DDU, 1 = DDP X
    das: '', //string 1 Return Signed Delivery Note. 0 – No,1 - Yes 10
    tipo_aviso: '', //string 1 Delivery's Notification Type.0 = No, 1 = SMS, 2 = EMAIL 11
  });

  const settingIncludeNewDestinationByTrackingNumber = data => {
    setIncludeNewDestinationByTrackingNumber(prevState => ({
      ...prevState,
      ...data,
    }));
  };

  // CANCEL PICKUP BY DELEGATION VALUES

  const [cancelPickupByDelegation, setCancelPickupByDelegation] = useState({
    delegacion: '', //string 3 Zeleris Origin Code for Pickup X
    num_recogida: 0, //long 8 Pickup Number
  });

  const settingCancelPickupByDelegation = data => {
    setCancelPickupByDelegation(prevState => ({...prevState, ...data}));
  };

  // CANCEL PICKUP BY TRACKING NO VALUES

  const [cancelPickupByTrackingNumber, setCancelPickupByTrackingNumber] =
    useState({
      nseg: '', //string 18 Zeleris Pickup Tracking number X
    });

  const settingCancelPickupByTrackingNumber = data => {
    setCancelPickupByTrackingNumber(prevState => ({...prevState, ...data}));
  };

  //   --------------------FUNCTIONALITIES--------------------

  // CREATE PICKUP REQUEST FUNCTION
  const createPickupRequest = () => {
    let data = removeEmptyFromJSON(createPickup);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.newPickupRequest,
    )
      .then(result => {})
      .catch(err => {});
  };

  // ADD REFERENCE BY DELEGATION REQUEST FUNCTION
  const referenceByDelegation = () => {
    let data = removeEmptyFromJSON(includeReferenceByDelegation);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.includeReferenceByDelegationForPickup,
    )
      .then(result => {})
      .catch(err => {});
  };

  // ADD REFERENCE BY TRACKING NO REQUEST FUNCTION
  const referenceByTrackingNumber = () => {
    let data = removeEmptyFromJSON(includeReferenceByTrackingNumber);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.includeReferenceByTrackingNumberForPickup,
    )
      .then(result => {})
      .catch(err => {});
  };

  //  ADD DESTINATION BY DELEGATION REQUEST FUNCTION
  const addDestinationByDelegation = () => {
    let data = removeEmptyFromJSON(includeNewDestinationByDelegation);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.includeNewDestinationByDelegationForPickup,
    )
      .then(result => {})
      .catch(err => {});
  };

  // ADD DESTIANTION BY TRACKING NO REQUEST FUNCTION
  const addDestinationByTrackingNumber = () => {
    let data = removeEmptyFromJSON(includeNewDestinationByTrackingNumber);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.includeNewDestinationByTrackingNumberForPickup,
    )
      .then(result => {})
      .catch(err => {});
  };

  // CANCEL PICKUP BY DELEGATION FUNCTION
  const cancelPickupByDelegationFunction = () => {
    let data = removeEmptyFromJSON(cancelPickupByDelegation);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.cancelPickupByDelegationForPickup,
    )
      .then(result => {})
      .catch(err => {});
  };

  // CANCEL PICKUP BY TRACKING NO FUNCTION
  const cancelPickupByTrackingNumberFunction = () => {
    let data = removeEmptyFromJSON(cancelPickupByTrackingNumber);

    pickupRequest(
      {
        ...userReducer.shipmentDetails,
        ...data,
      },
      ShipmentParameters.cancelPickupByTrackingNumberForPickup,
    )
      .then(result => {})
      .catch(err => {});
  };

  useEffect(() => {
    // CREATE PICKUP REQUEST FUNCTION
    createPickupRequest();

    // // ADD REFERENCE BY DELEGATION REQUEST FUNCTION
    // referenceByDelegation();

    // // ADD REFERENCE BY TRACKING NO REQUEST FUNCTION
    // referenceByTrackingNumber();

    // //  ADD DESTINATION BY DELEGATION REQUEST FUNCTION
    // addDestinationByDelegation();

    // // ADD DESTIANTION BY TRACKING NO REQUEST FUNCTION
    // addDestinationByTrackingNumber();

    // // CANCEL PICKUP BY DELEGATION FUNCTION
    // cancelPickupByDelegationFunction();

    // // CANCEL PICKUP BY TRACKING NO FUNCTION
    // cancelPickupByTrackingNumberFunction();
  }, []);

  return <SafeAreaView></SafeAreaView>;
};

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(PickupScreen);
// // ADD PACKAGE TO SHIPMENT REQUEST VALUES
// const [addPackageToShipment, setAddPackageToShipment] = useState({
//   nseg: '', //string 18 Zeleris Tracking number X
//   referencia: '', //string 20 Package Order Number/Id or Reference X
//   bulto: '', //string 3 Package number
//   kilos: '', //string 6 Package weight
//   volumen: '', //string 6 Package volume
// });

// const settingAddPackageToShipment = data => {
//   setAddPackageToShipment(prevState => ({...prevState, ...data}));
// };

// // ADD PACKAGE TO EXPEDITION REQUEST VALUES
// const [addPackageToExpedition, setAddPackageToExpedition] = useState({
//   origen: '', //string 3 Zeleris origin code X
//   expedicion: '', //long 8 Expedition number X
//   referencia: '', //string 20 Package Order Number/Id or Reference X
//   bulto: '', //string 3 Package number 18 X
//   kilos: '', //string 6 Package weight
//   volumen: '', //string 6 Package volume
// });

// const settingtAddPackageToExpedition = data => {
//   setAddPackageToExpedition(prevState => ({...prevState, ...data}));
// };

// //CANCEL SHIPMENT REQUEST VALUES
// const [cancelShipment, setCancelShipment] = useState({
//   nseg: '', //string 18 Zeleris Tracking number X
// });

// const settingCancelShipment = data => {
//   setCancelShipment(prevState => ({...prevState, ...data}));
// };

// //CANCEL SHIPMENT EXPEDITION REQUEST VALUES
// const [cancelShipmentExpedition, setCancelShipmentExpedition] = useState({
//   nseg: '', //string 18 Zeleris Tracking number X
// });

// const settingCancelShipmentExpedition = data => {
//   setCancelShipmentExpedition(prevState => ({...prevState, ...data}));
// };

// // ADD PACKAGE TO SHIPMENT REQUEST FUNCTION
// const addPackageToShipmentRequest = () => {
//   let data = removeEmptyFromJSON(addPackageToShipment);

//   shipmentRequest(
//     {
//       ...userReducer.shipmentDetails,
//       ...data,
//     },
//     ShipmentParameters.includeNewPackageForExistingShipment,
//   )
//     .then(result => {})
//     .catch(err => {});
// };

// // ADD PACKAGE TO EXPEDITION REQUEST FUNCTION
// const addPackageToExpeditionShipmentRequest = () => {
//   let data = removeEmptyFromJSON(addPackageToExpedition);

//   shipmentRequest(
//     {
//       ...userReducer.shipmentDetails,
//       ...data,
//     },
//     ShipmentParameters.includeNewPackageForExistingShipmentExpedition,
//   )
//     .then(result => {})
//     .catch(err => {});
// };

// //CANCEL SHIPMENT REQUEST FUNCTION
// const cancelShipmentRequest = () => {
//   let data = removeEmptyFromJSON(cancelShipment);

//   shipmentRequest(
//     {
//       ...userReducer.shipmentDetails,
//       ...data,
//     },
//     ShipmentParameters.cancelShipment,
//   )
//     .then(result => {})
//     .catch(err => {});
// };

// //CANCEL SHIPMENT EXPEDITION REQUEST FUNCTION
// const cancelExpeditionShipmentRequest = () => {
//   let data = removeEmptyFromJSON(cancelShipmentExpedition);

//   shipmentRequest(
//     {
//       ...userReducer.shipmentDetails,
//       ...data,
//     },
//     ShipmentParameters.cancelShipmentExpedition,
//   )
//     .then(result => {})
//     .catch(err => {});
// };

// // ADD PACKAGE TO SHIPMENT REQUEST FUNCTION
// addPackageToShipmentRequest();

// // ADD PACKAGE TO EXPEDITION REQUEST FUNCTION
// addPackageToExpeditionShipmentRequest;

// // CANCEL SHIPMENT REQUEST FUNCTION
// cancelShipmentRequest();

// //CANCEL SHIPMENT EXPEDITION REQUEST FUNCTION
// cancelExpeditionShipmentRequest();

// cancelDestinationByDelegationForPickup: 'AnularDestinoRCO',
// cancelDestinationByTrackingNumberForPickup: 'AnularDestinoNSeg',

// //SHIPMENT AND PICKUP TRACKING REQUESTS
// summaryInfoByCustomerCodeShipmentRef: 'ResumenRef',

let jsonData = {
  usuario: 'string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  codcliente: 'string 9 Billing Account Code',
  referencia: 'string 20 Order Number / Id X',
};

// summaryInfoByShipmentTrackingNumber: 'ResumenNSeg',

let jsonData = {
  usuario: ' string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  nseg: 'string 18 Zeleris Tracking number X',
};

// summaryInfoEXPByDelegationAndExpedionCode: 'ResumenEXP',
let jsonData = {
  usuario: 'string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  origen: 'string 3 Zeleris Origin Code X',
  expedicion: 'long 8 Expedition Number X',
};

// proformaInvoicesByCustomerCodeShipmentRef: 'ProformaRef',
// proformaInvoicesByShipmentTrackingNumber: 'ProformaNSeg',
// proformaInvoicesEXPByDelegationAndExpedionCode: 'ProformaEXP',
// proformaInvoicesByCustomerCodeShipmentRefToEmail: 'ProformaEMailRef',
// proformaInvoicesByShipmentTrackingNumberToEmail: 'ProformaEMailNSeg',
// proformaInvoicesEXPByDelegationAndExpedionCodeToEmail: 'ProformaEMailEXP',
// summaryInfoByCustomerCodeShipmentRefSecond: 'PODRef',
// summaryInfoByShipmentTrackingNumberSecond: 'PODNSeg',
// summaryInfoEXPByDelegationAndExpedionCodeSecond: 'PODEXP',
let jsonData = {
  usuario: 'string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  origen: 'string 3 Zeleris Origin Code X',
  expedicion: 'long 8 Expedition number X',
};
// validatePostalCode: 'InfoCodigoPostal',
// historyOfShipmentByCustomerCodeShipmentRef: 'HistorialRef',
let jsonData = {
  usuario: 'string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  codcliente: 'string 9 Billing Account Code',
  referencia: 'string 20 Order Number / Id X',
};
// historyOfShipmentByShipmentTrackingNumber: 'HistorialNSeg',

let jsonData = {
  usuario: 'string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  nseg: 'string 18 Zeleris Tracking number X ',
};
// historyOfEXPByDelegationAndExpedionCode: 'HistorialEXP',
let jsonData = {
  usuario: 'string 9 User (provided) X',
  clave: 'string 10 Password (provided) X',
  origen: 'string 3 Zeleris Origin Code X',
  expedicion: 'long 8 Expedition number',
};
// labelOfShipmentByCustomerCodeShipmentRef: 'EtiquetaRef',
// labelOfShipmentByCustomerCodeShipmentRef: 'EtiquetaNSeg',
// labelOfEXPByDelegationAndExpedionCode: 'EtiquetaEXP',
