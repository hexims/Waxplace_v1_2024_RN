import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {
  TextInput,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import fontFamily from '../utils/FontFamily';

const AutoFillInput = ({
  colors,
  data,
  onSelect,
  maxOptions = 5,
  currentValue,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [valid, setValid] = useState(false);

  const inputRef = useRef(null);

  const handleInputChange = text => {
    setInputValue(text);
    const newOptions = data.filter(
      item =>
        item.label.toLowerCase().startsWith(text.toLowerCase()) && text !== '',
    );
    setOptions(newOptions.slice(0, 4));
  };

  const handleOptionPress = item => {
    setInputValue(item.label);
    setOptions([]);
    onSelect(item.label);
  };

  const optionsContainerHeight =
    options.length > maxOptions ? maxOptions * 40 : 'auto';
  return (
    <View
      style={{
        width: '100%',
        marginTop: 7,
        height: 45,
        alignItems: 'center',
        alignContent: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: valid && options.length > 0 ? 0 : 15,
        borderBottomRightRadius: valid && options.length > 0 ? 0 : 15,
        backgroundColor: colors.searchBarColor,
      }}>
      <View style={{position: 'absolute', zIndex: 10, width: '100%'}}>
        <TextInput
          ref={inputRef}
          onFocus={() => {
            setValid(true);
            setInputValue('');
            setOptions([]);
          }}
          onBlur={() => {
            if (options.length == 0) {
              setValid(false);
              onSelect(inputValue);
            }
          }}
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
          value={!valid ? currentValue : inputValue}
          onChangeText={handleInputChange}
        />
        {options.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              zIndex: 1,
              height: optionsContainerHeight,
            }}>
            <ScrollView
              contentContainerStyle={{paddingBottom: 10, alignItems: 'center'}}>
              {options.map(
                (item, index) =>
                  item.label.toLowerCase().startsWith(inputValue) &&
                  inputValue !== '' && (
                    <TouchableOpacity
                      style={{
                        width: '100%',
                        height: 40,
                        backgroundColor: colors.searchBarColor,
                        zIndex: 1500,
                        justifyContent: 'center',
                        paddingLeft: 12,

                        borderBottomLeftRadius:
                          index == options.length - 1 ? 18 : 0,
                        borderBottomRightRadius:
                          index == options.length - 1 ? 18 : 0,
                        overflow: 'hidden',
                        shadowColor: colors.black,
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.22,
                        shadowRadius: 2.22,
                        elevation: 4,
                        borderTopWidth:
                          index == 0 ? StyleSheet.hairlineWidth : 0,
                        borderColor: colors.primaryBackground,
                      }}
                      onPress={() => handleOptionPress(item)}>
                      <Text
                        style={{
                          fontFamily: fontFamily.MontserratRegular,
                          color: colors.primaryTextColor,
                          fontSize: 16,

                          letterSpacing: 1,
                        }}
                        key={index}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ),
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

export default AutoFillInput;
