import React, { useEffect } from "react";
import CalendarHeader from "../CalendarHeader";
import CalendarGrid from "../CalendarGrid";
import DayModal from "../DayModal";
import "./styles.css";
import { useSelector, useDispatch } from "react-redux";
import { formatDateKey } from "./utils";
import { fetchEventsFromServer, selectModalOpen, selectModalDateIso } from "../../store/calendarSlice";

export default function Calendar() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEventsFromServer());
  }, [dispatch]);

  const modalOpen = useSelector(selectModalOpen);
  const modalDateIso = useSelector(selectModalDateIso);

  return (
    <div className="calendar-root">
      <CalendarHeader />

      <div className="calendar-viewport">
        <CalendarGrid />
      </div>

      {modalOpen && modalDateIso && (
        <DayModal
          formatKey={formatDateKey}
        />
      )}
    </div>
  );
}
