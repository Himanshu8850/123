import React, { useState, useEffect } from "react";
import "../css/itinerary.css";
function Itinerary({ itineraryData, setitineraryData, peopleCount, markers }) {
  const [st, setst] = useState(false);
  const email = localStorage.getItem("user");

  useEffect(() => {
    CreateTripPlan();
  }, [st]);
  if (!itineraryData) {
    return <div>Loading...</div>;
  }
  const sanitizeMarkers = (map) => {
    const obj = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  };
  const handleRemoveActivity = (dayIndex, activityIndex) => {
    const updatedItinerary = { ...itineraryData };
    updatedItinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setitineraryData(updatedItinerary);
  };
  const CreateTripPlan = async () => {
    const sanitizedMarkers = Array.isArray(markers)
      ? sanitizeMarkers(markers)
      : markers;
    const tripPlanData = {
      user_email: email,
      location_markers: sanitizeMarkers,
      activities: itineraryData,
    };

    try {
      const response = await fetch("http://localhost:8000/api/createplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripPlanData),
      });

      if (!response.ok) {
        throw new Error("Failed to create trip plan");
      }

      const data = await response.json();
      console.log("Trip plan created:", data);
      // Handle successful creation (e.g., redirect or show a success message)
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div className="itinerary-container">
      <h1>Your Itinerary</h1>
      <div className="itinerary-days">
        {itineraryData.days.map((day, index) => (
          <div key={index} className="itinerary-day">
            <h2>Day {index + 1}</h2>
            {day.activities.map((activity, actIndex) => (
              <div key={actIndex} className="itinerary-activity">
                <h3>Activity {actIndex + 1}</h3>
                <p>{activity.description}</p>
                <p>
                  Location:{" "}
                  {`Lat: ${activity.location[0]}, Lng: ${activity.location[1]}`}
                </p>
                <button
                  onClick={() => handleRemoveActivity(index, actIndex)}
                  className="done-button"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        ))}
        <h1>
          Total trip cost:$
          {parseFloat(itineraryData.estimated_cost.total.replace("$", "")) *
            peopleCount}
        </h1>
      </div>
    </div>
  );
}

export default Itinerary;
