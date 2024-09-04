import React from "react";
import "../css/input.css";
function Activities() {
  return (
    <>
      {/* <div>
        <label>Select dates</label>
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
      <div>
        <label>Select the kind of activities you want to do</label>
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
      <label>Select Your Maximum Budget</label>
      <div className="budget-slider">
        <input
          type="range"
          min="500"
          max="10000"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <div className="budget-values">
          <span>{`Up to ₹${budget}`}</span>
        </div>
      </div> */}
    </>
  );
}

export default Activities;
