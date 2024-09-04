import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useHotel } from "../context/HotelContext";
// Use environment variables for sensitive data
const mapboxToken =
  process.env.REACT_APP_MAPBOX_TOKEN ||
  "pk.eyJ1IjoieWEtc3NpbnE4IiwiYSI6ImNsaDlnaHRyZTA3YjUzZnMwcHAwZzRvemUifQ.2A9nOErD6xi_Vse6ajDo6w";

// React component
function HotelsMap() {
  const { map, setMap } = useHotel();

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-122.4369, 37.7618],
      zoom: 13,
      accessToken: mapboxToken,
    });

    setMap(map);
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "50vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        backgroundRepeat: "none",
      }}
    ></div>
  );
}

export default HotelsMap; // Ensure this line is present
