import React, {useContext, useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {featuredItemsByCategories} from '../../actions/HomePageAPI';
import {DarkModeContext} from '../../components/DarkModeContext';
import FeaturedItemComponent from '../../components/FeaturedItem';
import {normalize} from '../../components/NormalizeFonts';
import fontFamily from '../../utils/FontFamily';
import textContent from '../../utils/textContent';

export const FeaturedList = ({
  userCategories,
  HomeNavigation,
  updateUserDetails,
  userReducer,
  pagReload,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);

  const [extra, setExtra] = useState(0);
  const [number, setNumber] = useState(1);
  const [loadingEnabled, setLoadingEnabled] = useState(true);
  const [endReached, setEndReached] = useState(false);

  useEffect(() => {
    return () => {
      setNumber(0);
      updateUserDetails({
        prop: 'featuredData',
        value: [
          {data: 'emptyLoader'},
          {data: 'emptyLoader'},
          {data: 'emptyLoader'},
        ],
      });
    };
  }, []);

  useEffect(() => {
    setExtra(extra + 1);
  }, [userReducer?.featuredData]);

  useEffect(() => {
    if (userCategories.length > 0) {
      getFeaturedList();
    }
  }, [number, userCategories]);

  const footerComponent = () => {
    return (
      loadingEnabled == true && (
        <View style={{paddingHorizontal: 10, justifyContent: 'center'}}>
          <ActivityIndicator color={colors.spinner} size={'small'} />
        </View>
      )
    );
  };

  const renderItem = (item, index) => {
    return (
      <FeaturedItemComponent
        item={item}
        index={index}
        userReducer={userReducer}
        updateUserDetails={updateUserDetails}
        HomeNavigation={HomeNavigation}
      />
    );
  };

  const getFeaturedList = () => {
    let jsonData = {
      categories: JSON.stringify(userCategories),
      size: 10,
      page: number,
    };

    featuredItemsByCategories(jsonData)
      .then(result => {
        if (Array.isArray(result)) {
          if (result.length < 10) {
            setEndReached(true);
          }

          setLoadingEnabled(false);
          updateUserDetails({
            prop: 'featuredData',
            value:
              Array.isArray(userReducer?.featuredData) &&
              userReducer?.featuredData[0].data == 'emptyLoader'
                ? [...result]
                : [...userReducer?.featuredData, ...result],
          });
        } else {
          setLoadingEnabled(false);
        }
      })
      .catch(err => {
        setLoadingEnabled(false);
      });
  };
  if (userReducer?.featuredData.length > 0) {
    return (
      <View style={{width: '100%', alignItems: 'flex-start'}}>
        {userReducer?.featuredData[0]?.data != 'emptyLoader' ? (
          <Text
            style={{
              marginTop: 4,
              color: colors.primaryTextColor,
              fontSize: normalize(17),
              // shadowColor: colors.shadowColor,
              // shadowOffset: {
              //   width: 0,
              //   height: 1,
              // },
              // shadowOpacity: 0.22,
              // shadowRadius: 2.22,
              // elevation: 2,
              borderRadius: 20,
              marginLeft: 15,
              fontFamily: fontFamily.MontserratBold,
            }}>
            {textContent.homePage.featured_items}
          </Text>
        ) : (
          <Text
            style={{
              marginTop: 4,
              color: colors.primaryTextColor,
              fontSize: normalize(17),
              backgroundColor: colors.premiumGrayOne,
              width: 130,
              marginLeft: 15,
              fontFamily: fontFamily.MontserratBold,
              shadowColor: colors.shadowColor,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 2,
              borderRadius: 8,
              overflow: 'hidden',
            }}>
            {''}
          </Text>
          // <View
          //   style={{
          //     backgroundColor: colors.premiumGrayOne,
          //     shadowColor: colors.shadowColor,
          //     shadowOffset: {
          //       width: 0,
          //       height: 1,
          //     },
          //     shadowOpacity: 0.22,
          //     shadowRadius: 2.22,
          //     elevation: 2,
          //     marginTop: 4,
          //     height: 19,
          //     width: 138,
          //     borderRadius: 20,
          //     marginLeft: 15,
          //   }}></View>
        )}
        <FlatList
          listKey={(item, index) => `_key${index.toString()}`}
          initialNumToRender={5}
          data={userReducer?.featuredData}
          style={{
            marginTop: 8,
            width: '100%',
            marginBottom: -15,
          }}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingLeft: 5,
            paddingRight: 20,
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 10,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          ListFooterComponent={footerComponent}
          extraData={extra}
          renderItem={({item, index}) => renderItem(item, index)}
          onEndReached={() => {
            if (!loadingEnabled && !endReached && userCategories.length > 0) {
              setLoadingEnabled(true);
              setNumber(number + 1);
            }
          }}></FlatList>
      </View>
    );
  } else {
    return null;
  }
};
