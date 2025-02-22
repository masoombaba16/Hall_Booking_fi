import React, { useState, useEffect } from 'react';
import './EditHall.css';
import { useSelector } from 'react-redux';

function EditHall({ onClose }) {
  const { hallsData } = useSelector((state) => state.hall);
  const { userData } = useSelector((state) => state.user);
  const [currentImages, setCurrentImages] = useState({});
  const [editingHall, setEditingHall] = useState(null);
  const [formData, setFormData] = useState({
    hallname: '',
    description: '',
    capacity: '',
    venue: '',
    imageLinks: [],
    status: ''  // Add a field for status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = userData.token;

  const slideImage = (hallIndex, totalImages) => {
    setCurrentImages((prev) => {
      const newImages = { ...prev };
      newImages[hallIndex] = (newImages[hallIndex] + 1) % totalImages;
      return newImages;
    });
  };

  useEffect(() => {
    const initialImages = hallsData.reduce((acc, _, index) => {
      acc[index] = 0;
      return acc;
    }, {});
    setCurrentImages(initialImages);

    const intervals = hallsData.map((_, index) =>
      setInterval(() => slideImage(index, hallsData[index].imageLinks.length), 3000)
    );

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [hallsData]);

  const handleEditClick = (hall) => {
    setEditingHall(hall);
    setFormData({
      hallname: hall.hallname,
      description: hall.description,
      capacity: hall.capacity,
      venue: hall.venue,
      imageLinks: hall.imageLinks || [],
      status: hall.status || 'inactive',  // Set status for editing
      username: userData.username,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageLinkChange = (index, value) => {
    const updatedLinks = [...formData.imageLinks];
    updatedLinks[index] = value;
    setFormData((prev) => ({ ...prev, imageLinks: updatedLinks }));
  };

  const addImageLinkField = () => {
    setFormData((prev) => ({
      ...prev,
      imageLinks: [...prev.imageLinks, ''],
    }));
  };

  const removeImageLinkField = (index) => {
    const updatedLinks = formData.imageLinks.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, imageLinks: updatedLinks }));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/admin/modify-hall', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        alert('Hall details updated successfully');
        onClose();
      } else {
        alert(data.message || 'Failed to update hall details');
      }
    } catch (error) {
      console.error('Error updating hall:', error);
      alert('An error occurred while updating the hall. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,  // Update the status when changed
    }));
  };

  const handleClose = () => {
    setEditingHall(null);
    onClose();
    window.location.reload();
  };

  return (
    <div className="add-hall-form-overlay">
      <div className="add-hall-form">
        <button className="close-button-x" onClick={handleClose}>
          &times;
        </button>
        <h2 className="form-title">{editingHall ? 'Edit Hall Details' : 'Hall Details'}</h2>
        {editingHall ? (
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="hallname">Hall Name :- </label>
              <input
                type="text"
                id="hallname"
                name="hallname"
                value={formData.hallname}
                onChange={handleFormChange}
                placeholder="Enter hall name"
                required
                className='disab'
                disabled={true}
              />
            </div>

            
            <div className="form-group">
  <label htmlFor="status" style={{ display: 'inline', marginRight: '10px' }}>
    Current Status : 
  </label>
  <p className='status' style={{ display: 'inline', color: formData.status === 'active' ? 'green' : 'red', margin: '0' }}>
    {formData.status}
  </p>
  <div className='but-fac'>
    <button type="button" className='stau' onClick={() => handleStatusChange('active')}>Set Active</button>
    <button type="button" className='stau' onClick={() => handleStatusChange('inactive')}>Set Inactive</button>
  </div>
</div>


            <div className="form-group">
              <label htmlFor="description">Description :- </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Enter description"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity :- </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleFormChange}
                placeholder="Enter hall capacity"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue :- </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleFormChange}
                placeholder="Enter venue details"
                required
              />
            </div>

            <div className="form-group">
              <label>Hall Images (Links)</label>
              {formData.imageLinks.map((link, index) => (
                <div key={index} className="image-link-group">
                  {isValidUrl(link) && (
                    <div className="image-preview">
                      <img src={link} alt={`Image ${index + 1}`} className="preview-image" />
                    </div>
                  )}
                  <label htmlFor="image" className="imag">Image Link:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={link}
                      className='imalink'
                      onChange={(e) => handleImageLinkChange(index, e.target.value)}
                      placeholder="Enter image link"
                      required
                    />
                    <button
                      type="button"
                      className="remove-image-link-button"
                      onClick={() => removeImageLinkField(index)}
                      disabled={formData.imageLinks.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="add-image-link-button"
                onClick={addImageLinkField}
                disabled={isSubmitting}
              >
                Add Image Link
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                Save Changes
              </button>
              <button type="button" className="close-button" onClick={handleClose}>
                Close
              </button>
            </div>
          </form>
        ) : (
          hallsData && hallsData.length > 0 ? (
            <div className="hall-list">
              {hallsData.map((hall, index) => (
                <div key={index} className="hall-item">
                  <div className="hall-card">
                    <img
                      src={hall.imageLinks[currentImages[index]]}
                      alt={hall.hallname}
                      className="hall-image"
                    />
                    <div className="hall-info">
                      <p className="description"><strong>Name :</strong> <i>{hall.hallname.toUpperCase()}</i></p>
                      <p className="hall-desc"><strong>Description :</strong> <i>{hall.description.toLowerCase()}</i></p>
                      <p className="venue"><strong>Venue :</strong> <i>{hall.venue.toUpperCase()}</i></p>
                      <p className="hall-capacity">Capacity: {hall.capacity} members</p>
                      <p className="created">Created on: {hall.createdAt['date']} at {hall.createdAt['time']}</p>
                      <p className="created">Last Modified on: {hall.lastModified['date']} at {hall.lastModified['time']}</p>
                      <p className="created">Created By: {hall.createdBy} (admin)</p>
                    </div>
                    <div className="manage">
                      <p className={`status ${hall.status === 'active' ? 'active' : 'inactive'}`} id='sta'><strong>Status :</strong> {hall.status}</p>
                      <button className="update" onClick={() => handleEditClick(hall)}>
                        <strong>Modify Details</strong>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No halls available</p>
          )
        )}
      </div>
    </div>
  );
}

export default EditHall;
