import moment from 'moment';
import React, {useCallback, useLayoutEffect, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import ImgToBase64 from 'react-native-image-base64';
import {getImage} from '../../actions/GenericAPI';
import fontFamily from '../../utils/FontFamily';
import imagepath from '../../utils/Images';
import {saveReturnChat} from '../../actions/ReturnAPI';
import {useContext} from 'react';
import {DarkModeContext} from '../../components/DarkModeContext';

export const InfoBubble = ({_id, currentMessage}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const renderData = item => {
   
    return (
      <View
        style={{
          width: '100%',
          backgroundColor: colors.transparent,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 5,
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 14,
            fontFamily: fontFamily.MontserratMedium,
            color: colors.gray + '80',
          }}>
          {currentMessage.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={{width: '85%', marginTop: 10, marginRight: 3}}>
      <View
        style={{
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.transparent,
        }}>
        {renderData(currentMessage.data)}
      </View>
    </View>
  );
};
