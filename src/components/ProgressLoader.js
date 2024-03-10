import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import {useContext} from 'react';
import {DarkModeContext} from './DarkModeContext';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const ProgressLoader = ({
  visible = false,
  isModal = true,
  barHeight = 64,
  color = colors => colors.secondaryBackground,
  hudColor = (colors, darkMode) =>
    darkMode ? colors.blackShadeOne : colors.secondaryBackground,
  isHUD = false,
  size = 80,
  radius = 20,
}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const renderWithModal = () => {
    return (
      <Modal
        transparent={true}
        animationType={'none'}
        visible={visible}
        onRequestClose={() => {}}>
        <View style={[styles.modalBackground(colors)]}>
          <View
            style={[
              styles.activityIndicatorWrapper(colors),
              {width: size, height: size},
              {
                backgroundColor: isHUD
                  ? typeof hudColor == 'string'
                    ? hudColor
                    : hudColor(colors, darkMode)
                  : colors.transparent,
              },
            ]}>
            {renderActivityIndicator()}
          </View>
        </View>
      </Modal>
    );
  };

  const renderActivityIndicator = () => {
    const loaderColor = typeof color == 'string' ? color : color(colors);

    return isModal ? (
      <ActivityIndicator
        size="large"
        color={loaderColor}
        style={{zIndex: 80}}
        animating={visible}
      />
    ) : (
      <ActivityIndicator
        size="large"
        color={loaderColor}
        //style={{zIndex: 80, marginBottom: barHeight}}
        animating={visible}
      />
    );
  };

  const renderWithView = () => {
    return (
      <View
        style={{
          height: height - barHeight,
          width: width,
          position: 'absolute',
          zIndex: 5,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: colors.primaryTextColor + '20',
        }}>
        {renderActivityIndicator()}
      </View>
    );
  };

  const goEmpty = () => {
    return <View />;
  };

  return isModal ? renderWithModal() : visible ? renderWithView() : goEmpty();
};

ProgressLoader.propTypes = {
  visible: PropTypes.bool.isRequired,
  isModal: PropTypes.bool.isRequired,
  barHeight: PropTypes.number,
  color: PropTypes.string,
  hudColor: PropTypes.string,
  isHUD: PropTypes.bool,
  size: PropTypes.number,
};

const styles = StyleSheet.create({
  modalBackground: colors => ({
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: colors.primaryTextColor + '20',
  }),
  activityIndicatorWrapper: colors => ({
    backgroundColor: colors.transparent,
    height: 80,
    width: 80,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  }),
});

export default ProgressLoader;
