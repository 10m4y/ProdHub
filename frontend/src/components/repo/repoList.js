import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAllRepos } from '../../api/repo';
import { Music, Clock, Globe, Lock, Users } from 'lucide-react';
import Navigation from '../navBar';



const RepoList = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
              {repo.public ? (
                <>
                  <Globe size={14} />
                  Public
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Private
                </>
              )}
            </StatusBadge>
            
            <RepoName to={`/repo/${repo.RepoID}`}>
              {repo.Name}
            </RepoName>

            <MetaInfo>
              <Clock size={16} />
              {new Date(repo.UpdatedAt * 1000).toLocaleString()}
            </MetaInfo>

            <MetaInfo>
              <Music size={16} />
              {repo.Description.BPM} BPM
            </MetaInfo>

            {repo.Collaborators && repo.Collaborators.length > 0 && (
              <MetaInfo>
                <Users size={16} />
                {repo.Collaborators.length} Collaborator{repo.Collaborators.length !== 1 ? 's' : ''}
              </MetaInfo>
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
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #00f5d4;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid #333;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 245, 212, 0.1);
    border-color: #00f5d4;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #00f5d4, #00b8ff);
    border-radius: 12px 12px 0 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:before {
    opacity: 1;
  }
`;

const RepoName = styled(Link)`
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  margin: 1rem 0;
  display: block;
  transition: color 0.3s ease;

  &:hover {
    color: #00f5d4;
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
  color: #00f5d4;
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
  color: #b3b3b3;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  
  svg {
    color: #00f5d4;
  }
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  position: absolute;
  top: 1rem;
  right: 1rem;
  
  ${props => props.isPublic ? `
    background: rgba(0, 245, 212, 0.1);
    color: #00f5d4;
    border: 1px solid #00f5d4;
  ` : `
    background: rgba(255, 51, 102, 0.1);
    color: #ff3366;
    border: 1px solid #ff3366;
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  color: #b3b3b3;
  padding: 3rem;
  font-size: 1.2rem;
`;