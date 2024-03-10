import * as React from 'react';
import {createNavigationContainerRef} from '@react-navigation/native';
import {StackActions, CommonActions} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

function navigate(name, params) {
  return navigationRef.current?.navigate(name, params);
}

function reset(name, params) {
  return navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: name, params: params}],
    }),
  );
}

function push(name, params) {
  return navigationRef.current?.dispatch(StackActions.push(name, params));
}

function pop(name, params) {
  return navigationRef.current?.dispatch(StackActions.pop(1));
}

export {navigate, reset, push, pop};
