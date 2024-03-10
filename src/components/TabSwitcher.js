import React, {useState, useRef, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Animated,
} from 'react-native';
import {DarkModeContext} from './DarkModeContext';

const TabSwitcher = ({tabs}) => {
  const {darkMode, colors} = useContext(DarkModeContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    tabsContainer: {
      flexDirection: 'row',

      height: 40,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabTitle: {
      fontWeight: 'bold',
      color: colors.primaryTextColor + '90',
    },
    activeTabTitle: {
      color: colors.waxplaceColor,
    },
    slider: {
      position: 'absolute',
      bottom: 0,
      height: 3,
      backgroundColor: colors.waxplaceColor,
    },
  });

  const handleTabPress = index => {
    setActiveIndex(index);
    const width = tabs[index].title.length * 10 + 20;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    sliderRef.current?.setNativeProps({
      style: {
        left: index * (width - 20) + 10,
        width,
      },
    });
  };

  const renderTab = (tab, index) => {
    const isActive = activeIndex === index;

    return (
      <TouchableOpacity
        key={tab.title}
        style={styles.tab}
        onPress={() => handleTabPress(index)}>
        <Text style={[styles.tabTitle, isActive && styles.activeTabTitle]}>
          {tab.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTabs = () => {
    const activeTabWidth = tabs[activeIndex].title.length * 10;
    const sliderWidth = activeTabWidth - 20;
    const numTabs = tabs.length;
    const tabWidth = 100 / numTabs;
    const translateX =
      activeIndex === 0
        ? 5.5
        : activeIndex === numTabs - 1
        ? 100 - tabWidth + 4
        : (activeIndex + 0.5) * tabWidth - activeTabWidth / 2;

    return (
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => renderTab(tab, index))}
        <Animated.View
          ref={sliderRef}
          style={[
            styles.slider,
            {
              width: sliderWidth,
              left: `${translateX}%`,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      {tabs[activeIndex].content}
    </View>
  );
};

export default TabSwitcher;
