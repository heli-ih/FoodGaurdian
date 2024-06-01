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
import { format } from "date-fns";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import config from "../config";
// const apiKey = config.API_KEY;
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(apiKey);

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
  const [isCreateCategory, setIsCreateCategory] = useState(false);
  const [date, setDate] = useState(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ label: "", value: "" });

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
        console.log("categories", categories)
      } else {
        console.log("No categories found in the database.");
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const route = useRoute();
  const navigation = useNavigation();
  // async function classifier(apiCategory: string) {
  //   let catg = categories.map((c) => c.label)
  //   const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  //   const prompt = `you are a classifier. give me what category is ${apiCategory} from those catagories ${catg}. give the exact string from the list. if it is not from the list give me an "".`
  
  //   const result = await model.generateContent(prompt);
  //   const response = await result.response;
  //   const text = response.text();
  //   console.log(typeof text)
  //   console.log(text)
  //   return(text);
  // }
  useEffect(() => {
    if (route.params) {
      if (
        route.params.newProductData &&
        route.params.newProductData.expiryDate
      ) {
        const [day, month, year] =
          route.params.newProductData.expiryDate.split("/");
        const isoDate = new Date(year, month - 1, day).toISOString();
        const parsedDate = new Date(isoDate);
        // Set the state with the ISO 8601 formatted date string
        console.log(parsedDate);
        setDate(parsedDate);
      }

      if (route.params.newProductData) {
        setProductData(route.params.newProductData);
      }
    }
    setIsOptions(false);
  }, [route.params]);

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

  const goRawFoodScanner = () => {
    navigation.navigate("rawFoodScanner");
  };

  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      setDate(selectedDate);
      console.log(selectedDate);

      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      console.log(formattedDate);
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

  const handleCategoryCreate = async () => {
    try {
      const newCategoryRef = push(ref(db, "categories"));
      await set(newCategoryRef, { ...newCat });

      Alert.alert(
        "Category Created",
        "The category has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("New record ", newCat, " was added successfully!");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error adding record to the database:", error);
    }
    setNewCat({ label: "", value: "" });
  };

  const handleCategoryConfirmation = async () => {
    try {
      Alert.alert("Category Confirmation", `Name: ${newCat.value}`, [
        {
          text: "Edit",
        },
        {
          text: "Confirm",
          onPress: () => {
            handleCategoryCreate();
            console.log("confirmd!"), setIsCreateCategory(!isCreateCategory);
          },
        },
      ]);
    } catch (error) {
      console.error("Error confirming:", error);
    }
  };

  return (
    <KeyboardAwareScrollView>
      <View className="bg-white">
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          className="ml-9 mt-20"
          onPress={goHome}
        />

        <ScrollView className="p-10 ">
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
                value={
                  productData && productData.productName
                    ? productData.productName
                    : ""
                }
                onChangeText={(text) =>
                  handleProductDataChange({
                    ...productData,
                    productName: text,
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
                  onPress={() => {
                    setIsCreateCategory(true);
                  }}
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
                  !isFocus && productData && productData.category
                    ? `${productData.category}`
                    : ""
                }
                searchPlaceholder="Search..."
                value={
                  productData && productData.category
                    ? productData.category
                    : ""
                }
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
              <Text className="text-xl font-bold pt-1">Expiry Date</Text>
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
                value={
                  productData && productData.quantity
                    ? `${productData.quantity}`
                    : ""
                }
                onChangeText={(text) =>
                  handleProductDataChange({
                    ...productData,
                    quantity: text,
                  })
                }
                className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              />
            </View>

            {/* Number of units */}
            <View>
              <Text className="text-xl font-bold pb-1">Number of units</Text>
              <TextInput
                value={
                  productData && productData.numberOfUnits
                    ? `${productData.numberOfUnits}`
                    : ""
                }
                onChangeText={(text) =>
                  handleProductDataChange({
                    ...productData,
                    numberOfUnits: text,
                  })
                }
                className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              />
              <Text className="text-[10px] font-semibold pt-1 pl-1 text-neutral-400">
                Required to calculate the total worth of donations.
              </Text>
            </View>

            {/* Price */}
            <View>
              <Text className="text-xl font-bold pb-1">Price</Text>
              <TextInput
                value={
                  productData && productData.price ? `${productData.price}` : ""
                }
                onChangeText={(text) =>
                  handleProductDataChange({
                    ...productData,
                    price: text,
                  })
                }
                className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              />
              <Text className="text-[10px] font-semibold pt-1 pl-1 text-neutral-400">
                Required to calculate the total worth of donations.
              </Text>
            </View>
          </View>

          {/* Options */}
          {isOptons && (
            <View className="flex items-start justify-center absolute right-3 top-12 py-3 px-3 rounded-xl bg-slate-50 border-2 border-neutral-300 shadow-xl">
              <TouchableOpacity
                onPress={goScan}
                className="flex flex-row gap-4 items-center px-6 pt-2 w-full"
              >
                <Entypo name="camera" size={24} color={"#018E6F"} />
                <Text className="text-xl font-semibold">AI Scan</Text>
              </TouchableOpacity>
              <Text className="text-neutral-400">
                ______________________________
              </Text>
              <TouchableOpacity
                onPress={goRawFoodScanner}
                className="flex flex-row gap-4 items-center px-6 pt-3 w-full"
              >
                <MaterialCommunityIcons
                  name="food-apple"
                  size={26}
                  color="#018E6F"
                />
                <Text className="text-xl font-semibold -ml-1">
                  Raw Food Scan
                </Text>
              </TouchableOpacity>
              <Text className="text-neutral-400">
                ______________________________
              </Text>
              <TouchableOpacity
                onPress={goBarcodeScanner}
                className="flex flex-row gap-4 items-center px-7 pt-3 w-full"
              >
                <FontAwesome6 name="barcode" size={22} color={"#018E6F"} />
                <Text className="text-xl font-semibold">Barcode Scan</Text>
              </TouchableOpacity>
              <Text className="text-neutral-400">
                ______________________________
              </Text>
              <TouchableOpacity
                onPress={goExpiryScanner}
                className="flex flex-row gap-4 items-center px-7 pt-3 pb-2 w-full"
              >
                <Fontisto name="date" size={22} color="#018E6F" />
                <Text className="text-xl font-semibold">Expiry Scan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create  */}
          <View className="items-end mt-16">
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

        {/* Create Category Modal */}
        {isCreateCategory && (
          <View className="bg-white border-2 border-neutral-300 rounded-xl shadow-md shadow-black absolute top-52 left-10 w-[83%]">
            <View className="flex flex-row justify-end items-center w-fit">
              {/* Close  */}
              <Ionicons
                name="close-outline"
                size={24}
                color="black"
                className="m-5 mb-0"
                onPress={() => setIsCreateCategory(!isCreateCategory)}
              />
            </View>
            <ScrollView className="p-10 h-full mb-5">
              <Text className="text-2xl font-bold mb-10">Create Category</Text>

              <View className="rounded-2xl bg-neutral-100 px-7 py-7 pb-10 gap-5">
                {/* Name */}
                <View>
                  <Text className="text-xl font-bold pb-1">Name</Text>
                  <TextInput
                    className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
                    onChangeText={(text) =>
                      setNewCat({ label: text, value: text })
                    }
                    value={
                      productData.category ? productData.category : newCat.value
                    }
                  />
                </View>
                {/* Create  */}
                <View className="items-end  mt-16">
                  <View className="bg-theme w-32 rounded-3xl">
                    <Button
                      title="Create"
                      onPress={handleCategoryConfirmation}
                      color="white"
                    ></Button>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
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
