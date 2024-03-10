import React, {useEffect, useState} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import * as HomeNavigation from '../router/_HomeNavigation';
import * as ProfileNavigation from '../router/_ProfileNavigation';
import * as BottomNavigation from '../router/_BottomNavigation';
import fontFamily from '../utils/FontFamily';
import FastImage from 'react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import {updateUserDetails} from '../redux/actions/UserAction';
import {connect} from 'react-redux';
import {getImage} from '../actions/GenericAPI';
import {getCategories, saveCategories} from '../actions/SaleFlowAPI';
import {profileDetails} from '../actions/UserAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../components/DarkModeContext';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {BASEURL} from '../actions/_apiUrls';

const numColumns = 3;
const size = Dimensions.get('window').width / numColumns - 20;
const Categoriesscreen = ({
  props,
  navigation,
  route,
  userReducer,
  updateUserDetails,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const toast = useToast();
  const [categoriesArr, setCategoriesArr] = useState([]);
  const [clickedCategories, setClickedCategories] = useState([]);
  const [initial, setInitial] = useState(true);
  const horizontalLoderData = [{}, {}, {}, {}, {}];

  useEffect(() => {
    const backAction = () => {
      if (
        route?.params?.from &&
        (route?.params?.from === 'Home' || route?.params?.from === 'Profile')
      ) {
        return false;
      } else {
        return true;
      }
    };

    // Add the event listener for the back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    updateUserDetails({prop: 'showCategories', value: false});
    BottomNavigation.navigationRef?.setParams({hide: true});
    mountFunction();
    return () => {
      BottomNavigation.navigationRef?.setParams({hide: false});
    };
  }, [BottomNavigation?.navigationRef.isReady()]);

  const mountFunction = () => {
    getCategories()
      .then(response => {
        let categories = response.categories;

        if (
          route?.params?.from &&
          (route?.params?.from === 'Home' || route?.params?.from === 'Profile')
        ) {
          profileDetails().then(response => {
            setInitial(false);
            let profileCategories = response?.user?.categories;
            let categoriesArray = [];
            let ClickedCategory = [];
            setCategoriesArr(profileCategories);
            categories.map(value => {
              categoriesArray.push({...value});
              profileCategories.map(item => {
                if (value._id === item._id) {
                  let index = categoriesArray
                    .map(function (data) {
                      return data._id;
                    })
                    .indexOf(value._id);

                  categoriesArray[index].clicked = true;
                  ClickedCategory.push({...value});
                }
              });
            });

            setCategoriesArr(categoriesArray);
            setClickedCategories(ClickedCategory);
          });
        } else {
          setInitial(false);
          setCategoriesArr(response.categories);
        }
      })
      .catch(error => {});
  };

  const saveSelectedCategories = () => {
    if (clickedCategories?.length < 3) {
      toast.show(textContent.Categoires.mandatory_to_continue);
      return;
    }

    saveCategories(clickedCategories)
      .then(response => {
        if (response.status == 'success') {
          if (route?.params?.from === 'Profile') {
            ProfileNavigation.pop();
          } else {
            HomeNavigation.reset('HomeScreen');
          }
        } else {
          toast.show(textContent.general.general_error);
        }
      })
      .catch(error => {});
  };

  const categoryClicked = (item, index) => {
    let newCategoryArr = Array.from(categoriesArr);
    newCategoryArr.splice(index, 1, {
      ...item,
      clicked: !item.clicked,
    });
    setCategoriesArr(newCategoryArr);
    setClickedCategories(newCategoryArr.filter(value => value.clicked));
  };

  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <View
        style={{
          flex: 1,
          width: '100%',

          alignSelf: 'center',
          alignItems: 'center',
          alignContent: 'center',
        }}>
        <View
          style={{
            // flex: 1.5,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,
          }}>
          <Text
            style={{
              marginTop: 20,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratBold,
              textAlign: 'center',
              letterSpacing: 2,
              fontSize: 42,
              alignSelf: 'center',
            }}>
            {textContent.Categoires.let_us_know}
          </Text>
          <Text
            style={{
              marginTop: 3,
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratBold,
              textAlign: 'center',
              letterSpacing: 2,
              fontSize: 42,
              alignSelf: 'center',
            }}>
            {textContent.Categoires.your_vibe}
          </Text>
          <Text
            style={{
              color: colors.primaryTextColor,
              alignSelf: 'center',
              textAlign: 'center',

              fontSize: 20,
              fontFamily: fontFamily.MontserratRegular,
              marginVertical: 6,
            }}>
            {textContent.Categoires.select_categories}
          </Text>
          <View
            style={{
              marginTop: 10,
              marginBottom: 6,
              height: 35,
              width: '100%',
              justifyContent: 'center',
            }}>
            <FlatList
              listKey={(item, index) => `_key${index.toString()}`}
              data={initial ? horizontalLoderData : clickedCategories}
              style={{flex: 2, marginLeft: 2, marginRight: 2}}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 15,
                paddingLeft: 5,
              }}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              renderItem={({item, index}) => (
                <View
                  style={[
                    styles.shadowBox(colors),
                    {
                      height: 30,

                      borderRadius: 16,
                      backgroundColor: initial
                        ? colors.premiumGrayOne
                        : colors.secondaryBackground,
                      elevation: 4,
                      shadowColor: colors.shadowColor,
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.22,
                      shadowRadius: 2.22,
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                      marginLeft: 10,
                    },
                    initial && {width: 80},
                  ]}>
                  <Text
                    style={{
                      color: colors.primaryTextColor,
                      fontSize: 14,
                      letterSpacing: 0.5,
                      alignSelf: 'center',
                      fontFamily: fontFamily.MontserratRegular,
                      textAlign: 'center',
                      paddingHorizontal: 8,
                    }}>
                    {item?.name}
                  </Text>
                </View>
              )}></FlatList>
          </View>
        </View>

        <View style={{flex: 1, width: '100%'}}>
          <View style={{flex: 15, width: '100%', justifyContent: 'flex-start'}}>
            <FlatList
              showsVerticalScrollIndicator={false}
              listKey={(item, index) => `_key${index.toString()}`}
              data={categoriesArr}
              showsHorizontalScrollIndicator={false}
              style={styles.categoryflatlist}
              contentContainerStyle={{
                paddingBottom: 90,
                justifyContent: 'flex-start',
              }}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={[
                    styles.categoryitemContainer(colors),
                    //{backgroundColor: colors.gray},
                  ]}
                  onPress={() => categoryClicked(item, index)}>
                  {/* <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      //backgroundColor: colors.bgGray,
                    }}
                    resizeMode={'cover'}
                    source={getImage(item.image)}></Image> */}
                  <FastImage
                    style={{width: '100%', height: '100%'}}
                    source={{
                      ...getImage(item.image),
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                  />

                  {item.clicked ? (
                    <TouchableOpacity
                      style={[
                        styles.categoryitemContainer(colors),
                        {
                          position: 'absolute',
                          backgroundColor: colors.black + '90',
                          borderRadius: 150,
                        },
                      ]}
                      onPress={() =>
                        categoryClicked(item, index)
                      }></TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <>
                  <ActivityIndicator
                    size={'small'}
                    style={{marginTop: 50}}
                    color={colors.spinner}
                  />
                </>
              }
              numColumns={numColumns}></FlatList>
          </View>
        </View>
      </View>

      <View
        style={{
          width: '100%',
          position: 'absolute',
          bottom: '7%',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={{
            width: 130,
            height: 40,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            backgroundColor: colors.primaryButtonColor,
            alignItems: 'center',
            borderRadius: 15,
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
            saveSelectedCategories();
          }}>
          <Text
            style={{
              color: colors.black,
              letterSpacing: 1,
              marginLeft: 5,
              fontSize: 18,
              fontFamily: fontFamily.MontserratBold,
              alignSelf: 'center',
            }}>
            {textContent.Categoires.button_text}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
  }),
  shadowBox: colors => ({
    shadowColor: colors.shadowColor,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  }),
  categoryflatlist: {
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'center',
  },
  categoryitemContainer: colors => ({
    width: size,
    height: size,
    borderWidth: 0,

    borderRadius: 10,

    marginRight: 7,
    marginLeft: 7,
    marginBottom: 7,
    marginTop: 7,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(Categoriesscreen);
