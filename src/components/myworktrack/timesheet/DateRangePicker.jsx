import React, { useState } from "react";
import { DateRange } from "react-date-range";
import {
  FaCalendarAlt,
  FaChevronDown,
} from "react-icons/fa";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./DateRangePicker.css";

function DateRangePicker() {
  const [showPicker, setShowPicker] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  return (
    <div className="date-picker-container">

      <button
        className="date-picker-btn"
        onClick={() => setShowPicker(!showPicker)}
      >
        <FaCalendarAlt />
        Today
        <FaChevronDown />
      </button>

      {showPicker && (
        <div className="date-popup">

          <DateRange
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={range}
            onChange={(item) =>
              setRange([item.selection])
            }
          />

        </div>
      )}

    </div>
  );
}

export default DateRangePicker;