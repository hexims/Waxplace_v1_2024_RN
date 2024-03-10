import {UPDATE_USER_DETAILS} from './types';

export const updateUserDetails = ({prop, value}) => {
  return dispatch => {
    dispatch({
      type: UPDATE_USER_DETAILS,
      payload: {prop, value},
    });
  };
};
