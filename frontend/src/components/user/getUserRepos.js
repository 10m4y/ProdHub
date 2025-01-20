import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { getUserRepos } from '../../api/user';
import { useParams } from 'react-router-dom';

const GetUserRepos = () => {
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState('');

  const {id} = useParams();
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await getUserRepos(id);
        setRepos(response.data.repos);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch repositories');
      }
    };

    fetchRepos();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!repos.length) return <div>No repositories found</div>;

  return (
    <div>
      <h2>User Repositories</h2>
      <ul>
        {repos.map((repo) => (
          <li key={repo.repo_id}>
            <strong>{repo.name}</strong> - {repo.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetUserRepos;
