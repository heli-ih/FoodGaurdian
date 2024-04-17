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
import { ref, set, push, update } from "firebase/database";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Category } from "./(tabs)/_layout";

export default function MapScreen() {
  const [newCat, setNewCat] = useState<Category>();
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params.selectedCategory) {
      setNewCat(route.params.selectedCategory[0]);
    }
  }, [route.params]);

  const goCategories = () => {
    navigation.navigate("categories");
  };

  const handleUpdate = async () => {
    if (newCat)
      try {
        await update(ref(db, `records/${newCat.id}`), newCat);

        Alert.alert(
          "Category Updated",
          "The category has been updated successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Record ", newCat, " was updated successfully!");
              },
            },
          ]
        );
      } catch (error) {
        console.error("Error updating category to the database:", error);
      }
  };

  const handleConfirmation = async () => {
    if (newCat)
      try {
        Alert.alert("Category Confirmation", `Name: ${newCat.value}`, [
          {
            text: "Edit",
          },
          {
            text: "Confirm",
            onPress: () => {
              handleUpdate();
              console.log("confirmd!"), navigation.navigate("categories");
            },
          },
        ]);
      } catch (error) {
        console.error("Error updating category to the database:", error);
      }
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
        <Text className="text-3xl font-bold mb-10">Modify Category</Text>

        <View className="rounded-2xl bg-neutral-100 px-7 py-7 pb-10 gap-5">
          {/* Name */}
          <View>
            <Text className="text-xl font-bold pb-1">Name</Text>
            <TextInput
              className="rounded-xl border-2 p-2 border-neutral-300 bg-white h-10"
              onChangeText={(text) => {
                if (newCat)
                  setNewCat({ id: newCat.id, label: text, value: text });
              }}
              value={newCat ? newCat.value : ""}
            />
          </View>
          {/* Save  */}
          <View className="items-end  mt-16">
            <View className="bg-theme w-32 rounded-3xl">
              <Button
                title="Save"
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
