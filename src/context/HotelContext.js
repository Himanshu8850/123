import React, { createContext, useState, useContext } from "react";

// Create the context
const HotelContext = createContext();

// Create a custom hook to use the context
export const useHotel = () => useContext(HotelContext);

// Create the provider component
export const HotelProvider = ({ children }) => {
  const [hotelsData, sethotelsData] = useState([]);
  const [map, setMap] = useState(null);

  return (
    <HotelContext.Provider value={{ hotelsData, sethotelsData, map, setMap }}>
      {children}
    </HotelContext.Provider>
  );
};
