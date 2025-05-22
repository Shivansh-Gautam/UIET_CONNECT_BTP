import { useState, useEffect } from 'react';
import axios from 'axios';

const departmentNameMap = {
  "6800c64265d452d6a4b75ea1": "CSE",
  "6808926ca16927caec076318": "IT",
  "680c04d4d12802cc0718055f": "ECE",
  "680c981405b8a4ad5775a38c": "MEE",
  "680ca1f505b8a4ad5775a424": "CHE",
};

const HOD = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all teachers from backend API on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        const [teachersResponse, hodsResponse] = await Promise.all([
          axios.get('/api/teacher/fetch-all', {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
          axios.get('/api/hod/fetch', {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
        ]);
        console.log('Fetch all teachers response:', teachersResponse);
        console.log('Fetch saved HODs response:', hodsResponse);
        if (teachersResponse.data.success) {
          setTeachers(teachersResponse.data.teachers);
        } else {
          console.error('Failed to fetch teachers:', teachersResponse.data);
          setError('Failed to fetch teachers');
        }
        if (hodsResponse.data.success) {
          const savedHODs = hodsResponse.data.hods;
          const selected = {};
          savedHODs.forEach(hod => {
            if (hod.department && hod.teacher) {
              selected[hod.department._id] = hod.teacher._id;
            }
          });
          setSelectedHODs(selected);
        } else {
          console.error('Failed to fetch saved HODs:', hodsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching teachers or HODs:', error);
        setError('Error fetching teachers or HODs');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Group teachers by department id
  const departments = [...new Set(teachers.map(t => t.department))];
  const teachersByDept = departments.reduce((acc, deptId) => {
    acc[deptId] = teachers.filter(t => t.department === deptId);
    return acc;
  }, {});

  // State to hold selected HOD per department
  const [selectedHODs, setSelectedHODs] = useState({});

  const handleSelectHOD = async (department, teacherId) => {
    const updatedSelectedHODs = {
      ...selectedHODs,
      [department]: teacherId,
    };
    setSelectedHODs(updatedSelectedHODs);

    try {
      const token = localStorage.getItem('authToken');
      const hodData = Object.entries(updatedSelectedHODs).map(([department, teacher]) => ({ department, teacher }));
      const response = await axios.post('/api/hod/save', hodData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (response.data.success) {
        alert('Selected HOD saved successfully!');
      } else {
        alert('Failed to save selected HOD.');
      }
    } catch (error) {
      console.error('Error saving selected HOD:', error);
      alert('Error saving selected HOD.');
    }
  };

  if (loading) {
    return <div>Loading teachers...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem', width: '100vw', height: '100vh', margin: '0' }}>
      {/* Left side: Department cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', overflowY: 'auto' }}>
        {departments.map(deptId => (
          <div key={deptId} style={{ border: '1px solid #bbb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: '#fafafa', height: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.5rem', fontWeight: '600' }}>
              {departmentNameMap[deptId] || `Department ID: ${deptId}`}
            </h3>
            {teachersByDept[deptId].map(teacher => (
              <label key={teacher._id} style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '0.75rem', cursor: 'pointer', backgroundColor: selectedHODs[deptId] === teacher._id ? '#e0f7fa' : '#fff', transition: 'background-color 0.3s ease' }}>
                <input
                  type="checkbox"
                  checked={selectedHODs[deptId] === teacher._id}
                  onChange={() => handleSelectHOD(deptId, teacher._id)}
                  style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1rem', color: '#222' }}>{teacher.name}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      {/* Right side: Selected HODs */}
      <div style={{ flex: 1, border: '1px solid #bbb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff', height: '100%', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.5rem', fontWeight: '600' }}>Selected HODs</h3>
        {departments.map(deptId => {
          const selectedTeacherId = selectedHODs[deptId];
          const selectedTeacher = teachersByDept[deptId].find(t => t._id === selectedTeacherId);
          return (
            <div key={deptId} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#555', fontWeight: '600' }}>
                {departmentNameMap[deptId] || `Department ID: ${deptId}`}
              </h4>
              {selectedTeacher ? (
                <div style={{ fontSize: '1.1rem', color: '#222' }}>
                  <p><strong>Name:</strong> {selectedTeacher.name}</p>
                  {/* Additional teacher info can be added here if available */}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#999' }}>No HOD selected</p>
              )}
            </div>
          );
        })}
        {/* Save Selected HODs Button */}
        <button
          onClick={async () => {
            try {
              const token = localStorage.getItem('authToken');
              const hodData = Object.entries(selectedHODs).map(([department, teacher]) => ({ department, teacher }));
              const response = await axios.post('/api/hod/save', hodData, {
                headers: {
                  Authorization: token ? `Bearer ${token}` : '',
                },
              });
              if (response.data.success) {
                alert('Selected HODs saved successfully!');
              } else {
                alert('Failed to save selected HODs.');
              }
            } catch (error) {
              console.error('Error saving selected HODs:', error);
              alert('Error saving selected HODs.');
            }
          }}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Save Selected HODs
        </button>
      </div>
    </div>
  );
};

export default HOD;
