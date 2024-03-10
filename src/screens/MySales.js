import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Dialog } from 'react-native-simple-dialogs';
import moment from 'moment';
import _, { result } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../components/SearchBar';
import persistStorage from '../redux/store/persistStore';
import { connect } from 'react-redux';
import { updateUserDetails } from '../redux/actions/UserAction';
import { getImage } from '../actions/GenericAPI';
import { MainButton } from '../components/MainButton';
import { SortView } from '../components/SortView';
import {
  isCustomsCorreosShipment,
  isMatch,
  ValidateSpanishID,
} from '../actions/HelperFunctions';
import RNFetchBlob from 'rn-fetch-blob';
import { getSalesList, rejectSalesOrder } from '../actions/SaleFlowAPI';
import { addShipmentDetails } from '../actions/ShipmentAPI';

import ProgressLoader from '../components/ProgressLoader';
import { useContext } from 'react';
import { DarkModeContext } from '../components/DarkModeContext';
import {
  createCorreosPreRegistration,
  getCorreosCustomsDocument,
  getCorreosLabel,
} from '../actions/_CorreosAPI';
import { editUserProfile } from '../actions/UserAPI';
import { useToast } from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import { useKeyboard } from '../utils/UseKeyBoard';
import FastImage from 'react-native-fast-image';
import { NativeModules } from 'react-native';

const { PDFModule } = NativeModules;



const MySales = ({ props, route, userReducer, updateUserDetails }) => {
  const { darkMode, colors } = useContext(DarkModeContext);
  const toast = useToast();
  const [salesList, setSalesList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [initial, setInitial] = useState(true);
  const [taxNumber, setTaxNumber] = useState('');
  const [extra, setExtra] = useState(0);
  const [currentSelectedAlbum, setCurrentSelectedAlbum] = useState({});
  const [taxNumberPopup, setTaxNumberPopup] = useState(false);
  const [sortValue, setSortValue] = useState('newest');
  const [meetingDate, setMeetingDate] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
  );
  const [meetingDatePicker, setMeetingDatePicker] = useState(false);
  const [meetingTimeOne, setMeetingTimeOne] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(9, 0),
  );
  const [meetingTimeOnePicker, setMeetingTimeOnePicker] = useState(false);
  const [meetingTimeTwo, setMeetingTimeTwo] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(17, 0),
  );
  const [meetingTimeTwoPicker, setMeetingTimeTwoPicker] = useState(false);
  const [shipmentDialog, setShipmentDialog] = useState(false);
  const [labelDialog, setLabelDialog] = useState(false);
  const [labelItem, setLabelItem] = useState({ item: null, index: null });

  useEffect(() => {
    loadSalesList();
  }, [sortValue]);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const loadSalesList = () => {
    getSalesList(sortValue)
      .then(response => {
        if (response.status == 'success') {
          let salesList = [];
          response?.result?.map(value => {
            salesList.push({ ...value, price: parseFloat(value.totalPayment) });
          });
          setSalesList(salesList);
          setExtra(extra + 1);
        } else {
          toast.show(response.message);
        }
        setInitial(false);
      })
      .catch(err => {
        setInitial(false);
      });
  };




  const printLabel = async (item, index) => {
    let jsonData = {
      'soapenv:Envelope': {
        _attributes: {
          'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:prer':
            'http://www.correos.es/iris6/services/preregistroetiquetas',
        },
        'soapenv:Header': {},
        'soapenv:Body': {
          'prer:SolicitudEtiqueta': {
            'prer:FechaOperacion': moment().format('DD-MM-YYYY HH:mm:ss'),
            'prer:CodEtiquetador': '8DTG',
            'prer:NumContrato': '54055316',
            'prer:NumCliente': '81357204',
            'prer:CodEnvio': item.shipmentDetails.codEnvio,
            'prer:Care': {},
            'prer:ModDevEtiqueta': '2',
          },
        },
      },
    };

    setLabelDialog(false);
    setSpinner(true)


    getCorreosLabel(jsonData)
      .then(async result => {
        Linking.openURL(result?.url)
        setSpinner(false)

        // console.log(result, 'res')

        // // PDFModule.openPDFFromBase64(result?.pdf)
        // const filePath =
        //   RNFetchBlob.fs.dirs.DownloadDir +
        //   `/${item.albumName}_${item.shipmentDetails.codEnvio}.pdf`;
        // setLabelDialog(false);




        // RNFetchBlob.fs
        //   .writeFile(filePath, result.pdf, 'base64')
        //   .then(async () => {
        //     console.log(filePath)
        //     //    await RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
        //     toast.show('Correos Label has been download:\n' + filePath);
        //     setLabelDialog(false);

        //     // Call the native method
        //     // PDFModule.openPDF(`file://${filePath}`);
        //     // Share.open({
        //     //   url: `file://${filePath}`,
        //     //   type: 'application/pdf',
        //     // });
        //   })
        //   .catch(err => { });
      })
      .catch(err => { 
        setSpinner(false)
      });
  };

  const printCustomsDocument = async (item, index, cn23 = false) => {
    let jsonData;
    if (cn23) {
      jsonData = {
        'soapenv:Envelope': {
          _attributes: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:prer':
              'http://www.correos.es/iris6/services/preregistroetiquetas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'prer:SolicitudDocumentacionAduaneraCN23CP71': {
              'prer:codCertificado': item.shipmentDetails.codEnvio,
              'prer:IdiomaErrores': 'N',
            },
          },
        },
      };
    } else {
      jsonData = {
        'soapenv:Envelope': {
          _attributes: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:prer':
              'http://www.correos.es/iris6/services/preregistroetiquetas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'prer:SolicitudDocumentacionAduanera': {
              'prer:TipoESAD': 'DDP',
              'prer:NumContrato': '54055316',
              'prer:NumCliente': '81357204',
              'prer:CodEtiquetador': '8DTG',
              'prer:Provincia': item?.buyerInformation[0].vendorData
                ? item.buyerInformation[0]?.vendorData?.zipcode
                  ?.toString()
                  ?.substring(0, 2)
                : item.buyerInformation[0]?.postalCode
                  ?.toString()
                  ?.substring(0, 2),
              'prer:PaisDestino': 'ES',
              'prer:NombreDestinatario': item?.buyerInformation[0].vendorData
                ? item.buyerInformation[0]?.vendorData?.name
                : item.buyerInformation[0]?.firstName +
                ' ' +
                item.buyerInformation[0]?.lastName,
              'prer:NumeroEnvios': '1',
            },
          },
        },
      };
    }

    getCorreosCustomsDocument(jsonData)
      .then(result => {
        const filePath =
          RNFetchBlob.fs.dirs.DownloadDir +
          `/${item.albumName}_${cn23 == true ? 'CN23' : 'Customs_Document'}_${item.shipmentDetails.codEnvio
          }.pdf`;

        RNFetchBlob.fs
          .writeFile(filePath, result.pdf, 'base64')
          .then(() => {
            toast.show('Correos Label has been download:\n' + filePath);
            setLabelDialog(false);
            // Share.open({
            //   url: `file://${filePath}`,
            //   type: 'application/pdf',
            // });
          })
          .catch(err => { });
      })
      .catch(err => { });
  };

  const cancelOrder = (item, index) => {
    setSpinner(true);
    let jsonData = {
      albumId: item.albumId._id,
      orderId: item.orderId,
      sellerId: item?.sellerId?._id,
      buyerId: item?.buyerId._id,
      albumCost: item?.albumCost,
      shipmentCharge: item?.shipmentCharge,
    };

    rejectSalesOrder(jsonData)
      .then(result => {
        if (result.status == 'success') {
          toast.show(result.message);
          salesList.splice(index, 1, {
            ...item,
            isCancel: true,
            orderStatus: 'Order Rejected',
          });
          setExtra(extra + 1);
          setTaxNumberPopup(false);
        } else {
          toast.show(textContent.general.general_error);
        }
        setSpinner(false);
      })
      .catch(err => {
        setSpinner(false);
        toast.show('Something went wrong');
      });
  };

  const shipmentPreRegistration = async (item, index) => {
    try {
      let deliveryDetails = item?.buyerInformation[0]?.vendorData
        ? {
          'prer:Identificacion': {
            'prer:Nombre':
              item?.buyerInformation[0]?.vendorData?.businessName,
            'prer:Empresa':
              item?.buyerInformation[0]?.vendorData?.businessName,
            'prer:PersonaContacto':
              item?.buyerInformation[0]?.vendorData?.userName,
          },
          'prer:DatosDireccion': {
            'prer:Direccion':
              item?.buyerInformation[0]?.vendorData?.deliveryAddress,

            'prer:Localidad': item?.buyerInformation[0]?.vendorData?.city,
            // 'prer:Provincia': buyerData?.city,
          },
          'prer:CP': item?.buyerInformation[0]?.vendorData?.zipcode,
          'prer:Telefonocontacto':
            item?.buyerInformation[0]?.vendorData?.contact.toString(),
          'prer:Email': item?.buyerInformation[0]?.vendorData?.email,
          'prer:DatosSMS': {
            'prer:NumeroSMS':
              item?.buyerInformation[0]?.vendorData?.contact.toString(),
            'prer:Idioma': '1',
          },
        }
        : {
          'prer:Identificacion': {
            'prer:Nombre':
              item?.buyerInformation[0]?.firstName +
              ' ' +
              item?.buyerInformation[0]?.lastName,
            'prer:PersonaContacto':
              item?.buyerInformation[0]?.firstName +
              ' ' +
              item?.buyerInformation[0]?.lastName,
          },
          'prer:DatosDireccion': {
            'prer:Direccion': item?.buyerInformation[0]?.deliveryAddress,

            'prer:Localidad': item?.buyerInformation[0]?.city,
            // 'prer:Provincia': buyerData?.city,
          },
          'prer:CP': item?.buyerInformation[0]?.postalCode,
          'prer:Telefonocontacto':
            item?.buyerInformation[0]?.mobileNumber.toString(),
          'prer:Email': item?.buyerInformation[0]?.email,
          'prer:DatosSMS': {
            'prer:NumeroSMS':
              item?.buyerInformation[0]?.mobileNumber.toString(),
            'prer:Idioma': '1',
          },
        };

      let sellerDetails = {
        'prer:Identificacion': {
          'prer:Nombre': userReducer?.profileDetails?.firstName,
          'prer:Apellido1': userReducer?.profileDetails?.lastName,
          'prer:Empresa': userReducer?.profileDetails?.firstName,
          'prer:PersonaContacto':
            userReducer?.profileDetails?.firstName +
            ' ' +
            userReducer?.profileDetails?.lastName,
        },
        'prer:DatosDireccion': {
          'prer:Direccion': userReducer?.profileDetails?.deliveryAddress,
          'prer:Localidad': userReducer?.profileDetails?.city,
          //   'prer:Provincia': userReducer?.profileDetails?.city,
        },
        'prer:CP': userReducer?.profileDetails?.postalCode,
        'prer:Telefonocontacto':
          userReducer?.profileDetails?.mobileNumber.toString(),
        'prer:Email': userReducer?.profileDetails?.email,
        'prer:DatosSMS': {
          'prer:NumeroSMS':
            userReducer?.profileDetails?.mobileNumber.toString(),
          'prer:Idioma': '1',
        },
      };

      if (
        isCustomsCorreosShipment(
          userReducer?.profileDetails?.postalCode,
          item?.buyerInformation[0]?.vendorData
            ? item?.buyerInformation[0]?.vendorData?.zipcode
            : item?.buyerInformation[0]?.postalCode,
        )
      ) {
        sellerDetails['prer:Identificacion']['prer:Nif'] = userReducer
          ?.profileDetails?.taxNumber
          ? userReducer?.profileDetails?.taxNumber
          : taxNumber;
      }

      let jsonData = {
        'soapenv:Envelope': {
          _attributes: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:prer':
              'http://www.correos.es/iris6/services/preregistroetiquetas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'prer:PreregistroEnvio': {
              'prer:FechaOperacion': moment(new Date()).format(
                'DD-MM-YYYY HH:mm:ss',
              ),
              'prer:CodEtiquetador': '8DTG',
              'prer:NumContrato': '54055316',
              'prer:NumCliente': '81357204',
              'prer:Care': {},
              'prer:TotalBultos': '1',
              'prer:ModDevEtiqueta': '1',
              'prer:Remitente': sellerDetails,
              'prer:Destinatario': deliveryDetails,
              'prer:Envio': {
                'prer:NumBulto': '1',
                'prer:CodProducto': 'S0132',
                'prer:ReferenciaCliente': item?.albumId?._id,
                'prer:TipoFranqueo': 'FP',
                'prer:Pesos': {
                  'prer:Peso': {
                    'prer:TipoPeso': 'R',
                    'prer:Valor': JSON.parse(item?.albumId?.volume_weight)
                      .weight,
                  },
                },
                'prer:ModalidadEntrega': 'ST',
                'prer:ValoresAnadidos': {
                  'prer:PruebaEntrega': {
                    'prer:Formato': '3',
                    'prer:ReferenciaeAR': 'WAXPLACE',
                  },
                  'prer:IndImprimirEtiqueta': '1',
                  'prer:IntentosDeEntrega': '2',
                  // 'prer:EntregaSinFirmar': 'S', //for pAQ or international shipment
                },
                'prer:Observaciones1': 'WAXPLACE',
                'prer:InstruccionesDevolucion': 'D',
                'prer:Aduana': isCustomsCorreosShipment(
                  userReducer?.profileDetails?.postalCode,
                  item?.buyerInformation[0]?.vendorData
                    ? item?.buyerInformation[0]?.vendorData?.zipcode
                    : item?.buyerInformation[0]?.postalCode,
                )
                  ? {
                    'prer:TipoEnvio': '6',
                    'prer:Factura': 'S',
                    'prer:EnvioComercial': 'S',
                    'prer:FacturaSuperiora500': 'N',
                    'prer:DUAConCorreos': 'S',
                    'prer:DescAduanera': {
                      'prer:DATOSADUANA': {
                        'prer:Descripcion': '590',
                        'prer:Cantidad': '2',
                        'prer:Valorneto': item.totalPayment.toString(),
                        'prer:Pesoneto': JSON.parse(
                          item?.albumId?.volume_weight,
                        ).weight,
                      },
                    },
                  }
                  : {
                    'prer:TipoEnvio': '6',
                    'prer:EnvioComercial': 'S',
                    'prer:Factura': 'S',
                  },
                'prer:PermiteEmbalaje': 'S',
              },
            },
          },
        },
      };

      setSpinner(true);
      createCorreosPreRegistration(jsonData)
        .then(result => {
          if (result.status == 'success') {
            let value = persistStorage.getState().userDetails.userId;
            let albumId = item.albumId._id;
            let shipmentDetails = { codEnvio: result.codEnvio };
            let pickupDetails = {};
            let jsonData = {
              sellerId: value,
              _id: item._id,
              albumId,
              shipmentDetails,
              pickupDetails,
              buyerId: item.buyerInformation[0]?._id,
              orderStatus: 'Order Accepted',
              date: moment(new Date()).format('DD/MM/YYYY hh:mm a'),
            };
            addShipmentDetails(jsonData)
              .then(result => {
                if (result.status == 'success') {
                  salesList.splice(index, 1, {
                    ...item,
                    shipmentDetails,
                    pickupDetails,
                    orderStatus: 'Order Accepted',
                  });
                  setExtra(extra + 1);
                  setShipmentDialog(false);
                  setTaxNumberPopup(false);
                } else {
                  toast.show(textContent.general.general_error);
                }
                setSpinner(false);
              })
              .catch(err => {
                setSpinner(false);
                toast.show(textContent.general.general_error);
              });
          } else {
            setSpinner(false);
            toast.show(textContent.general.general_error);
          }
        })
        .catch(err => {
          setSpinner(false);
        });
    } catch (err) {
      setSpinner(false);
    }
  };

  const updateSalesList = (index, value) => {
    salesList.splice(index, 1, value);
  };

  const renderSalesList = (data, index) => {
    let item = { ...data, ...data.albumDetails };
    delete item.albumDetails;

    let date = moment(item.createdAt).format('DD/MM/YY').toString();

    if (
      !isMatch(
        item,
        ['albumName', 'label', 'artist', 'orderId', 'orderStatus'],
        searchText,
      ) &&
      !getPrice(
        parseFloat(item.albumCost) -
        parseFloat(item.albumCost) * (item.sellerTax / 100),
      )
        .toString()
        .includes(searchText.toLowerCase()) &&
      !getPrice(parseFloat(item.albumCost) * (item.sellerTax / 100))
        .toString()
        .includes(searchText.toLowerCase()) &&
      !getPrice(parseFloat(item.albumCost))
        .toString()
        .includes(searchText.toLowerCase()) &&
      !(
        item.buyerInformation[0].firstName +
        '' +
        item.buyerInformation[0].lastName
      )
        .toLowerCase()
        .includes(
          searchText.toLowerCase() &&
          !date.toLowerCase().includes(searchText.toLowerCase()),
        )
    ) {
      return null;
    }

    return (
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 5,
          paddingTop: 5,
          paddingHorizontal: 10,
          paddingBottom: 10,
          borderRadius: 10,
          backgroundColor: colors.cardColor,
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,

          marginTop: 5,
        }}>
        <View style={{ width: '100%' }}>
          <View style={{ paddingVertical: 5, flexDirection: 'row' }}>
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <FastImage
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  alignSelf: 'center',
                  backgroundColor: colors.bgGray,
                }}
                source={{
                  ...getImage(
                    item?.albumId?.thumbnailImage ?? item?.albumId?.images[0],
                  ),
                }}
              />
            </View>
            <View style={{ flex: 4, paddingLeft: 10 }}>
              <View
                style={{
                  paddingVertical: 2,
                  width: '100%',
                  alignItems: 'flex-start',
                  overflow: 'hidden',
                  justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.primaryTextColor,

                    fontSize: 17,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {item?.albumId?.albumName}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 17,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.albumId?.artist}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 16,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.albumId?.label}
                </Text>
              </View>
              <View
                style={{
                  paddingVertical: 2,
                  width: '100%',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 16,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {moment(item.createdAt).format('DD/MM/YYYY hh:mm a')}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1.8,
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 2,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.notificationColor,
                  fontSize: 17,
                  fontFamily: fontFamily.MontserratBold,
                }}>
                {`\u20AC${getPrice(
                  parseFloat(item.albumCost) -
                  parseFloat(item.albumCost) * (item.sellerTax / 100),
                )}`}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginBottom:
              !item.shipmentDetails &&
                item.orderStatus.toUpperCase() !== 'CANCELLED' &&
                item.orderStatus.toUpperCase() !== 'ORDER REJECTED'
                ? 10
                : 3,
            marginTop: 10,
            width: '100%',
          }}>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.order_id}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item.orderId}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.buyer}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 14,

                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item.buyerInformation[0].firstName !== ''
                  ? item?.buyerInformation[0]?.firstName?.toUpperCase()
                  : ''}{' '}
                {item.buyerInformation[0].lastName !== ''
                  ? item?.buyerInformation[0]?.lastName?.toUpperCase()
                  : ''}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.cost}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(parseFloat(item.albumCost))}`}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.tax}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(
                  parseFloat(item.albumCost) * (item.sellerTax / 100),
                )}`}
                {'(' + item.sellerTax + '%)'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.net_sales}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {`\u20AC${getPrice(
                  parseFloat(item.albumCost) -
                  parseFloat(item.albumCost) * (item.sellerTax / 100),
                )}`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.pickup_date}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {moment(item.createdAt).format('DD/MM/YYYY hh:mm a')}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 2 }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.MySales.order_status}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item.orderStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        {!item.shipmentDetails &&
          item.orderStatus.toUpperCase() !== 'CANCELLED' &&
          item.orderStatus.toUpperCase() !== 'ORDER REJECTED' && (
            <View
              style={{
                width: '100%',
                justifyContent: 'flex-end',
                marginTop: 2,
                marginBottom: 5,
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View style={{ alignItems: 'center', marginRight: 10 }}>
                <TouchableOpacity
                  style={{
                    height: 30,

                    borderRadius: 15,
                    backgroundColor: colors.secondaryBackground,
                    elevation: 2,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                    overflow: 'hidden',
                  }}
                  onPress={() => {
                    cancelOrder(item, index);
                  }}>
                  <View
                    style={{
                      backgroundColor: darkMode
                        ? colors.gray + 'aa'
                        : colors.premiumGrayOne + '90',
                      height: '100%',

                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      paddingHorizontal: 15,
                    }}>
                    <Image
                      resizeMode="contain"
                      style={{
                        height: 15,
                        width: 15,
                        padding: 2,
                        alignSelf: 'center',
                        tintColor: colors.red,
                        marginRight: 5,
                      }}
                      source={imagepath.warning}></Image>

                    <Text
                      style={{
                        color: darkMode
                          ? colors.black
                          : colors.primaryTextColor,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        paddingVertical: 2,
                        fontFamily: fontFamily.MontserratRegular,
                      }}>
                      {textContent.MySales.cancel}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.secondaryBackground,
                    elevation: 2,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                    overflow: 'hidden',
                  }}
                  onPress={() => {
                    ProfileNavigation.navigate('SellerDetails', {
                      item,
                      index,
                      callback: updateSalesList,
                    });
                    // if (
                    //   isCustomsCorreosShipment(
                    //     item?.sellerInformation?.zipcode,
                    //     item?.buyerInformation[0]?.vendorData
                    //       ? item?.buyerInformation[0]?.vendorData?.zipcode
                    //       : item?.buyerInformation[0]?.postalCode,
                    //   )
                    // ) {
                    //   setCurrentSelectedAlbum({item, index});
                    //   setTaxNumberPopup(true);
                    // } else {
                    //   setCurrentSelectedAlbum({item, index});
                    //   shipmentPreRegistration(item, index);
                    // }
                  }}>
                  <View
                    style={{
                      backgroundColor: colors.primaryButtonColor,
                      height: '100%',

                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      paddingHorizontal: 25,
                      shadowColor: colors.shadowColor,
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 8,
                    }}>
                    <Text
                      style={{
                        color: colors.black,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        paddingVertical: 2,
                        fontFamily: fontFamily.MontserratRegular,
                      }}>
                      {textContent.MySales.button_text_one}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        {!item.isCancel && item.orderStatus.toUpperCase() == 'ORDER ACCEPTED' && (
          <View
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              marginVertical: 5,
              alignItems: 'flex-start',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                height: 35,

                overflow: 'hidden',
              }}
              onPress={() => {
                ProfileNavigation.navigate('NearbyDepots', {
                  postalCode: '08025'//</View>item?.sellerInformation?.zipcode,
                });
              }}>
              <View
                style={{
                  height: '100%',

                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  resizeMode="contain"
                  style={{
                    height: 20,
                    width: 20,
                    padding: 2,
                    alignSelf: 'center',
                    tintColor: colors.primaryTextColor + '90',
                    marginHorizontal: 4,
                  }}
                  source={imagepath.correos}></Image>

                <Text
                  style={{
                    color: colors.blue + 'dd',
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    marginRight: 10,
                  }}>
                  {textContent.MySales.view_depots}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 35,

                overflow: 'hidden',
              }}
              onPress={() => {
                setLabelItem({ item, index });
                setLabelDialog(true);
              }}>
              <View
                style={{
                  height: '100%',

                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  resizeMode="contain"
                  style={{
                    height: 18,
                    width: 18,
                    padding: 2,
                    alignSelf: 'center',
                    tintColor: colors.primaryTextColor + '90',
                    marginHorizontal: 4,
                  }}
                  source={imagepath.document}></Image>

                <Text
                  style={{
                    color: colors.blue + 'dd',
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    marginRight: 10,
                  }}>
                  {textContent.MySales.print_label}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderPage = () => {
    return (
      <View style={{ width: '100%', height: '100%' }}>
        <SortView
          hideDistance={true}
          initial={initial}
          marginBottom={0}
          setFilterType={type => {
            setSortValue(type);
          }}
        />

        <FlatList
          ListHeaderComponent={
            <>
              {initial && (
                <ActivityIndicator
                  size={'small'}
                  style={{ marginTop: '20%' }}
                  color={colors.spinner}
                />
              )}
            </>
          }
          ListFooterComponent={<></>}
          data={salesList}
          extraData={extra}
          showsVerticalScrollIndicator={false}
          style={{ height: '100%', marginTop: 10 }}
          contentContainerStyle={{ paddingBottom: useKeyboard() + 50 }}
          renderItem={({ item, index }) =>
            renderSalesList(item, index)
          }></FlatList>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      {Platform.OS == 'android' && meetingDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={meetingDate}
          mode={'date'}
          minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setMeetingDatePicker(false);
            setMeetingDate(selectedDate);
            setShipmentDialog(true);
          }}
        />
      )}

      <Dialog
        visible={meetingDatePicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setShipmentDialog(true);
          setMeetingDatePicker(false);
        }}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          alignItems: 'center',
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <DateTimePicker
          display="spinner"
          testID="datePicker"
          value={meetingDate}
          mode={'date'}
          minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setMeetingDate(selectedDate);
          }}
        />
        <MainButton
          style={{
            marginTop: 10,
            height: 35,
            width: 200,
            paddingHorizontal: 10,
            borderRadius: 15,
            backgroundColor: colors.primaryButtonColor,
            elevation: 2,
            shadowColor: colors.shadowColor,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            shadowColor: colors.shadowColor,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
          onPress={() => {
            setShipmentDialog(true);
            setMeetingDatePicker(false);
          }}
          fontSize={15}
          title={textContent.MySales.button_text_two}
        />
      </Dialog>

      {Platform.OS == 'android' && meetingTimeOnePicker && (
        <DateTimePicker
          testID="timePickerOne"
          value={new Date(meetingTimeOne)}
          mode={'time'}
          minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setMeetingTimeOnePicker(false);
            setMeetingTimeOne(selectedDate);
            setShipmentDialog(true);
          }}
        />
      )}

      <Dialog
        display="spinner"
        visible={meetingTimeOnePicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setShipmentDialog(true);
          setMeetingTimeOnePicker(false);
        }}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          alignItems: 'center',
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <DateTimePicker
          display="spinner"
          testID="timePickerOne"
          value={new Date(meetingTimeOne)}
          mode={'time'}
          minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setMeetingTimeOne(selectedDate);
          }}
        />
        <MainButton
          style={{
            marginTop: 10,
            height: 35,
            width: 200,
            paddingHorizontal: 10,
            borderRadius: 15,
            backgroundColor: colors.primaryButtonColor,
            shadowColor: colors.shadowColor,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
          onPress={() => {
            setShipmentDialog(true);
            setMeetingTimeOnePicker(false);
          }}
          fontSize={15}
          title={textContent.MySales.button_text_two}
        />
      </Dialog>

      {Platform.OS == 'android' && meetingTimeTwoPicker && (
        <DateTimePicker
          testID="timePickerTwo"
          value={new Date(meetingTimeTwo)}
          mode={'time'}
          minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setMeetingTimeTwoPicker(false);
            setMeetingTimeTwo(selectedDate);
            setShipmentDialog(true);
          }}
        />
      )}

      <Dialog
        visible={meetingTimeTwoPicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setShipmentDialog(true);
          setMeetingTimeTwoPicker(false);
        }}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          alignItems: 'center',
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <DateTimePicker
          display="spinner"
          testID="timePickerTwo"
          value={new Date(meetingTimeTwo)}
          mode={'time'}
          minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setMeetingTimeTwo(selectedDate);
          }}
        />
        <MainButton
          style={{
            marginTop: 10,
            height: 35,
            width: 200,
            paddingHorizontal: 10,
            borderRadius: 15,
            backgroundColor: colors.primaryButtonColor,
            shadowColor: colors.shadowColor,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
          onPress={() => {
            setShipmentDialog(true);
            setMeetingTimeTwoPicker(false);
          }}
          fontSize={15}
          title={textContent.MySales.button_text_two}
        />
      </Dialog>

      <Dialog
        visible={shipmentDialog}
        onTouchOutside={() => setShipmentDialog(false)}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View style={{ paddingVertical: 5, alignItems: 'center' }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 18,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.MySales.pickup_details}
          </Text>
        </View>
        <View style={{ width: '100%' }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              marginTop: 10,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.MySales.set_date}
          </Text>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 7,
              height: 45,
              backgroundColor: colors.premiumGrayOne + '90',
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <View style={{ flex: 6, height: '100%', justifyContent: 'center' }}>
              <TextInput
                editable={false}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 16,
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                  paddingLeft: 10,
                }}
                placeholder={''}
                value={moment(meetingDate).format('DD/MM/YYYY').toString()}
              />
            </View>
            <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  setShipmentDialog(false);
                  setMeetingDatePicker(true);
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    alignSelf: 'center',
                  }}
                  source={imagepath.calender}></Image>
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={{
              color: colors.notificationColor,
              fontSize: 14,
              marginTop: 20,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.MySales.working_hours}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              marginTop: 15,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.MySales.available_from}
          </Text>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 7,
              height: 45,
              backgroundColor: colors.premiumGrayOne + '90',
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <View style={{ flex: 6, height: '100%', justifyContent: 'center' }}>
              <TextInput
                editable={false}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 16,
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                  paddingLeft: 10,
                }}
                placeholder={''}
                value={moment(meetingTimeOne).format('hh:mm A').toString()}
              />
            </View>
            <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  setShipmentDialog(false);
                  setMeetingTimeOnePicker(true);
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    alignSelf: 'center',
                  }}
                  source={imagepath.timeselection}></Image>
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              marginTop: 15,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.MySales.available_to}
          </Text>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 7,
              height: 45,
              backgroundColor: colors.premiumGrayOne + '90',
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <View style={{ flex: 6, height: '100%', justifyContent: 'center' }}>
              <TextInput
                editable={false}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 16,
                  letterSpacing: 0.5,
                  fontFamily: fontFamily.MontserratRegular,
                  backgroundColor: colors.transparent,
                  paddingLeft: 10,
                }}
                placeholder={''}
                value={moment(meetingTimeTwo).format('hh:mm A').toString()}
              />
            </View>
            <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  setShipmentDialog(false);
                  setMeetingTimeTwoPicker(true);
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    alignSelf: 'center',
                  }}
                  source={imagepath.timeselection}></Image>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 2 }}>
            <MainButton
              style={{
                height: 35,
                paddingHorizontal: 10,
                borderRadius: 15,
                backgroundColor: colors.primaryButtonColor,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
              }}
              fontSize={15}
              title={textContent.MySales.button_text_three}
              onPress={() => {
                let someDate = new Date();
                let numberOfDaysToAdd = 6;
                let result = someDate.setDate(
                  someDate.getDate() + numberOfDaysToAdd,
                );

                if (meetingDate > result) {
                  toast.show(textContent.MySales.select_day);
                }
                if (
                  !(
                    parseInt(moment(meetingTimeOne).format('HH')) >= 9 &&
                    parseInt(moment(meetingTimeOne).format('HH')) <= 17
                  )
                ) {
                  toast.show(textContent.MySales.from_time);
                  return;
                } else {
                  if (parseInt(moment(meetingTimeOne).format('HH')) == 17) {
                    if (parseInt(moment(meetingTimeOne).format('mm')) != 0) {
                      toast.show(textContent.MySales.from_time);
                      return;
                    }
                  }
                }

                if (
                  !(
                    parseInt(moment(meetingTimeTwo).format('HH')) >= 9 &&
                    parseInt(moment(meetingTimeTwo).format('HH')) <= 17
                  )
                ) {
                  toast.show(textContent.MySales.to_time);
                  return;
                } else {
                  if (parseInt(moment(meetingTimeTwo).format('HH')) == 17) {
                    if (parseInt(moment(meetingTimeTwo).format('mm')) != 0) {
                      toast.show(textContent.MySales.to_time);
                      return;
                    }
                  }
                }

                // createShipment(
                //   currentSelectedAlbum.item,
                //   currentSelectedAlbum.index,
                // );
              }}
            />
          </View>
        </View>
      </Dialog>
      <Dialog
        visible={labelDialog}
        onTouchOutside={() => setLabelDialog(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          width: '90%',
          backgroundColor: colors.secondaryBackground,
          alignSelf: 'center',
        }}>
        <View
          style={{
            borderRadius: 10,

            alignItems: 'center',

            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: '100%',
              justifyContent: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => printLabel(labelItem.item, labelItem.index)}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: 18,
                alignSelf: 'center',
              }}>
              {textContent.MySales.print_label}
            </Text>
          </TouchableOpacity>
          {isCustomsCorreosShipment(
            labelItem?.item?.buyerInformation[0]?.vendorData
              ? labelItem?.item?.buyerInformation[0]?.vendorData?.zipcode
              : labelItem?.item?.buyerInformation[0]?.postalCode,
            labelItem?.item?.sellerInformation?.zipcode,
          ) && (
              <TouchableOpacity
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 16,
                  alignSelf: 'center',
                  flexDirection: 'row',
                }}
                onPress={() =>
                  printCustomsDocument(labelItem.item, labelItem.index)
                }>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    fontSize: 18,
                    alignSelf: 'center',
                  }}>
                  {textContent.MySales.customs_document}
                </Text>
              </TouchableOpacity>
            )}
          {isCustomsCorreosShipment(
            labelItem?.item?.buyerInformation[0]?.vendorData
              ? labelItem?.item?.buyerInformation[0]?.vendorData?.zipcode
              : labelItem?.item?.buyerInformation[0]?.postalCode,
            labelItem?.item?.sellerInformation?.zipcode,
          ) && (
              <TouchableOpacity
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 16,
                  alignSelf: 'center',
                  flexDirection: 'row',
                }}
                onPress={() =>
                  printCustomsDocument(labelItem.item, labelItem.index, true)
                }>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    fontSize: 18,
                    alignSelf: 'center',
                  }}>
                  {textContent.MySales.customs_cn23}
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </Dialog>

      <Dialog
        visible={taxNumberPopup}
        onTouchOutside={() => setTaxNumberPopup(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          width: '95%',
          backgroundColor: colors.secondaryBackground,
          alignSelf: 'center',
        }}>
        <View style={{ height: 180, width: '100%' }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.MySales.tax_number}
          </Text>
          <View style={{ marginTop: 7 }}>
            <TextInput
              style={[styles.textInput(colors)]}
              placeholderTextColor={colors.primaryTextColor}
              //  placeholder={textContent.AlbumDetails.report_text}
              value={taxNumber}
              onChangeText={setTaxNumber}
            />
          </View>
          <View
            style={{
              flex: 2.5,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  height: 30,

                  borderRadius: 15,
                  backgroundColor: colors.secondaryBackground,
                  elevation: 2,
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  overflow: 'hidden',
                }}
                onPress={() => {
                  cancelOrder(
                    currentSelectedAlbum.item,
                    currentSelectedAlbum.index,
                  );
                }}>
                <View
                  style={{
                    backgroundColor: darkMode
                      ? colors.gray + 'aa'
                      : colors.premiumGrayOne + '90',
                    height: '100%',

                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                  }}>
                  <Image
                    resizeMode="contain"
                    style={{
                      height: 15,
                      width: 15,
                      padding: 2,
                      alignSelf: 'center',
                      tintColor: colors.red,
                      marginRight: 5,
                    }}
                    source={imagepath.warning}></Image>

                  <Text
                    style={{
                      color: darkMode ? colors.black : colors.primaryTextColor,
                      fontSize: 14,
                      letterSpacing: 0.5,
                      paddingVertical: 2,
                      fontFamily: fontFamily.MontserratRegular,
                    }}>
                    {textContent.MySales.cancel}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MainButton
                title={textContent.MySales.button_text_one}
                style={{
                  width: '90%',
                  height: 30,
                  borderRadius: 20,
                  backgroundColor: colors.secondaryBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  shadowColor: colors.shadowColor,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                }}
                onPress={() => {
                  if (!ValidateSpanishID(taxNumber).valid) {
                    toast.show(textContent.MySales.alert_tax_number);
                    return;
                  }
                  setSpinner(true);
                  if (taxNumber !== '') {
                    let jsonData = { taxNumber };
                    editUserProfile(jsonData)
                      .then(response => {
                        if (response.status === 'success') {
                          updateUserDetails({
                            prop: 'profileDetails',
                            value: response?.user,
                          });
                          shipmentPreRegistration(
                            currentSelectedAlbum.item,
                            currentSelectedAlbum.index,
                          );
                        } else {
                          setSpinner(false);
                          toast.show(textContent.general.general_error);
                        }
                      })
                      .catch(error => {
                        setSpinner(false);
                        toast.show(textContent.general.general_error);
                      });
                  } else {
                    setSpinner(false);
                    toast.show(textContent.MySales.enter_tax_number);
                  }
                }}
              />
            </View>
          </View>
          <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity
              style={{ alignSelf: 'center', marginTop: 5 }}
              onPress={() => {
                setTaxNumberPopup(false);
              }}>
              <Text
                style={{
                  color: colors.primaryTextColor,

                  letterSpacing: 0.5,
                  paddingVertical: 2,
                  fontFamily: fontFamily.MontserratRegular,
                  fontSize: 13,
                }}>
                {textContent.MySales.will_do_later}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>

      <SearchBar
        userReducer={userReducer}
        helpEnabled={true}
        helpPress={() => { }}
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.MySales.search_text
        }
        onBackPress={() => {
          ProfileNavigation.pop();
        }}
      />

      {renderPage()}
      <ProgressLoader
        visible={spinner}
        isHUD={true}
        isModal={true}
        color={colors.spinner}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  checkbox: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    padding: 2,
  },
  title: colors => ({
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: colors.blue,
    fontFamily: fontFamily.MontserratMedium,
  }),
  textInput: colors => ({
    fontFamily: fontFamily.MontserratRegular,
    fontSize: 16,

    padding: 10,
    backgroundColor: colors.primaryBackground,
    borderColor: colors.premiumGrayOne,
    color: colors.primaryTextColor,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, { updateUserDetails })(MySales);
