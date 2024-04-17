import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Alert,
} from "react-native";
import { CameraView } from "expo-camera/next";
import { Camera } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "./(tabs)/_layout";

export default function QRscan() {
  const [hasPermission, setHasPermission] = useState(null);
  const [productData, setProductData] = useState<Product>();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef();
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

  let EntireResponse;
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    const proxyurl = "https://cors-anywhere.herokuapp.com/"; // Use a proxy to avoid CORS error
    const api_key = "elylitruvgtbrhgc2s1cf3wqexxq0h";
    const url =
      proxyurl +
      `https://api.barcodelookup.com/v3/products?barcode=${data}&formatted=y&key=` +
      api_key;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setProductData({ ...productData, productName: data.products[0].title });
        EntireResponse = JSON.stringify(data, null, "<br/>");
      })
      .catch((err) => {
        throw err;
      });

    console.log("hi");
    console.log(data.products[0].title);
    Alert.alert(
      "Successful",
      `Data is ${data}`,

      [
        {
          text: "OK",
          onPress: () => {
            console.log({ data }, { productData }, { EntireResponse });
            // navigation.navigate("createItem");
          },
        },
      ]
    );
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
    <View>
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
        </View>
        <TouchableOpacity
          className="bg-theme w-32 h-8 rounded-3xl flex items-center justify-center"
          onPress={() => setScanned(false)}
          disabled={scanned}
        >
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
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
