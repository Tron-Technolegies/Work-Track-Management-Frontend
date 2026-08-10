import React, { useEffect, useState } from "react";
import "./Efficiency.css";
import api from "../../../api/api/";

const Efficiency = () => {
  const [stats, setStats] = useState({
    efficiency: 0,
    activity: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [efficiencyRes, activityRes] = await Promise.all([
        api.get("admin_app/dashboard/efficiency/"),
        api.get("admin_app/dashboard/activity/"),
      ]);

      setStats({
        efficiency: efficiencyRes.data.efficiency,
        activity: activityRes.data.activity,
      });
    } catch (error) {
      console.error("Error fetching efficiency/activity:", error);
    }
  };

  const eficbar = [
    {
      icon: "/efficiency icon.svg",
      name: "Efficiency",
      percentage: `${stats.efficiency}%`,
    },
    {
      icon: "/activity icon.svg",
      name: "Activity",
      percentage: `${stats.activity}%`,
    },
  ];

  return (
    <div className="bar">
      {eficbar.map((effic, index) => (
        <div className="efficiency-activity-bar" key={index}>
          <div className="effici-activ-icon">
            <img src={effic.icon} alt={effic.name} />
          </div>

          <div className="name-percentage">
            {effic.name}
            <br />
            <span>{effic.percentage}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Efficiency;