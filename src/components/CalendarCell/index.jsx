import React from "react";
import "./styles.css";
import { useSelector } from "react-redux";
import { selectDisplayedDateIso } from "../../store/calendarSlice.js";

/**
 * CalendarCell: single square in the month grid.
 * Props:
 *  - day (number | null)
 *  - eventsForDay (array)
 *  - onClick
 *  - weekDay (0=Sun..6=Sat)
 */
export default function CalendarCell({ day, eventsForDay = [], onClick, weekDay }) {
    const displayedIso = useSelector(selectDisplayedDateIso);
    const categories = useSelector((state) => state.calendar.categories);

    const displayed = new Date(displayedIso);
    const displayedYear = displayed.getFullYear();
    const displayedMonth = displayed.getMonth();

    const today = new Date();
    const isSameYear = displayedYear === today.getFullYear();
    const isSameMonth = displayedMonth === today.getMonth();

    const isToday = day && isSameYear && isSameMonth && today.getDate() === day;

    // Build classes
    const classes = ["cell"];
    if (!day) classes.push("empty");
    if (weekDay === 0) classes.push("sunday");
    if (weekDay === 6) classes.push("saturday");
    if (isToday) classes.push("today");

    // Helper: get category color
    function getCategoryColor(categoryId) {
        if (!categoryId) return null;
        const cat = categories.find((c) => c.id === categoryId);
        return cat?.color || null;
    }

    return (
        <div className={classes.join(" ")} onClick={day ? onClick : undefined}>
            <div className="cell-top">
                <div className="day-number">{day || ""}</div>
            </div>

            {/* Category dots */}
            {eventsForDay.length > 0 && (
                <div className="event-dots">
                    {eventsForDay.map((event, idx) => {
                        const color = getCategoryColor(event.categoryId);

                        return color ? (
                            <span
                                key={idx}
                                className="dot"
                                style={{ backgroundColor: color }}
                                title={event.text}
                            />
                        ) : (
                            <span key={idx} className="dot-icon" title={event.text}>
                •
              </span>
                        );
                    })}
                </div>
            )}

            <div className="cell-body" />
        </div>
    );
}
