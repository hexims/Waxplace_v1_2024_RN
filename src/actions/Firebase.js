export const getMeetingUpdates = (callback, meetingName, db) => {
  const dbRef = db.ref(`/scheduleMeeting/${meetingName}`);
  dbRef.on('value', snapshot => {
    callback(snapshot.val());
  });

  return () => {
    dbRef.off();
  };
};

export const getScheduledMeetingsFirebase = (callback, db) => {
  const dbRef = db.ref(`/scheduleMeeting`);
  dbRef.on('value', snapshot => {
    callback(snapshot.val());
  });

  return () => {
    dbRef.off();
  };
};

export const updateMeetingStatusFirebase = (meetingName, meetingStatus, db) => {
  db.ref(`/scheduleMeeting/${meetingName}`).update({
    status: meetingStatus,
  });
};
