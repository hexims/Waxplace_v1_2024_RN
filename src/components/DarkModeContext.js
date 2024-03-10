import React, {createContext} from 'react';

import {darkModeColors, lightModeColors} from '../utils/Colors';

const DarkModeContext = createContext();

const DarkModeProvider = props => {
  return (
    <DarkModeContext.Provider
      value={{
        darkMode: props.darkMode,
        colors: props.darkMode ? darkModeColors : lightModeColors,
      }}>
      {props.children}
    </DarkModeContext.Provider>
  );
};

export {DarkModeContext, DarkModeProvider};
