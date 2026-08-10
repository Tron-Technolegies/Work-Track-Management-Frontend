import React, {useState,useEffect} from 'react'
import api from "../../../api/api"
import "./ReportStatusCard.css"

function ReportStatuCard() {

    const [report, setReport] = useState([
        { title: "Total Projects", count: 0 },
        { title: "Active Tasks", count: 0 },
        { title: "Completed Tasks", count: 0 },
        { title: "Active Team", count: 0 },
    ]);

    useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await api.get("/admin_app/dashboard/summary/");
        const data = res.data;

        setReport([
          { title: "Total Projects", count: data.total_projects },
          { title: "Active Tasks", count: data.active_tasks },
          { title: "Completed Tasks", count: data.completed_tasks },
          { title: "Active Team", count: data.active_members },
        ]);
      } catch (error) {
        console.error("Failed to load report data", error);
      }
    };

    fetchReportData();
  }, []);


  return (
    <div className="report-title-container">
      <div className="report-title">
        <p className="report-text">Report</p>
      </div>

      <div className="report-list">
        {report.map((item, index) => (
          <div className="reportCard-container" key={index}>
            <div className="reportCard-title">{item.title}</div>
            <div className="reportCard-count">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReportStatuCard