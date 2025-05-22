import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseApi } from "../../../environment";
import { AuthContext } from "../../../context/AuthContext";

export default function Notes() {
  const { logout } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);

  // Helper to handle axios errors, logout on 401
  const handleAxiosError = (error) => {
    if (error.response && error.response.status === 401) {
      alert("Session expired or unauthorized. Please login again.");
      logout();
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch subjects from backend
    const token = localStorage.getItem("authToken");
    axios
      .get(`${baseApi}/subject/fetch-with-query`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          setSubjects(res.data.subjects || res.data.data || []);
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      });
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      // Fetch notes for selected subject
      const token = localStorage.getItem("authToken");
      axios
        .get(`${baseApi}/note/subject/${selectedSubjectId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            if (res.data.data.length === 0) {
              alert("No notes available for this subject.");
              setNotes([]);
            } else {
              // Open the first note PDF in a new tab
              const firstNote = res.data.data[0];
              const apiBaseUrl = baseApi.replace('/api', '');
              const url = `${apiBaseUrl}/uploads/${firstNote.filePath}`;
              window.open(url, "_blank");
              setNotes(res.data.data);
              setSelectedNoteIndex(0);
            }
          }
        })
        .catch((err) => {
          handleAxiosError(err);
          setNotes([]);
        });
    } else {
      setNotes([]);
    }
  }, [selectedSubjectId]);

  return (
    <div style={{ height: "500vh", display: "flex", flexDirection: "column", padding: "20px", boxSizing: "border-box" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333", fontSize: "2.5rem", fontWeight: "bold" }}>Student Notes</h1>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {subjects.map((subject) => (
          <button
            key={subject._id}
            onClick={() => setSelectedSubjectId(subject._id)}
            style={{
              padding: "12px 30px",
              backgroundColor: selectedSubjectId === subject._id ? "#007bff" : "#f0f0f0",
              color: selectedSubjectId === subject._id ? "#fff" : "#333",
              border: "1px solid #007bff",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: selectedSubjectId === subject._id ? "0 0 12px #007bff" : "none",
              transition: "all 0.3s ease",
              minWidth: "120px",
              textAlign: "center",
            }}
            onMouseEnter={e => {
              if (selectedSubjectId !== subject._id) e.currentTarget.style.backgroundColor = "#d0d0d0";
            }}
            onMouseLeave={e => {
              if (selectedSubjectId !== subject._id) e.currentTarget.style.backgroundColor = "#f0f0f0";
            }}
          >
            {subject.subject_name}
          </button>
        ))}
      </div>

      {notes.length > 0 && (
        <div
          style={{
            flexGrow: 1,
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#444" }}>Notes for selected subject:</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
              flexShrink: 0,
            }}
          >
            {notes.map((note, index) => (
              <button
                key={note._id}
                onClick={() => setSelectedNoteIndex(index)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: selectedNoteIndex === index ? "#28a745" : "#e0e0e0",
                  color: selectedNoteIndex === index ? "#fff" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  boxShadow: selectedNoteIndex === index ? "0 0 8px #28a745" : "none",
                  transition: "all 0.3s ease",
                  minWidth: "150px",
                  textAlign: "center",
                }}
                onMouseEnter={e => {
                  if (selectedNoteIndex !== index) e.currentTarget.style.backgroundColor = "#a0dca0";
                }}
                onMouseLeave={e => {
                  if (selectedNoteIndex !== index) e.currentTarget.style.backgroundColor = "#e0e0e0";
                }}
              >
                Note {index + 1}
              </button>
            ))}
          </div>
          <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <iframe
              src={`${baseApi.replace('/api', '')}/uploads/${notes[selectedNoteIndex].filePath}`}
              width="100%"
              height="200%"
              title="Note PDF"
              style={{ borderRadius: "10px", border: "1px solid #ccc" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
