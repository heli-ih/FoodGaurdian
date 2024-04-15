import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";

import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebase/index";
import { ref, set, push, onValue } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category } from "./(tabs)/_layout";

export default function CreateItem() {
  const [productData, setProductData] = useState({
    productName: "",
    category: "",
    quantity: "",
    expiryDate: "",
  });
  const cameraRef = useRef();
  const [isFocus, setIsFocus] = useState(false);
  const [date, setDate] = useState(new Date());
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
    }>
  ) => {
    try {
      Alert.alert(
        "Product Confirmation",
        `Name: ${productData.productName}\nCategory: ${productData.category}\nQuantity: ${productData.quantity}\nExpiryDate: ${productData.expiryDate}`,
        [
          {
            text: "Confirm",
            onPress: () => {
              handleCreate(productData);
              console.log("confirmd!"), navigation.navigate("home");
            },
          },
          {
            text: "Edit",
          },
        ]
      );
    } catch (error) {
      console.error("Error adding record to the database:", error);
    }
  };

  const goHome = () => {
    navigation.navigate("home");
  };

  const goScan = () => {
    navigation.navigate("scan");
  };

  const goBarcodeReader = () => {
    navigation.navigate("barcodeReader");
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
      <ScrollView className="p-10 mb-32">
        <View className="flex flex-row justify-between w-full ">
          <Text className="text-3xl font-bold mb-10">Create Item</Text>
          <View className="flex flex-row justify-between pt-2 w-16">
            <Entypo
              name="camera"
              size={24}
              color={"#018E6F"}
              onPress={goScan}
            />
            <FontAwesome6
              name="barcode"
              size={22}
              color={"#018E6F"}
              onPress={goBarcodeReader}
            />
          </View>
        </View>
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
              placeholder={!isFocus ? `${productData.category}` : ""}
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
                })
              }
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
            />
          </View>
        </View>
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
