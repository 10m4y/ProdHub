import React, { useState } from 'react';
import { addVersion } from '../../api/repo';
import { useParams } from 'react-router-dom';

const UploadVersion = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [changes, setChanges] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changes', changes);

    try {
      await addVersion(id, formData);
      alert('Version uploaded successfully');
    } catch (err) {
      console.error(err);
      alert('Error uploading version');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <textarea placeholder="Changes" onChange={(e) => setChanges(e.target.value)} />
      <button type="submit">Upload Version</button>
    </form>
  );
};

export default UploadVersion;