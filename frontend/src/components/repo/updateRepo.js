import React, { useState, useEffect } from "react";
import styled, { keyframes } from 'styled-components';
import { getRepo, updateRepo } from '../../api/repo';
import { useNavigate, useParams } from 'react-router-dom';

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

  &::placeholder {
    color: #ccc;  // or any light color that contrasts well
    opacity: 1;   // Ensure it's fully visible
  }

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


const UpdateRepo = () => {
  const [formData, setFormData] = useState({ name: '', bpm: '', scale: '', genre: '' });
  const [placeholders, setPlaceholders] = useState({ name: '', bpm: '', scale: '', genre: '' });
  const [selectedAppearance, setSelectedAppearance] = useState("true");
  const navigate = useNavigate();
  const { id } = useParams(); // Get repo ID from URL if needed

 useEffect(() => {
  const fetchRepo = async () => {
    try {
      const response = await getRepo(id);  // Fetching single repo
      const data = response.data;
      console.log("Fetched repo data:", data);

      setPlaceholders({
  name: data.Name || '',
  bpm: data.Description.BPM !== undefined ? data.Description.BPM.toString() : '',
  scale: data.Description.Scale || '',
  genre: data.Description.Genre || '',
});
setFormData({
    name: data.Name || '',
  bpm: data.Description.BPM !== undefined ? data.Description.BPM.toString() : '',
  scale: data.Description.Scale || '',
  genre: data.Description.Genre || '',

});
setSelectedAppearance(data.Public !== undefined ? data.public.toString() : "true");
    } catch (error) {
      console.error("Error fetching repo:", error);
    }
  };

  fetchRepo();
}, [id]);


  const preprocessFormData = () => {
    return {
      ...formData,
      bpm: parseInt(formData.bpm || placeholders.bpm, 10),
      public: selectedAppearance === "true"
    };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (value) => {
    setSelectedAppearance(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalData = preprocessFormData();
      await updateRepo(id,finalData); // or updateRepo if editing
      alert('Repo updated successfully');
      navigate('/repos');
    } catch (err) {
      console.error(err);
      alert('Error updating repo');
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Input
          name="name"
          placeholder={placeholders.name}
          onChange={handleChange}
        />
        <Input
          name="bpm"
          placeholder={placeholders.bpm}
          onChange={handleChange}
        />
        <Input
          name="scale"
          placeholder={placeholders.scale}
          onChange={handleChange}
        />
        <Input
          name="genre"
          placeholder={placeholders.genre}
          onChange={handleChange}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <label>
            <input
              type="radio"
              name="appearance"
              value="true"
              checked={selectedAppearance === "true"}
              onChange={() => handleRadioChange("true")}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="appearance"
              value="false"
              checked={selectedAppearance === "false"}
              onChange={() => handleRadioChange("false")}
            />
            Private
          </label>
        </div>

        <Button type="submit">Update Repo</Button>
      </Form>
    </FormContainer>
  );
};

export default UpdateRepo;
