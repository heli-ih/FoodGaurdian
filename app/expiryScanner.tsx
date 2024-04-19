import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView } from "expo-camera/next";
import { Camera } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "./(tabs)/_layout";
import config from "../config";
const apiKey = config.API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const key = process.env.API_KEY;
import * as FileSystem from "expo-file-system";

export default function QRscan() {
  const [hasPermission, setHasPermission] = useState(null);
  const [expiryDate, setExpiryDate] = useState();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const [image, setImage] = useState();
  const [focus, setFocus] = useState(true);
  const navigation = useNavigation();

  const focusCamera = () => {
    setFocus(false);
    setTimeout(() => {
      setFocus(true);
    }, 200);
  };

  const goCreateItem = () => {
    navigation.navigate("createItem");
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  async function fileToGenerativePart(path: string, mimeType: string) {
    try {
      const base64ImageData = await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem?.EncodingType?.Base64,
      });

      return {
        inlineData: {
          data: base64ImageData,
          mimeType,
        },
      };
    } catch (error) {
      console.error("Error reading and encoding file:", error);
      throw error;
    }
  }

  const getExpiry = async () => {
    {
      try {
        if (cameraRef.current) {
          const data = await cameraRef.current.takePictureAsync();
          setImage(data.uri);
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-pro-vision",
          });
          const prompt =
            'This is the image of an expiry date of a product on a food can. Return to me this date in the format of "dd/mm/yyyy" ';
          const imageParts = [
            await fileToGenerativePart(data.uri, "image/jpeg"),
          ];
          const result = await model.generateContent([prompt, ...imageParts]);
          const response = result.response;
          const text = response.text();

          console.log("The exp date of this item is", text);

          setExpiryDate(text);
          navigation.navigate("createItem", {
            newProductData: {
              id: "",
              productName: "",
              category: "",
              expiryDate: text,
              quantity: "",
              numberOfUnits: "",
              price: "",
            },
          });
        }
      } catch (e) {
        console.error("Error reading exp of product:", e);
      }
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Camera permission not granted</Text>
      </View>
    );
  }

  return (
    <>
      <View className={image ? "bg-white opacity-10" : ""}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          className="ml-9 mt-20"
          onPress={goCreateItem}
        />
        <View className="p-10 mb-32">
          <Text className="text-3xl font-bold ">Expiry Date Scanner</Text>
          <Text className="text-xl my-10">
            Scan the expiry date of your product!
          </Text>
          <View style={styles.cameraContainer}>
            {!image ? (
              <Camera style={styles.camera} ref={cameraRef} autoFocus={focus}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={focusCamera}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                  }}
                />
              </Camera>
            ) : (
              <Image source={{ uri: image }} style={styles.camera} />
            )}
          </View>
          <TouchableOpacity
            className="bg-theme w-32 h-8 rounded-3xl flex items-center justify-center"
            onPress={getExpiry}
            disabled={scanned}
          >
            <Text style={styles.buttonText}>Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
      {image ? (
        <ActivityIndicator
          className="absolute top-1/4 left-1/3 m-5 mt-44"
          size={100}
        />
      ) : undefined}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 40,
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 40,
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: "#018E6F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
