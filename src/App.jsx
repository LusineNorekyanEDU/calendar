import React from "react";
import Calendar from "./components/Calendar";
import "./calendar.css";

function App() {
    return (
        <div className="app-root">
            <h1 className="title">Monthly Planner</h1>
            <Calendar />
        </div>
    );
}

export default App;
