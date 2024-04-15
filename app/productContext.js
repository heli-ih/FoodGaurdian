import React, { createContext, useState } from "react";

const ProductContext = createContext({
  productName: "",
  setProductName: () => {},
  category: "",
  setCategory: () => {},
  weigth: "",
  setWeight: () => {},
  expiryDate: "",
  setExpiryDate: () => {},
});

export default ProductContext;
