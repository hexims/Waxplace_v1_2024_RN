import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
} from 'react-native';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as CartNavigation from '../router/_CartNavigation';
import fontFamily from '../utils/FontFamily';

import Share from 'react-native-share';

import _, {values} from 'lodash';
import {SearchBar} from '../components/SearchBar';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dialog} from 'react-native-simple-dialogs';
import {updateUserDetails} from '../redux/actions/UserAction';
import {connect} from 'react-redux';
import {MainButton} from '../components/MainButton';
import {getImage} from '../actions/GenericAPI';

import {
  getAlbumsByBarcode,
  getIndividualAlbum,
  sendAlbumReport,
} from '../actions/PurchaseFlowAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import ImageCarousel from '../components/ImageCorousal';
import {normalize} from '../components/NormalizeFonts';
import {getLocation, getPrice} from '../actions/HelperFunctions';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {BASEURL} from '../actions/_apiUrls';
import RNFetchBlob from 'rn-fetch-blob';
import mime from 'mime';
import {useKeyboard} from '../utils/UseKeyBoard';
import FastImage from 'react-native-fast-image';

const AlbumDetails = ({props, route, userReducer, updateUserDetails}) => {
  const toast = useToast();
  const {darkMode, colors} = useContext(DarkModeContext);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedAlbumDetails, setSelectedAlbumDetails] = useState({});
  const [selectedAlbumRelatedDetails, setSelectedAlbumRelatedDetails] =
    useState([]);

  useEffect(() => {
    getIndividualAlbum(route?.params?.selectedAlbumId)
      .then(response => {
        if (response.status == 'success') {
          updateUserDetails({
            prop: 'selectedAlbumDetails',
            value: response?.findAlbum,
          });
          setSelectedAlbumDetails(response?.findAlbum);
          if (response?.findAlbum?.barCode && !response?.findAlbum?.isAdmin) {
            getAlbumsByBarcode(
              response?.findAlbum?.barCode,
              response?.findAlbum?._id,
            )
              .then(response => {
                if (response?.status == 'success') {
                  updateUserDetails({
                    prop: 'selectedAlbumRelatedDetails',
                    value: response.albums,
                  });
                  setSelectedAlbumRelatedDetails(response?.albums);
                }
              })
              .catch(err => {});
          }
        }
        setLoading(false);
      })
      .catch(err => {});
  }, []);

  const SellerDetails = ({seller}) => {
    return (
      <TouchableOpacity
        onPress={async () => {
          if (seller?.businessName) {
            let distanceFromCurrentLocation = await getLocation(seller);

            HomeNavigation.navigate('StoreDetails', {
              vendorData: seller,
              distance: distanceFromCurrentLocation,
            });
          } else {
            HomeNavigation?.navigate('FriendProfile', {
              userData: seller,
            });
          }
        }}
        style={[
          !loading
            ? {
                height: 90,
                width: '100%',
                marginTop:
                  selectedAlbumDetails?.notes &&
                  selectedAlbumDetails?.notes == ''
                    ? 30
                    : 15,
                borderRadius: 12,

                elevation: 2,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                overflow: 'hidden',
                backgroundColor: colors.cardColor,
              }
            : {
                overflow: 'hidden',
                height: 90,
                width: '100%',
                marginVertical: 30,
                borderRadius: 12,
                backgroundColor: colors.premiumGrayOne,
              },
        ]}>
        {!loading ? (
          <View
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: colors.cardColor,
              flexDirection: 'row',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}>
            <View style={{flex: 3, height: '100%', paddingLeft: 10}}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  paddingBottom: 3,
                }}>
                <Text
                  style={{
                    fontSize: 14.5,
                    fontFamily: fontFamily.MontserratBold,
                    color: colors.primaryTextColor,
                  }}>
                  {textContent.AlbumDetails.seller_details}
                </Text>
              </View>
              <View style={{flex: 2}}>
                <View style={{width: '100%'}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: fontFamily.MontserratMedium,
                      color: colors.primaryTextColor,
                    }}>
                    {seller?.storeName
                      ? seller?.storeName
                      : seller?.firstName + ' ' + seller?.lastName}
                  </Text>
                </View>
                <View style={{width: '100%', marginTop: 3}}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.MontserratRegular,
                      color: colors.primaryTextColor,
                    }}>
                    {seller?.city +
                      (seller?.city == '' ? '' : ', ') +
                      seller?.country}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 5,
                //width: '100%',
                alignItems: 'flex-end',
              }}>
              <View
                style={{
                  height: '100%',
                  justifyContent: 'center',
                  width: '100%',
                  alignItems: 'flex-end',
                }}>
                <FastImage
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 30,
                    alignSelf: 'center',
                    backgroundColor: colors.bgGray,
                  }}
                  source={{
                    ...getImage(
                      seller?.profile_image
                        ? seller?.profile_image
                        : seller?.image,
                    ),
                    priority: FastImage.priority.normal,
                  }}
                />
              </View>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const AdditionalAlbums = ({albumInfo}) => {
    if (
      (albumInfo?.sellerId?._id,
      userReducer?.profileDetails?._id &&
        albumInfo?.sellerId?._id !== route?.params?.selectedAlbumId)
    ) {
      return (
        <TouchableOpacity
          disabled={true}
          style={{
            width: '100%',
            alignSelf: 'center',
            height: 100,
            marginBottom: 12,
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
            overflow: 'hidden',
            flexDirection: 'row',
            paddingRight: 4,
          }}
          onPress={() => {}}>
          <View
            style={{
              //  flex: 1.8,
              paddingHorizontal: 8,
              height: '100%',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <FastImage
              style={{
                width: 70,
                height: 70,
                borderRadius: 34,
                marginLeft: 3,
                alignSelf: 'center',
                backgroundColor: colors.bgGray,
              }}
              source={{
                ...getImage(
                  albumInfo?.sellerId?.profile_image
                    ? albumInfo?.sellerId?.profile_image
                    : albumInfo?.sellerId?.image,
                ),
                priority: FastImage.priority.normal,
              }}
            />
          </View>
          <View
            style={{
              flex: 2.7,
              height: '100%',
              overFlow: 'hidden',
              paddingHorizontal: 5,
            }}>
            <View
              style={{
                flex: 0.8,
                width: '100%',
                justifyContent: 'flex-end',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  fontSize: normalize(20),
                  marginVertical: 5,
                  fontFamily: fontFamily.MontserratMedium,
                  marginLeft: 5,
                }}>
                {albumInfo?.sellerId?.storeName
                  ? albumInfo?.sellerId?.storeName
                  : albumInfo?.sellerId?.firstName +
                    ' ' +
                    albumInfo?.sellerId?.lastName}
              </Text>
            </View>
            <View style={{flex: 1, width: '100%'}}>
              <View
                style={{
                  flexDirection: 'row',

                  marginLeft: 5,
                  overflow: 'hidden',
                }}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 13,
                    letterSpacing: 1,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {textContent.AlbumDetails.media_condition}:{' '}
                </Text>
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 13,
                    letterSpacing: 1,
                    fontFamily: fontFamily.MontserratMedium,
                    width: 110,
                  }}>
                  {albumInfo?.mediaCondition}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',

                  marginLeft: 5,
                  overflow: 'hidden',
                }}>
                <Text
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 13,
                    letterSpacing: 1,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {textContent.AlbumDetails.sleeve_condition}:{' '}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.primaryTextColor,
                    fontSize: 13,
                    letterSpacing: 1,
                    fontFamily: fontFamily.MontserratMedium,
                    width: 110,
                  }}>
                  {albumInfo?.sleveCondition}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 2.2,
              height: '100%',
            }}>
            <View
              style={{
                flex: 1,
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                paddingRight: 10,
                paddingTop: 10,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primaryTextColor,
                  textAlign: 'center',
                  fontSize: 16,
                  letterSpacing: 1,

                  fontFamily: fontFamily.MontserratRegular,
                }}>
                {' '}
                {`\u20AC${getPrice(parseFloat(albumInfo?.cost))}`}
              </Text>
            </View>

            <View
              style={{
                flex: 1.5,
                width: '100%',
                justifyContent: 'flex-end',
                paddingRight: 5,
              }}>
              <MainButton
                backgroundColor={colors.primaryButtonColor}
                style={{
                  alignSelf: 'flex-end',
                  height: 30,
                  width: '90%',
                  marginBottom: 10,
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
                  HomeNavigation.push('AlbumDetails', {
                    selectedAlbumId: albumInfo?._id,
                  });
                }}
                fontSize={13.5}
                title={textContent.AlbumDetails.button_text_three}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <ReportAlbumDialog
        colors={colors}
        visible={reportDialog}
        onDismiss={() => {
          setReportDialog(false);
        }}
        albumId={route?.params?.selectedAlbumId}
      />
      <View style={{zIndex: 1500}}>
        <SearchBar
          searchEnabled={false}
          cartValue={userReducer.cartLength}
          onBackPress={() => {
            if (CartNavigation?.cartNavigationRef?.current?.isFocused()) {
              CartNavigation.pop();
            } else {
              HomeNavigation.pop();
            }
          }}
          backgroundColor={colors.searchBarColor + 'cc'}
          onShare={async () => {
            try {
              const res = await RNFetchBlob.config({
                fileCache: true,
                path:
                  RNFetchBlob.fs.dirs.CacheDir +
                  '/' +
                  'WAXPLACE' +
                  '_' +
                  selectedAlbumDetails?.albumName +
                  '_' +
                  selectedAlbumDetails?.artist +
                  '.jpg', // Set the desired file path
                appendExt: 'jpg', // Set the desired file extension
              }).fetch('GET', BASEURL + selectedAlbumDetails?.images[0]);

              const imagePath = res.path();
              const fileExtension = imagePath.split('.').pop();
              const mimeType = mime.getType(fileExtension);
              const shareOptions = {
                title: 'WAXPLACE',
                message: `Check out this album:\n\nAlbum Name: ${
                  selectedAlbumDetails?.albumName
                }\nArtist: ${
                  selectedAlbumDetails?.artist
                }\nPrice: ${`\u20AC${selectedAlbumDetails?.cost}`}`,
                url: `file://${imagePath}`,
                type: mimeType,
                filename: selectedAlbumDetails?.albumName,
              };

              await Share.open(shareOptions);
            } catch (error) {}
          }}
          sharingEnabled={true}
          searchText={searchText}
          searchFunction={text => {
            setSearchText(text);
          }}
          placeHolderCondition={
            searchText !== '' ? '' : textContent.AlbumDetails.search_text
          }
        />
      </View>
      <View style={{position: 'absolute', width: '100%', height: '100%'}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: useKeyboard()}}
          style={{
            width: '100%',
          }}>
          <ImageCarousel
            data={selectedAlbumDetails}
            type={route?.params?.type}
            userReducer={userReducer}
            updateUserDetails={updateUserDetails}
            HomeNavigation={HomeNavigation}
            images={
              selectedAlbumDetails?.images
                ? selectedAlbumDetails?.images
                : ['none']
            }
            colors={colors}
            callback={wishList => {
              route?.params?.updateWishList(wishList);
            }}
          />

          <View style={{width: '100%', marginTop: 10}}>
            <View
              style={{
                height: 115,
                width: '100%',
                marginTop: 5,
                flexDirection: 'row',
                paddingHorizontal: 15,
              }}>
              <View style={{flex: 1.1, height: '100%'}}>
                <View
                  style={{
                    flex: 1.1,
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 18,
                      color: colors.primaryTextColor,
                      backgroundColor: loading
                        ? colors.premiumGrayOne
                        : colors.transparent,
                    }}>
                    {selectedAlbumDetails?.artist}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 16,
                      color: colors.primaryTextColor,
                      backgroundColor: loading
                        ? colors.premiumGrayOne
                        : colors.transparent,
                    }}>
                    {selectedAlbumDetails?.albumName}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 16,
                      color: colors.primaryTextColor,
                      backgroundColor: loading
                        ? colors.premiumGrayOne
                        : colors.transparent,
                    }}>
                    {selectedAlbumDetails?.label}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 16,
                      color: colors.primaryTextColor,
                      backgroundColor: loading
                        ? colors.premiumGrayOne
                        : colors.transparent,
                    }}>
                    {selectedAlbumDetails?.year}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  height: '100%',
                }}>
                <View
                  style={{
                    flex: 0.2,
                    width: '100%',
                    justifyContent: 'center',
                  }}></View>

                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{height: '100%'}}>
                      <Text
                        style={{
                          fontFamily: fontFamily.MontserratRegular,
                          fontSize: 15,
                          color: colors.primaryTextColor,
                          backgroundColor: loading
                            ? colors.premiumGrayOne
                            : colors.transparent,
                        }}>
                        {loading
                          ? ''
                          : textContent.AlbumDetails.media_condition + ': '}
                      </Text>
                    </View>
                    <View style={{marginLeft: 5, height: '100%'}}>
                      <Text
                        style={{
                          fontFamily: fontFamily.MontserratMedium,
                          fontSize: 16,
                          color: colors.primaryTextColor,
                          backgroundColor: loading
                            ? colors.premiumGrayOne
                            : colors.transparent,
                        }}>
                        {selectedAlbumDetails?.mediaCondition}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{height: '100%'}}>
                      <Text
                        style={{
                          fontFamily: fontFamily.MontserratRegular,
                          fontSize: 15,
                          color: colors.primaryTextColor,
                          backgroundColor: loading
                            ? colors.premiumGrayOne
                            : colors.transparent,
                        }}>
                        {loading
                          ? ''
                          : textContent.AlbumDetails.sleeve_condition + ': '}
                      </Text>
                    </View>
                    <View style={{marginLeft: 5, height: '100%'}}>
                      <Text
                        style={{
                          fontFamily: fontFamily.MontserratMedium,
                          fontSize: 16,
                          color: colors.primaryTextColor,
                          backgroundColor: loading
                            ? colors.premiumGrayOne
                            : colors.transparent,
                        }}>
                        {selectedAlbumDetails?.sleveCondition}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1.5,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={{
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 18,
                      color: colors.primaryTextColor,
                      backgroundColor: loading
                        ? colors.premiumGrayOne
                        : colors.transparent,
                    }}>
                    {loading
                      ? ''
                      : `\u20AC${getPrice(
                          parseFloat(selectedAlbumDetails?.cost),
                        )}`}
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    //paddingHorizontal: 15,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedAlbumDetails?.videoUrl) {
                        const formattedUrl =
                          selectedAlbumDetails.videoUrl.startsWith('http')
                            ? selectedAlbumDetails.videoUrl
                            : `http://${selectedAlbumDetails.videoUrl}`;

                        if (Linking.canOpenURL(formattedUrl)) {
                          Linking.openURL(formattedUrl).catch(() => {
                            // Handle error, e.g., show a toast indicating the URL couldn't be opened
                            toast.show(
                              textContent.AlbumDetails.url_unavailable,
                            );
                          });
                        } else {
                          toast.show(textContent.AlbumDetails.url_unavailable);
                        }
                      }
                    }}>
                    <Text
                      style={{
                        fontFamily: fontFamily.MontserratMedium,
                        fontSize: 16,
                        color: colors.blue + 'cc',
                        backgroundColor: loading
                          ? colors.premiumGrayOne
                          : colors.transparent,
                      }}>
                      {loading ? '' : textContent.AlbumDetails.watch}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                flexGrow: 1,
                width: '100%',
                marginTop: 15,
                paddingHorizontal: 15,
              }}>
              <View
                style={{
                  marginBottom: 8,
                  marginTop: 5,
                  width: '100%',
                }}>
                <Text
                  style={{
                    fontFamily: fontFamily.MontserratMedium,
                    fontSize: 18,
                    color: colors.primaryTextColor,
                    width: '30%',
                    backgroundColor: loading
                      ? colors.premiumGrayOne
                      : colors.transparent,
                  }}>
                  {loading ? '' : textContent.AlbumDetails.tracks}
                </Text>
              </View>
              <View style={{width: '100%', paddingLeft: 10}}>
                {selectedAlbumDetails?.tracks?.map((track, index) => (
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      key={index}
                      style={{
                        fontSize: 16,
                        paddingVertical: 3,
                        fontFamily: fontFamily.MontserratMedium,
                        color: colors.primaryTextColor,
                      }}>
                      {index + 1}
                    </Text>
                    <Text
                      key={track.id}
                      style={{
                        fontSize: 16,
                        paddingVertical: 3,
                        fontFamily: fontFamily.MontserratRegular,
                        color: colors.primaryTextColor,
                      }}>
                      {'   ' +
                        (typeof track == 'object' ? track?.track : track)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            {selectedAlbumDetails?.notes &&
            selectedAlbumDetails?.notes !== '' ? (
              <View
                style={{
                  marginBottom: 10,
                  paddingHorizontal: 15,
                  marginTop: 15,
                }}>
                <Text
                  style={{
                    fontFamily: fontFamily.MontserratMedium,
                    fontSize: 14,
                    color: colors.primaryTextColor,
                    lineHeight: 20,
                    paddingLeft: 10,
                  }}>
                  {selectedAlbumDetails?.notes}
                </Text>
              </View>
            ) : null}
            <View style={{width: '100%', paddingHorizontal: 12}}>
              {!selectedAlbumDetails?.isAdmin && (
                <SellerDetails seller={selectedAlbumDetails?.sellerId} />
              )}
            </View>
            <View
              style={{
                width: '100%',
                marginVertical: 15,
                alignItems: 'flex-end',
                paddingHorizontal: 15,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setReportDialog(true);
                }}>
                <Text
                  style={{
                    fontFamily: fontFamily.MontserratMedium,
                    fontSize: 14,
                    color: colors.red + 'cc',
                    backgroundColor: loading
                      ? colors.premiumGrayOne
                      : colors.transparent,
                  }}>
                  {loading ? '' : textContent.AlbumDetails.report}
                </Text>
              </TouchableOpacity>
            </View>
            {selectedAlbumRelatedDetails?.length > 0 && (
              <View
                style={{
                  flexGrow: 1,
                  width: '100%',
                  paddingHorizontal: 15,
                }}>
                <View
                  style={{
                    marginBottom: 8,
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      fontFamily: fontFamily.MontserratMedium,
                      fontSize: 18,
                      color: colors.primaryTextColor,
                    }}>
                    {textContent.AlbumDetails.other_options}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  {selectedAlbumRelatedDetails.map((item, index) => (
                    <AdditionalAlbums albumInfo={item} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const ReportAlbumDialog = ({visible, onDismiss, colors, albumId}) => {
  const [comments, setComments] = useState('');
  const toast = useToast();

  const handleSubmit = () => {
    // Submit the report, for example by sending a request to a server

    let jsonData = {
      albumId,
      comments,
    };
    sendAlbumReport(jsonData)
      .then(result => {
        if (result.status == 'success') {
          toast.show(result.message);
          setComments('');
          onDismiss();
        } else {
          toast.show(textContent.general.general_error);
        }
      })
      .catch(err => {});
    // Reset the comments

    // Close the dialog
  };

  return (
    <Dialog
      visible={visible}
      onTouchOutside={onDismiss}
      // title="Report Album"
      contentStyle={styles.contentStyle(colors)}
      style={styles.dialogStyle(colors)}>
      <View style={{height: 300, width: '100%'}}>
        <View style={styles.container}>
          <TextInput
            style={[styles.textInput(colors)]}
            multiline
            placeholderTextColor={colors.primaryTextColor}
            placeholder={textContent.AlbumDetails.report_text}
            value={comments}
            onChangeText={setComments}
          />
        </View>
        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'center',

            paddingHorizontal: 40,
          }}>
          <MainButton
            title={textContent.AlbumDetails.submit}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  contentStyle: colors => ({
    backgroundColor: colors.secondaryBackground,
    // borderRadius: 15,
    padding: 15,
    height: 300,
  }),
  container: {flex: 1.5, width: '100%', justifyContent: 'center'},
  dialogStyle: colors => ({
    height: 300,
    backgroundColor: colors.cardColor,
    //borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: colors.cardColor,
    paddingBottom: normalize(20),
    width: '100%',
    alignSelf: 'center',
  }),
  textInput: colors => ({
    fontFamily: fontFamily.MontserratRegular,
    fontSize: 16,
    height: '100%',
    padding: 10,
    backgroundColor: colors.primaryBackground,
    borderColor: colors.premiumGrayOne,
    color: colors.primaryTextColor,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(AlbumDetails);
