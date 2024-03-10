import React from 'react';
import { useContext } from 'react';
import { TouchableOpacity, Text,ActivityIndicator } from 'react-native';
import { color } from 'react-native-reanimated';

import fontFamily from '../utils/FontFamily';
import { DarkModeContext } from './DarkModeContext';

export const MainButton = ({
  spinner = false,
  style = colors => ({
    height: 30,
    borderRadius: 20,
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
  }),
  textStyle = colors => ({
    color: colors.black,
    letterSpacing: 0.5,
    paddingVertical: 2,
    fontFamily: fontFamily.MontserratRegular,
  }),
  backgroundColor = colors => colors.primaryButtonColor,
  paddingHorizontal = 10,
  fontSize = 14,
  onPress = () => { },
  disabled = false,
  title = '',
}) => {
  const { darkMode, colors } = useContext(DarkModeContext);
  return (
    <TouchableOpacity
      style={[
        typeof style == 'object' ? style : style(colors),
        {
          backgroundColor:
            typeof backgroundColor == 'string'
              ? backgroundColor
              : backgroundColor(colors),
        },
      ]}
      disabled={disabled || spinner}
      onPress={onPress}>
      {spinner ? (<ActivityIndicator
        size={'small'}

        color={colors.black}
      />) : <Text
        style={[
          typeof textStyle == 'object' ? textStyle : textStyle(colors),
          { fontSize },
          { paddingHorizontal },
        ]}>
        {title}
      </Text>
      }

    </TouchableOpacity>
  );
};
