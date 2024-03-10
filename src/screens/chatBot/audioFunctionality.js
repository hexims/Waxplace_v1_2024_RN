import React,{ useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from "react-native-audio-recorder-player";
import { useToast } from "react-native-toast-notifications";
import textContent from "../../utils/textContent";

export const audioFunctionality = (audioPath,audioData,setAudioData,audioUri,setAudioUri,recordToggle,playbackToggle,play) => {
  const toast = useToast();
  const [initial,setInitial] = useState(true)

  const audioRecorderPlayer = new AudioRecorderPlayer();

  useEffect(() => {
    if (recordToggle) {
      onStartRecord();
    } else {
      if (initial) {
        setInitial(false);
      } else {
        onStopRecord();
      }
    }
  }, [recordToggle]);

  useEffect(() => {
    if (playbackToggle) {
      if (play) {
        onStartPlay();
      } else {
        onPausePlay();
      }
    }
  }, [play]);

  const settingAudioData = (data) => {
    let audio =audioData
    setAudioData({ ...audio, ...data });
  };

  const onStartRecord = React.useCallback(async () => {
    try {
      // Request permissions for both Android and iOS.
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          // Android-specific settings
          const audioSet = {
            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
            AudioSourceAndroid: AudioSourceAndroidType.MIC,
          };

          const uri = await audioRecorderPlayer.startRecorder(audioPath, audioSet);
          audioRecorderPlayer.addRecordBackListener((e) => {
            settingAudioData({
              recordSecs: e.currentPosition,
              recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
            });
          });
          setAudioUri(uri);
        } else {
          return;
        }
      }

      if (Platform.OS === 'ios') {
        // iOS-specific settings
        const audioSet = {
          AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
          AVNumberOfChannelsKeyIOS: 2,
          AVFormatIDKeyIOS: AVEncodingOption.aac,
        };

        const uri = await audioRecorderPlayer.startRecorder(audioPath, audioSet);
        audioRecorderPlayer.addRecordBackListener((e) => {
          settingAudioData({
            recordSecs: e.currentPosition,
            recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
          });
        });
        setAudioUri(uri);
      }
    } catch (err) {
      toast.show(textContent.general.general_error);
      return;
    }
  }, [audioPath]);

  const onStopRecord = React.useCallback(async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    settingAudioData({
      recordSecs: 0,
    });
  }, [audioPath]);

  const onStartPlay = React.useCallback(async () => {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const msg = await audioRecorderPlayer.startPlayer(audioPath);

        audioRecorderPlayer.addPlayBackListener((e) => {
          settingAudioData({
            currentPositionSec: e.currentPosition,
            currentDurationSec: e.duration,
            playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
            duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
          });
          return;
        });
      }
    } catch (err) {
      toast.show(textContent.general.general_error);
      return;
    }
  }, [audioPath]);

  const onPausePlay = React.useCallback(async () => {
    await audioRecorderPlayer.pausePlayer();
  }, [audioPath]);

  const onStopPlay = React.useCallback(async () => {
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  }, [audioPath]);
};
