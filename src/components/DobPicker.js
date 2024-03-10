import React, {useState, useContext} from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Dialog} from 'react-native-simple-dialogs';
import {useToast} from 'react-native-toast-notifications';
import textContent from '../utils/textContent';
import {DarkModeContext} from './DarkModeContext';
import {MainButton} from './MainButton';

const DOBPicker = ({setDateOfBirth, dobPicker, setDobPicker}) => {
  const [dob, setDOB] = useState(new Date());
  const toast = useToast();
  const [selectedDate,setSelectedDate] =useState(new Date())

  const {darkMode, colors} = useContext(DarkModeContext);

  const handleDOBChange = date => {
    const today = new Date();
    let dob = new Date(date);
    let ageDiff = today.getFullYear() - dob.getFullYear();
    let monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      ageDiff--;
    }
    if (ageDiff >= 18) {
      const formattedDate =
        dob.getDate() + '/' + (dob.getMonth() + 1) + '/' + dob.getFullYear();
      setDOB(dob);
      setDateOfBirth(formattedDate);

      // Pass the formatted date to a prop or do something with it
    } else {
      // Show an alert or do something else to handle the age requirement
      toast.show(textContent.general.eighteen_plus);
    }
  };

  return (
    <>
      {Platform.OS == 'android' && dobPicker && (
        <DateTimePicker
          testID="datePicker"
          value={dob}
          mode={'date'}
          maximumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setDobPicker(false);
            handleDOBChange(selectedDate);
          }}
        />
      )}
      <Dialog
        visible={dobPicker && Platform.OS == 'ios'}
        onTouchOutside={() => {
          setDobPicker(false);
        }}
        contentStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 15,
          alignItems: 'center',
        }}
        dialogStyle={{
          backgroundColor: colors.cardColor,
          borderRadius: 15,

          backgroundColor: colors.secondaryBackground,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View style={{}}>
        <DateTimePicker
          testID="datePicker"
          value={dob}
          mode={'date'}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          is24Hour={true}
          onChange={(event, date) => {
          
           setSelectedDate(date)
          }}
        />
        </View>
        <MainButton
          style={{
            marginTop: 10,
            height: 35,
            width: 200,
            paddingHorizontal: 10,
            borderRadius: 15,
            backgroundColor: colors.primaryButtonColor,
            shadowColor: colors.shadowColor,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
          onPress={() => {
            setDobPicker(false);
            handleDOBChange(selectedDate);
          }}
          fontSize={15}
          title={textContent.Registration.button_text_one}
        />
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedDOB: {
    marginTop: 10,
  },
});

export default DOBPicker;
