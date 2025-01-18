import React, { useState } from 'react';
import axios from 'axios';
import { updateUser } from '../../api/user';
import { useParams } from 'react-router-dom';

const UpdateUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUser(id, formData);
      setMessage('User updated successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <div>
      <h2>Update User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </label>
        <label>
          Username:
          <input type="text" name="username" value={formData.username} onChange={handleChange} />
        </label>
        <button type="submit">Update</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default UpdateUser;
