import React, { useEffect, useState } from 'react';
import { getRepo, deleteRepo } from '../../api/repo';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00f5d4;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #333;
  padding-bottom: 0.5rem;
`;

const Section = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: #242424;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: -4px 4px 12px rgba(0, 245, 212, 0.1);
  }
`;

const Label = styled.strong`
  color: #00f5d4;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: #2a2a2a;
  border-radius: 6px;
  display: flex;
  align-items: center;

  &:before {
    content: '♪';
    color: #00f5d4;
    margin-right: 10px;
  }
`;

const MetaData = styled.p`
  color: #b3b3b3;
  font-size: 0.9rem;
  margin: 0.5rem 0;
`;

const DeleteButton = styled.button`
  background: #ff3366;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover {
    background: #ff1f1f;
    transform: translateY(-2px);
  }
`;

const Badge = styled.span`
  background: ${props => props.public ? '#00f5d4' : '#ff3366'};
  color: #1a1a1a;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

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
  const handdleUpdate=async ()=>{
    navigate(`/repo/${id}/update`)
  }

  return repo ? (
    <Container>
      <Title>{repo.Name}</Title>
      
      <Section>
        <Label>Project Details</Label>
        <DetailGrid>
          <MetaData><Label>BPM:</Label> {repo.Description.BPM}</MetaData>
          <MetaData><Label>Scale:</Label> {repo.Description.Scale}</MetaData>
          <MetaData><Label>Genre:</Label> {repo.Description.Genre}</MetaData>
        </DetailGrid>
      </Section>

      <Section>
        <Label>Collaborators</Label>
        {repo.Collaborators.length > 0 ? (
          <List>
            {repo.Collaborators.map((collaborator, index) => (
              <ListItem key={index}>{collaborator}</ListItem>
            ))}
          </List>
        ) : (
          <MetaData>No collaborators yet</MetaData>
        )}
      </Section>

      <Section>
        <Label>Recent Activity</Label>
        {repo.Activity.length > 0 ? (
          <List>
            {repo.Activity.map((activity, index) => (
              <ListItem key={index}>
                {new Date(activity.Date * 1000).toLocaleString()} - {activity.Description}
              </ListItem>
            ))}
          </List>
        ) : (
          <MetaData>No recent activity</MetaData>
        )}
      </Section>

      <Section>
        <Label>Versions</Label>
        {repo.Versions.length > 0 ? (
          <List>
            {repo.Versions.map((version, index) => (
              <ListItem key={index}>{version}</ListItem>
            ))}
          </List>
        ) : (
          <MetaData>No versions available</MetaData>
        )}
      </Section>

      <Section>
        <Label>Project Info</Label>
        <MetaData><Label>Branches:</Label> {repo && repo.Branches && repo.Branches.length > 0?(
          <List>
            {repo.Branches.map((branch, index) => (
              <ListItem key={index}>{branch.name}</ListItem>
            ))}
          </List>

        ):(
          <MetaData>No branches available</MetaData>
        )}</MetaData>
        <MetaData><Label>Created:</Label> {new Date(repo.CreatedAt * 1000).toLocaleString()}</MetaData>
        <MetaData><Label>Last Updated:</Label> {repo.UpdatedAt ? new Date(repo.UpdatedAt * 1000).toLocaleString() : "Never"}</MetaData>
        <MetaData>
          <Label>Access:</Label> <Badge public={repo.Public}>{repo.Public ? "Public" : "Private"}</Badge>
        </MetaData>
      </Section>

      <DeleteButton onClick={handleDelete}>Delete Project</DeleteButton>
      <DeleteButton onClick={handdleUpdate}>Edit Repo</DeleteButton>
    </Container>
  ) : (
    <Container>
      <MetaData>Loading...</MetaData>
    </Container>
  );
};

export default RepoDetails;