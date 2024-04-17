import React, { useEffect, useState, useContext } from "react";
import { View, Text, ActivityIndicator, ScrollView, Alert } from "react-native";
import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase/index";
import ProductContext from "./_layout";
import { router } from "expo-router";
import { Product } from "./_layout";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { toHalfFloat } from "three/src/extras/DataUtils";

const checkExpiry = (expiryDate: string) => {
  const currentDate = new Date();

  const [day, month, year] = expiryDate.split("/");
  const formattedExpiryDate = new Date(`${year}-${month}-${day}`);

  //Difference in ms
  const diffInMS = formattedExpiryDate.getTime() - currentDate.getTime();

  //Convertm ms to days
  const diffInDays = Math.ceil(diffInMS / (1000 * 60 * 60 * 24));
  console.log("Difference in days:", diffInDays);

  let color;
  let percentage;

  if (expiryDate) {
    if (diffInDays > 10) {
      // Green zone: diffInDays > 10
      color = "#32CD32";
      // percentage = (diffInDays - 10) / 4.5;
      percentage = 30;
    } else if (diffInDays > 5) {
      // Yellow zone: 5 < diffInDays <= 10
      color = "#FFD700";
      // percentage = ((diffInDays - 5) / (10 - 5)) * 33.3 + 33.3;
      percentage = 50;
    } else {
      // Red zone: diffInDays <= 5
      color = "#FF0000";
      // percentage = (diffInDays / 5) * 33.3 + 66.6;
      percentage = 80;
    }
  }

  return { color, percentage, diffInDays };
};

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation();

  // Function to clear notifications
  const clearNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Notification
  // useEffect(() => {
  //   const getNotificationPermission = async () => {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission Denied",
  //         "You need to enable notifications for this app to receive reminders."
  //       );
  //     }
  //   };

  //   getNotificationPermission();

  //   Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "🟢Don't let good food go to waste!!",
  //       body: "Check your kitchen for near expiry items... Help make a difference by donating some today!!🌟",
  //       sound: "default",
  //     },
  //     trigger: {
  //       hour: 10, // 10 AM
  //       minute: 0,
  //       repeats: true,
  //     },
  //   });
  // }, []);

  useEffect(() => {
    const recordsRef = ref(db, "records");
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const records = snapshot.val();
        const fetchedProducts: Product[] = Object.entries(records).map(
          ([id, product]) => ({
            id,
            ...product,
          })
        );
        fetchedProducts.sort((a, b) => {
          const diffA = checkExpiry(a.expiryDate).diffInDays;
          const diffB = checkExpiry(b.expiryDate).diffInDays;
          return diffA - diffB;
        });

        setProducts(fetchedProducts);
        console.log("fetchedProducts ", fetchedProducts);
      } else {
        console.log("No records found in the database.");
      }
    });

    // clearNotifications();
    // console.log("cleared");

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `records/${id}`));
      setProducts((prevProducts) => prevProducts.filter((_, i) => i !== id));
      console.log("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };
  const handleConfirmDelete = (item: Product) => {
    Alert.alert(
      "Item Deletion",
      `Are you sure you want to delete ${item.productName}?`,
      [
        {
          text: "Cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            handleDelete(item.id);
            console.log("confirmd!");
          },
        },
      ]
    );
  };

  const handleEdit = (id) => {
    const selectedProduct = products.filter((p) => p.id === id);
    navigation.navigate("updateItem", {
      selectedProduct: selectedProduct,
    });
  };

  const goCreateItem = () => {
    navigation.navigate("createItem");
  };

  return (
    <ScrollView className="p-10 h-full mt-20">
      <View className="flex flex-row justify-between items-center mt-5 mb-12">
        <Text className="font-bold text-3xl ">Items</Text>
        <View className="flex flex-row">
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={24}
            color={"#018E6F"}
            onPress={goCreateItem}
          />
        </View>
      </View>
      <View className="mb-20">
        {products.map((item: Product) => {
          const { color, percentage } = checkExpiry(item.expiryDate);
          return (
            <View className="mb-6  border-2 rounded-md  relative" key={item.id}>
              {/* Shadow View */}
              <View
                className="absolute left-0 top-0 bottom-0  opacity-25 rounded-l-md "
                style={{ width: `${percentage}%`, backgroundColor: `${color}` }}
              />
              {/* Product Info View */}
              <View className="flex flex-row items-center justify-around  py-4  relative">
                {/* logo */}
                <MaterialCommunityIcons
                  name="food-variant"
                  size={40}
                  color={"#018E6F"}
                />
                <View className="items-start -left-7 ">
                  <Text className="text-base font-semibold pb-2 ">
                    {item.productName}
                  </Text>
                  <View className="flex flex-row items-center">
                    <Text className="text-sm mr-1">Expiry:</Text>
                    <Text className="text-sm font-semibold ">
                      {item.expiryDate}
                    </Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <Text className="text-sm mr-1">Category:</Text>
                    <Text className="text-sm font-semibold ">
                      {item.category}
                    </Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <Text className="text-sm mr-1">Quantity:</Text>
                    <Text className="text-sm font-semibold ">
                      {item.quantity}
                    </Text>
                  </View>
                </View>
                <View className="flex flex-row items-start justify-center h-full">
                  {/* Edit */}
                  <MaterialCommunityIcons
                    name="square-edit-outline"
                    size={19}
                    color="black"
                    onPress={() => handleEdit(item.id)}
                    className=" pt-0.5"
                  />
                  {/* Delete */}
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color="black"
                    onPress={() => handleConfirmDelete(item)}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
