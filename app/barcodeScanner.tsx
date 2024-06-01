import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Alert,
} from "react-native";
import { CameraView } from "expo-camera";
import { Camera } from "expo-camera/legacy";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "./(tabs)/_layout";
import { db } from "./firebase/index";
import { ref, set, push, onValue, update } from "firebase/database";
import config from "../config";
const apiKey = config.API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(apiKey);

export default function QRscan() {
  const [hasPermission, setHasPermission] = useState(null);
  const [productData, setProductData] = useState<Product>();
  const [scanned, setScanned] = useState(false);
  const [focus, setFocus] = useState(true);
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);

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

  useEffect(() => {
    const categoriesRef = ref(db, "categories");
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categories = snapshot.val();
        const fetchedCategories: Category[] = Object.entries(categories).map(
          ([id, cat]) => ({
            id,
            ...cat,
          })
        );
        setCategories(fetchedCategories);
        console.log("categories", categories);
      } else {
        console.log("No categories found in the database.");
      }
    });

    return () => unsubscribe();
  }, []);

  async function classifier(apiCategory: string) {
    let catg = categories.map((c) => c.label);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `you are a classifier. give me what category is ${apiCategory} from those catagories ${catg}. give the exact string from the list.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    if (!catg.includes(text)) {
      text = "";
    }
    return text;
  }

  let EntireResponse;
  let newProductData;
  let valid = false;

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const url = `https://world.openfoodfacts.org/api/v2/search?code=${data}&fields=product_name,food_groups,expiration_date,quantity,categories_hierarchy`;

    // Fetch name, category, expiry date and quantity of a product
    fetch(url)
      .then((response) => response.json())
      .then(async (data) => {
        newProductData = {
          productName: data.products[0].product_name,
          category: await classifier(data.products[0].food_groups.slice(3)),
          expiryDate: data.products[0].expiration_date || "",
          quantity: data.products[0].quantity || "",
          numberOfUnits: "",
          price: "",
        };
        valid = true;
        if (newProductData.quantity == undefined) {
          newProductData.quantity === "";
        }
        EntireResponse = JSON.stringify(data, null, "<br/>");
        setProductData(newProductData);

        console.log("productData is ", newProductData);
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        Alert.alert(
          `${valid ? "Successful" : "Data Not Found"}`,
          `Barcode number is ${data}`,

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
        valid = false;
      });
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

  const focusCamera = () => {
    setFocus(false);
    setTimeout(() => {
      setFocus(true);
    }, 200);
  };

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
            autofocus={focus}
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
          >
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
          </CameraView>
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
