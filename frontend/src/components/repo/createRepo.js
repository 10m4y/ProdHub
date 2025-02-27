import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { createRepo } from '../../api/repo';
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: url('/image1.jpg') no-repeat center center/cover;
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 25px;
  background: rgba(40, 42, 54, 0.9);
  border-radius: 12px;
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
  width: 350px;
  animation: ${fadeIn} 0.5s ease-in-out;
  border: 2px solid rgba(255, 0, 128, 0.8);
`;

const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: rgba(68, 71, 90, 0.8);
  color: #f8f8f2;
  font-size: 16px;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    box-shadow: 0 0 8px #ff79c6;
    background: rgba(68, 71, 90, 1);
  }
`;

const Button = styled.button`
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff0080, #6a0572);
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, background 0.3s ease-in-out;
  &:hover {
    background: linear-gradient(135deg, #6a0572, #ff0080);
    transform: scale(1.05);
  }
`;

const CreateRepo = () => {
  const [formData, setFormData] = useState({ name: '', bpm: '', scale: '', genre: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRepo(formData);
      alert('Repo created successfully');
      navigate('/repo');
    } catch (err) {
      console.error(err);
      alert('Error creating repo');
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Input name="name" placeholder="Repo Name" onChange={handleChange} required />
        <Input name="bpm" placeholder="BPM" onChange={handleChange} required />
        <Input name="scale" placeholder="Scale" onChange={handleChange} required />
        <Input name="genre" placeholder="Genre" onChange={handleChange} required />
        <Button type="submit">Create Repo</Button>
      </Form>
    </FormContainer>
  );
};

export default CreateRepo;
