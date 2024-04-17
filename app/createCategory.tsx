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
import { ref, set, push } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function MapScreen() {
  const [newCat, setNewCat] = useState({ label: "", value: "" });
  const route = useRoute();
  const navigation = useNavigation();

  const handleCreate = async () => {
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
              console.log("New record ", newCat, " was added successfully!"),
                navigation.navigate("categories");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error adding record to the database:", error);
    }
    setNewCat({ label: "", value: "" });
  };

  const handleConfirmation = async () => {
    try {
      Alert.alert("Category Confirmation", `Name: ${newCat.value}`, [
        {
          text: "Edit",
        },
        {
          text: "Confirm",
          onPress: () => {
            handleCreate();
            console.log("confirmd!"), navigation.navigate("categories");
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating category to the database:", error);
    }
  };

  const goHome = () => {
    navigation.navigate("index");
  };

  const goCategories = () => {
    navigation.navigate("categories");
  };

  return (
    <View className="bg-white">
      <Ionicons
        name="arrow-back"
        size={24}
        color="black"
        className="ml-9 mt-20"
        onPress={goCategories}
      />
      <ScrollView className="p-10 h-full mb-32">
        <Text className="text-3xl font-bold mb-10">Create Category</Text>

        <View className="rounded-2xl bg-neutral-100 px-7 py-7 pb-10 gap-5">
          {/* Name */}
          <View>
            <Text className="text-xl font-bold pb-1">Name</Text>
            <TextInput
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              onChangeText={(text) => setNewCat({ label: text, value: text })}
              value={newCat.value}
            />
          </View>
          {/* Create  */}
          <View className="items-end  mt-16">
            <View className="bg-theme w-32 rounded-3xl">
              <Button
                title="Create"
                onPress={handleConfirmation}
                color="white"
              ></Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 40,
  },
});
