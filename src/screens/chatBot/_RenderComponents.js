import React, {useCallback, useLayoutEffect, useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Bubble} from 'react-native-gifted-chat';
import {findFocusedRoute} from '@react-navigation/native';
import fontFamily from '../../utils/FontFamily';
import {OrderDetailsBubble} from './OrderDetailsBubble';
import {QuickRepliesBubble} from './QuickRepliesBubble';
import {PaymentDetailsBubble} from './PaymentDetailsBubble';
import {ContactUsBubble} from './ContactUsBubble';
import {AudioBubble} from './AudioBubble';
import {ReturnDetailsBubble} from './ReturnDetailsBubble';
import {ImageBubble} from './ImageBubble';
import {TrackingBubble} from './TrackingBubble';
import {OptionsBubble} from './OptionsBubble';
import {CancelShipmentBubble} from './CancelShipmentBubble';
import {InfoBubble} from './InfoBubble';
import {useContext} from 'react';
import {DarkModeContext} from '../../components/DarkModeContext';
import moment from 'moment';
import {color} from 'react-native-reanimated';

export const RenderComponents = ({
  giftedChatProps,
  onQuickReply,
  updateWaxbot,
  addAudio,
  addImage,
  userReducer,
  updateUserDetails,
  updateChat,
  removeChat,
  returnId,
  returnInitiated,
}) => {
  //...other code
  const {darkMode, colors} = useContext(DarkModeContext);
  const {currentMessage} = giftedChatProps;
  const {type, _id} = currentMessage;

  switch (currentMessage.type) {
    case 'QUICKREPLIES': {
      return (
        <QuickRepliesBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          onQuickReply={onQuickReply}
          quickReplies={currentMessage.quickReplies}
          //...other props
        />
      );
    }
    case 'CONTACTUS': {
      return (
        <ContactUsBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          //...other props
        />
      );
    }
    case 'OPTIONS': {
      return (
        <OptionsBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          updateUserDetails={updateUserDetails}
          //...other props
        />
      );
    }
    case 'AUDIO': {
      return (
        <AudioBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          updateUserDetails={updateUserDetails}
          userReducer={userReducer}
          removeChat={() => {
            removeChat();
          }}
          returnId={returnId}
          //...other props
        />
      );
    }
    case 'IMAGE': {
      return (
        <ImageBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          updateUserDetails={updateUserDetails}
          userReducer={userReducer}
          returnId={returnId}
          removeChat={() => {
            removeChat();
          }}
          //...other props
        />
      );
    }
    case 'TRACKING': {
      return (
        <TrackingBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          userReducer={userReducer}
          updateUserDetails={updateUserDetails}
          //...other props
        />
      );
    }
    case 'USERORDERS': {
      return (
        <OrderDetailsBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          //...other props
        />
      );
    }
    case 'PAYMENTDETAILS': {
      return (
        <PaymentDetailsBubble
          _id={_id}
          currentMessage={currentMessage}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          //...other props
        />
      );
    }
    case 'RETURNDETAILS': {
      return (
        <ReturnDetailsBubble
          _id={_id}
          currentMessage={currentMessage}
          userReducer={userReducer}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          addAudio={addAudio}
          addImage={addImage}
          updateUserDetails={updateUserDetails}
          updateChat={updateChat}
          returnInitiated={() => {
            returnInitiated();
          }}
          //...other props
        />
      );
    }

    case 'INFO': {
      return <InfoBubble _id={_id} currentMessage={currentMessage} />;
    }
    case 'CANCELSHIPMENT': {
      return (
        <CancelShipmentBubble
          _id={_id}
          currentMessage={currentMessage}
          userReducer={userReducer}
          title={currentMessage.text}
          updateWaxbot={updateWaxbot}
          addAudio={addAudio}
          addImage={addImage}
          updateUserDetails={updateUserDetails}
          //...other props
        />
      );
    }
    default: {
      return (
        <Bubble
          {...giftedChatProps}
          renderTime={() => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 5,
                marginBottom: 10,
                minWidth: '20%',
              }}>
              <View
                style={{
                  backgroundColor: colors.secondaryBackground,
                  borderWidth: 1,
                  borderColor: colors.secondaryBackground,
                  paddingBottom: -1,
                  paddingLeft: 5,
                  // marginTop: 5,
                  marginRight: 5,
                  borderRadius: 12,
                }}>
                <Text
                  style={{
                    backgroundColor: colors.transparent,
                    color: colors.gray,
                    fontSize: 12,
                    fontFamily: fontFamily.MontserratRegular,
                  }}>
                  {moment(currentMessage.createdAt).format('hh:mm a')}
                </Text>
              </View>
            </View>
          )}
          textStyle={{
            right: {
              color: colors.primaryTextColor,
              fontFamily: fontFamily.MontserratMedium,
            },
            left: {
              color: colors.primaryTextColor,
              backgroundColor: colors.secondaryBackground,
              fontFamily: fontFamily.MontserratMedium,
            },
          }}
          wrapperStyle={{
            left: {
              backgroundColor: colors.secondaryBackground,
              borderWidth: 1,
              borderColor: colors.secondaryBackground,
              paddingBottom: -1,
              paddingLeft: 3,
              // marginTop: 5,
              marginRight: 5,
              borderRadius: 12,
            },
            right: {
              backgroundColor: colors.secondaryBackground,
              borderWidth: 1,
              borderColor: colors.secondaryBackground,
              paddingBottom: -1,
              paddingLeft: 3,
              // marginTop: 15,
              marginRight: 5,
              borderRadius: 12,
            },
          }}
        />
      );
    }
  }
};

export default RenderComponents;
