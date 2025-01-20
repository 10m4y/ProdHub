import React, { useEffect, useState } from 'react';
import { getRepoVersions } from '../../api/repo';
import { useParams } from 'react-router-dom';

const RepoHistory = () => {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const { data } = await getRepoVersions(id);
        setVersions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVersions();
  }, [id]);

  return (
    <div>
      <h2>Repo Versions</h2>
      <ul>
        {versions.map((version) => (
          <li key={version.versionId}>{version.changes}</li>
        ))}
      </ul>
    </div>
  );
};

export default RepoHistory;