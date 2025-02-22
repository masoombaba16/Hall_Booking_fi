import React, { useState } from 'react';
import './AddClub.css';
import { useSelector } from 'react-redux';
import Loader from '../Loader';

function AddClub({ isOpen, onClose }) {
  const { userData } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false); // 🔄 Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🔄 Show loader

    const clubname = e.target.clubname.value;
    const email = e.target.email.value;
    const department = e.target.department.value;
    const description = e.target.description.value;
    const username = userData.username;
    const password = 'vnrvjiet@123';

    const payload = {
      clubname,
      username,
      email,
      department,
      password,
      description,
    };

    const token = userData.token;

    try {
      const response = await fetch('http://localhost:5000/admin/add-club', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        alert(data.message);
        window.location.reload();
        onClose();
      } else {
        alert(`Failed to add club: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setLoading(false); // ✅ Hide loader after response
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-club-form-overlay">
      <div className="add-club-form">
        {loading ? (
          <Loader /> // 🔄 Loader shown when loading is true
        ) : (
          <>
            <h2 className="form-title">Add New Club</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="clubname">Club Name :- </label>
                <input
                  type="text"
                  id="clubname"
                  name="clubname"
                  placeholder="Enter club name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email :- </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter club Email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Dept. of (Optional) :- </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  placeholder="Enter department name (if any)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description :- </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Enter club description"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Club'}
                </button>
                <button
                  type="button"
                  className="close-button"
                  onClick={onClose}
                  disabled={loading}
                >
                  Close
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AddClub;
