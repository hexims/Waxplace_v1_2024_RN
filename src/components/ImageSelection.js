
import React, { memo, useContext } from "react";
import { Image, TouchableOpacity, View, Text } from "react-native";
import { getImage } from "../actions/GenericAPI";
import imagepath from "../utils/Images";
import textContent from '../utils/textContent';
import { DarkModeContext } from "./DarkModeContext";
import fontFamily from "../utils/FontFamily";



const ImageSelection = ({ pos, enabled, image, setSelectedImagePos, setCameraPickDialog,disabled=false }) => {

    const { darkMode, colors } = useContext(DarkModeContext);
    
    return <View>
        <TouchableOpacity
            disabled={disabled}
            onPress={() => {
                setSelectedImagePos(pos);
                setCameraPickDialog(true);
            }}
        >
            <View
                style={[
                    {
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    { borderRadius: 12, overflow: 'hidden' },
                ]}
            >
                <Image
                    style={[{ height: 70, width: 70, borderRadius: 12, }, image == '' && { tintColor: darkMode ? colors.white : colors.black, }]}
                    source={image !== '' ? getImage(image) : imagepath.addPic}
                />
            </View>
        </TouchableOpacity>
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 5,
            }}
        >
            <Text
                style={{
                    fontFamily: fontFamily.MontserratRegular,
                    color: colors.primaryTextColor,
                    fontSize: 13,
                }}
            >
                {pos === 0 ? textContent.CreateSaleProduct.principal : ''}
            </Text>
        </View>
    </View>

}



export default memo(ImageSelection)