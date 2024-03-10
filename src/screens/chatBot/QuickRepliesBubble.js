import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useContext,
} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {DarkModeContext} from '../../components/DarkModeContext';

export const QuickRepliesBubble = ({
  _id,
  currentMessage,
  title,
  quickReplies, //quickreplies array from message object
  onQuickReply, //
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  return (
    <View style={{width: '85%', marginTop: 10}}>
      <View
        style={{flex: 3, width: '100%', borderRadius: 12, overflow: 'hidden'}}>
        {quickReplies?.values?.map(reply => {
          return (
            <TouchableOpacity
              // disabled={currentMessage.updated}
              onPress={() => {
                let data = [];
                quickReplies.values.map(val => {
                  if (val.title == reply.title) {
                    data.push({...val, enable: true});
                  } else {
                    data.push({...val, enable: false});
                  }
                });
                let returnData = {
                  ...currentMessage,
                  updated: true,
                  quickReplies: {...quickReplies, values: data},
                };
                onQuickReply(returnData);
              }}
              style={{
                paddingVertical: 15,
                width: '100%',
                borderColor: darkMode
                  ? colors.black
                  : colors.premiumGrayOne + '90',
                backgroundColor: reply.enable
                  ? darkMode
                    ? colors.notificationColor
                    : colors.Pink
                  : colors.cardColor,
                // borderRadius: 10,
                borderBottomWidth: StyleSheet.hairlineWidth,
                // marginBottom: 5,
                justifyContent: 'center',
                paddingLeft: 10,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: darkMode ? colors.grayShadeThree : colors.black,
                }}>
                {reply.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
