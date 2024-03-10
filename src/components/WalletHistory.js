import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, Animated} from 'react-native';

const WalletHistory = ({isVisible, colors}) => {
  const animation = new Animated.Value(0);

  useEffect(() => {
    toggleVisibility();
  }, [isVisible]);

  const toggleVisibility = () => {
    Animated.timing(animation, {
      toValue: !isVisible ? 0 : 1,
      duration: 500,
    }).start();
  };

  const flatListHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  const data = [
    {key: '1', name: 'Item 1'},
    {key: '2', name: 'Item 2'},
    {key: '3', name: 'Item 3'},
    {key: '4', name: 'Item 4'},
  ];

  return (
    <View style={{width: '100%'}}>
      <Animated.View style={{height: flatListHeight, width: '100%'}}>
        <View>
          <Text>Today</Text>
        </View>

        <FlatList
          data={data}
          style={{width: '100%'}}
          contentContainerStyle={{width: '100%', alignItems: 'center'}}
          renderItem={({item}) => (
            <View
              style={{
                width: 320,
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 8,
                backgroundColor: colors.cardColor,
                height: 62,
                borderRadius: 12,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 3,
                shadowColor: colors.shadowColor,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
};

export default WalletHistory;
