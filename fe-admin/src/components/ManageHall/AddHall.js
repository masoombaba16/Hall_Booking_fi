import React, { useState } from 'react';
import './AddHall.css';
import { useSelector } from 'react-redux';
import Loader from '../Loader';

function AddHall({ isOpen, onClose }) {
  const { userData, error } = useSelector((state) => state.user);
  const [hallname, sethallname] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [venue, setVenue] = useState('');
  const [imageLinks, setImageLinks] = useState(['']);
  const [loading, setLoading] = useState(false); // Loading state added

  const token = userData.token;

  const resetForm = () => {
    sethallname('');
    setDescription('');
    setCapacity('');
    setVenue('');
    setImageLinks(['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hallname || !capacity || !venue || imageLinks.some(link => !link)) {
      alert("Please fill in all required fields.");
      return;
    }

    let username = userData.username;
    const payload = {
      hallname,
      description,
      capacity,
      venue,
      imageLinks,
      username,
    };

    setLoading(true); // Show loader before request
    try {
      const response = await fetch('http://localhost:5000/admin/add-hall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false); // Hide loader after response

      if (response.ok) {
        alert('Hall added successfully!');
        resetForm();
        onClose();
        window.location.reload();
      } else {
        alert(data.message || 'Failed to add hall.');
      }
    } catch (error) {
      setLoading(false); // Hide loader if error occurs
      alert('An error occurred. Please try again.');
    }
  };

  const handleImageLinkChange = (index, value) => {
    const updatedLinks = [...imageLinks];
    updatedLinks[index] = value;
    setImageLinks(updatedLinks);
  };

  const addImageLinkField = () => {
    setImageLinks([...imageLinks, '']);
  };

  const removeImageLinkField = (index) => {
    const updatedLinks = imageLinks.filter((_, i) => i !== index);
    setImageLinks(updatedLinks);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-hall-form-overlay">
      {loading ? ( // Conditionally render Loader
        <Loader />
      ) : (
        <div className="add-hall-forms">
          <h2 className="form-title">Add Hall</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="hallname">Hall Name :- </label>
              <input
                type="text"
                id="hallname-v"
                value={hallname}
                onChange={(e) => sethallname(e.target.value)}
                placeholder="Enter hall name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description :-</label>
              <input
                type="text"
                id="description-v"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity :- </label>
              <input
                type="number"
                id="capacity-v"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Enter hall capacity"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue :- </label>
              <input
                type="text"
                id="venue-v"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue details"
                required
              />
            </div>

            <div className="form-group">
              <label>Hall Images (Links)</label>
              {imageLinks.map((link, index) => (
                <div key={index} className="image-link-group">
                  {isValidUrl(link) && (
                    <div className="image-preview">
                      <img src={link} alt={`Image ${index + 1}`} className="preview-image-view" />
                    </div>
                  )}
                  <label htmlFor="image" className='imag2'>Image Link:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className='link'
                      value={link}
                      onChange={(e) => handleImageLinkChange(index, e.target.value)}
                      placeholder="Enter image link"
                      required
                    />
                    <button
                      type="button"
                      className="remove-image-link-button"
                      onClick={() => removeImageLinkField(index)}
                      disabled={imageLinks.length === 1}
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
              >
                Add Image Link
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Add Hall
              </button>
              <button type="button" className="close-button" onClick={handleClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddHall;
