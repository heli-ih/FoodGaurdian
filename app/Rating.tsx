import React from "react";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const RatingStars = ({ rating }) => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to the nearest 0.5
  const numFullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating - numFullStars !== 0;
  const numEmptyStars = 5 - numFullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={{ flexDirection: "row" }}>
      {[...Array(numFullStars)].map((_, index) => (
        <FontAwesome key={index} name="star" size={20} color="#F9D849" />
      ))}
      {hasHalfStar && (
        <FontAwesome name="star-half-full" size={20} color="#F9D849" />
      )}
      {[...Array(numEmptyStars)].map((_, index) => (
        <FontAwesome key={index} name="star-o" size={20} color="#F9D849" />
      ))}
    </View>
  );
};

export default RatingStars;
