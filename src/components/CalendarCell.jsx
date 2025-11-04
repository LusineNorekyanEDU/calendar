import React from "react";

/**
 * CalendarCell: single square in the month grid.
 * Props:
 *  - day (number | null)
 *  - hasEvents (boolean)
 *  - onClick
 *  - weekDay (0=Sun..6=Sat) used to color weekends
 */
export default function CalendarCell({ day, hasEvents, onClick, weekDay }) {
    const today = new Date();
    const isToday =
        day &&
        today.getFullYear() === today.getFullYear() &&
        today.getDate() === day &&
        today.getMonth() === new Date().getMonth() &&
        true;

    // Decide cell class
    const classes = ["cell"];
    if (!day) classes.push("empty");
    if (weekDay === 0) classes.push("sunday");
    if (weekDay === 6) classes.push("saturday");
    if (isToday) classes.push("today");

    return (
        <div className={classes.join(" ")} onClick={day ? onClick : undefined}>
            <div className="cell-top">
                <div className="day-number">{day || ""}</div>
                {hasEvents && <div className="event-dot" aria-hidden="true" />}
            </div>
            <div className="cell-body" />
        </div>
    );
}
