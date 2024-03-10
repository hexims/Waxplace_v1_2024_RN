import React, {useState} from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import imagepath from '../utils/Images';

const ToggleWeight = ({colors}) => {
  const [selected, setSelected] = useState(0);
  const images = [imagepath.sizethree, imagepath.sizetwo, imagepath.sizeone];

  return (
    <View style={{flexDirection: 'row', marginVertical: 40}}>
      {images.map((image, index) => (
        <TouchableOpacity
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => setSelected(index)}>
          {index === selected ? (
            <Image
              style={{position: 'absolute', tintColor: colors.primaryTextColor}}
              source={imagepath.rectangle}
            />
          ) : null}

          <Image
            key={index}
            resizeMode={'contain'}
            source={image}
            style={[
              {tintColor: colors.primaryTextColor},
              styles.image,
              index === selected ? styles.selectedImage : null,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 80,
    width: 80,

    marginHorizontal: 10,
  },
  selectedImage: {
    transform: [{scale: 1.3}],
  },
});

export default ToggleWeight;
