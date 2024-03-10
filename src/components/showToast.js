import * as React from 'react';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent.json';

export const showToast = messageType => {
  const toast = useToast();
  toast.show(textContent[messageType]);
};
