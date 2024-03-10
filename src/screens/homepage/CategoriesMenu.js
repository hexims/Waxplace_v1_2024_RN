import React from 'react';
import {FlatList, TouchableOpacity, View, Text, Image} from 'react-native';
import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';

export const CategoriesMenu = ({
  colors,
  userReducer,
  styles,
  darkMode,
  width,
  placeHolder,
  onPress,
  isHome,
  reload,
}) => {
  return (
    <View
      style={{
        marginTop: 10,
        marginBottom: 5,
        width: '100%',
      }}>
      <FlatList
        listKey={(item, index) => `_key${index.toString()}`}
        showsHorizontalScrollIndicator={false}
        data={userReducer?.homeCategoriesData}
        contentContainerStyle={{
          paddingHorizontal: 15,

          justifyContent: 'center',
          alignItems: 'center',
        }}
        nestedScrollEnabled={true}
        style={{
          height: 40,
          marginRight: 2,
          width: width,
          alignSelf: 'center',
        }}
        horizontal={true}
        renderItem={({item, index}) =>
          item?.data && item?.data == 'emptyLoader' ? (
            <View
              style={{
                height: 30.2,
                width: item?.width,
                marginVertical: 7,
                borderRadius: 16,
                backgroundColor: colors.premiumGrayOne,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                elevation: 2,
                marginLeft: index > 0 ? 10 : 1,
              }}></View>
          ) : (
            <TouchableOpacity
              style={[
                styles.shadowBox(colors),
                {
                  height: 30,
                  marginVertical: 7,
                  borderRadius: 20,
                  backgroundColor:
                    item?.name?.toLocaleUpperCase() == placeHolder &&
                    !isHome &&
                    !reload
                      ? colors.premiumGrayOne
                      : darkMode
                      ? colors.secondaryBackground
                      : item?.name == 'WaxDrops' || item?.name == '24hr Access'
                      ? colors.waxplaceYellow
                      : colors.secondaryBackground,
                  shadowOffset: {width: 0, height: 2},
                  shadowColor: colors.shadowColor,
                  shadowOpacity: 0.2,
                  elevation: darkMode ? 0 : 4,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  marginLeft: index > 0 ? 10 : 1,
                  flexDirection: 'row',
                },
                item?.name === 'addcat' ? {width: 65} : null,
              ]}
              onPress={() => onPress(item)}>
              {item?.name === 'addcat' ? (
                <View
                  style={{
                    height: '100%',
                    flexDirection: 'row',
                    marginLeft: 18,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                  }}>
                  <Image
                    style={[
                      {
                        width: 25,
                        height: 25,
                        alignSelf: 'center',
                        marginRight: 5,
                      },
                      darkMode && {tintColor: colors.primaryTextColor},
                    ]}
                    source={imagepath.minus}></Image>
                  <Image
                    style={[
                      {
                        width: 23,
                        height: 23,
                        alignSelf: 'center',
                        marginRight: 20,
                      },
                      darkMode && {tintColor: colors.primaryTextColor},
                    ]}
                    source={imagepath.plus}></Image>
                </View>
              ) : (
                <Text
                  style={{
                    color:
                      item?.name == 'WaxDrops' || item?.name == '24hr Access'
                        ? colors.waxplaceTextColor
                        : colors.primaryTextColor,
                    fontSize: 14,
                    letterSpacing: 0.5,
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {item?.name}
                </Text>
              )}
            </TouchableOpacity>
          )
        }></FlatList>
    </View>
  );
};
