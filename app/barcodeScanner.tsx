import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Alert,
} from "react-native";
import { CameraView, Camera } from "expo-camera/next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "./(tabs)/_layout";

export default function QRscan() {
  const [hasPermission, setHasPermission] = useState(null);
  const [productData, setProductData] = useState<Product>();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

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
  let newProductData;

  const handleBarCodeScanned = ({ type, data }) => {
    data = "5000246726011";
    setScanned(true);
    const url = `https://world.openfoodfacts.org/api/v2/search?code=${data}&fields=product_name,food_groups,expiration_date,quantity,categories_hierarchy`;

    // Fetch name, category, expiry date and quantity of a product
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        newProductData = {
          productName: data.products[0].product_name,
          category: data.products[0].food_groups.slice(3),
          expiryDate: data.products[0].expiration_date,
          quantity: data.products[0].quantity,
        };

        EntireResponse = JSON.stringify(data, null, "<br/>");
        setProductData({
          ...productData,
          ...newProductData,
        });
        console.log("productData is ", {
          ...productData,
          ...newProductData,
        });
      })
      .catch((err) => {
        throw err;
      });

    Alert.alert(
      "Successful",
      `Data is ${data}`,

      [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("createItem", {
              newProductData: {
                ...productData,
                ...newProductData,
              },
            });
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
        <Text style={styles.text}>Camera permission not granted</Text>
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
        <Text className="text-3xl font-bold ">Barcode Scanner</Text>
        <Text className="text-xl my-10">Scan the barcode of your product!</Text>
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                "aztec",
                "ean13",
                "ean8",
                "qr",
                "pdf417",
                "upc_e",
                "datamatrix",
                "code39",
                "code93",
                "itf14",
                "codabar",
                "code128",
                "upc_a",
              ],
            }}
            style={styles.camera}
            focusable={true}
          />
        </View>
        {/* <TouchableOpacity
          className="bg-theme w-32 h-8 rounded-3xl flex items-center justify-center"
          onPress={() => setScanned(false)}
          disabled={scanned}
        >
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity> */}
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
