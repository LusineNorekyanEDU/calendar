// /server/server.js
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 5000;
const DATA_FILE = new URL("./events.json", import.meta.url);

// Middleware
app.use(cors());
app.use(express.json());

// Helper: load data object from disk, return normalized shape
function loadStore() {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);

        // Support older shape { id: ..., data: [events...] }
        if (parsed && Array.isArray(parsed.data)) {
            return {
                id: parsed.id || "calendar-data",
                events: parsed.data || [],
                categories: parsed.categories || []
            };
        }

        // If already in new shape
        return {
            id: parsed.id || "calendar-data",
            events: parsed.events || [],
            categories: parsed.categories || []
        };
    } catch (err) {
        console.error("Error loading data file:", err);
        // default store
        return { id: "calendar-data", events: [], categories: [] };
    }
}

// Helper: write to disk
function saveStore(store) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// Load initial store into memory
let store = loadStore();

// --- Events endpoints ---

// GET /events - returns full store (id, events, categories)
app.get("/events", (req, res) => {
    store = loadStore(); // reload latest from disk
    res.json(store);
});

// POST /events - create event (optional categoryId)
app.post("/events", (req, res) => {
    const { text, date, categoryId } = req.body;
    if (!text || !date) {
        return res.status(400).json({ error: "Missing 'text' or 'date' field" });
    }

    // Normalize date to YYYY-MM-DD
    const normalizedDate = date.length > 10 ? date.split("T")[0] : date;

    // If categoryId provided, validate it exists
    let category = null;
    if (categoryId) {
        category = store.categories.find((c) => c.id === categoryId);
        if (!category) {
            return res.status(400).json({ error: "Provided categoryId does not exist" });
        }
    }

    const newEvent = {
        id: randomUUID(),
        text,
        date: normalizedDate,
        categoryId: category ? category.id : null,
        createdAt: new Date().toISOString()
    };

    store.events.push(newEvent);

    try {
        saveStore(store);
    } catch (err) {
        console.error("Error saving event:", err);
        return res.status(500).json({ error: "Failed to save event" });
    }

    res.status(201).json({ message: "Event added successfully", event: newEvent });
});

// DELETE /events/:id
app.delete("/events/:id", (req, res) => {
    const { id } = req.params;
    const before = store.events.length;
    store.events = store.events.filter((ev) => ev.id !== id);

    if (store.events.length === before) {
        return res.status(404).json({ error: "Event not found" });
    }

    saveStore(store);
    res.json({ message: "Event deleted successfully" });
});

// PATCH /events/:id
app.patch("/events/:id", (req, res) => {
    const { id } = req.params;
    const { text, date, categoryId } = req.body;

    const event = store.events.find((e) => e.id === id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (text !== undefined) event.text = text;
    if (date !== undefined) {
        event.date = date.length > 10 ? date.split("T")[0] : date;
    }

    if (categoryId !== undefined) {
        if (categoryId === null) {
            event.categoryId = null;
        } else {
            const categoryExists = store.categories.some((c) => c.id === categoryId);
            if (!categoryExists) {
                return res.status(400).json({ error: "Provided categoryId does not exist" });
            }
            event.categoryId = categoryId;
        }
    }

    event.updatedAt = new Date().toISOString();

    saveStore(store);
    res.json({ message: "Event updated successfully", event });
});

// --- Categories endpoints ---

// GET /categories
app.get("/categories", (req, res) => {
    store = loadStore();
    res.json({ categories: store.categories });
});

// POST /categories
app.post("/categories", (req, res) => {
    const { name, color } = req.body;
    if (!name || !color) {
        return res.status(400).json({ error: "Missing 'name' or 'color' field" });
    }

    // Simple color validation: accept hex or named color (don't enforce too strict)
    const newCategory = {
        id: randomUUID(),
        name: name.trim(),
        color: color.trim()
    };

    store.categories.push(newCategory);

    try {
        saveStore(store);
    } catch (err) {
        console.error("Error saving category:", err);
        return res.status(500).json({ error: "Failed to save category" });
    }

    res.status(201).json({ message: "Category created", category: newCategory });
});

// PATCH /categories/:id
app.patch("/categories/:id", (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;

    const category = store.categories.find((c) => c.id === id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    if (name !== undefined) category.name = name.trim();
    if (color !== undefined) category.color = color.trim();

    saveStore(store);
    res.json({ message: "Category updated", category });
});

// DELETE /categories/:id
app.delete("/categories/:id", (req, res) => {
    const { id } = req.params;
    const before = store.categories.length;
    store.categories = store.categories.filter((c) => c.id !== id);

    if (store.categories.length === before) {
        return res.status(404).json({ error: "Category not found" });
    }

    // Remove category references from events
    store.events = store.events.map((ev) => {
        if (ev.categoryId === id) {
            return { ...ev, categoryId: null };
        }
        return ev;
    });

    saveStore(store);
    res.json({ message: "Category deleted; events updated" });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
