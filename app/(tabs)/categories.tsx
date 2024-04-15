import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import {
  AntDesign,
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase/index";
import { ref, set, push, remove, onValue } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category } from "./_layout";

export default function MapScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const route = useRoute();
  const navigation = useNavigation();

  // const goHome = () => {
  //   navigation.navigate("home");
  // };

  const goCreateCategory = () => {
    navigation.navigate("createCategory");
  };

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

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `categories/${id}`));
      setCategories((prevCategories) =>
        prevCategories.filter((_, i) => i !== id)
      );
      console.log("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEdit = (id) => {
    const selectedCategory = categories.filter((c) => c.id === id);
    navigation.navigate("updateCategory", {
      selectedCategory: selectedCategory,
    });
  };

  return (
    <ScrollView className="p-10 h-full mt-20">
      <View className="flex flex-row justify-between items-center w-full pb-1 pr-2">
        <Text className="text-3xl font-bold ">Categories</Text>
        <AntDesign
          color="#018E6F"
          name="pluscircleo"
          size={24}
          onPress={goCreateCategory}
        />
      </View>

      <View style={styles.container}>
        {categories.map((cat, index) => (
          <View className="w-2/5 rounded-2xl items-center mb-6" key={index}>
            <ImageBackground
              key={index}
              source={cat.img ? { uri: cat.img } : { uri: cat.img }}
              style={{
                width: "100%",
                borderRadius: 23,
                borderWidth: 3,
                borderColor: "#ccc",
                backgroundColor: cat.img ? "transparent" : "#eee",
              }}
              imageStyle={{ borderRadius: 20, opacity: cat.img ? 0.6 : 1 }}
            >
              <View className="flex flex-row w-full items-center justify-end mt-2 pr-2">
                {/* Edit */}
                <MaterialCommunityIcons
                  name="square-edit-outline"
                  size={19}
                  color="black"
                  onPress={() => handleEdit(cat.id)}
                />
                {/* Delete */}
                <MaterialIcons
                  name="delete-outline"
                  size={22}
                  color="black"
                  onPress={() => handleDelete(cat.id)}
                />
              </View>
              {/* Title */}
              <View
                key={cat.id}
                className="flex justify-center  items-center  mb-10  mt-5 h-14"
              >
                <Text
                  className="text-lg font-bold"
                  style={{ shadowOpacity: 0.2 }}
                >
                  {cat.value}
                </Text>
              </View>
            </ImageBackground>
          </View>
        ))}
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
    marginBottom: 60,
  },
});
