// /server/server.js
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import fs from "fs";

const app = express();
const PORT = 5000;
const DATA_FILE = new URL("./events.json", import.meta.url);

// Middleware
app.use(cors());
app.use(express.json());

// Helper to load events
function loadEvents() {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("Error loading events:", err);
        return { id: "calendar-events", data: [] };
    }
}

// Helper to save events
function saveEvents(events) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
}

// Load data into memory
let eventsStore = loadEvents();

// --- GET: Retrieve all events ---
app.get("/events", (req, res) => {
    eventsStore = loadEvents(); // reload latest from disk
    res.json(eventsStore);
});

// --- POST: Add a new event ---
app.post("/events", (req, res) => {
    const { text, date } = req.body;
    console.log("Incoming body:", req.body);

    if (!text || !date) {
        return res.status(400).json({ error: "Missing 'text' or 'date' field" });
    }

    // Ensure it's always "YYYY-MM-DD"
    const normalizedDate = date.length > 10 ? date.split("T")[0] : date;

    const newEvent = {
        id: randomUUID(),
        text,
        date: normalizedDate,
        createdAt: new Date().toISOString()
    };

    eventsStore.data.push(newEvent);

    // ✅ Persist to file
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(eventsStore, null, 2));
    } catch (err) {
        console.error("Error saving events:", err);
        return res.status(500).json({ error: "Failed to save event" });
    }

    res.status(201).json({ message: "Event added successfully", event: newEvent });
});


// --- DELETE: remove event by ID ---
app.delete("/events/:id", (req, res) => {
    const { id } = req.params;
    const beforeCount = eventsStore.data.length;
    eventsStore.data = eventsStore.data.filter((ev) => ev.id !== id);

    if (beforeCount === eventsStore.data.length) {
        return res.status(404).json({ error: "Event not found" });
    }

    saveEvents(eventsStore);
    res.json({ message: "Event deleted successfully" });
});
// --- PATCH: update event by ID ---
app.patch("/events/:id", (req, res) => {
  const { id } = req.params;
  const { text, date } = req.body;

  let event = eventsStore.data.find((ev) => ev.id === id);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (text !== undefined) event.text = text;

  if (date !== undefined) {
    const normalizedDate =
      date.length > 10 ? date.split("T")[0] : date;
    event.date = normalizedDate;
  }

  event.updatedAt = new Date().toISOString();

  saveEvents(eventsStore);

  res.json({ message: "Event updated successfully", event });
});


// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
