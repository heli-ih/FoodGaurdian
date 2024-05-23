import React, { useEffect, useRef, useState } from "react";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import {
  Alert,
  Button,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "expo-router";
import { markers } from "../markers";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import RatingStars from "../Rating";

const INITIAL_REGION = {
  latitude: 25.2068615,
  longitude: 55.2616044,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

interface Marker {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  name: string;
  phone: string;
  website: string;
  rate: number;
}

const handlePhonePress = (phone: string) => {
  Linking.openURL(`tel:${phone}`);
};

const handleWebsitePress = (website: string) => {
  Linking.openURL(website);
};

const handleDirections = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.openURL(url);
};

export default function MapsScreen() {
  const mapRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Marker>();

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        ref={mapRef}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            title={marker.name}
            onPress={() => {
              setShowModal(true), setSelectedMarker(marker);
            }}
          />
        ))}
      </MapView>
      {/* Modal  */}
      {showModal && selectedMarker && (
        <View className="absolute bottom-0 left-0 right-0 bg-theme rounded-t-3xl px-6 py-5 shadow-lg h-[25%]">
          {/* Close  */}
          <View className="flex flex-row justify-end items-center w-full">
            <Ionicons
              name="close-outline"
              size={24}
              color="white"
              onPress={() => setShowModal(false)}
            />
          </View>
          <View className="flex flex-col justify-between items-start h-fit gap-5">
            {/* Name  */}
            <Text className="font-bold text-2xl  text-white">
              {selectedMarker.name}
            </Text>
            {/* Rate  */}
            <RatingStars rating={selectedMarker.rate} />
            {/* Phone & Website */}
            <View className="flex flex-row justify-between items-center w-full">
              <View className="flex flex-row justify-between items-center w-[17%]">
                {selectedMarker.phone && (
                  <Feather
                    name="phone-call"
                    size={20}
                    color="white"
                    onPress={() => handlePhonePress(selectedMarker.phone)}
                  />
                )}
                {selectedMarker.website && (
                  <MaterialCommunityIcons
                    name="web"
                    size={24}
                    color="white"
                    onPress={() => handleWebsitePress(selectedMarker.website)}
                  />
                )}
              </View>
              {/* Directions */}
              <TouchableOpacity
                onPress={() =>
                  handleDirections(
                    selectedMarker.latitude,
                    selectedMarker.longitude
                  )
                }
                className=" bg-themeDark px-5 py-3 rounded-3xl"
              >
                <Text
                  style={{ fontWeight: "bold", fontSize: 14, color: "white" }}
                >
                  Directions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
