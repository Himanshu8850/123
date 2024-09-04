import React, { useEffect, useState } from "react";
import "../css/Hotel.css";
import HotelCard from "./HotelCard";
function Hotels({ hotelsData, map, markers, setMarkers, sethotel }) {
  useEffect(() => {
    console.log(hotelsData);
  }, []);

  return (
    <div className="hotels-section">
      <h2>Hotels Nearby</h2>
      <div className="hotel-list">
        {hotelsData.map((hotel, index) => (
          <>
            <HotelCard
              key={index}
              name={hotel.name}
              Location={hotel.location}
              price={hotel.price}
              map={map}
              markers={markers}
              setMarkers={setMarkers}
              sethotel={sethotel}
            />
          </>
        ))}
      </div>
    </div>
  );
}

export default Hotels;
