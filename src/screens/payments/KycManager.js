import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Keyboard,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {TouchableOpacity as AnotherTouchableOpacity} from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Dialog} from 'react-native-simple-dialogs';
import imagepath from '../../utils/Images';
import textContent from '../../utils/textContent';
import fontFamily from '../../utils/FontFamily';

import {
  createKycDocument,
  submitKycDocument,
  uploadKycDocument,
} from '../../actions/_MangoPay';
import {useToast} from 'react-native-toast-notifications';
import ProgressLoader from '../../components/ProgressLoader';

import {normalize} from '../../components/NormalizeFonts';
import {DarkModeContext} from '../../components/DarkModeContext';
import {MainButton} from '../../components/MainButton';

import * as ProfileNavigation from '../../router/_ProfileNavigation';

import persistStorage from '../../redux/store/persistStore';
import ModalSelector from '../../components/ModalSelectorInput';

import OneSignal from 'react-native-onesignal';
import {ONESIGNALAPPID} from '../../utils/keys';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  editUserProfile,
  shareCodeCheckFunction,
  sendKycDocumentResults,
} from '../../actions/UserAPI';
import {connect} from 'react-redux';
import {updateUserDetails} from '../../redux/actions/UserAction';

import {updateUserData} from '../../redux/reducers/PersistReducer';
import {
  compareTwilloOTP,
  userRegistrationWhatsAppOTP,
} from '../../actions/LoginAPI';

import {SearchBar} from '../../components/SearchBar';

import {
  getCitiesOfSelectedCountry,
  getCountriesList,
} from '../../actions/SaleFlowAPI';
import {useKeyboard} from '../../utils/UseKeyBoard';
import {
  changeToNumber,
  checkPostalCodeInSpain,
  ValidateSpanishID,
} from '../../actions/HelperFunctions';

import PhoneInput from 'react-native-phone-number-input';

import {updateNaturalUser} from '../../actions/_MangoPay';
import DOBPicker from '../../components/DobPicker';
import {getCode} from 'iso-3166-1-alpha-2';

import OTPButton from '../../components/OtpButton';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import StepIndicator from 'react-native-step-indicator';

let {getHash, startOtpListener, removeListener} = {};

if (Platform.OS === 'android') {
  ({
    getHash,
    startOtpListener,
    removeListener,
  } = require('../../actions/_OtpVerify/otpVerify.android'));
} else {
  ({
    getHash,
    startOtpListener,
    removeListener,
  } = require('../../actions/_OtpVerify/otpVerify.ios'));
}
//PROVISION FOR MULTIPLE FILE SELECTION IS ADDED. NEED SOME CHANGES TO CODE NEEDED

export const KycManager = ({
  userReducer,
  updateUserDetails,
  validationAsked,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [validating, setValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [firstName, setFirstName] = useState(
    userReducer?.profileDetails?.firstName,
  );
  const [lastName, setLastName] = useState(
    userReducer?.profileDetails?.lastName,
  );
  const [email, setEmail] = useState(userReducer?.profileDetails?.email);
  const [mobileNumber, setMobileNumber] = useState(
    userReducer?.profileDetails?.mobileNumber?.toString(),
  );

  const [province, setProvince] = useState(
    userReducer?.profileDetails?.province?.toString(),
  );

  const [postalCode, setPostalCode] = useState(
    userReducer?.profileDetails?.postalCode,
  );

  const [taxNumber, setTaxNumber] = useState(
    userReducer?.profileDetails?.taxNumber,
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    userReducer?.profileDetails?.deliveryAddress,
  );
  const [alternativeAddress, setAlternativeAddress] = useState(
    userReducer?.profileDetails?.alternativeAddress,
  );
  const [shareCode, setShareCode] = useState(
    userReducer?.profileDetails?.shareCode,
  );
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(true);
  const [verify, setVerify] = useState(false);
  const [userId, setUserId] = useState(userReducer?.profileDetails?._id);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(userReducer?.profileDetails?.country);

  const [nationality, setNationality] = useState(
    userReducer?.profileDetails?.nationality,
  );
  const [citiesList, setCitiesList] = useState([]);
  const [city, setCity] = useState(userReducer?.profileDetails?.city);
  const [shareCodeError, setShareCodeError] = useState(false);

  const [countryCodeNumber, setCountryCodeNumber] = useState(
    userReducer?.profileDetails?.countryCodeNumber,
  );
  const [verifiedMobile, setVerifiedMobile] = useState(
    userReducer?.profileDetails?.mobileNumber?.toString(),
  );
  const [mobileOtp, setMobileOtp] = useState('');
  const [value, setValue] = useState(
    userReducer?.profileDetails?.mobileNumber?.toString(),
  );
  const [formattedValue, setFormattedValue] = useState('');
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [dobPicker, setDobPicker] = useState(false);
  const [dob, setDob] = useState(userReducer?.profileDetails?.dob);
  const phoneInput = useRef(null);

  const mobileNumberRef = useRef('');

  useEffect(() => {
    mobileNumberRef.current = mobileNumber;
  }, [mobileNumber]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      startOtpListener(message => {
        const otpPattern = /\b\d{6}\b/;
        const match = message.match(otpPattern);
        const otp = match ? match[0] : null;

        if (otp) {
          setMobileOtp(otp);
          confirmMobileOtpValidation(otp);
        } else {
          toast.show(textContent.general.general_error);
        }
      });

      return () => {
        removeListener();
      };
    }
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    getCountriesList()
      .then(response => {
        setCountries(
          response.map(value => {
            return {label: value._id};
          }),
        );
      })
      .catch(error => {});

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (country !== '') {
      getCitiesOfSelectedCountry(country)
        .then(response => {
          setCitiesList(
            response
              .map(value => ({label: value?.name})) // map to new array of objects with label property
              .filter((value, index, self) => {
                return (
                  index === self.findIndex(obj => obj?.label === value?.label)
                ); // keep only the first occurrence of each label
              }),
          );
        })
        .catch(error => {});
    }
  }, [country]);

  useEffect(() => {
    OneSignal.setAppId(ONESIGNALAPPID);
  }, []);

  const validateIsEmail = email => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.primaryBackgroundColor,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 5,
      color: colors.primaryTextColor,
      fontFamily: fontFamily.MontserratMedium,
    },
    section: {
      flex: 1,
      minHeight: !validating ? 200 : 200,
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: colors.primaryButtonColor,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    buttonText: {
      fontSize: 18,
      color: colors.black,
    },
    coverImagesList: {
      marginTop: 16,
    },
    coverImageContainer: {
      marginRight: 16,
    },
    coverImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    deleteIcon: {
      position: 'absolute',
      top: -5,
      right: -5,
    },
    deleteIcon: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: colors.gray,
      padding: 5,
      borderRadius: 10,
      zIndex: 1,
    },
    deleteIconImage: {
      width: 20,
      height: 20,
      tintColor: colors.primaryTextColor + '90',
    },
    selectPdfButton: {
      backgroundColor: '#0099ff',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    selectPdfText: {
      color: colors.primaryTextColor,
      fontSize: 18,
    },
    pdfDocsList: {
      minHeight: 100,
      marginTop: 10,
    },
    pdfDocContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardColor,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginVertical: 5,
      borderRadius: 5,
    },
    pdfIcon: {
      width: 30,
      height: 30,
      marginRight: 10,
      tintColor: colors.primaryTextColor + '90',
    },
    pdfDetails: {
      flex: 1,
    },
    pdfName: {
      fontSize: 16,

      width: 200,
      color: colors.primaryTextColor + 'dd',
      fontFamily: fontFamily.MontserratBold,
    },
    pdfSize: {
      fontSize: 14,
      color: colors.gray,
      fontFamily: fontFamily.MontserratRegular,
    },
    textAreaContainer: colors => ({
      width: '100%',
      justifyContent: 'center',
      borderRadius: 16,
      marginTop: 7,
      marginBottom: 0,
      borderRadius: 8,
      backgroundColor: colors.searchBarColor,
      borderWidth: 1,
      borderColor: colors.borderColor + '90',
    }),
    borderStyleBase: colors => ({
      width: 30,
      height: 45,
      backgroundColor: colors.red,
    }),

    borderStyleHighLighted: {},

    underlineStyleBase: colors => ({
      width: 45,
      height: 45,

      backgroundColor: colors.searchBarColor,
      borderWidth: 1,
      borderColor: colors.borderColor + '90',
      color: colors.primaryTextColor,
      fontSize: 18,
    }),
    textArea: colors => ({
      height: 150,
      width: '75%',
      fontFamily: fontFamily.MontserratRegular,
      fontSize: 16,
      letterSpacing: 0.5,
      backgroundColor: colors.transparent,
      textAlignVertical: 'top',
      color: colors.primaryTextColor,
      paddingLeft: 10,
      justifyContent: 'flex-start',
    }),
    underlineStyleHighLighted: {},
  });
  const [help, setHelp] = useState(false);
  const [proofUris, setProofUris] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [documentPicker, setDocumentPicker] = useState(false);
  const [secondStep, setSecondStep] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      userReducer?.profileDetails?.kycIdentityInfo?.length > 0 &&
      validationAsked
    ) {
      setCurrentStep(2);
      setValidating(true);
      setPdfDocs([
        {
          type: userReducer?.profileDetails?.kycIdentityInfo[0].type
            ? userReducer?.profileDetails?.kycIdentityInfo[0].type
            : 'image',
          file: {
            uri: null,
            name: userReducer?.profileDetails?.kycIdentityInfo[0].filename,
            size: userReducer?.profileDetails?.kycIdentityInfo[0]?.size,
          },
        },
      ]);
    } else {
      if (secondStep) {
        setCurrentStep(1);
      } else {
        setCurrentStep(0);
      }
    }
    setLoading(false);
  }, [
    userReducer?.profileDetails?.kycIdentityInfo,
    userReducer?.profileDetails?.MangoPayUserInformation?.UserCategory,
  ]);

  const bytesToKB = bytes => {
    return (bytes / 1024).toFixed(2);
  };

  const isSizeInRange = bytes => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return kb >= 32 && mb <= 8;
  };
  const handlePDFSelect = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      let data = [...pdfDocs];
      results.map(result => {
        data.push({
          type: 'pdf',
          file: {
            uri: result.uri,
            name: result.name,
            size: result.size,
          },
        });
      });

      setPdfDocs(data);
    } catch (err) {}
  };

  const handlePDFDelete = index => {
    const newPdfDocs = [...pdfDocs];
    newPdfDocs.splice(index, 1);
    setPdfDocs(newPdfDocs);
  };

  const renderPdfDoc = ({item, index}) => {
    return (
      <View style={styles.pdfDocContainer}>
        <Image
          source={
            item?.type == 'image' ? imagepath.document : imagepath.pdfdocument
          }
          style={styles.pdfIcon}
        />
        <View style={styles.pdfDetails}>
          <Text numberOfLines={1} style={styles.pdfName}>
            {item?.file?.name}
          </Text>
          <Text style={styles.pdfSize}>{bytesToKB(item?.file?.size)} KB</Text>
        </View>

        <TouchableOpacity
          disabled={validating}
          style={{width: 30, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => handlePDFDelete(index)}>
          <Image
            resizeMode="contain"
            source={!validating ? imagepath.cross : imagepath.check}
            style={styles.deleteIconImage}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const pickImageFromGallery = async callback => {
    try {
      const response = await ImagePicker.openPicker({
        cropping: true,
      });
      callback({
        uri: response.path,
        name: response.path.split('/').pop(),
        size: response.size,
      });
    } catch (error) {}
  };

  const takePhotoFromCamera = async callback => {
    try {
      const response = await ImagePicker.openCamera({
        cropping: true,
      });

      callback({
        uri: response.path,
        name: response.path.split('/').pop(),
        size: response.size,
      });
    } catch (error) {}
  };

  const addImageData = file => {
    setPdfDocs([...pdfDocs, {type: 'image', file}]);
  };

  // const uploadDocumentAsBase64 = async (doc) => {
  //   try {
  //     const response = await fetch(pdfDocs[0]?.file?.uri);
  //     const blob = await response.blob();
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64data = reader.result;

  //       createKycDocument('IDENTITY_PROOF', userReducer)
  //         .then(value => {
  //           if (value?.data?.Status == 'CREATED') {
  //             let jsonData = { File: base64data.split(';base64,')[1] };
  //             uploadKycDocument(jsonData, value?.data?.Id, userReducer)
  //               .then(res => {
  //                 submitKycDocument(value?.data?.Id, userReducer)
  //                   .then(resValue => {
  //                     if (resValue?.data?.Status == 'VALIDATION_ASKED') {

  //                     } else {
  //                       toast.show(textContent.general.general_error);
  //                       updateUserDetails({ prop: 'spinner', value: false });
  //                     }
  //                   })
  //                   .catch(errValue => {
  //                     updateUserDetails({ prop: 'spinner', value: false });
  //                     toast.show(textContent.general.general_error);
  //                   });
  //               })
  //               .catch(error => {
  //                 updateUserDetails({ prop: 'spinner', value: false });
  //                 toast.show(textContent.general.general_error);
  //               });
  //           }
  //         })
  //         .catch(err => {
  //           updateUserDetails({ prop: 'spinner', value: false });
  //           toast.show(textContent.general.general_error);
  //         });
  //     };
  //     reader.readAsDataURL(blob);
  //   } catch (error) {
  //     updateUserDetails({ prop: 'spinner', value: false });
  //     toast.show(textContent.general.general_error);
  //   }
  // };

  // async function uploadAndCheckDocuments() {
  //   try {
  //     const response1 = await uploadDocumentAsBase64(doc1);
  //     const response2 = await uploadDocumentAsBase64(doc2);

  //     if (
  //       response1?.data?.Status === 'VALIDATION_ASKED' &&
  //       response2?.data?.Status === 'VALIDATION_ASKED'
  //     ) {
  //       // Both responses have 'VALIDATION_ASKED', call another function here.
  //       anotherFunction();
  //     } else {
  //       // Handle the case where at least one response doesn't have 'VALIDATION_ASKED'.
  //       toast.show(textContent.general.general_error);
  //       updateUserDetails({ prop: 'spinner', value: false });
  //     }
  //   } catch (error) {
  //     updateUserDetails({ prop: 'spinner', value: false });
  //     toast.show(textContent.general.general_error);
  //   }
  // }

  async function uploadAndCheckDocuments(documents) {
    try {
      let value = await createKycDocument('IDENTITY_PROOF', userReducer);
     
      const responses = await Promise.all(
        documents.map(async doc => await uploadDocumentAsBase64(doc, value)),
      );
   
      if (responses.every(response => response.status == 204)) {
        // All responses have 'VALIDATION_ASKED', call another function here.
        
        submitKycDocument(value?.data?.Id, userReducer)
          .then(resValue => {
            if (resValue?.data?.Status === 'VALIDATION_ASKED') {
              onSuccess(value); // Resolve with the response when 'VALIDATION_ASKED'
            } else {
              toast.show(textContent.general.general_error);
              updateUserDetails({prop: 'spinner', value: false});
            }
          })
          .catch(errValue => {
            toast.show(textContent.general.general_error);
            updateUserDetails({prop: 'spinner', value: false});
          });
      } else {
        // Handle the case where at least one response doesn't have 'VALIDATION_ASKED'.
        toast.show(textContent.general.general_error);
        updateUserDetails({prop: 'spinner', value: false});
      }
    } catch (error) {
    
      updateUserDetails({prop: 'spinner', value: false});
      toast.show(textContent.general.general_error);
    }
  }

  const uploadDocumentAsBase64 = async (doc, value) => {
    try {
      const response = await fetch(doc.file.uri);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result;

          if (value?.data?.Status === 'CREATED') {
            let jsonData = {File: base64data.split(';base64,')[1]};
            uploadKycDocument(jsonData, value?.data?.Id, userReducer)
              .then(res => {
           
                resolve(res);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            reject(new Error('Status is not CREATED'));
          }
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const onSuccess = async (value) => {
    const data = pdfDocs.map((doc, index) => ({
      kycDocumentId: value?.data?.Id,
      filename: doc?.file?.name,
      size: doc?.file?.size,
      type: doc?.type,
    }));

    const jsonData = {
      identityInfo: data,
    };

    sendKycDocumentResults(jsonData)
      .then(resData => {
        if (resData.data.status === 'success') {
          updateUserDetails({
            prop: 'profileDetails',
            value: resData?.data?.user,
          });
          setCurrentStep(2);
          setValidating(true);

          const updatedPdfDocs = resData?.data?.user?.kycIdentityInfo.map(
            info => ({
              type: info.type ? info.type : 'image',
              file: {
                uri: null,
                name: info.filename,
                size: info.size,
              },
            }),
          );

          setPdfDocs(updatedPdfDocs);
          toast.show(textContent.payments.KycManager.kyc_updated);
        } else {
          toast.show(textContent.general.general_error);
        }
        updateUserDetails({prop: 'spinner', value: false});
      })
      .catch(errData => {
        toast.show(textContent.general.general_error);
        updateUserDetails({prop: 'spinner', value: false});
      });
  };

  // const onSuccess = async()=>{

  //   let data = [
  //     {
  //       kycDocumentId: value?.data?.Id,
  //       filename: pdfDocs[0]?.file?.name,
  //       size: pdfDocs[0]?.file?.size,
  //       type: pdfDocs[0]?.type,
  //     }]
  //     if(pdfDocs.length==2)
  //     {
  //       data.push( {
  //         kycDocumentId: value?.data?.Id,
  //         filename: pdfDocs[1]?.file?.name,
  //         size: pdfDocs[1]?.file?.size,
  //         type: pdfDocs[1]?.type,
  //       })
  //     }
  //   let jsonData = {
  //     identityInfo:data

  //   };
  //   sendKycDocumentResults(jsonData)
  //     .then(resData => {
  //       if (resData.data.status == 'success') {
  //         updateUserDetails({
  //           prop: 'profileDetails',
  //           value: resData?.data?.user,
  //         });
  //         setCurrentStep(2);
  //         setValidating(true);
  //         let data =[
  //           {
  //             type: resData?.data?.user?.kycIdentityInfo[0]
  //               .type
  //               ? resData?.data?.user?.kycIdentityInfo[0]
  //                 .type
  //               : 'image',
  //             file: {
  //               uri: null,
  //               name: resData?.data?.user
  //                 ?.kycIdentityInfo[0].filename,
  //               size: resData?.data?.user
  //                 ?.kycIdentityInfo[0]?.size,
  //             },
  //           },
  //         ]

  //         if( resData?.data?.user
  //           ?.kycIdentityInfo.length==2)
  //           {
  //             data.push( {
  //               type: resData?.data?.user?.kycIdentityInfo[1]
  //                 .type
  //                 ? resData?.data?.user?.kycIdentityInfo[1]
  //                   .type
  //                 : 'image',
  //               file: {
  //                 uri: null,
  //                 name: resData?.data?.user
  //                   ?.kycIdentityInfo[1].filename,
  //                 size: resData?.data?.user
  //                   ?.kycIdentityInfo[1]?.size,
  //               },
  //             })
  //           }
  //         setPdfDocs(data);
  //         toast.show(
  //           textContent.payments.KycManager.kyc_updated,
  //         );
  //       } else {
  //         toast.show(textContent.general.general_error);
  //       }
  //       updateUserDetails({ prop: 'spinner', value: false });
  //     })
  //     .catch(errData => {
  //       toast.show(textContent.general.general_error);
  //       updateUserDetails({ prop: 'spinner', value: false });
  //     });
  // }

  const handleRegistration = async () => {
    if (firstName == '') {
      toast.show(textContent.EditProfile.alert_firstname);
      return;
    }

    if (lastName == '') {
      toast.show(textContent.EditProfile.alert_lastname);
      return;
    }

    if (email == '' || !validateIsEmail(email)) {
      toast.show(textContent.EditProfile.alert_email);
      return;
    }

    if (deliveryAddress == '') {
      toast.show(textContent.EditProfile.alert_address);
      return;
    }
    if (dob == '') {
      toast.show(textContent.general.eighteen_plus);
      return;
    }

    if (nationality == '') {
      toast.show(textContent.EditProfile.alert_nationality);
      return;
    }

    if (city == '') {
      toast.show(textContent.EditProfile.alert_city);
      return;
    }

    if (country == '') {
      toast.show(textContent.EditProfile.alert_country);
      return;
    }
    let postalCodeCheck = checkPostalCodeInSpain(postalCode);
    if (postalCode == '' || !postalCodeCheck) {
      toast.show(textContent.EditProfile.alert_postalcode);
      return;
    }

    const islandsPattern = /^(07|35|38|51|52)\d{3}$/;
    if (islandsPattern.test(postalCode)) {
      toast.show(textContent.Registration.alert_postalcode_islands);
      return;
    }

    const countryCode = getCode(country);
    const nationalityCode = getCode(nationality);
    const [day, month, year] = dob.split('/'); // split the date string into day, month, and year
    const utcSeconds = Date.UTC(year, month - 1, day) / 1000; // convert the date to UTC milliseconds

    try {
      let jsonData = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Address: {
          AddressLine1: deliveryAddress,

          City: city,
          Region: province !== '' ? province : city,
          PostalCode: postalCode,
          Country: countryCode ? countryCode : 'ES',
        },
        Birthday: utcSeconds,
        Nationality: nationalityCode ? nationalityCode : 'ES',
        CountryOfResidence: countryCode ? countryCode : 'ES',
        Tag: 'Waxplace User',
        TermsAndConditionsAccepted: true,
        UserCategory: 'OWNER',
      };
      updateUserDetails({prop: 'spinner', value: true});
      let response = await updateNaturalUser(
        jsonData,
        userReducer.profileDetails.paymentDetails.mangopayCustomerId,
      );
      if (response.data) {
        delete jsonData.Tag;
        editUserProfile({MangoPayUserInformation: jsonData})
          .then(response => {
            if (response.status == 'success') {
              setSecondStep(true);
              updateUserDetails({
                prop: 'cartLength',
                value: response?.user?.cart?.length,
              });
              updateUserDetails({
                prop: 'profileDetails',
                value: response?.user,
              });

              toast.show(response.message);
              updateUserDetails({prop: 'spinner', value: false});
            } else {
              updateUserDetails({prop: 'spinner', value: false});
            }
          })
          .catch(err => {
            updateUserDetails({prop: 'spinner', value: false});
          });
      } else {
        updateUserDetails({prop: 'spinner', value: false});
      }
    } catch (error) {
      updateUserDetails({prop: 'spinner', value: false});
      toast.show(textContent.general.general_error);
    }
  };
  const customStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    separatorStrokeUnfinishedWidth: 0,
    separatorStrokeFinishedWidth: 0,
    currentStepStrokeWidth: 5,
    stepStrokeWidth: 0,
    stepStrokeCurrentColor: '#4aae4f',
    stepStrokeFinishedColor: '#a4d4a5',
    stepStrokeUnFinishedColor: '#a4d4a5',
    separatorFinishedColor: '#a4d4a5',
    separatorUnFinishedColor: '#a4d4a5',
    stepIndicatorFinishedColor: '#a4d4a5',
    stepIndicatorUnFinishedColor: '#a4d4a5',
    stepIndicatorCurrentColor: '#4aae4f',
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: colors.primaryTextColor,
    stepIndicatorLabelFinishedColor: colors.primaryTextColor,
    stepIndicatorLabelUnFinishedColor: colors.primaryTextColor,
    labelColor: colors.primaryTextColor,
    labelSize: 13,
    labelAlign: 'center',
    currentStepLabelColor: '#4aae4f',
  };

  return (
    <View style={{flex: 1, width: '100%'}}>
      <Dialog
        visible={help}
        onTouchOutside={() => setHelp(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          width: '100%',
          backgroundColor: colors.secondaryBackground,
          alignSelf: 'center',
        }}>
        <View>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 16,
              fontFamily: fontFamily.MontserratBold,
            }}>
            {textContent.payments.KycManager.kyc}
          </Text>
          <Text
            style={{
              marginTop: 5,
              color: colors.primaryTextColor,
              fontSize: 13,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.payments.KycManager.kyc_info}
          </Text>
        </View>
        {!validating && (
          <View style={{marginTop: 10}}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 16,
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.payments.KycManager.required_document}
            </Text>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratBold,
              }}>
              {textContent.payments.KycManager.identity_proof}
            </Text>
            <Text
              style={{
                marginTop: 5,
                color: colors.primaryTextColor,
                fontSize: 15,
                fontFamily: fontFamily.MontserratRegular,
              }}>
              {textContent.payments.KycManager.identity_proof_info}
            </Text>
            <Text
              style={{
                marginTop: 15,
                color: colors.primaryTextColor,
                fontSize: 14,
                fontFamily: fontFamily.MontserratMedium,
                lineHeight: 18,
                //  alignSelf: 'flex-end',
              }}>
              {textContent.payments.KycManager.file_size_info}
            </Text>
          </View>
        )}
      </Dialog>
      <Dialog
        visible={documentPicker}
        onTouchOutside={() => setDocumentPicker(false)}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 12,
          width: '90%',
          backgroundColor: colors.secondaryBackground,
          alignSelf: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            borderRadius: 10,

            alignItems: 'center',

            justifyContent: 'center',
            alignSelf: 'center',
          }}>
          <TouchableOpacity
            style={{
              //  width: '100%',
              justifyContent: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  takePhotoFromCamera(addImageData);
                }, 1000);
              } else {
                takePhotoFromCamera(addImageData);
              }
              setDocumentPicker(false);
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.payments.KycManager.camera}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              //  width: '100%',
              justifyContent: 'center',
              marginTop: normalize(15),
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  pickImageFromGallery(addImageData);
                }, 1000);
              } else {
                pickImageFromGallery(addImageData);
              }
              setDocumentPicker(false);
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.payments.KycManager.gallery}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              // width: '100%',
              justifyContent: 'center',
              marginTop: normalize(15),
              alignSelf: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              setDocumentPicker(false);
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  handlePDFSelect();
                }, 1000);
              } else {
                handlePDFSelect();
              }
            }}>
            <Text
              style={{
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                fontSize: normalize(22),
                alignSelf: 'center',
              }}>
              {textContent.payments.KycManager.select_pdf}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: useKeyboard()}}>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            marginBottom: 30,
          }}>
          <StepIndicator
            customStyles={customStyles}
            currentPosition={currentStep}
            labels={['User Info', 'Kyc Updation', 'Wait for Confirmation']}
            stepCount={3}
            direction="horizontal"
            // renderLabel={({position}) => (
            //   <Text
            //     style={
            //       position === currentStep
            //         ? styles.stepLabelSelected
            //         : styles.stepLabel
            //     }>
            //     {/* {labels[position]} */}
            //   </Text>
            // )}
            //onPress={position => setCurrentStep(position)}
          />
        </View>
        {currentStep == 0 && !loading ? (
          <View
            style={{
              flex: 1,
              width: '100%',
            }}>
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                // height: height - height * 0.28 - 25,
              }}>
              <View style={{width: '100%', flexDirection: 'row', marginTop: 0}}>
                <View style={{width: '50%'}}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 12,
                      alignSelf: 'flex-start',
                      marginLeft: 10,
                      // marginTop: 12,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.EditProfile.first_name}
                  </Text>
                  <View
                    style={{
                      width: '98%',
                      marginTop: 7,
                      height: 45,
                      alignItems: 'center',
                      alignContent: 'center',
                      borderRadius: 8,
                      backgroundColor: colors.searchBarColor,
                      borderWidth: 1,
                      borderColor: colors.borderColor + '90',
                    }}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 18,
                        paddingLeft: 12,
                        letterSpacing: 1,
                        color: colors.primaryTextColor,
                        alignSelf: 'center',
                        fontFamily: fontFamily.MontserratRegular,
                        backgroundColor: colors.transparent,
                      }}
                      value={firstName}
                      //  placeholder={'First Name'}
                      onChangeText={value => setFirstName(value)}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>
                <View style={{width: '50%', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 12,
                      alignSelf: 'flex-start',
                      marginLeft: 10,
                      // marginTop: 12,
                      fontFamily: fontFamily.MontserratMedium,
                    }}>
                    {textContent.EditProfile.last_name}
                  </Text>
                  <View
                    style={{
                      width: '95%',
                      marginTop: 7,
                      // marginLeft: 10,
                      height: 45,
                      alignItems: 'center',
                      alignContent: 'center',
                      borderRadius: 8,
                      backgroundColor: colors.searchBarColor,
                      borderWidth: 1,
                      borderColor: colors.borderColor + '90',
                    }}>
                    <TextInput
                      style={{
                        width: '95%',
                        height: '100%',
                        fontSize: 18,
                        paddingLeft: 12,
                        letterSpacing: 1,
                        color: colors.primaryTextColor,
                        fontFamily: fontFamily.MontserratRegular,
                        alignSelf: 'center',
                        backgroundColor: colors.transparent,
                      }}
                      value={lastName}
                      //  placeholder={'Last Name'}
                      onChangeText={value => setLastName(value)}
                      placeholderTextColor={
                        colors.primaryTextColor
                      }></TextInput>
                  </View>
                </View>
              </View>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.email}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 45,
                  marginTop: 7,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                  flexDirection: 'row',
                }}>
                <View style={{flex: 6, height: '100%'}}>
                  <TextInput
                    style={{
                      width: '100%',
                      height: '100%',
                      fontSize: 16,
                      paddingLeft: 12,
                      letterSpacing: 1,

                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratRegular,
                      alignSelf: 'center',
                      backgroundColor: colors.transparent,
                    }}
                    value={email}
                    editable={false}
                    placeholderTextColor={colors.primaryTextColor}></TextInput>
                </View>
                <View
                  style={{
                    width: 45,
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={imagepath.check}
                    resizeMode={'contain'}
                    style={{
                      height: 20,
                      width: 20,
                      tintColor: colors.successGreen,
                    }}
                  />
                </View>
              </View>

              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.address}
              </Text>
              <View style={styles.textAreaContainer(colors)}>
                <TextInput
                  value={deliveryAddress}
                  style={styles.textArea(colors)}
                  underlineColorAndroid="transparent"
                  onChangeText={value => setDeliveryAddress(value)}
                  placeholderTextColor={colors.primaryTextColor}
                  numberOfLines={10}
                  multiline={true}
                />
              </View>

              <DOBPicker
                setDateOfBirth={dob => {
                  setDob(dob);
                }}
                dobPicker={dobPicker}
                setDobPicker={dobPicker => {
                  setDobPicker(dobPicker);
                }}
              />

              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.dob}
              </Text>
              {Platform.OS == 'android' ? (
                <TouchableOpacity
                  style={{
                    width: '100%',
                    marginTop: 7,
                    // marginLeft: 10,
                    height: 45,
                    alignItems: 'center',
                    alignContent: 'center',
                    borderRadius: 8,
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                  }}
                  onPress={() => {
                    setDobPicker(true);
                  }}>
                  <TextInput
                    style={{
                      width: '100%',
                      height: '100%',
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratRegular,
                      paddingLeft: 10,
                      fontSize: 16,
                      letterSpacing: 0.5,
                      backgroundColor: colors.transparent,
                      paddingLeft: 10,
                    }}
                    editable={false}
                    placeholder={dob !== '' ? dob : ''}
                    placeholderTextColor={colors.primaryTextColor}
                    value={dob}
                  />
                </TouchableOpacity>
              ) : (
                <AnotherTouchableOpacity
                  style={{
                    width: '100%',
                    marginTop: 7,
                    // marginLeft: 10,
                    height: 45,
                    alignItems: 'center',
                    alignContent: 'center',
                    borderRadius: 8,
                    backgroundColor: colors.searchBarColor,
                    borderWidth: 1,
                    borderColor: colors.borderColor + '90',
                  }}
                  onPress={() => {
                    setDobPicker(true);
                  }}>
                  <TextInput
                    style={{
                      width: '100%',
                      height: '100%',
                      color: colors.primaryTextColor,
                      fontFamily: fontFamily.MontserratRegular,
                      paddingLeft: 10,
                      fontSize: 16,
                      letterSpacing: 0.5,
                      backgroundColor: colors.transparent,
                      paddingLeft: 10,
                    }}
                    editable={false}
                    placeholder={dob !== '' ? dob : ''}
                    placeholderTextColor={colors.primaryTextColor}
                    value={dob}
                  />
                </AnotherTouchableOpacity>
              )}

              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.nationality}
              </Text>
              <View
                style={{
                  width: '100%',
                  marginTop: 7,
                  // marginLeft: 10,
                  height: 45,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                }}>
                {(countries?.length > 0 || nationality !== '') && (
                  <ModalSelector
                    colors={colors}
                    listType={Platform.OS == 'android' ? 'FLATLIST' : ''}
                    initialNumToRender={10}
                    data={countries}
                    style={{width: '100%'}}
                    initValue={textContent.EditProfile.select_country}
                    searchText={textContent.general.search}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={item => {
                      setNationality(item.label);
                    }}>
                    <TextInput
                      style={{
                        width: '100%',
                        height: '100%',
                        color: colors.primaryTextColor,
                        fontFamily: fontFamily.MontserratRegular,
                        paddingLeft: 10,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        backgroundColor: colors.transparent,
                        paddingLeft: 10,
                      }}
                      editable={false}
                      placeholder={nationality !== '' ? nationality : ''}
                      placeholderTextColor={colors.primaryTextColor}
                      value={nationality}
                    />
                  </ModalSelector>
                )}
              </View>

              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.country}
              </Text>
              <View
                style={{
                  width: '100%',
                  marginTop: 7,
                  // marginLeft: 10,
                  height: 45,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                }}>
                {(countries?.length > 0 || country !== '') && (
                  <ModalSelector
                    disabled={true}
                    colors={colors}
                    listType={Platform.OS == 'android' ? 'FLATLIST' : ''}
                    initialNumToRender={10}
                    data={countries}
                    style={{width: '100%'}}
                    initValue={textContent.EditProfile.select_country}
                    searchText={textContent.general.search}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={item => {
                      setCountry(item.label);
                      setCity('');
                    }}>
                    <TextInput
                      style={{
                        width: '100%',
                        height: '100%',
                        color: colors.primaryTextColor,
                        fontFamily: fontFamily.MontserratRegular,
                        paddingLeft: 10,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        backgroundColor: colors.transparent,
                        paddingLeft: 10,
                      }}
                      editable={false}
                      placeholder={country !== '' ? country : ''}
                      placeholderTextColor={colors.primaryTextColor}
                      value={country}
                    />
                  </ModalSelector>
                )}
              </View>
              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.city}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 45,
                  marginTop: 7,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                  flexDirection: 'row',
                }}>
                {(citiesList?.length > 0 || city !== '') && (
                  <ModalSelector
                    colors={colors}
                    listType={'FLATLIST'}
                    initialNumToRender={10}
                    data={citiesList}
                    style={{width: '100%'}}
                    initValue={textContent.EditProfile.select_city}
                    searchText={textContent.general.search}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={item => {
                      setCity(item.label);
                    }}>
                    <TextInput
                      style={{
                        width: '100%',
                        height: '100%',
                        color: colors.primaryTextColor,
                        fontFamily: fontFamily.MontserratRegular,
                        paddingLeft: 10,
                        fontSize: 16,
                        letterSpacing: 0.5,
                        backgroundColor: colors.transparent,
                        paddingLeft: 10,
                      }}
                      editable={false}
                      placeholder={city !== '' ? city : ''}
                      placeholderTextColor={colors.primaryTextColor}
                      value={city}
                    />
                  </ModalSelector>
                )}
              </View>
              {/* <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.EditProfile.province}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor: colors.borderColor+'90',
              shadowColor: colors.black,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
            }}>
            <TextInput
              style={{
                width: '95%',
                height: '100%',
                fontSize: 18,
                paddingLeft: 12,
                letterSpacing: 1,
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
                backgroundColor: colors.transparent,
              }}
              value={province}
              //  placeholder={'Last Name'}
              onChangeText={value => setProvince(value)}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View> */}
              {/* <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 12,
              alignSelf: 'flex-start',
              marginLeft: 10,
              marginTop: 10,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            {textContent.EditProfile.tax_number}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 7,
              // marginLeft: 10,
              height: 45,
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.searchBarColor,
              borderWidth: 1,
              borderColor:  '#c0c0c890',
            }}>
            <TextInput
              style={{
                width: '95%',
                height: '100%',
                fontSize: 18,
                paddingLeft: 12,
                letterSpacing: 1,
                color: colors.primaryTextColor,
                fontFamily: fontFamily.MontserratRegular,
                alignSelf: 'center',
                backgroundColor: colors.transparent,
              }}
              //  keyboardType={'number-pad'}
              value={taxNumber}
              //  placeholder={'Last Name'}
              onChangeText={value => setTaxNumber(value)}
              placeholderTextColor={colors.primaryTextColor}></TextInput>
          </View> */}

              <Text
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 12,
                  alignSelf: 'flex-start',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {textContent.EditProfile.postalcode}
              </Text>
              <View
                style={{
                  width: '100%',
                  marginTop: 7,
                  // marginLeft: 10,
                  height: 45,
                  alignItems: 'center',
                  alignContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.searchBarColor,
                  borderWidth: 1,
                  borderColor: colors.borderColor + '90',
                }}>
                <TextInput
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: 18,
                    paddingLeft: 10,
                    letterSpacing: 1,
                    color: colors.primaryTextColor,
                    fontFamily: fontFamily.MontserratRegular,
                    alignSelf: 'center',
                    backgroundColor: colors.transparent,
                  }}
                  keyboardType={'number-pad'}
                  value={postalCode}
                  //  placeholder={'Last Name'}
                  onChangeText={value => setPostalCode(changeToNumber(value))}
                  placeholderTextColor={colors.primaryTextColor}></TextInput>
              </View>

              <View
                style={{
                  marginTop: 30,
                  height: 70,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    minWidth: '100%',
                    height: 50,
                    backgroundColor: colors.primaryButtonColor,
                    borderRadius: 15,
                    justifyContent: 'center',

                    alignItems: 'center',
                    shadowColor: colors.shadowColor,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                  }}
                  onPress={() => handleRegistration()}>
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: 18,
                      letterSpacing: 1,
                      fontFamily: fontFamily.MontserratMedium,
                      alignSelf: 'center',
                    }}>
                    {textContent.EditProfile.button_text_two}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : !loading ? (
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.title}>
                {textContent.payments.KycManager.kyc_document}
              </Text>
              <TouchableOpacity
                style={{
                  overflow: 'hidden',
                  marginLeft: 2,
                  marginTop: -2,
                }}
                onPress={() => {
                  setHelp(true);
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
                  source={imagepath.questionmark}></Image>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={pdfDocs}
                keyExtractor={(item, index) => `${index}`}
                style={{height: 100, width: '100%'}}
                ListEmptyComponent={
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 35,
                    }}>
                    <Text
                      style={{
                        color: colors.primaryTextColor,
                        fontFamily: fontFamily.MontserratRegular,
                        fontSize: 14,
                      }}>
                      {'No doument selected'}
                    </Text>
                  </View>
                }
                renderItem={renderPdfDoc}
                contentContainerStyle={styles.pdfDocsList}
              />
              {!validating && (
                <View
                  style={{
                    width: '100%',
                    alignItems: 'flex-end',
                  }}>
                  <TouchableOpacity
                    // disabled={pdfDocs.length == 2}
                    onPress={() => {
                      setDocumentPicker(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      marginVertical: 15,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderRadius: 12,
                      width: 150,
                      justifyContent: 'center',
                      padding: 5,
                      borderColor: colors.primaryTextColor + 'aa',
                      // pdfDocs.length == 1
                      //   ? colors.primaryTextColor + '50'
                      //   : colors.primaryTextColor + 'aa',
                      backgroundColor: colors.cardColor,
                      // pdfDocs.length == 1
                      //   ? colors.cardColor + 'aa'
                      //   : colors.cardColor,
                    }}>
                    <Image
                      source={imagepath.upload}
                      resizeMode={'contain'}
                      style={{
                        marginLeft: 5,
                        tintColor: colors.primaryTextColor + 'aa',
                        // pdfDocs.length == 2
                        //   ? colors.primaryTextColor + '50'
                        //   : colors.primaryTextColor + 'aa',
                        height: 20,
                        width: 20,
                      }}
                    />
                    <Text
                      style={{
                        marginLeft: 5,
                        width: 100,
                        color: colors.primaryTextColor + 'aa',
                        // pdfDocs.length == 2
                        //   ? colors.primaryTextColor + '50'
                        //   : colors.primaryTextColor + 'aa',
                        fontFamily: fontFamily.MontserratBold,
                        fontSize: 14,
                      }}>
                      {'Upload File'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View
              style={{
                width: '90%',
                alignSelf: 'center',
                borderTopWidth: 0.6,
                borderColor: colors.premiumGray,
                marginTop: normalize(17),
                marginBottom: normalize(3),
              }}></View>

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                paddingHorizontal: 10,
                marginTop: 10,
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: colors.red + 'aa',
                  fontSize: 13,
                  marginBottom: 5,
                  fontFamily: fontFamily.MontserratBold,
                  textAlign: 'center',
                }}>
                {!validating
                  ? textContent.payments.KycManager.if_not_validating
                  : textContent.payments.KycManager.if_validating}
              </Text>

              <Text
                style={[
                  {
                    marginTop: 10,
                    alignSelf: 'center',
                    color: colors.grayShadeOne,
                    fontSize: 14,
                    fontFamily: fontFamily.MontserratRegular,
                  },
                  validating && {textAlign: 'center'},
                ]}>
                {!validating
                  ? textContent.payments.KycManager
                      .if_not_validating_second_text
                  : textContent.payments.KycManager.if_validating_second_text}
              </Text>
            </View>
            {!validating && (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginVertical: 40,
                  paddingHorizontal: 10,
                }}>
                <MainButton
                  style={{
                    borderRadius: 20,
                    height: 40,

                    padding: 5,
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
                  fontSize={14}
                  onPress={() => {
                    // if (pdfDocs.length > 0) {
                    //   if (isSizeInRange(pdfDocs[0]?.file?.size) ) {
                    //     updateUserDetails({ prop: 'spinner', value: true });
                    //     uploadDocumentAsBase64();
                    //   } else {
                    //     toast.show(
                    //       textContent.payments.KycManager.invalid_document_size,
                    //     );
                    //   }
                    // } else {
                    //   toast.show(
                    //     textContent.payments.KycManager.select_kyc_document,
                    //   );
                    // }
                    if (pdfDocs.length > 0) {
                      let allDocumentsValid = true; // Flag to track if all documents are valid.

                      // Iterate through each document in pdfDocs.
                      for (let i = 0; i < pdfDocs.length; i++) {
                        if (!isSizeInRange(pdfDocs[i]?.file?.size)) {
                          allDocumentsValid = false; // Set the flag to false if any document has an invalid size.
                          break; // No need to check other documents, exit the loop.
                        }
                      }

                      if (allDocumentsValid) {
                        updateUserDetails({prop: 'spinner', value: true});

                        // Now, you can call the uploadDocumentAsBase64 function for each document in pdfDocs.
                        uploadAndCheckDocuments(pdfDocs);
                      } else {
                        toast.show(
                          textContent.payments.KycManager.invalid_document_size,
                        );
                      }
                    } else {
                      toast.show(
                        textContent.payments.KycManager.select_kyc_document,
                      );
                    }
                  }}
                  title={textContent.payments.KycManager.submit_kyc_document}
                />
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              height: 100,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size={'small'} color={colors.spinner} />
          </View>
        )}

        <ProgressLoader
          visible={userReducer.spinner}
          isHUD={true}
          isModal={true}
          color={colors.spinner}
        />
      </ScrollView>
    </View>
  );
};
