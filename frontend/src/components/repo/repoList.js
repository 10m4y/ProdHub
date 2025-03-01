import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { getAllRepos } from '../../api/repo';
import { Music, Clock, Globe, Lock, Users } from 'lucide-react';
import Navigation from '../navBar';

const RepoList = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        const repos = await getAllRepos();
        setRepos(repos.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  if (loading) {
    return (
      <Container>
        <EmptyState>Loading your music projects...</EmptyState>
      </Container>
    );
  }

  if (!repos.length) {
    return (
      <Container>
        <EmptyState>No music projects found. Start creating!</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Navigation />
      <Header>Music Production Projects</Header>
      <Grid>
        {repos.map((repo) => (
          <Card key={repo.repoId}>
            <StatusBadge isPublic={repo.public}>
              {repo.public ? <><Globe size={14} /> Public</> : <><Lock size={14} /> Private</>}
            </StatusBadge>
            <RepoName to={`/repo/${repo.RepoID}`}>{repo.Name}</RepoName>
            <MetaInfo><Clock size={16} /> {new Date(repo.UpdatedAt * 1000).toLocaleString()}</MetaInfo>
            <MetaInfo><Music size={16} /> {repo.Description.BPM} BPM</MetaInfo>
            {repo.Collaborators && repo.Collaborators.length > 0 && (
              <MetaInfo><Users size={16} /> {repo.Collaborators.length} Collaborator{repo.Collaborators.length !== 1 ? 's' : ''}</MetaInfo>
            )}
            <TagContainer>
              <Tag>{repo.Description.Scale}</Tag>
              <Tag>{repo.Description.Genre}</Tag>
            </TagContainer>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default RepoList;

const neonGlow = keyframes`
  0% { box-shadow: 0 0 10px #ff00ff; }
  50% { box-shadow: 0 0 20px #00f5d4; }
  100% { box-shadow: 0 0 10px #ff00ff; }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  background: url('/music-bg.jpg') no-repeat center center/cover;
  min-height: 100vh;
  color: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
  }
`;

const Header = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  font-weight: bold;
  text-shadow: 0 0 20px #ff00ff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: ${neonGlow} 2s infinite alternate;
  &:hover {
    transform: translateY(-5px) scale(1.02);
  }
`;

const RepoName = styled(Link)`
  font-size: 1.5rem;
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
  &:hover {
    color: #ff00ff;
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #2a2a2a;
  color: #ff00ff;
  border: 1px solid #333;
  transition: all 0.3s ease;
  &:hover {
    background: #333;
    transform: translateY(-2px);
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  color: #b3b3b3;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  ${(props) => props.isPublic
    ? `background: rgba(0, 245, 212, 0.1); color: #00f5d4; border: 1px solid #00f5d4;`
    : `background: rgba(255, 51, 102, 0.1); color: #ff3366; border: 1px solid #ff3366;`
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #b3b3b3;
`;
