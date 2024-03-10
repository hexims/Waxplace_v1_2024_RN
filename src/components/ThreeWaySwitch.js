import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  AsyncStorage,
  useColorScheme,
} from 'react-native';
import fontFamily from '../utils/FontFamily';
import textContent from '../utils/textContent';

const titleCase = str =>
  str
    .split(/\s+/)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');

const ClickableLabel = ({title, onPress, id, selected, colors}) => (
  <TouchableOpacity
    onPress={() => onPress(title)}
    style={{
      padding: 5,
      backgroundColor: selected === title ? colors.blue : colors.premiumGrayOne,
      borderRadius: 5,
      width: '90%',
      alignItems: 'center',
    }}>
    <Text
      numberOfLines={1}
      style={{
        color: selected === title ? 'white' : colors.primaryTextColor,
        fontFamily: fontFamily.MontserratRegular,
      }}>
      {titleCase(title)}
    </Text>
  </TouchableOpacity>
);

const ThreeWaySwitch = ({
  values = [
    textContent.components.auto,
    textContent.components.dark_mode,
    textContent.components.light_mode,
  ],
  persistStorage,
  updateUserData,
  updateUserDetails,
  colors,
}) => {
  const [selected, setSelected] = useState(
    persistStorage?.getState()?.systemTheme,
  );
  useEffect(() => {
    setSelected(persistStorage?.getState()?.systemTheme);
  }, [persistStorage?.getState()?.systemTheme]);
  const value = useColorScheme();

  return (
    <>
      <Text
        style={{
          fontSize: 16,
          color: colors.primaryTextColor,
          fontFamily: fontFamily.MontserratMedium,
          alignSelf: 'flex-start',
          marginLeft: 32,
        }}>
        {textContent.components.choose_style}
      </Text>
      <View
        style={{
          height: 55,
          // borderWidth: 1,
          // borderColor: colors.premiunGrayOne,
          borderRadius: 5,
          flexDirection: 'row',
          // justifyContent: 'space-between',
          justifyContent: 'center',
          padding: 5,
          width: '90%',
        }}>
        {values.map(val => (
          <View
            style={{
              flex: 1,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ClickableLabel
              key={val}
              title={val}
              onPress={mode => {
                persistStorage.dispatch(
                  updateUserData({prop: 'systemTheme', value: mode}),
                );
                updateUserDetails({
                  prop: 'darkMode',
                  value:
                    mode == 'Auto'
                      ? value == 'dark'
                        ? true
                        : false
                      : mode == 'Dark Mode'
                      ? true
                      : false,
                });
              }}
              id={val}
              selected={selected}
              colors={colors}
            />
          </View>
        ))}
      </View>
    </>
  );
};

export default ThreeWaySwitch;
