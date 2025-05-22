import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { getAllRepos } from '../../api/repo';
import { Music, Clock, Globe, Lock, Users, Zap, TrendingUp } from 'lucide-react';
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
        <Navigation />
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading your creative projects...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (!repos.length) {
    return (
      <Container>
        <Navigation />
        <EmptyStateContainer>
          <EmptyIcon>
            <Music size={64} />
          </EmptyIcon>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            Ready to create something amazing? Start your first music production project.
          </EmptyDescription>
          <CreateButton>Start Creating</CreateButton>
        </EmptyStateContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Navigation />
      <ContentWrapper>
        <HeaderSection>
          <HeaderTitle>Your Music Studio</HeaderTitle>
          <HeaderSubtitle>
            Manage and collaborate on your music production projects
          </HeaderSubtitle>
          <StatsRow>
            <StatItem>
              <StatNumber>{repos.length}</StatNumber>
              <StatLabel>Projects</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{repos.filter(r => r.Public).length}</StatNumber>
              <StatLabel>Public</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{repos.reduce((acc, r) => acc + (r.Collaborators?.length || 0), 0)}</StatNumber>
              <StatLabel>Collaborators</StatLabel>
            </StatItem>
          </StatsRow>
        </HeaderSection>

        <ProjectGrid>
          {repos.map((repo) => (
            <ProjectCard key={repo.repoId}>
              <CardHeader>
                <ProjectTitle to={`/repo/${repo.RepoID}`}>
                  {repo.Name}
                </ProjectTitle>
                <StatusIndicator isPublic={repo.Public}>
                  {repo.Public ? <Globe size={16} /> : <Lock size={16} />}
                </StatusIndicator>
              </CardHeader>
              
              <MetadataGrid>
                <MetaItem>
                  <MetaIcon><Clock size={14} /></MetaIcon>
                  <MetaText>
                    {new Date(repo.UpdatedAt * 1000).toLocaleDateString()}
                  </MetaText>
                </MetaItem>
                <MetaItem>
                  <MetaIcon><Zap size={14} /></MetaIcon>
                  <MetaText>{repo.Description.BPM} BPM</MetaText>
                </MetaItem>
                {repo.Collaborators && repo.Collaborators.length > 0 && (
                  <MetaItem>
                    <MetaIcon><Users size={14} /></MetaIcon>
                    <MetaText>
                      {repo.Collaborators.length} member{repo.Collaborators.length !== 1 ? 's' : ''}
                    </MetaText>
                  </MetaItem>
                )}
              </MetadataGrid>

              <TagSection>
                <MusicTag variant="scale">{repo.Description.Scale}</MusicTag>
                <MusicTag variant="genre">{repo.Description.Genre}</MusicTag>
              </TagSection>

              <CardFooter>
                <VisibilityBadge isPublic={repo.Public}>
                  {repo.Public ? 'Public' : 'Private'}
                </VisibilityBadge>
                <TrendingIcon><TrendingUp size={12} /></TrendingIcon>
              </CardFooter>
            </ProjectCard>
          ))}
        </ProjectGrid>
      </ContentWrapper>
    </Container>
  );
};

export default RepoList;

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(245, 87, 108, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 2rem;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  color: white;
`;

const EmptyIcon = styled.div`
  margin-bottom: 2rem;
  opacity: 0.7;
  animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const EmptyDescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
`;

const CreateButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease;
`;

const HeaderTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f8f9fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ProjectCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(102, 126, 234, 0.3);
    
    &::before {
      left: 100%;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const ProjectTitle = styled(Link)`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s ease;
  flex: 1;
  margin-right: 1rem;
  
  &:hover {
    color: #667eea;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.isPublic 
    ? 'linear-gradient(45deg, #48bb78, #38a169)' 
    : 'linear-gradient(45deg, #ed8936, #dd6b20)'};
  color: white;
  box-shadow: 0 4px 12px ${props => props.isPublic 
    ? 'rgba(72, 187, 120, 0.3)' 
    : 'rgba(237, 137, 54, 0.3)'};
`;

const MetadataGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetaIcon = styled.div`
  color: #667eea;
  display: flex;
  align-items: center;
`;

const MetaText = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const TagSection = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const MusicTag = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    if (props.variant === 'scale') return 'linear-gradient(45deg, #667eea, #764ba2)';
    if (props.variant === 'genre') return 'linear-gradient(45deg, #f093fb, #f5576c)';
    return 'linear-gradient(45deg, #4facfe, #00f2fe)';
  }};
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const VisibilityBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.isPublic ? '#48bb78' : '#ed8936'};
  background: ${props => props.isPublic 
    ? 'rgba(72, 187, 120, 0.1)' 
    : 'rgba(237, 137, 54, 0.1)'};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid ${props => props.isPublic 
    ? 'rgba(72, 187, 120, 0.2)' 
    : 'rgba(237, 137, 54, 0.2)'};
`;

const TrendingIcon = styled.div`
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.3s ease;
  
  ${ProjectCard}:hover & {
    color: #667eea;
  }
`;