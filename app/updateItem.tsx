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

import { AntDesign, Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebase/index";
import { ref, set, push, update, onValue } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category, Product } from "./(tabs)/_layout";
import { format } from "date-fns";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function UpdateItem() {
  const [productData, setProductData] = useState<Product>();
  const [isFocus, setIsFocus] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState(new Date());
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    if (
      route.params.selectedProduct &&
      route.params.selectedProduct.length > 0
    ) {
      const firstProduct = route.params.selectedProduct[0];
      if (firstProduct && firstProduct.expiryDate) {
        const expDate = firstProduct.expiryDate;
        const [day, month, year] = expDate.split("/");
        const isoDate = new Date(year, month - 1, day).toISOString();
        const parsedDate = new Date(isoDate);

        console.log(parsedDate);
        setDate(parsedDate);
      }
      setProductData(firstProduct);
    }
  }, [route.params]);

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

  const goHome = () => {
    navigation.navigate("index");
  };

  const goCreateCategory = () => {
    navigation.navigate("createCategory");
  };

  const handleUpdate = async () => {
    try {
      await update(ref(db, `records/${productData.id}`), productData);

      Alert.alert(
        "Product Updated",
        "The product has been updated successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Record ", productData, " was updated successfully!");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error updating record to the database:", error);
    }
  };

  const handleConfirmation = async () => {
    try {
      productData &&
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
                handleUpdate();
                console.log("confirmd!"), navigation.navigate("index");
              },
            },
          ]
        );
    } catch (error) {
      console.error("Error updating record to the database:", error);
    }
  };

  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      setDate(selectedDate);

      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      console.log(formattedDate);
      if (productData)
        handleProductDataChange({
          id: productData.id,
          expiryDate: formattedDate,
          category: productData.category,
          productName: productData.productName,
          quantity: productData.quantity,
        });
    } else {
      console.log("failed");
    }
  };

  const handleProductDataChange = (modifiedProduct: Product) => {
    setProductData(modifiedProduct);
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
        <ScrollView className="p-10">
          <Text className="text-3xl font-bold mb-10">Modify Item</Text>

          {/* Form  */}
          <View className="rounded-2xl bg-neutral-100 px-7 py-7 pb-10 gap-5">
            {/* Name */}
            <View>
              <Text className="text-xl font-bold pb-1">Name</Text>
              <TextInput
                value={productData ? `${productData.productName}` : ""}
                onChangeText={(text) => {
                  if (productData)
                    handleProductDataChange({
                      id: productData.id,
                      productName: text,
                      category: productData.category,
                      quantity: productData.quantity,
                      expiryDate: productData.expiryDate,
                      numberOfUnits: productData.numberOfUnits,
                      price: productData.price,
                    });
                }}
                className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              />
            </View>

            {/* Category */}
            <View>
              <View className="flex flex-row justify-between items-center w-full pb-1 pr-2">
                <Text className="text-xl font-bold ">Category</Text>
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
                value={productData ? productData.category : ""}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(text) => {
                  if (productData)
                    handleProductDataChange({
                      id: productData.id,
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
                value={productData ? `${productData.quantity}` : ""}
                onChangeText={(text) => {
                  if (productData)
                    handleProductDataChange({
                      id: productData.id,
                      expiryDate: productData.expiryDate,
                      category: productData.category,
                      productName: productData.productName,
                      quantity: text,
                      numberOfUnits: productData.numberOfUnits,
                      price: productData.price,
                    });
                }}
                className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              />
            </View>

            {/* Number of units */}
            <View>
              <Text className="text-xl font-bold pb-1">Number of units</Text>
              <TextInput
                value={productData ? `${productData.numberOfUnits}` : ""}
                onChangeText={(text) => {
                  if (productData) {
                    handleProductDataChange({
                      id: productData.id,
                      expiryDate: productData.expiryDate,
                      category: productData.category,
                      productName: productData.productName,
                      quantity: productData.quantity,
                      numberOfUnits: text,
                      price: productData.price,
                    });
                  }
                }}
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
                value={productData ? `${productData.price}` : ""}
                onChangeText={(text) => {
                  if (productData) {
                    handleProductDataChange({
                      id: productData.id,
                      expiryDate: productData.expiryDate,
                      category: productData.category,
                      productName: productData.productName,
                      quantity: productData.quantity,
                      numberOfUnits: productData.numberOfUnits,
                      price: text,
                    });
                  }
                }}
                className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              />
              <Text className="text-[10px] font-semibold pt-1 pl-1 text-neutral-400">
                Required to calculate the total worth of donations.
              </Text>
            </View>
          </View>

          {/* Save  */}
          <View className="items-end mt-16">
            <View className="bg-theme w-32 rounded-3xl">
              <Button
                title="Save"
                onPress={() => {
                  handleConfirmation();
                }}
                color="white"
              ></Button>
            </View>
          </View>
        </ScrollView>
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
