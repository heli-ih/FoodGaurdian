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
} from "react-native";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
const { GoogleGenerativeAI } = require("@google/generative-ai");
// put api key from .env
import { db } from "../firebase/index";
import { ref, set, push, onValue } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category } from "./_layout";

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
    expiryDate: "",
  });
  const cameraRef = useRef();
  const [images, setImages] = useState([]);
  const [focus, setFocus] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);

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
      } else {
        console.log("No categories found in the database.");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (route.params && route.params.setToTrue) {
      setInfo(true);
    }
    if (route.params && route.params.selectedProduct) {
      setInfo(true);
      setProductData(route.params.selectedProduct[0]);
    }
  }, [route.params]);

  const goCreateItem = () => {
    navigation.navigate("createItem", {
      product: productData,
    });
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

  const getDetails = async () => {
    try {
      if (cameraRef.current) {
        // const genAI = new GoogleGenerativeAI(API_KEY);
        // const model = genAI.getGenerativeModel({
        //   model: "gemini-pro-vision",
        // });
        // const prompt =
        //   'This is an image of a food can. Extract this name and identify its category from this list=[bread, milk, cheese, chicken, meats, fruits, and vegetables]. Return the result in the format of "name-category". If the category does not exist return it as unknown.';
        // // const imageParts = [
        // //   await fileToGenerativePart(data.uri, "image/jpeg"),
        // // ];
        // const imageParts = await Promise.all(
        //   [...images].map((img) => fileToGenerativePart(img, "image/jpeg"))
        // );
        // const result = await model.generateContent([prompt, ...imageParts]);
        // const response = await result.response;
        // const text = response.text();

        // console.log("The name of this item is", text);

        // const splitedResult = text.split("-");
        // setProductData({
        //   ...productData,
        //   productName: splitedResult[0],
        //   category: splitedResult[1],
        // });
        setInfo(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // const getProduct = async () => {
  //   {
  //     try {
  //       if (cameraRef.current) {
  //         const data = await cameraRef.current.takePictureAsync();
  //         setImages(data.uri);
  //         const genAI = new GoogleGenerativeAI(API_KEY);
  //         const model = genAI.getGenerativeModel({
  //           model: "gemini-pro-vision",
  //         });
  //         const prompt =
  //           'This is an image of a food can. Extract this name and identify its category from this list=[bread, milk, cheese, chicken, meats, fruits, and vegetables]. Return the result in the format of "name-category". If the category does not exist return it as unknown.';
  //         const imageParts = [
  //           await fileToGenerativePart(data.uri, "image/jpeg"),
  //         ];
  //         const result = await model.generateContent([prompt, ...imageParts]);
  //         const response = result.response;
  //         const text = response.text();

  //         console.log("The name of this item is", text);

  //         const splitedResult = text.split("-");
  //         setProductData({
  //           ...productData,
  //           productName: splitedResult[0],
  //           category: splitedResult[1],
  //         });
  //         return text;
  //       }
  //     } catch (e) {
  //       console.error("Error getting product:", e);
  //     }
  //   }
  // };

  // const getExpiryDate = async () => {
  //   if (cameraRef.current) {
  //     try {
  //       const data = await cameraRef.current.takePictureAsync();
  //       setImages(data.uri);
  //       const genAI = new GoogleGenerativeAI(API_KEY);
  //       const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  //       const prompt =
  //         'This is the image of an expiry date of a product on a food can. Return to me this date in the format of "yyyy.mm.dd" ';
  //       const imageParts = [await fileToGenerativePart(data.uri, "image/jpeg")];
  //       const result = await model.generateContent([prompt, ...imageParts]);
  //       const response = result.response;
  //       const text = response.text();

  //       console.log("The expiary date of this item is", text);
  //       setProductData({
  //         ...productData,
  //         expiryDate: text,
  //       });
  //       return text;
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // };

  // const getWeight = async () => {
  //   if (cameraRef.current) {
  //     try {
  //       const data = await cameraRef.current.takePictureAsync();
  //       setImages(data.uri);
  //       const genAI = new GoogleGenerativeAI(API_KEY);
  //       const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  //       const prompt =
  //         'This is the image of a product\'s weight on a food can. Extract this quantity. return in the format of "quantity" ';
  //       const imageParts = [await fileToGenerativePart(data.uri, "image/jpeg")];
  //       const result = await model.generateContent([prompt, ...imageParts]);
  //       const response = result.response;
  //       const text = response.text();

  //       console.log("The quantity of this item is", text);
  //       setProductData({
  //         ...productData,
  //         quantity: text,
  //       });
  //       return text;
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // };

  return (
    <ScrollView>
      <View className="p-10 h-full mt-16 ">
        <Text className="text-3xl font-bold ">Create Item</Text>
        {/* Camera */}
        <View className=" flex-1 h-96 ">
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
            <FontAwesome name="circle" size={45} color="gray" onPress={click} />
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
          <View className="items-end mb-20">
            <View className="bg-theme w-32 rounded-3xl">
              <Button
                onPress={goCreateItem}
                title="Details"
                color="white"
              ></Button>
            </View>
          </View>
        ) : null}
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
    position: "relative",
    borderRadius: 10,
    marginTop: 30,
  },
});
