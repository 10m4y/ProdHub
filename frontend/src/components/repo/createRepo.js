import React, { useState } from 'react';
import { createRepo } from '../../api/repo';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';


const CreateRepo = () => {
  const [formData, setFormData] = useState({ name: '', bpm: '', scale: '', genre: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRepo(formData);
      alert('Repo created successfully');
      Navigate('/repo');
      
    } catch (err) {
      console.error(err);
      alert('Error creating repo');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Repo Name" onChange={handleChange} />
      <input name="bpm" placeholder="BPM" onChange={handleChange} />
      <input name="scale" placeholder="Scale" onChange={handleChange} />
      <input name="genre" placeholder="Genre" onChange={handleChange} />
      <button type="submit">Create Repo</button>
    </form>
  );
};

export default CreateRepo;