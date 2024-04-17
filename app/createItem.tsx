import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  AntDesign,
  Entypo,
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebase/index";
import { ref, set, push, onValue, update } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category } from "./(tabs)/_layout";
import { Divider } from "@rneui/themed";

export default function CreateItem() {
  const [productData, setProductData] = useState({
    productName: "",
    category: "",
    expiryDate: "",
    quantity: "",
    numberOfUnits: "",
    price: "",
  });
  const cameraRef = useRef();
  const [isFocus, setIsFocus] = useState(false);
  const [isOptons, setIsOptions] = useState(false);
  const [date, setDate] = useState(new Date());
  const [categories, setCategories] = useState<Category[]>([]);

  // Get Categories
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
        console.log("fetchedCategories ", fetchedCategories);
      } else {
        console.log("No categories found in the database.");
      }
    });

    return () => unsubscribe();
  }, []);

  const route = useRoute();
  const navigation = useNavigation();

  const handleCreate = async (
    productData: React.SetStateAction<{
      productName: string;
      category: string;
      quantity: string;
      expiryDate: string;
      numberOfUnits: string;
      price: string;
    }>
  ) => {
    try {
      const newRecordRef = push(ref(db, "records"));
      await set(newRecordRef, { ...productData });

      Alert.alert(
        "Product Created",
        "The product has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              console.log(
                "New record ",
                productData,
                " was added successfully!"
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error adding record to the database:", error);
    }
  };

  const handleConfirmation = async (
    productData: React.SetStateAction<{
      productName: string;
      category: string;
      quantity: string;
      expiryDate: string;
      numberOfUnits: string;
      price: string;
    }>
  ) => {
    try {
      if (!productData.productName) {
        Alert.alert("Product's name is missing!");
      } else {
        Alert.alert(
          "Product Confirmation",
          `Name: ${productData.productName}\nCategory: ${productData.category}\nQuantity: ${productData.quantity}\nExpiryDate: ${productData.expiryDate}\nNumber of Units: ${productData.numberOfUnits}\nPrice: ${productData.price}`,
          [
            {
              text: "Edit",
            },
            {
              text: "Confirm",
              onPress: () => {
                handleCreate(productData);
                console.log("confirmd!"), navigation.navigate("index");
                setSavings(
                  Number(productData.numberOfUnits) * Number(productData.price)
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error adding record to the database:", error);
    }
  };

  const goHome = () => {
    navigation.navigate("index");
  };

  const goScan = () => {
    navigation.navigate("scan");
  };

  const goBarcodeScanner = () => {
    navigation.navigate("barcodeScanner");
  };

  const goExpiryScanner = () => {
    navigation.navigate("expiryScanner");
  };

  const goCreateCategory = () => {
    navigation.navigate("createCategory");
  };

  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      setDate(selectedDate);

      const formattedDate = selectedDate.toLocaleDateString();
      if (productData)
        handleProductDataChange({
          expiryDate: formattedDate,
          category: productData.category,
          productName: productData.productName,
          quantity: productData.quantity,
          numberOfUnits: productData.numberOfUnits,
          price: productData.price,
        });
    } else {
      console.log("failed");
    }
  };

  const handleProductDataChange = (
    modifiedProduct: React.SetStateAction<{
      productName: string;
      category: string;
      quantity: string;
      expiryDate: string;
      numberOfUnits: string;
      price: string;
    }>
  ) => {
    setProductData(modifiedProduct);
  };

  return (
    <View className="bg-white">
      <Ionicons
        name="arrow-back"
        size={24}
        color="black"
        className="ml-9 mt-20"
        onPress={goHome}
      />
      <ScrollView className="p-10 mb-28">
        {/* Title */}
        <View className="flex flex-row justify-between items-center w-full mb-10">
          <Text className="text-3xl font-bold">Create Item</Text>

          <View
            className={
              isOptons
                ? "bg-theme rounded-full p-1 mr-3 shadow-md border border-neutral-700"
                : "p-1"
            }
          >
            <MaterialIcons
              name="electric-bolt"
              size={isOptons ? 24 : 28}
              color={isOptons ? "#F9E869" : "#018E6F"}
              onPress={() => setIsOptions(!isOptons)}
            />
          </View>
        </View>

        {/* Form  */}
        <View className="rounded-2xl bg-neutral-100 px-7 py-7 pb-10 gap-5">
          {/* Name */}
          <View>
            <Text className="text-xl font-bold pb-1">Name</Text>
            <TextInput
              value={productData ? `${productData.productName}` : ""}
              onChangeText={(text) =>
                handleProductDataChange({
                  productName: text,
                  category: productData.category,
                  quantity: productData.quantity,
                  expiryDate: productData.expiryDate,
                  numberOfUnits: productData.numberOfUnits,
                  price: productData.price,
                })
              }
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
            />
          </View>

          {/* Category */}
          <View>
            <View className="flex flex-row justify-between items-center w-full pb-1 pr-2">
              <Text className="text-xl font-bold ">Category</Text>
              <AntDesign
                style={styles.icon}
                color="black"
                name="pluscircleo"
                size={15}
                onPress={goCreateCategory}
              />
            </View>

            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: "#018E6F" }]}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={categories}
              search
              labelField="label"
              valueField="value"
              placeholder={
                !isFocus && productData ? `${productData.category}` : ""
              }
              searchPlaceholder="Search..."
              value={productData.category}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(text) => {
                handleProductDataChange({
                  expiryDate: productData.expiryDate,
                  category: text.value,
                  productName: productData.productName,
                  quantity: productData.quantity,
                  numberOfUnits: productData.numberOfUnits,
                  price: productData.price,
                });
                setIsFocus(false);
              }}
            />
          </View>

          {/* Exp Date */}
          <View>
            <Text className="text-xl font-bold pb-1">Expiry Date</Text>
            <DateTimePicker
              display="inline"
              mode="date"
              value={date}
              onChange={onChange}
            />
          </View>

          {/* Quantity */}
          <View>
            <Text className="text-xl font-bold pb-1">Quantity</Text>
            <TextInput
              value={productData ? `${productData.quantity}` : ""}
              onChangeText={(text) =>
                handleProductDataChange({
                  expiryDate: productData.expiryDate,
                  category: productData.category,
                  productName: productData.productName,
                  quantity: text,
                  numberOfUnits: productData.numberOfUnits,
                  price: productData.price,
                })
              }
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
            />
          </View>

          {/* Number of units */}
          <View>
            <Text className="text-xl font-bold pb-1">Number of units</Text>
            <TextInput
              value={productData ? `${productData.numberOfUnits}` : ""}
              onChangeText={(text) =>
                handleProductDataChange({
                  expiryDate: productData.expiryDate,
                  category: productData.category,
                  productName: productData.productName,
                  quantity: productData.quantity,
                  numberOfUnits: text,
                  price: productData.price,
                })
              }
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
            />
          </View>

          {/* Price */}
          <View>
            <Text className="text-xl font-bold pb-1">Price</Text>
            <TextInput
              value={productData ? `${productData.price}` : ""}
              onChangeText={(text) =>
                handleProductDataChange({
                  expiryDate: productData.expiryDate,
                  category: productData.category,
                  productName: productData.productName,
                  quantity: productData.quantity,
                  numberOfUnits: productData.numberOfUnits,
                  price: text,
                })
              }
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
            />
          </View>
        </View>

        {/* Options */}
        {isOptons && (
          <View className="flex items-start justify-center absolute right-3 top-12 py-3 px-3 rounded-xl bg-slate-50 border-2 border-neutral-300 shadow-xl">
            <TouchableOpacity
              onPress={goScan}
              className="flex flex-row gap-4 items-center px-7 pt-2 w-full"
            >
              <Entypo name="camera" size={24} color={"#018E6F"} />
              <Text className="text-xl font-semibold">AI</Text>
            </TouchableOpacity>
            {/* <Divider width={5} color="red" /> */}
            <Text className="text-neutral-400">
              ______________________________
            </Text>
            <TouchableOpacity
              onPress={goBarcodeScanner}
              className="flex flex-row gap-4 items-center px-7 pt-3 w-full"
            >
              <FontAwesome6 name="barcode" size={22} color={"#018E6F"} />
              <Text className="text-xl font-semibold">Barcode Scanner</Text>
            </TouchableOpacity>
            <Text className="text-neutral-400">
              ______________________________
            </Text>
            <TouchableOpacity
              onPress={goExpiryScanner}
              className="flex flex-row gap-4 items-center px-7 pt-3 w-full"
            >
              <Fontisto name="date" size={22} color="#018E6F" />
              <Text className="text-xl font-semibold">Expiry Scanner</Text>
            </TouchableOpacity>
            <Text className="text-neutral-400">
              ______________________________
            </Text>
            <TouchableOpacity className="flex flex-row gap-4 items-center px-7 pt-3 pb-2 w-full">
              <MaterialCommunityIcons
                name="food-apple"
                size={26}
                color="#018E6F"
              />
              <Text className="text-xl font-semibold -ml-1">Raw Food</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create  */}
        <View className="items-end mb-32 mt-16">
          <View className="bg-theme w-32 rounded-3xl">
            <Button
              title="Create"
              onPress={() => {
                handleConfirmation(productData);
              }}
              color="white"
            ></Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonContainer: {
    width: "30%",
    marginTop: 50,
    backgroundColor: "#AADAFA",
    borderRadius: 10,
  },
  dropdown: {
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgb(212, 212, 212)",
    backgroundColor: "white",
    height: 35,
  },
  datepicker: {
    borderRadius: 11,
    width: 110,
    borderWidth: 2,
    borderColor: "rgb(212, 212, 212)",

    height: 35,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 35,
    fontSize: 15,
  },
});
