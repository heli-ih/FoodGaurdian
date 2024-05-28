import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  Button,
} from "react-native";
import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../firebase/index";
import ProductContext from "./_layout";
import { router } from "expo-router";
import { Product } from "./_layout";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const checkExpiry = (expiryDate: string) => {
  const currentDate = new Date();

  const [day, month, year] = expiryDate.split("/");
  const formattedExpiryDate = new Date(`${year}-${month}-${day}`);

  //Difference in ms
  const diffInMS = formattedExpiryDate.getTime() - currentDate.getTime();

  //Convertm ms to days
  const diffInDays = Math.ceil(diffInMS / (1000 * 60 * 60 * 24));

  let color;
  let percentage;

  if (expiryDate) {
    if (diffInDays <= 21) {
      // only considering 3 weeks (21 days) before expiration
      // 100/21 = 4.761904761904762 (percentage of each day)
      percentage = (21 - diffInDays) * 4.761904761904762;

      // last week
      if (diffInDays <= 7) {
        color = "#FF0000";
      } else if (diffInDays <= 14) {
        color = "#FFD700";
      } else {
        color = "#32CD32";
      }
    } else {
      // Green zone: diffInDays > 10
      // percentage = (diffInDays - 10) / 4.5;
      percentage = 0;
    }
  }

  return { color, percentage, diffInDays };
};

const donations: Product[] = [];

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [savings, setSavings] = useState(0);
  const [date, setDate] = useState(new Date());
  const navigation = useNavigation();

  // Function to clear notifications
  const clearNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Notification
  // useEffect(() => {
  // const getNotificationPermission = async () => {
  //   const { status } = await Notifications.requestPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert(
  //       "Permission Denied",
  //       "You need to enable notifications for this app to receive reminders."
  //     );
  //   }
  // };
  // getNotificationPermission();

  // }, []);

  // Daily Notification
  // Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: "🟢Don't let good food go to waste!!",
  //     body: `Check out prodects: ${nearExpiryItems.join(
  //       ", "
  //     )}. They are about to expire soon!! Help make a difference by donating them today!!🌟`,
  //     sound: "default",
  //   },
  //   trigger: {
  //     // hour: 10,
  //     // minute: 0,
  //     seconds: 60 * 30,
  //     repeats: true,
  //   },
  // });

  // Get Items & near expiry products

  useEffect(() => {
    const recordsRef = ref(db, "records");
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const records = snapshot.val();
        const currentDate = new Date();
        const fetchedProducts: Product[] = Object.entries(records)
          .map(([id, product]) => {
            // console.log("product", product);
            const { expiryDate } = product as Product;
            const [day, month, year] = expiryDate.split("/");
            const formattedExpiryDate = new Date(`${year}-${month}-${day}`);
            if (formattedExpiryDate > currentDate) {
              return {
                id,
                ...product,
              };
            } else {
              return null;
            }
          })
          .filter((product) => product !== null); // Filter out expired products

        fetchedProducts.sort((a, b) => {
          const diffA = checkExpiry(a.expiryDate).diffInDays;
          const diffB = checkExpiry(b.expiryDate).diffInDays;
          return diffA - diffB;
        });

        setProducts(fetchedProducts);
        console.log("fetchedProducts ", fetchedProducts);
        console.log("Products ", products);

        // Capturing nearExpiryItems which expire within 3 days -- for notifications
        // setNearExpiryItems([]);
        // fetchedProducts.map((product: Product) => {
        //   const { expiryDate } = product;
        //   const [day, month, year] = expiryDate.split("/");
        //   const formattedExpiryDate = new Date(`${year}-${month}-${day}`);
        //   //Difference in ms
        //   const diffInMS =
        //     formattedExpiryDate.getTime() - currentDate.getTime();
        //   //Convert ms to days
        //   const diffInDays = Math.ceil(diffInMS / (1000 * 60 * 60 * 24));

        //   if (diffInDays <= 3) {
        //     setNearExpiryItems((prevItems) => [
        //       ...prevItems,
        //       product.productName,
        //     ]);
        //   }
        // });
      } else {
        console.log("No records found in the database.");
      }
    });

    // Alert.alert(
    //   "✨It's time!✨",
    //   "Please observe the 🔻RED🔺 items! They are about to expire!!\nYou can donate them at the nearest food bank!",
    //   [
    //     {
    //       text: "Donate Now!🙌🏼",
    //       onPress: () => {
    //         navigation.navigate("maps");
    //       },
    //     },
    //     { text: "Later" },
    //   ]
    // );

    clearNotifications();
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

  const handleDonations = async (item: Product) => {
    donations.push(item);
    handleDelete(item.id);

    if (item.numberOfUnits && item.price) {
      const allSavings =
        savings + Number(item.numberOfUnits) * Number(item.price);

      setSavings(allSavings);
    }
  };

  const handleTotalSavings = async () => {
    console.log("Total savings is ", savings);
    await update(ref(db, "savings"), { value: savings });
  };

  if (savings) {
    handleTotalSavings();
  }

  const goCreateItem = () => {
    navigation.navigate("createItem", {
      newProductData: {
        id: "",
        productName: "",
        category: "",
        expiryDate: "",
        quantity: "",
        numberOfUnits: "",
        price: "",
      },
    });
  };

  let toDonate: string[] = []; 
    products.map((item: Product) => {
      const { color, percentage } = checkExpiry(item.expiryDate);
      if (color == "#FF0000"){
        toDonate.push(item.productName);
      }
    });

  Notifications.scheduleNotificationAsync({
    content: {
      title: "🟢Don't let good food go to waste!!",
      body: `Check out products: ${
        toDonate.length <= 3
          ? toDonate.join(", ")
          : toDonate.slice(0, 3).join(", ") + " ..."
      }. They are about to expire soon!! Help make a difference by donating them today!!🌟`,
      sound: "default",
    },
    trigger: {
      hour: 9,
      repeats: true,
    },
  });

  // every friday
  Notifications.scheduleNotificationAsync({
    content: {
      title: "🪷It is the weekend",
      body: `Use the weekend to donate food!📌`,
      sound: "default",
    },
    trigger: {
      weekday: 6,
      hour: 8,
      repeats: true,
    },
  });

    
  return (
    <ScrollView className="p-10 h-full mt-20">
      {/* Title  */}
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

      {/* Items  */}
      <View className="mb-20">
        {products.map((item: Product) => {
          const { color, percentage } = checkExpiry(item.expiryDate);
          return (
            <View
              className="mb-6 bg-neutral-200 border-neutral-400 border-2 rounded-md  relative"
              key={item.id}
            >
              {/* Shadow Color */}
              <View
                className="absolute left-0 top-0 bottom-0  opacity-25 rounded-l-md "
                style={{ width: `${percentage}%`, backgroundColor: `${color}` }}
              />
              {/* Product Info View */}
              <View className="flex flex-row items-center justify-around py-4 relative ">
                {/* Logo */}
                <View className="w-[20%] mx-4">
                  <MaterialCommunityIcons
                    name="food-variant"
                    size={40}
                    color={"#018E6F"}
                  />
                </View>

                {/* Details  */}
                <View className="items-start -left-7 w-[50%]">
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
                {/* <View >

                </View> */}
                <View className="flex flex-col justify-between items-center h-24 w-[20%]">
                  <View className="flex flex-row items-start justify-center">
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
                  <TouchableOpacity onPress={() => handleDonations(item)}>
                    <Text className="text-themeBtn shadow-lg">Donate</Text>
                  </TouchableOpacity>
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
