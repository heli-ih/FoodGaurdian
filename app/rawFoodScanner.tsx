import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  Button,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera/legacy";
import * as FileSystem from "expo-file-system";
import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import config from "../config";
const apiKey = config.API_KEY;
import { db } from "./firebase/index";
import { ref, set, push, onValue } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category } from "./(tabs)/_layout";
import { coolDownAsync } from "expo-web-browser";
const genAI = new GoogleGenerativeAI(apiKey);

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

export default function ScanScreen() {
  const [productData, setProductData] = useState({
    productName: "",
    category: "",
    quantity: "",
    price: "",
    expiryDate: "",
    numberOfUnits: "",
  });
  const cameraRef = useRef(null);
  const [images, setImages] = useState([]);
  const [focus, setFocus] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get Categories
  useEffect(() => {
    const categoriesRef = ref(db, "categories");
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categories = snapshot.val();
        const fetchedCategories: Category[] = Object.entries(categories).map(
          ([id, cat]) => ({
            ...(cat as Category),
          })
        );
        setCategories(fetchedCategories);
      } else {
        console.log("No categories found in the database.");
      }
    });

    return () => unsubscribe();
  }, []);

  const goCreateItem = () => {
    navigation.navigate("createItem", {
      product: productData,
    });
    setImages([]);
  };

  const focusCamera = () => {
    setFocus(false);
    setTimeout(() => {
      setFocus(true);
    }, 200);
  };

  const click = async () => {
    try {
      if (cameraRef.current) {
        const data = await cameraRef.current.takePictureAsync();
        setImages((prevImages) => [...prevImages, data.uri]);
      }
    } catch (e) {
      console.error("Error getting product:", e);
    }
  };

  let newProductData;
  const getDetails = async () => {
    try {
      if (cameraRef.current) {
        const model = genAI.getGenerativeModel({
          model: "gemini-pro-vision",
        });
        const prompt =
          'This is an image of raw food. What is the name of this food? what category is it (fruit or vegetable? what is the average weight of it? what is the average price of this piece in US dollars? on average, for how many days does it stay fresh (format it as dd/mm/yyyy)? how many of them are in the picture? Strictly, return the answers as a JSON object. A typical response should be as follows:{name: "Potato",category: "Vegetables",weight: "200 g",price: "2.5",expiryDate: "20/07/2024", numberOfUnits: "2"}';
        // const imageParts = [
        //   await fileToGenerativePart(data.uri, "image/jpeg"),
        // ];
        const imageParts = await Promise.all(
          [...images].map((img) => fileToGenerativePart(img, "image/jpeg"))
        );
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const json = response.text();
        let trimmedResponse = json.match(/{[^]*}/);
        let jsonObject = JSON.parse(trimmedResponse[0]);
        let values: string[] = Object.values(jsonObject);

        newProductData = {
          productName: values[0],
          category: await classifier(values[1]),
          quantity: values[2],
          price: values[3],
          expiryDate: values[4],
          numberOfUnits: values[5],
        };

        setProductData(newProductData);
        console.log("productData is ", newProductData);

        setProductData(newProductData);
        console.log("productData is ", newProductData);

        navigation.navigate("createItem", {
          newProductData: newProductData,
        });
        setImages([]);
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

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

  return (
    <ScrollView>
      <Ionicons
        name="arrow-back"
        size={24}
        color="black"
        className="ml-9 mt-20"
        onPress={goCreateItem}
      />
      <View className={isLoading ? "bg-slate-50 opacity-25 p-10" : "p-10"}>
        <Text className="text-3xl font-bold ">Raw Food Scanner</Text>
        <Text className="text-xl mt-10">
          Start capturing details of your product!
        </Text>

        {/* Camera */}
        <View className=" flex-1 h-96 rounded-3xl">
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
          <View className=" absolute items-center top-3/4  w-full">
            <FontAwesome name="circle" size={53} color="#018E6F" />
          </View>
          <View className=" absolute items-center top-3/4  w-full">
            <FontAwesome
              name="circle"
              size={39}
              color="white"
              onPress={click}
              className="mt-2"
            />
          </View>
        </View>

        {/* Images */}
        <View style={styles.container}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img }} style={styles.image} />
            </View>
          ))}
        </View>

        {/* Details */}
        {images.length ? (
          <View className="items-end mb-20 mt-7">
            <View className="bg-theme w-32 rounded-3xl">
              <Button
                onPress={() => {
                  getDetails(), setIsLoading(true);
                }}
                title="Details"
                color="white"
              ></Button>
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator
            className="absolute  top-1/4 left-1/3 ml-12 mt-14"
            size={100}
            color={"#000000"}
          />
        ) : undefined}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 40,
  },
  imageContainer: {
    width: "48%",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    position: "relative",
    borderRadius: 10,
    marginTop: 30,
  },
});
