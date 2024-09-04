import "../css/input.css";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SearchBox } from "@mapbox/search-js-react";
import { useNavigate } from "react-router-dom";
import { useHotel } from "../context/HotelContext";
import mapboxgl from "mapbox-gl";
import Hotels from "./Hotels";
import Itinerary from "./Itinerary";
import Activities from "./Activities";
import HotelsMap from "./Mapbox";
function Home() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [value, setValue] = useState("");
  const [activities, setActivities] = useState([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const { hotelsData, sethotelsData, map, setMap } = useHotel();
  const [budget, setBudget] = useState([0, 5000]);
  const [load, setload] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [hotelset, sethotel] = useState(false);
  const [itineraryData, setitineraryData] = useState([]);
  const activityOptions = [
    "Kid Friendly",
    "Museums",
    "Shopping",
    "Historical",
    "Outdoor Adventures",
    "Art & Cultural",
    "Amusement Parks",
  ];
  const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const getloc = async (location) => {
    const lat = location["lat"];
    const lon = location["lng"];

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/hotel.json?proximity=${lon},${lat}&limit=20&access_token=${accessToken}`
    );

    const data = await response.json();

    // Extract hotel information from the response
    const hotels = data.features.map((feature) => ({
      name: feature.text,
      location: feature.geometry.coordinates,
      price: feature.properties?.price || "N/A",
      rating: feature.properties?.rating || "N/A",
      city:
        feature.context?.find((context) => context.id.includes("place"))
          ?.text || "Unknown City",
    }));

    return hotels;
  };

  const handlePlaceSelect = async (data) => {
    if (data && data.features && data.features.length > 0) {
      const feature = await data.features[0];
      const { coordinates } = feature.geometry;
      const [longitude, latitude] = coordinates;
      let lat = 19;
      let lng = 72;
      lat = latitude;
      lng = longitude;
      const address =
        feature.properties.full_address || feature.properties.place_formatted;
      setValue(address);
      setSelectedPlace({
        description: address,
        lat: lat,
        lng: lng,
      });
      setsmap(lat, lng);
    } else {
      console.error("Invalid data:", data);
    }
  };

  const handleActivityChange = (activity) => {
    setActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };
  function createHotelPopup(hotel) {
    const popup = new mapboxgl.Popup({ offset: 25 });
    const content = `
      <div class="hotel-popup">
        <h3>${hotel.name}</h3>
        <p>Price: ${hotel.price}</p>
        <p>Type: ${hotel.type}</p>
        <p>Rating: ${hotel.rating}</p>
        <a href="https://www.booking.com/searchresults.html?city=${hotel.city}&hotel=${hotel.name}" target="_blank">
          Check on Booking.com
        </a>
      </div>
    `;
    popup.setHTML(content);
    return popup;
  }

  async function displayHotels(hotels, map) {
    const newMarkers = [];

    for (const hotel of hotels) {
      const lat = hotel.location["lat"];
      const lng = hotel.location["lng"];
      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .setPopup(createHotelPopup(hotel))
        .addTo(map);

      newMarkers.push(marker);
    }

    setMarkers(newMarkers);
    setload(false);
  }
  const displayitinerary = (itinerary) => {
    try {
      console.log("displaying");
      itinerary.days.forEach((day) => {
        day.activities.forEach((activity) => {
          const [lat, lng] = activity.location;

          // Create a blue marker
          new mapboxgl.Marker({ color: "blue" })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setText(activity.description)
            )
            .addTo(map);
        });
      });
    } catch (error) {
      console.log(`failed to display itinerary locations:${error}`);
    }
  };

  const setsmap = async (latitude, longitude) => {
    // getitinery();

    // Check if the map is already initialized
    if (!map) {
      const newMap = new mapboxgl.Map({
        container: "map", // Specify the container ID
        style: "mapbox://styles/mapbox/navigation-day-v1", // Specify the map style
        center: [longitude, latitude], // Set the center to the selected place
        zoom: 12, // Set the initial zoom level
        accessToken: accessToken,
      });
      console.log("check");
      setMap(newMap); // Store the map in state
    } else {
      // If map already exists, just center it and display hotels
      map.setCenter([longitude, latitude]);
      const hotels = await getloc({ lng: longitude, lat: latitude });
    }

    // Add a marker at the selected place
    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
  };
  const createTrip = async () => {
    setload(true);
    try {
      // Fetch activities and location description from Gemini API
      const res = await fetch("http://localhost:8000/generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          peoplecount: peopleCount,
          startdate: dateRange[0],
          enddate: dateRange[1],
          activities: activities,
          location: selectedPlace,
        }),
      });
      const activityData = await res.json();
      const dat = await activityData;
      const itineraryText = dat.candidates[0].content.parts[0].text || "";
      const jsonMatch = itineraryText.match(/\{[\s\S]*\}/);
      const ans = JSON.parse(jsonMatch[0]);
      console.log(ans);
      const loc = ans["itinerary"].days[0].activities[0];
      setitineraryData(ans["itinerary"]);
      const parsedData = JSON.parse(jsonMatch[0]);
      displayitinerary(ans["itinerary"]);
      console.log(parsedData);
      const userEmail = localStorage.getItem("user");
      // Fetch hotels based on the selected location
      const hotelRes = await fetch("http://localhost:8000/allhotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: loc.location,
        }),
      });
      const hoteldat = await hotelRes.json();
      const hoteljsontext =
        (await hoteldat.candidates[0].content.parts[0].text) || "";
      const hoteljsonmatch = await hoteljsontext.match(/\{[\s\S]*\}/);
      const hoteljsoncomplete = await JSON.parse(hoteljsonmatch[0]);
      console.log(hoteljsoncomplete);
      const hoteljson = await hoteljsoncomplete.hotels;
      const hotelloc = {
        lat: hoteljson[0].location[0] || 19,
        lng: hoteljson[0].location[1] || 72,
      };
      console.log(hotelloc);
      const hotels =
        hoteljson && Array.isArray(hoteljson)
          ? hoteljson.map((feature) => {
              // Parse the location string into an array of numbers
              const parsedLocation = feature.location;
              console.log(parsedLocation);
              return {
                name: feature.name,
                location: {
                  lat: parsedLocation[0],
                  lng: parsedLocation[1],
                },
                price: feature.estimated_price || "N/A",
                type: feature.price_range || "N/A",
                rating: feature.star_rating || "N/A",
                city: feature.City || "N/A",
              };
            })
          : [];
      map.setCenter(hotelloc);
      displayHotels(hotels, map);
      sethotelsData(hotels);
    } catch (error) {
      createTrip();
      console.error("Failed to create trip:", error);
    }
  };
  const removeUser = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  return (
    <>
      <HotelsMap></HotelsMap>
      {!load && hotelsData.length === 0 && (
        <div className="app-container">
          <h4
            style={{
              margin: "0",
              display: "flex",
              backgroundColor: "lightgreen",
              width: "200px",
              borderRadius: "10px",
            }}
          >
            {localStorage.getItem("user")}
          </h4>
          <div
            className="header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "lightgreen",
              padding: "0 20px",
              borderRadius: "10px",
            }}
          >
            <h1 className="main-title">Plan Your Next Adventure</h1>
            <button
              style={{
                width: "100px",
                height: "50px",
                border: "None",
                backgroundColor: "red",
                color: "white",
                boxShadow: "3px 3px 10px black",
              }}
              onClick={removeUser}
            >
              Logout
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="destination" className="form-label">
              Where do you want to go?
            </label>
            <SearchBox
              id="destination"
              value={value}
              onRetrieve={handlePlaceSelect}
              onChange={(e) => {
                if (e && e.target) {
                  setSelectedPlace({
                    description: "notselected",
                    lat: null,
                    lng: null,
                  });
                  setValue(e.target.value);
                }
              }}
              accessToken={accessToken}
              className="search-box"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateRange" className="form-label">
              Select dates
            </label>
            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="datepicker"
              placeholderText="Select date range"
              isClearable={true}
              dateFormat="yy/MM/dd"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select the kind of activities</label>
            <div className="activity-options">
              {activityOptions.map((activity) => (
                <label key={activity} className="activity-label">
                  <input
                    type="checkbox"
                    checked={activities.includes(activity)}
                    onChange={() => handleActivityChange(activity)}
                  />
                  {activity}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="budget" className="form-label">
              Select Your Maximum Budget
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="budget-slider"
            />
            <div className="budget-values">
              <span>{`Up to ₹${budget}`}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="peopleCount" className="form-label">
              How many people are going?
            </label>
            <input
              type="number"
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
              min="1"
              className="people-input"
            />
            <span> Person{peopleCount > 1 ? "s" : ""}</span>
          </div>

          <button className="create-trip-btn" onClick={createTrip}>
            Create New Trip
          </button>
        </div>
      )}

      {load && (
        <div className="loading-overlay">
          <div className="loading-content">
            <img src="/Loading.gif" alt="Loading" className="loading-image" />
            <h1 className="loading-text">This may take a minute</h1>
          </div>
        </div>
      )}

      {/* hotels listed */}

      {hotelsData && hotelsData.length > 0 && !hotelset && markers && (
        <Hotels
          hotelsData={hotelsData}
          markers={markers}
          map={map}
          setMarkers={setMarkers}
          sethotel={sethotel}
        ></Hotels>
      )}

      {/* Itinerary Plan listed */}

      {hotelset && markers && (
        <Itinerary
          itineraryData={itineraryData}
          setitineraryData={setitineraryData}
          peopleCount={peopleCount}
          markers={markers}
        ></Itinerary>
      )}
    </>
  );
}

export default Home;
