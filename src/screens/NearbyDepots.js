import React, {useEffect, useState} from 'react';

import fontFamily from '../utils/FontFamily';
import imagepath from '../utils/Images';

import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';

import _, {filter} from 'lodash';

import {SafeAreaView} from 'react-native-safe-area-context';
import {SearchBar} from '../components/SearchBar';

import {connect} from 'react-redux';

import {updateUserDetails} from '../redux/actions/UserAction';
import ProgressLoader from '../components/ProgressLoader';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import {useKeyboard} from '../utils/UseKeyBoard';
import textContent from '../utils/textContent';
import {checkNearbyPostalCodes} from '../actions/_CorreosAPI';

const NearbyDepots = ({
  props,
  route,
  userReducer,
  updateUserDetails,
  navigation,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();

  const [initial, setInitial] = useState(true);
  const [extra, setExtra] = useState(0);
  const [depotDetails, setDepotDetails] = useState([]);

  useEffect(() => {
    checkNearbyPostalCodes(route?.params?.postalCode)
      .then(result => {
        if (Array.isArray(result)) {
          setDepotDetails(result.slice(0, 10));
        }
        setInitial(false);
      })
      .catch(err => {
        setInitial(false);
      });
  }, []);

  const renderDepotInfo = (item, index) => {
    return (
      <View
        style={{
          width: '100%',
          alignSelf: 'center',
          marginBottom: 5,

          borderRadius: 10,
          backgroundColor: colors.secondaryBackground,
          elevation: 2,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          marginTop: 5,
          padding: 10,
          paddingHorizontal: 13,
        }}>
        <Text
          style={{
            marginTop: 8,
            color: colors.primaryTextColor,
            fontSize: 13,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {item.unit}
        </Text>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 15,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {item.address}
        </Text>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 14,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {item.city}
        </Text>
        <Text
          style={{
            color: colors.primaryTextColor,
            fontSize: 15,
            fontFamily: fontFamily.MontserratMedium,
          }}>
          {item.postalCode}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            // alignItems: 'center',
            marginBottom: 10,
            marginTop: 2,
          }}>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 14,
              fontFamily: fontFamily.MontserratMedium,
            }}>
            Timing :{'  '}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              fontSize: 13,
              fontFamily: fontFamily.MontserratMedium,

              maxWidth: 200,
            }}>
            {item.timing}
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginRight: item.mobileNumber ? 15 : 0,
            }}
            onPress={() => {
              const scheme = Platform.select({
                ios: 'maps:0,0?q=',
                android: 'geo:0,0?q=',
              });
              const latLng = `${item.coordinate.latitude},${item.coordinate.longitude}`;
              const label = item?.unit;
              const url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`,
              });

              Linking.openURL(url);
            }}>
            <Image
              source={imagepath.distancemarker}
              resizeMode={'contain'}
              style={{
                height: 17,
                width: 17,
                tintColor: colors.primaryTextColor + '90',
                marginRight: 4,
              }}
            />
            <Text
              style={{
                color: colors.blue,
                fontSize: 15,
                fontFamily: fontFamily.MontserratMedium,
                marginVertical: 5,
              }}>
              {'Open In Maps'}
            </Text>
          </TouchableOpacity>
          {item.mobileNumber && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
              onPress={() => {
                Linking.openURL(`tel:+34${item.mobileNumber}`);
              }}>
              <Image
                source={imagepath.phone}
                style={{
                  height: 17,
                  width: 17,
                  tintColor: colors.primaryTextColor + '90',
                  marginRight: 4,
                }}
              />
              <Text
                style={{
                  color: colors.blue,
                  fontSize: 15,
                  fontFamily: fontFamily.MontserratMedium,
                  marginVertical: 5,
                }}>
                {'+34-' + item.mobileNumber}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPage = () => {
    return (
      <View style={{width: '100%', flex: 1}}>
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
          data={depotDetails}
          extraData={extra}
          showsVerticalScrollIndicator={false}
          style={{marginTop: 10, width: '100%'}}
          contentContainerStyle={{
            paddingBottom: useKeyboard() + 10,
            paddingHorizontal: 10,
            width: '100%',
          }}
          renderItem={({item, index}) =>
            renderDepotInfo(item, index)
          }></FlatList>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        cartValue={userReducer.cartLength}
        searchEnabled={false}
        searchText={''}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={textContent.NearbyDepots.correos_depots}
      />
      {renderPage()}
      <ProgressLoader
        visible={userReducer.spinner}
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
    justifyContent: 'center',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(NearbyDepots);
