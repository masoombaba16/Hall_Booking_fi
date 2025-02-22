import React, { useState } from 'react';
import './BlockClub.css';
import { useSelector } from 'react-redux';
import noProfile from '../../images/no-profile.png';
import Loader from '../Loader';

function BlockClub({ isOpen, onClose }) {
  const { clubsData } = useSelector((state) => state.club);
  const { userData } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handleStatusToggle = async (club) => {
    const apiUrl = `http://localhost:5000/admin/${club.status === 'active' ? 'block-club' : 'unblock-club'}`;
    const payload = { clubname: club.clubname, username: userData.username };
    const token = userData.token;

    try {
      setLoading(true); // Show loader when request starts
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Hall Status Changed successfully!');
        window.location.reload();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Error toggling club status: ${error.message}`);
    } finally {
      setLoading(false); // Hide loader after request finishes
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-club-form-overlay">
      <div className="add-club-form">
        <h2 className="form-title">Manage Clubs</h2>
        {loading ? (
          <Loader /> // Show loader when loading is true
        ) : clubsData && clubsData.length > 0 ? (
          <div className="club-list">
            {clubsData.map((club, index) => (
              <div key={index} className="club-item">
                <div className="club-card">
                  <img
                    src={club.profileImage ? club.profileImage : noProfile}
                    alt={`${club.clubname} Profile`}
                    className="club-profile-image"
                  />
                  <div className="club-info">
                    <p className="description">
                      <strong>Club Name :</strong> <i>{club.clubname.toUpperCase()}</i>
                    </p>
                    <p className="club-desc">
                      <strong>Description :</strong> <i>{club.description.toLowerCase()}</i>
                    </p>
                    <p className="club-desc">
                      <strong>Total Organizers :</strong> <i>{club.count}</i>
                    </p>
                    <p className="created">
                      Created on: {club.createdAt['date']} at {club.createdAt['time']}
                    </p>
                    <p className="created">
                      Last Modified on: {club.lastModified['date']} at {club.lastModified['time']}
                    </p>
                    <p className="created">Created By: {club.createdBy} (admin)</p>
                  </div>
                  <div className="manage">
                    <p
                      className={`status ${club.status === 'active' ? 'active' : 'inactive'}`}
                    >
                      <strong>Status :</strong> {club.status}
                    </p>
                    <button
                      className={`status-toggle ${club.status === 'active' ? 'block' : 'unblock'}`}
                      onClick={() => handleStatusToggle(club)}
                    >
                      <strong>
                        {club.status === 'active' ? 'Block' : 'Unblock'}
                      </strong>
                    </button>
                  </div>
                </div>
                <hr className="club-divider" />
              </div>
            ))}
          </div>
        ) : (
          <p>No clubs available</p>
        )}
        <button type="button" className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default BlockClub;
