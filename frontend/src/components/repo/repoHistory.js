import React, { useEffect, useState } from 'react';
import { getRepoVersions } from '../../api/repo';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  padding: 20px;
  background-color: #1e1e2f;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #ffcc00;
`;

const VersionList = styled.ul`
  list-style: none;
  padding: 0;
`;

const VersionItem = styled.li`
  background: linear-gradient(90deg, #ff7eb3, #ff758c);
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  animation: ${fadeIn} 0.5s ease-in-out;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 4px 15px rgba(255, 117, 140, 0.5);
  }
`;

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
    <Container>
      <Title>Repo Versions</Title>
      <VersionList>
        {versions.map((version) => (
          <VersionItem key={version.versionId}>{version.changes}</VersionItem>
        ))}
      </VersionList>
    </Container>
  );
};

export default RepoHistory;
