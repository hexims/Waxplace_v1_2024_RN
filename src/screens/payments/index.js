import React, {useState, useContext, useRef} from 'react';
import {StyleSheet, SafeAreaView, View, Text} from 'react-native';
import * as ProfileNavigation from '../../router/_ProfileNavigation';

import {connect} from 'react-redux';
import {SearchBar} from '../../components/SearchBar';
import {updateUserDetails} from '../../redux/actions/UserAction';
import {DarkModeContext} from '../../components/DarkModeContext';
import textContent from '../../utils/textContent';
import {CardManager} from '../../components/CardManager';
import {BankAccountManager} from './BankAccountManager';
import {KycManager} from './KycManager';
import TabSwitcher from '../../components/TabSwitcher';
import {useIsFocused} from '@react-navigation/native';

const PaymentSettings = ({userReducer, updateUserDetails, route}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const isFocused = useIsFocused();
  const [searchText, setSearchText] = useState('');
  const tabs = [
    {
      title: textContent.general.manage_bank_info,
      content: (
        <>
          <BankAccountManager
            userReducer={userReducer}
            updateUserDetails={updateUserDetails}
            paymentMode={false}
          />
        </>
      ),
    },
    {
      title: textContent.general.manage_your_cards,
      content: (
        <>
          <CardManager
            userReducer={userReducer}
            updateUserDetails={updateUserDetails}
            paymentMode={false}
          />
        </>
      ),
    },
  ];
  return (
    <SafeAreaView style={styles.maincontainer(colors)}>
      <SearchBar
        searchEnabled={false}
        cartValue={userReducer.cartLength}
        searchText={searchText}
        searchFunction={text => {
          setSearchText(text);
        }}
        placeHolderCondition={
          searchText !== '' ? '' : textContent.general.payment_settings
        }
        onBackPress={() => {
          ProfileNavigation.pop();
        }}
        showCart={false}
      />
      <View style={{marginTop: 5, width: '100%', flex: 1}}>
        {route?.params?.kycApproved ? (
          <TabSwitcher tabs={tabs} />
        ) : (
          <KycManager
            kycApproved={route?.params?.kycApproved}
            validationAsked={route?.params?.validationAsked}
            userReducer={userReducer}
            updateUserDetails={updateUserDetails}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: colors => ({
    flex: 1,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
  }),
});

const mapStateToProps = state => ({
  userReducer: state.userReducer,
});

export default connect(mapStateToProps, {updateUserDetails})(PaymentSettings);
