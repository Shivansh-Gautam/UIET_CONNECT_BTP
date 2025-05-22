import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseApi } from '../../environment';
import { Box, Typography, Card, CardContent, CardHeader, Divider, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Notice = () => {
  return (
    <>
      <style>{`
        .card-hover-effect {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover-effect:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .form-container {
          width: 100%;
          margin: 0 auto 40px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          box-sizing: border-box;
        }
        .form-title {
          text-align: center;
          font-weight: 700;
          font-size: 1.8rem;
          margin-bottom: 20px;
          width: 100%;
        }
        .form-input {
          width: 100%;
          margin-bottom: 20px;
          padding: 10px 15px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .form-textarea {
          width: 100%;
          height: 120px;
          margin-bottom: 20px;
          padding: 10px 15px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          resize: vertical;
        }
        .form-select {
          width: 100%;
          margin-bottom: 20px;
          padding: 10px 15px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          background-color: #fff;
        }
        .submit-button {
          width: 100%;
          padding: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          background-color: #007bff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .submit-button:hover {
          background-color: #0056b3;
        }
        .notices-container {
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .audience-selection {
          margin-bottom: 20px;
        }
        .audience-selection h5 {
          margin-bottom: 10px;
        }
        .audience-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
        }
        .audience-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .audience-item label {
          margin-left: 8px;
        }
      `}</style>
      <InnerNotice />
    </>
  );
};

const InnerNotice = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [hods, setHods] = useState([]);
  const [selectedAudienceMembers, setSelectedAudienceMembers] = useState([]);
  const [notices, setNotices] = useState([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    const fetchAudienceMembers = async () => {
      try {
        if (audience === 'Teachers') {
          const response = await axios.get(`${baseApi}/teacher/fetch-all`);
          setTeachers(response.data.teachers || []);
          setHods([]);
          setSelectedAudienceMembers([]);
        } else if (audience === 'HODs') {
          // Fetch HODs
          const hodResponse = await axios.get(`${baseApi}/hod/fetch`);
          const hodsData = hodResponse.data.hods || [];

          // Fetch teachers to map teacher names for HODs
          const teacherResponse = await axios.get(`${baseApi}/teacher/fetch-all`);
          const teachersData = teacherResponse.data.teachers || [];

          // Map teacher names to HODs
          const hodsWithTeacherNames = hodsData.map(hod => {
            const teacher = teachersData.find(t => t._id === hod.teacher);
            return {
              ...hod,
              teacherName: teacher ? teacher.name : '',
            };
          });

          setHods(hodsWithTeacherNames);
          setTeachers([]);
          setSelectedAudienceMembers([]);
        } else {
          setTeachers([]);
          setHods([]);
          setSelectedAudienceMembers([]);
        }
      } catch (error) {
        console.error('Error fetching audience members:', error);
        setTeachers([]);
        setHods([]);
        setSelectedAudienceMembers([]);
      }
    };

    fetchAudienceMembers();
  }, [audience]);

  const handleCheckboxChange = (id) => {
    setSelectedAudienceMembers((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((memberId) => memberId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAllChange = () => {
    if (audience === 'Teachers') {
      if (selectedAudienceMembers.length === teachers.length) {
        setSelectedAudienceMembers([]);
      } else {
        setSelectedAudienceMembers(teachers.map((teacher) => teacher._id));
      }
    } else if (audience === 'HODs') {
      if (selectedAudienceMembers.length === hods.length) {
        setSelectedAudienceMembers([]);
      } else {
        setSelectedAudienceMembers(hods.map((hod) => hod._id));
      }
    }
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get(`${baseApi}/directorNotice/all`);
        if (response.data && response.data.data) {
          // Fetch teachers to map teacher names for HOD notices
          const teacherResponse = await axios.get(`${baseApi}/teacher/fetch-all`);
          const teachersData = teacherResponse.data.teachers || [];

          // Normalize notices to add recipientNames array from recipientName string
          const normalizedNotices = response.data.data.map((notice) => {
            let recipientNames = [];
            if (notice.audience === 'HODs') {
              // For HOD audience, map recipientNames to teacher names
              if (Array.isArray(notice.recipientName)) {
                recipientNames = notice.recipientName.map((recip) => {
                  const teacher = teachersData.find(t => t.name === recip);
                  return teacher ? teacher.name : recip;
                });
              } else if (typeof notice.recipientName === 'string') {
                const teacher = teachersData.find(t => t.name === notice.recipientName);
                recipientNames = teacher ? [teacher.name] : [notice.recipientName];
              }
            } else {
              recipientNames = notice.recipientName ? (Array.isArray(notice.recipientName) ? [...notice.recipientName] : [notice.recipientName]) : [];
            }
            return {
              ...notice,
              recipientNames,
            };
          });
          setNotices(normalizedNotices);
        }
      } catch (error) {
        console.error('Error fetching director notices:', error);
      }
    };
    fetchNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let recipientNames = [];
      if (audience === 'Teachers') {
        recipientNames = teachers
          .filter((teacher) => selectedAudienceMembers.includes(teacher._id))
          .map((teacher) => teacher.name);
      } else if (audience === 'HODs') {
        recipientNames = selectedAudienceMembers.map((selectedId) => {
          const hod = hods.find(h => h._id === selectedId);
          return hod && hod.teacher && hod.teacher.name ? hod.teacher.name : 'Unnamed HOD';
        });
      }

      // Filter out empty recipient names to avoid server errors (only for Teachers)
      if (audience === 'Teachers') {
        recipientNames = recipientNames.filter(name => name && name.trim() !== '');
      }

      // Adjust recipientNames array length if select all is chosen and length is off by one
      if (
        (audience === 'Teachers' && selectedAudienceMembers.length === teachers.length + 1) ||
        (audience === 'HODs' && selectedAudienceMembers.length === hods.length + 1)
      ) {
        recipientNames = recipientNames.slice(0, selectedAudienceMembers.length);
      }

      const payloadData = {
        title,
        message,
        audience,
        selectedAudienceMembers,
        recipientNames,
      };

      const response = await axios.post(`${baseApi}/directorNotice/create`, payloadData);
      // Normalize the newly created notice to add recipientNames array
      const newNotice = response.data.notices[0];
      const normalizedNewNotice = {
        ...newNotice,
        recipientNames: newNotice.recipientName ? [newNotice.recipientName] : [],
      };
      setNotices((prevNotices) => [normalizedNewNotice, ...prevNotices]);
    } catch (error) {
      console.error('Error creating notice:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log('Deleting notice with id:', id);
      const response = await axios.delete(`${baseApi}/directorNotice/delete/${id}`);
      console.log('Delete response:', response);
      if (response.status === 200 || response.status === 204) {
        setNotices((prevNotices) => prevNotices.filter((notice) => notice._id !== id));
      } else {
        console.error('Failed to delete notice:', response);
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  const handleEditOpen = (notice) => {
    setEditNoticeId(notice._id);
    setEditTitle(notice.title);
    setEditMessage(notice.message);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditNoticeId(null);
    setEditTitle('');
    setEditMessage('');
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`${baseApi}/directorNotice/update/${editNoticeId}`, {
        title: editTitle,
        message: editMessage,
      });
      setNotices((prevNotices) =>
        prevNotices.map((notice) =>
          notice._id === editNoticeId ? response.data.notice : notice
        )
      );
      handleEditClose();
    } catch (error) {
      console.error('Error updating notice:', error);
    }
  };

  // Group notices by title, message, audience, and createdAt (date only), combining recipient names
  const groupedNotices = notices.reduce((acc, notice) => {
    const createdDate = notice.createdAt ? new Date(notice.createdAt).toISOString().split('T')[0] : '';
    const key = `${notice.title}||${notice.message}||${notice.audience}||${createdDate}`;
    if (!acc[key]) {
      // For HOD audience, ensure recipientNames are teacher names, not 'Unnamed HOD'
      let recipientNames = [];
      if (notice.audience === 'HODs' && notice.recipientNames) {
        recipientNames = Array.isArray(notice.recipientNames)
          ? notice.recipientNames.filter(name => name !== 'Unnamed HOD')
          : [notice.recipientNames];
      } else {
        recipientNames = notice.recipientNames ? (Array.isArray(notice.recipientNames) ? [...notice.recipientNames] : [notice.recipientNames]) : [];
      }
      acc[key] = { ...notice, recipientNames: recipientNames };
    } else {
      if (notice.recipientNames) {
        const newRecipients = Array.isArray(notice.recipientNames) ? notice.recipientNames : [notice.recipientNames];
        newRecipients.forEach((recipient) => {
          if (!acc[key].recipientNames.includes(recipient)) {
            acc[key].recipientNames.push(recipient);
          }
        });
      }
    }
    return acc;
  }, {});

  // Prepare notices to display, merging HOD notices into teacher notices if teacher names match
  let noticesToDisplay = Object.values(groupedNotices);

  if (audience === 'Teachers') {
    // Get all teacher names
    const teacherNames = teachers.map(t => t.name);

    // Filter notices where recipientNames include any teacher name, regardless of audience
    const teacherNotices = notices.filter(notice =>
      notice.recipientNames &&
      notice.recipientNames.some(name => teacherNames.includes(name))
    );

    // Merge teacherNotices into noticesToDisplay, avoiding duplicates by _id
    const existingIds = new Set(noticesToDisplay.map(n => n._id));
    teacherNotices.forEach(teacherNotice => {
      if (!existingIds.has(teacherNotice._id)) {
        noticesToDisplay.push(teacherNotice);
      }
    });
  }

  // Format recipientNames for display
  noticesToDisplay = noticesToDisplay.map((notice) => ({
    ...notice,
    recipientNames: Array.isArray(notice.recipientNames)
      ? (() => {
          const filtered = notice.recipientNames.filter(name => name !== 'Unnamed HOD');
          return filtered.length > 0 ? filtered.join(', ') : 'Unnamed HOD';
        })()
      : notice.recipientNames,
  }));

  // Sort notices by createdAt descending to show newest first
  noticesToDisplay = noticesToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="container mt-5">
      <h2 className="form-title">Add New Notice</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="form-textarea"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <select
          className="form-select"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          required
        >
          <option value="" disabled>
            Audience
          </option>
          <option value="Teachers">Teachers</option>
          <option value="HODs">HODs</option>
        </select>

        {(audience === 'Teachers' && teachers.length > 0) && (
          <div className="audience-selection">
            <h5>Select Teachers</h5>
            <div className="audience-list">
              <div className="audience-item">
                <input
                  type="checkbox"
                  id="select-all-teachers"
                  checked={selectedAudienceMembers.length === teachers.length}
                  onChange={handleSelectAllChange}
                />
                <label htmlFor="select-all-teachers">Select All</label>
              </div>
              {teachers.map((teacher) => (
                <div key={teacher._id} className="audience-item">
                  <input
                    type="checkbox"
                    id={`teacher-${teacher._id}`}
                    checked={selectedAudienceMembers.includes(teacher._id)}
                    onChange={() => handleCheckboxChange(teacher._id)}
                  />
                  <label htmlFor={`teacher-${teacher._id}`}>{teacher.name}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {(audience === 'HODs' && hods.length > 0) && (
          <div className="audience-selection">
            <h5>Select HODs</h5>
            <div className="audience-list">
              <div className="audience-item">
                <input
                  type="checkbox"
                  id="select-all-hods"
                  checked={selectedAudienceMembers.length === hods.length}
                  onChange={handleSelectAllChange}
                />
                <label htmlFor="select-all-hods">Select All</label>
              </div>
              {hods.map((hod) => (
                <div key={hod._id} className="audience-item">
                  <input
                    type="checkbox"
                    id={`hod-${hod._id}`}
                    checked={selectedAudienceMembers.includes(hod._id)}
                    onChange={() => handleCheckboxChange(hod._id)}
                  />
                  <label htmlFor={`hod-${hod._id}`}>{hod.teacher?.name || 'Unnamed HOD'}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">
          SUBMIT
        </button>
      </form>

      {/* Display notices below the submit button */}
      <Box className="notices-container" sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, mt: 4 }}>
        {noticesToDisplay.length === 0 ? (
          <Typography variant="h6" align="center">No notices to display.</Typography>
        ) : (
          noticesToDisplay.map((notice) => (
            <Card
              key={notice._id}
              variant="outlined"
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                transition: "box-shadow 0.3s ease",
                "&:hover": { boxShadow: 6 },
                position: "relative",
              }}
            >
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: "bold" }}>{notice.title}</Typography>}
                subheader={
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Audience: {notice.audience}</Typography>
                    {notice.createdAt && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                    <Box>
                      <IconButton aria-label="edit" onClick={() => handleEditOpen(notice)} sx={{ color: 'blue' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => handleDelete(notice._id)} sx={{ color: 'red' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {notice.message}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Recipient: {notice.recipientNames && notice.recipientNames.length > 0 ? notice.recipientNames : ''}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Edit Notice Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Notice</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Notice;
