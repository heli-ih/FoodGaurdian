import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function ProfileScreen() {
  const [points, setPoints] = useState<number>(0);
  let base64Logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAA..";
  const route = useRoute();
  const navigation = useNavigation();

  const badges = [
    "https://firebasestorage.googleapis.com/v0/b/sdp2024-e72ff.appspot.com/o/1.png?alt=media&token=611d2ae0-2ae1-4dcd-86d9-6699190b9b56",
    "https://firebasestorage.googleapis.com/v0/b/sdp2024-e72ff.appspot.com/o/2.png?alt=media&token=1796d557-56ec-4c3c-b935-5dc06ac56cdf",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShare = async (uri: string) => {
    try {
      const imageFilename = badges[currentImageIndex];

      // Share the image using Expo Sharing module
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share this image",
        UTI: "com.instagram.photo",
      });
    } catch (error) {
      console.error("Error sharing image: ", error.message);
    }
  };

  const goQRscan = () => {
    navigation.navigate("QRscan");
  };

  useEffect(() => {
    if (route.params) {
      const newPoints = route.params["points"];
      setPoints(points + newPoints);
    }
  }, [route.params]);

  return (
    <View className=" bg-theme">
      <ScrollView className="py-10 h-full">
        {/* User Info */}
        <View className="flex p-10 justify-between items-center mt-5 ">
          <FontAwesome5 name="user-circle" size={120} solid color={"#0A1816"} />
          <Text className="font-bold text-4xl text-white mt-5">Jain Doe</Text>
          <Text className=" text-xl text-white">JainDoe@gamil.com</Text>
        </View>
        <View className="bg-themeDark w-screen h-full " style={styles.round}>
          {/* Score */}
          <View className="flex justify-between items-center my-7">
            <Text className="font-bold text-xl text-themeLight">Score</Text>
            <Text
              className={
                points
                  ? "font-bold text-4xl text-themeLight "
                  : "font-semibold text-xl text-themeLight "
              }
            >
              {points ? points : "Start Donating!"}
            </Text>
          </View>

          <View className=" bg-white h-full p-10" style={styles.round}>
            {/* Badge Collection */}
            <View>
              <Text className="text-2xl font-semibold">Badge Collection</Text>
              <View style={styles.container}>
                {badges.map((badge, index) => (
                  <View key={index} className=" w-2/5  items-center ">
                    {/* Badge */}
                    <View className="flex justify-center mb-10 mt-10 h-14">
                      {/* <Text>{badge}</Text> */}
                      <Image
                        source={{ uri: badge }}
                        style={{ width: 130, height: 130 }}
                      />
                    </View>
                    {/* Share */}
                    <View className="flex flex-row w-full items-center justify-end ">
                      <FontAwesome
                        name="share-square-o"
                        size={16}
                        solid
                        color={"#0A1816"}
                        onPress={() => handleShare(badge)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {/* QR Code */}
            <View>
              <Text className="text-2xl font-semibold mb-6">QR Code</Text>
              <View className="flex items-center mb-20">
                <View className="rounded-3xl border-2 border-neutral-300 items-center py-6 px-10">
                  <Text className="font-bold text-2xl">Active</Text>

                  <View className="p-10">
                    <FontAwesome
                      name="check"
                      size={24}
                      solid
                      color={"#0A1816"}
                      onPress={goQRscan}
                    />
                    <QRCode
                      value="Collect Points"
                      logo={{ uri: base64Logo }}
                      logoBackgroundColor="transparent"
                    />
                  </View>
                  <Text className="font-bold text-lg">6111000015735221</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  round: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
