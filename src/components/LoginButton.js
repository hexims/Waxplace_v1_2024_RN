import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const LoginButtonVariants = {
  DEFAULT: 'White',
  WHITE: 'White',
  WHITE_OUTLINE: 'WhiteOutline',
  BLACK: 'Black',
};

export const LoginButtonTypes = {
  DEFAULT: 'SignIn',
  SIGN_IN: 'SignIn',
  CONTINUE: 'Continue',
  // iOS 13.2+
  SIGN_UP: 'SignUp',
  GOOGLE: 'Google',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
};

export const ButtonTexts = {
  [LoginButtonTypes.CONTINUE]: 'Continue with Apple',
  [LoginButtonTypes.SIGN_IN]: 'Sign in with Apple',
  [LoginButtonTypes.GOOGLE]: 'Sign in with Google',
  [LoginButtonTypes.FACEBOOK]: 'Sign in with Facebook',
  [LoginButtonTypes.INSTAGRAM]: 'Sign in with Instagram',
  [LoginButtonTypes.SIGN_UP]: 'Sign up with Apple',
};

const LoginButtonComponent = props => {
  const {
    style,
    textStyle,
    cornerRadius = 5,
    buttonStyle = LoginButtonVariants.DEFAULT,
    buttonType = LoginButtonTypes.DEFAULT,
    onPress,
    leftView,
  } = props;

  const _buttonStyle = [
    styles.baseButton,
    {borderRadius: cornerRadius},
    styles.LoginButtonVariants[buttonStyle],
    style,
  ];
  const _textStyle = [
    styles.baseText,
    styles.textVariants[buttonStyle],
    textStyle,
  ];

  const commonButtonContent = (
    <View style={styles.buttonContent}>
      {!!leftView && leftView}
      <Text style={_textStyle}>{ButtonTexts[buttonType]}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        _buttonStyle,
        buttonType === 'Instagram' && {overflow: 'hidden'},
      ]}>
      {buttonType === 'Instagram' ? (
        <LinearGradient
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          colors={['#e20039', '#cd0078']}
          style={styles.gradient}>
          {commonButtonContent}
        </LinearGradient>
      ) : (
        commonButtonContent
      )}
    </TouchableOpacity>
  );
};

LoginButtonComponent.Style = LoginButtonVariants;
LoginButtonComponent.Type = LoginButtonTypes;

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 40,
  },
  LoginButtonVariants: {
    [LoginButtonVariants.WHITE]: {
      backgroundColor: '#fff',
    },
    [LoginButtonVariants.WHITE_OUTLINE]: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#000',
    },
    [LoginButtonVariants.BLACK]: {
      backgroundColor: '#000',
    },
  },
  baseText: {
    fontSize: 14,
  },
  textVariants: {
    [LoginButtonVariants.WHITE]: {
      color: '#000',
    },
    [LoginButtonVariants.WHITE_OUTLINE]: {
      color: '#000',
    },
    [LoginButtonVariants.BLACK]: {
      color: '#fff',
    },
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
  },
});

export default LoginButtonComponent;
