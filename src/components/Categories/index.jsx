// src/components/Categories/index.jsx
import React, { useEffect, useState } from "react";
import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoriesFromServer,
  createCategoryToServer,
  updateCategoryOnServer,
  deleteCategoryFromServer,
  selectCategories
} from "../../store/calendarSlice";

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories) || [];

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6c8cff");

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#6c8cff");

  useEffect(() => {
    dispatch(fetchCategoriesFromServer());
  }, [dispatch]);

  const handleCreate = () => {
    const n = name.trim();
    if (!n) return;
    dispatch(createCategoryToServer(n, color));
    setName("");
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingColor(cat.color || "#6c8cff");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingColor("#6c8cff");
  };

  const saveEdit = () => {
    const n = editingName.trim();
    if (!n) return;
    dispatch(updateCategoryOnServer(editingId, { name: n, color: editingColor }));
    cancelEdit();
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this category? This will remove it from events.")) return;
    dispatch(deleteCategoryFromServer(id));
  };

  return (
    <div className="categories-root">
      <h2>Categories</h2>

      <div className="create-category">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={handleCreate}>Create</button>
      </div>

      <div className="categories-list" style={{ marginTop: 16 }}>
        {categories.length === 0 && <div>No categories yet</div>}
        <ul>
          {categories.map((c) => (
            <li key={c.id} className="category-row" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ width: 18, height: 18, backgroundColor: c.color, borderRadius: 4, display: "inline-block", border: "1px solid rgba(0,0,0,0.05)" }} />
              <strong>{c.name}</strong>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editingId && (
        <div className="edit-panel" style={{ marginTop: 20 }}>
          <h4>Edit category</h4>
          <input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
          <input type="color" value={editingColor} onChange={(e) => setEditingColor(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button onClick={saveEdit}>Save</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
