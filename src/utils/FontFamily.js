import { Platform } from "react-native";

const fontFamily =
 Platform.OS=='ios'?{
  // MontserratRegular: "Montserrat Regular",
  // MontserratMedium: "Montserrat Medium",
  // MontserratBold: "Montserrat Bold",
  // RobotoSlabRegular:'RobotoSlab Regular'
}:
{
  MontserratRegular: "Montserrat-Regular",
  MontserratMedium: "Montserrat-Medium",
  MontserratBold: "Montserrat-Bold",
  RobotoSlabRegular:'RobotoSlab-Regular'
};

export default fontFamily;
