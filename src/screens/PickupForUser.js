import React, {useEffect, useState, useContext} from 'react';

import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';

import moment from 'moment';
// Use iPhone6 as base size which is 375 x 667

import DateTimePicker from '@react-native-community/datetimepicker';
import {Dialog} from 'react-native-simple-dialogs';
import {MainButton} from '../components/MainButton';
import _, {result} from 'lodash';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';
import {connect} from 'react-redux';
import {updateUserDetails} from '../redux/actions/UserAction';
import {getPickupDataofUser, profileDetails} from '../actions/UserAPI';
import {getImage} from '../actions/GenericAPI';

import {isMatch} from '../actions/HelperFunctions';
import {DarkModeContext} from '../components/DarkModeContext';
import {saveUserPickupInfo} from '../actions/PurchaseFlowAPI';
import ProgressLoader from '../components/ProgressLoader';
import {useToast} from 'react-native-toast-notifications';

import textContent from '../utils/textContent';

const PickUpForUser = ({props, route, userReducer, updateUserDetails}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [pickupList, setPickupList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [extra, setExtra] = useState(0);
  const [functionCall, setFunctionCall] = useState('');

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
  const [pickupDialog, setPickupDialog] = useState(false);
  const [pickupInfo, setPickupInfo] = useState(null);
  const [contactInfoDialog, setContactInfoDialog] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [initial, setInitial] = useState(false);

  useEffect(() => {
    mountFunction();
  }, []);

  useEffect(() => {
    if (contactInfo) {
      setContactInfoDialog(true);
    }
  }, [contactInfo]);

  useEffect(() => {
    if (pickupInfo) {
      setPickupDialog(true);
    }
  }, [pickupInfo]);

  useEffect(() => {
    if (functionCall == 'getUserPickps') {
      getUserPickps();
    }
  }, [functionCall]);

  const getPrice = number => {
    let num = number;
    let n = num.toFixed(2);
    let replaceString = n.toString().replace('.', ',');

    return replaceString;
  };

  const getUserPickps = () => {
    setFunctionCall('');
    setInitial(true);
    getPickupDataofUser()
      .then(response => {
        let pickupList = [];

        if (response.status == 'success') {
          setPickupList(response.data.reverse());
        } else {
          toast.show(textContent.general.general_error);
        }
        setInitial(false);
      })
      .catch(error => {
        setInitial(false);
        toast.show(textContent.general.general_error);
      });
  };

  const mountFunction = () => {
    profileDetails().then(response => {});
    getUserPickps();
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', height: '100%'}}>
        <FlatList
          ListFooterComponent={
            <>
              {initial && (
                <ActivityIndicator
                  size={'small'}
                  style={{marginTop: '20%'}}
                  color={colors.spinner}
                />
              )}
            </>
          }
          data={pickupList}
          extraData={extra}
          showsVerticalScrollIndicator={false}
          style={{marginTop: 10}}
          contentContainerStyle={{paddingBottom: 150}}
          renderItem={({item, index}) =>
            renderPickupList(item, index)
          }></FlatList>
      </View>
    );
  };

  const renderPickupList = (data, index) => {
    let item = {
      ...data,
      ...data?.albumDetails,
      ...data.albumDetails?.albumId,
      sellerId: data?.albumDetails?.sellerId,
      saleProductId: data?.albumDetails?.albumId?._id,
      purchaseId: data?._id,
    };

    delete item.albumDetails;
    let date = moment(item.createdAt).format('DD/MM/YY').toString();

    if (
      !isMatch(
        item,
        ['artist', 'albumName', 'label', 'codEnvio', 'orderStatus'],
        searchText,
      ) &&
      !date.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return null;
    }
    return (
      <View
        style={{
          width: '95%',
          alignSelf: 'center',
          marginBottom: 8,
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
        <View style={{width: '100%'}}>
          <View style={{paddingVertical: 5, flexDirection: 'row'}}>
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  alignSelf: 'center',
                  backgroundColor: colors.bgGray,
                }}
                source={getImage(item.thumbnailImage ?? item.images[0])}></Image>
            </View>
            <View style={{flex: 4, paddingLeft: 10}}>
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
                    color: colors.grayShadeOne,

                    fontSize: 17,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {item?.albumName}
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
                    color: colors.grayShadeTwo,
                    fontSize: 17,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.artist}
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
                    color: colors.grayShadeTwo,
                    fontSize: 16,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.label}
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
                    color: colors.grayShadeTwo,
                    fontSize: 16,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {moment(item.createdAt).format('DD/MM/YYYY hh:mm a')}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1.2,
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 2,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.notificationColor,
                  fontSize: 16,
                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {`\u20AC${getPrice(
                  parseFloat(item.albumCost) -
                    parseFloat(item.albumCost) * (item.buyerTax / 100),
                )}`}
              </Text>
            </View>
          </View>
        </View>
        <View style={{marginVertical: 10, width: '100%'}}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.PickupForUser.tracking_id}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                }}>
                {item.shipmentDetails.codEnvio}
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', marginVertical: 2}}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.grayShadeOne,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratRegular,
                  width: 100,
                }}>
                {textContent.PickupForUser.status}
              </Text>
            </View>
            <View style={{marginLeft: 10}}>
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

        <View
          style={{
            width: '100%',
            justifyContent: 'flex-end',
            // marginTop: 10,
            alignItems: 'flex-end',
            flexDirection: 'row',
          }}>
          {item.storePickupTime == '' && (
            <TouchableOpacity
              style={{
                height: 35,

                overflow: 'hidden',
              }}
              onPress={() => {
                setPickupInfo({...item, itemIndex: index});
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
                    tintColor: colors.primaryTextColor,
                    marginHorizontal: 4,
                  }}
                  source={imagepath.calender}></Image>

                <Text
                  style={{
                    color: colors.blue + 'dd',
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                    marginRight: 10,
                  }}>
                  {textContent.PickupForUser.inform_pickup}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              height: 35,

              overflow: 'hidden',
            }}
            onPress={() => {
              setContactInfo(item?.storePickupId);
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

                  marginHorizontal: 4,
                }}
                source={imagepath.pin}></Image>

              <Text
                style={{
                  color: colors.blue + 'dd',
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                  marginRight: 10,
                }}>
                {textContent.PickupForUser.contact_info}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
            setPickupDialog(true);
          }}
        />
      )}

      <Dialog
        visible={meetingDatePicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setPickupDialog(true);
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
            setPickupDialog(true);
            setMeetingDatePicker(false);
          }}
          fontSize={15}
          title={textContent.PickupForUser.button_text_one}
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
            setPickupDialog(true);
          }}
        />
      )}

      <Dialog
        display="spinner"
        visible={meetingTimeOnePicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setPickupDialog(true);
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
            setPickupDialog(true);
            setMeetingTimeOnePicker(false);
          }}
          fontSize={15}
          title={textContent.PickupForUser.button_text_one}
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
            setPickupDialog(true);
          }}
        />
      )}

      <Dialog
        visible={meetingTimeTwoPicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setPickupDialog(true);
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
            setPickupDialog(true);
            setMeetingTimeTwoPicker(false);
          }}
          fontSize={15}
          title={textContent.PickupForUser.button_text_one}
        />
      </Dialog>

      <Dialog
        visible={pickupDialog}
        onTouchOutside={() => {
          setPickupInfo(null);
          setPickupDialog(false);
        }}
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
        <View style={{paddingVertical: 5, alignItems: 'center'}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 18,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.PickupForUser.pickup_details}
          </Text>
        </View>
        <View style={{width: '100%'}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              marginTop: 10,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.PickupForUser.set_date}
          </Text>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 7,
              height: 45,
              backgroundColor: darkMode
                ? colors.black
                : colors.premiumGrayOne + '90',
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <View style={{flex: 6, height: '100%', justifyContent: 'center'}}>
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
            <View style={{flex: 1, height: '100%', justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  setPickupDialog(false);
                  setMeetingDatePicker(true);
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    alignSelf: 'center',
                    tintColor: colors.primaryTextColor,
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
            {textContent.PickupForUser.working_hours}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              marginTop: 15,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.PickupForUser.set_time}
          </Text>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 7,
              height: 45,
              backgroundColor: darkMode
                ? colors.black
                : colors.premiumGrayOne + '90',
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <View style={{flex: 6, height: '100%', justifyContent: 'center'}}>
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
            <View style={{flex: 1, height: '100%', justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  setPickupDialog(false);
                  setMeetingTimeOnePicker(true);
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    alignSelf: 'center',
                    tintColor: colors.primaryTextColor,
                  }}
                  source={imagepath.timeselection}></Image>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{alignItems: 'center', marginTop: 30, marginBottom: 2}}>
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
              title={textContent.PickupForUser.button_text_two}
              onPress={() => {
                let dateTime =
                  moment(meetingTimeOne).format('DD-MM-YYYY') +
                  ' ' +
                  moment(meetingTimeOne).format('hh:mm:ss');
                let jsonData = {
                  albumId: pickupInfo?.saleProductId,
                  time: moment(dateTime, 'DD-MM-YYYY hh:mm:ss').toDate(),
                  sellerId: pickupInfo?.sellerId?._id,
                  purchaseId: pickupInfo?.purchaseId,
                  storePickupId: pickupInfo?.storePickupId?._id,
                };
                saveUserPickupInfo(jsonData)
                  .then(result => {
                    if (result.status == 'success') {
                      setPickupDialog(false);
                      let list = pickupList;
                      list.splice(pickupInfo?.itemIndex, 1, {
                        ...pickupInfo,
                        storePickupTime: '  ',
                      });
                      setPickupList(list);
                      setExtra(extra + 1);
                    }

                    toast.show(result.message);
                  })
                  .catch(err => {});
              }}
            />
          </View>
        </View>
      </Dialog>
      <Dialog
        visible={contactInfoDialog}
        onTouchOutside={() => {
          setContactInfo(null);
          setContactInfoDialog(false);
        }}
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
        <View style={{paddingVertical: 5, alignItems: 'center'}}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 18,
              fontFamily: fontFamily.MontserratRegular,
            }}>
            {textContent.PickupForUser.store_details}
          </Text>
        </View>
        <View style={{width: '100%'}}>
          <View style={{marginVertical: 10, width: '100%'}}>
            <View style={{flexDirection: 'row', marginVertical: 2}}>
              <View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.grayShadeOne,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratRegular,
                    width: 100,
                  }}>
                  {textContent.PickupForUser.store_name}
                </Text>
              </View>
              <View style={{marginLeft: 10}}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {contactInfo?.storeName}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginVertical: 2}}>
              <View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.grayShadeOne,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratRegular,
                    width: 100,
                  }}>
                  {textContent.PickupForUser.address}
                </Text>
              </View>
              <View style={{width: '60%'}}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {contactInfo?.address}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginVertical: 10}}>
              <View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.grayShadeOne,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratRegular,
                    width: 100,
                  }}>
                  {textContent.PickupForUser.mobile_number}
                </Text>
              </View>
              <View style={{marginLeft: 10}}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.blue,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratMedium,
                  }}>
                  {contactInfo?.businessContact}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginVertical: 2}}>
              <TouchableOpacity
                onPress={() => {
                  const scheme = Platform.select({
                    ios: 'maps:0,0?q=',
                    android: 'geo:0,0?q=',
                  });
                  const latLng = `${contactInfo.latitude},${contactInfo.longitude}`;
                  const label = contactInfo?.storeName;
                  const url = Platform.select({
                    ios: `${scheme}${label}@${latLng}`,
                    android: `${scheme}${latLng}(${label})`,
                  });

                  Linking.openURL(url);
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.red,
                    fontSize: 15,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {textContent.PickupForUser.open_maps}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Dialog>
      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={true}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
          setFunctionCall('changeTextDebouncer');
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.PickupForUser.search_text
        }
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
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(PickUpForUser);
