import React, {useState, useEffect, useContext} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {DarkModeContext} from './DarkModeContext';
import textContent from '../utils/textContent';
import fontFamily from '../utils/FontFamily';

const OTPButton = ({
  onPress,
  isValid,
  disable = false,
  setIsDisabled = value => {},
  emailReset = false,
}) => {
  let interval;

  const {colors, darlMode} = useContext(DarkModeContext);
  const [timer, setTimer] = useState(60); // Initial timer value in seconds
  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setDisableButton(false);
      setIsDisabled(false);
    }

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (emailReset) {
      setDisableButton(false);
      setIsDisabled(false);
    }
  }, [emailReset]);

  useEffect(() => {
    if (disable) {
      setDisableButton(false);
      setIsDisabled(false);
      clearInterval(interval);
    }
  }, [disable]);

  const handleButtonPress = () => {
    if (isValid) {
      setTimer(60);
      setDisableButton(true);
      setIsDisabled(true);
    }

    // Perform your OTP sending logic here
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handleButtonPress}
      disabled={disable ? disable : disableButton}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 18,
        backgroundColor: disable ? colors.gray : colors.primaryButtonColor,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadowColor,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        height: 40,
      }}>
      <Text
        style={{
          color: colors.black,
          fontSize: 16,
          fontFamily: fontFamily.MontserratMedium,
        }}>
        {disableButton
          ? `${textContent.general.resend_otp} ${timer} sec`
          : textContent.general.send_otp}
      </Text>
    </TouchableOpacity>
  );
};

export default OTPButton;
