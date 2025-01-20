import React, { useEffect, useState } from 'react';
import { getRepo, deleteRepo } from '../../api/repo';
import { useParams, useNavigate } from 'react-router-dom';

const RepoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const { data } = await getRepo(id);
        setRepo(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRepo();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteRepo(id);
      alert('Repo deleted successfully');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error deleting repo');
    }
  };

  return repo ? (
    <div>
      <h1>{repo.Name}</h1>
      {/* <p>Collaborators: {repo.Collaborators}</p> */}
      <p>BPM: {repo.Description.BPM}</p>
      <p>Scale: {repo.Description.Scale}</p>
      <p>Genre: {repo.Description.Genre}</p>
      {/* <p>Activity: {repo.Activity}</p> */}
      {/* <p>Version: {repo.Versions}</p> */}
      <p>Created: {repo.CreatedAt}</p>
      <p>Updated: {repo.UpdateAt}</p>
      <p>Access: {repo.public ? 'Public' : 'Private'}</p>
      <button onClick={handleDelete}>Delete Repo</button>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default RepoDetails;