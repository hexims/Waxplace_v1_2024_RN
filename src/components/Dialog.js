import * as React from 'react';
import {ScrollView} from 'react-native';
import {Dialog as Dialogs, Portal, Text} from 'react-native-paper';

export const Dialog = ({
  children,
  visible = false,
  dialogStyle = {},
  contentStyle = {},
}) => {
  return (

      <Dialogs visible={visible}  style={dialogStyle}>
        <Dialogs.ScrollArea>
          <ScrollView contentContainerStyle={contentStyle}>
            {children}
          </ScrollView>
        </Dialogs.ScrollArea>
      </Dialogs>
  
  );
};
