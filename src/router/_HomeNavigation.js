import * as React from 'react';
import {createNavigationContainerRef} from '@react-navigation/native';
import {StackActions, CommonActions} from '@react-navigation/native';

export const homeNavigationRef = createNavigationContainerRef();

function navigate(name, params) {
  return homeNavigationRef.current?.navigate(name, params);
}

function reset(name, params) {
  return homeNavigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: name, params: params}],
    }),
  );
}

function replace(name, params) {
  return homeNavigationRef.current?.dispatch(
    StackActions.replace(name, params),
  );
}

function push(name, params) {
  return homeNavigationRef.current?.dispatch(StackActions.push(name, params));
}

function pop(name, params) {
  return homeNavigationRef.current?.dispatch(StackActions.pop(1));
}
function popN(num) {
  return homeNavigationRef.current?.dispatch(StackActions.pop(num));
}

export {navigate, reset, replace, push, pop, popN};
