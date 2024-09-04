import React, { useState, useEffect } from "react";
import "../css/Hotelcard.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import mapboxgl from "mapbox-gl";
const HotelCard = ({
  name,
  Location,
  price,
  map,
  setMarkers,
  markers,
  sethotel,
}) => {
  const [searchedImages, setsearchedimage] = useState([]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  useEffect(() => {
    async function fetchImages() {
      try {
        console.log("fetching images..");
        const response = await fetch("http://localhost:8000/scrapeImages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: `${name}+${Location}` }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const imgurls = await response.json();
        setsearchedimage(imgurls.image_urls);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }

    fetchImages();
  }, [name, Location]);

  const handleSelectHotel = () => {
    markers.forEach((marker) => marker.remove());

    // Clear the markers array
    setMarkers([]);

    // Add marker for the selected hotel
    const newMarker = new mapboxgl.Marker({ color: "blue" })
      .setLngLat(Location)
      .addTo(map);

    // Add the new marker to the markers array
    setMarkers([newMarker]);

    // Optionally, center the map on the selected hotel
    map.flyTo({ center: Location, zoom: 15 });
    sethotel(true);
  };

  return (
    <div className="hotel-card">
      {searchedImages.length > 0 ? (
        <div className="hotel-images">
          <Slider {...sliderSettings} className="imgslider">
            {searchedImages.map((img, index) => (
              <div key={index} className="hotel-image-container">
                <img src={img} alt={name} className="hotel-image" />
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className="no-images">No images available</div>
      )}
      <div className="hotel-details">
        <h3 className="hotel-name">{name}</h3>
        <p className="hotel-price">Price: {price}</p>
        <button className="hotel-select-btn" onClick={handleSelectHotel}>
          Select hotel
        </button>
      </div>
      {/* <div className="hotel-rating">
      <span className="hotel-rating-score">{rating}</span>
      <p>{reviews} reviews</p>
    </div> */}
    </div>
  );
};

export default HotelCard;
