import {
    getHash as androidGetHash,
    startOtpListener as androidStartOtpListener,
    removeListener as androidRemoveListener,
  } from 'react-native-otp-verify';
  
  export const getHash = androidGetHash;
  export const startOtpListener = androidStartOtpListener;
  export const removeListener = androidRemoveListener;