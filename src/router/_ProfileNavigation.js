import * as React from 'react';
import {createNavigationContainerRef} from '@react-navigation/native';
import {StackActions, CommonActions} from '@react-navigation/native';

export const profileNavigationRef = createNavigationContainerRef();

function navigate(name, params) {
  return profileNavigationRef.current?.navigate(name, params);
}

function reset(name, params) {
  return profileNavigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: name, params: params}],
      key:null
    }),
  );
}

function resetRoot(name, params) {
  return profileNavigationRef.current?.resetRoot({
    index: 0,
    routes: [{name: name, params: params}],
  });
}

function push(name, params) {
  return profileNavigationRef.current?.dispatch(
    StackActions.push(name, params),
  );
}

function pop(name, params) {
  return profileNavigationRef.current?.dispatch(StackActions.pop(1));
}

export {navigate, reset, push, pop, resetRoot};
