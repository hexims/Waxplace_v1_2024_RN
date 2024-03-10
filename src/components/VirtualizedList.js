// import React, {useRef} from 'react';
// import {FlatList} from 'react-native-gesture-handler';
// export const VirtualizedList = ({
//   children,
//   style = {},
//   onMomentumScrollEnd = () => {},
//   refreshControl = {},
//   scrollEnabled = true,
//   keyExtractor = () => 'key',
//   listRef = useRef(null),
//   contentContainerStyle = {},
// }) => {
//   return (
//     <FlatList
//       ref={listRef}
//       listKey={(item, index) => `_key${index.toString()}`}
//       showsVerticalScrollIndicator={false}
//       data={[]}
//       contentContainerStyle={contentContainerStyle}
//       style={style}
//       scrollEnabled={scrollEnabled}
//       keyExtractor={keyExtractor}
//       renderItem={null}
//       onMomentumScrollEnd={onMomentumScrollEnd}
//       refreshControl={refreshControl}
//       onEndReachedThreshold={0.5}
//       ListHeaderComponent={<>{children}</>}
//     />
//   );
// };

import React, {useRef} from 'react';
import {FlatList} from 'react-native-gesture-handler';
export const VirtualizedList = ({
  children,
  style = {},
  onMomentumScrollEnd = () => {},
  scrollEnabled = true,
  keyExtractor = () => 'key',
  listRef = useRef(null),
}) => {
  return (
    <FlatList
      ref={listRef}
      listKey={(item, index) => `_key${index.toString()}`}
      showsVerticalScrollIndicator={false}
      data={[]}
      style={style}
      scrollEnabled={scrollEnabled}
      keyExtractor={keyExtractor}
      renderItem={null}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={<>{children}</>}
    />
  );
};
