import React, { useEffect, useState } from 'react';
import { getRepo, deleteRepo } from '../../api/repo';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  Music, Clock, Globe, Lock, Users, Zap, TrendingUp, 
  Calendar, GitBranch, Activity, Edit3, Trash2, ArrowLeft 
} from 'lucide-react';
import Navigation from '../navBar';

const RepoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        setLoading(true);
        const { data } = await getRepo(id);
        setRepo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteRepo(id);
        alert('Project deleted successfully');
        navigate('/');
      } catch (err) {
        console.error(err);
        alert('Error deleting project');
      }
    }
  };

  const handleUpdate = async () => {
    navigate(`/repo/${id}/update`);
  };

  const handleBack = () => {
    navigate('/repos');
  };

  if (loading) {
    return (
      <Container>
        <Navigation />
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading project details...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (!repo) {
    return (
      <Container>
        <Navigation />
        <ErrorContainer>
          <ErrorIcon>
            <Music size={64} />
          </ErrorIcon>
          <ErrorTitle>Project Not Found</ErrorTitle>
          <ErrorDescription>
            The project you're looking for doesn't exist or you don't have access to it.
          </ErrorDescription>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Projects
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Navigation />
      <ContentWrapper>
        <HeaderSection>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Projects
          </BackButton>
          
          <ProjectHeader>
            <ProjectTitleSection>
              <ProjectTitle>{repo.Name}</ProjectTitle>
              <StatusIndicator isPublic={repo.Public}>
                {repo.Public ? <Globe size={20} /> : <Lock size={20} />}
                <StatusText>{repo.Public ? 'Public' : 'Private'}</StatusText>
              </StatusIndicator>
            </ProjectTitleSection>
            
            {/* <QuickStats>
              <StatChip>
                <Zap size={16} />
                {repo.Description.BPM} BPM
              </StatChip>
              <StatChip>
                <Music size={16} />
                {repo.Description.Scale}
              </StatChip>
              <StatChip>
                <TrendingUp size={16} />
                {repo.Description.Genre}
              </StatChip>
            </QuickStats> */}
          </ProjectHeader>

          <ActionButtons>
            <ActionButton variant="primary" onClick={handleUpdate}>
              <Edit3 size={18} />
              Edit Project
            </ActionButton>
            <ActionButton variant="danger" onClick={handleDelete}>
              <Trash2 size={18} />
              Delete Project
            </ActionButton>
          </ActionButtons>
        </HeaderSection>

        <ContentGrid>
          <MainContent>
            <Section>
              <SectionHeader>
                <SectionIcon><Music size={20} /></SectionIcon>
                <SectionTitle>Project Details</SectionTitle>
              </SectionHeader>
              <DetailGrid>
                <DetailCard>
                  <DetailIcon><Zap size={16} /></DetailIcon>
                  <DetailInfo>
                    <DetailLabel>Tempo</DetailLabel>
                    <DetailValue>{repo.Description.BPM} BPM</DetailValue>
                  </DetailInfo>
                </DetailCard>
                <DetailCard>
                  <DetailIcon><Music size={16} /></DetailIcon>
                  <DetailInfo>
                    <DetailLabel>Scale</DetailLabel>
                    <DetailValue>{repo.Description.Scale}</DetailValue>
                  </DetailInfo>
                </DetailCard>
                <DetailCard>
                  <DetailIcon><TrendingUp size={16} /></DetailIcon>
                  <DetailInfo>
                    <DetailLabel>Genre</DetailLabel>
                    <DetailValue>{repo.Description.Genre}</DetailValue>
                  </DetailInfo>
                </DetailCard>
              </DetailGrid>
            </Section>

            <Section>
              <SectionHeader>
                <SectionIcon><Users size={20} /></SectionIcon>
                <SectionTitle>Collaborators</SectionTitle>
                <CollaboratorCount>{repo.Collaborators?.length || 0}</CollaboratorCount>
              </SectionHeader>
              {repo.Collaborators && repo.Collaborators.length > 0 ? (
                <CollaboratorGrid>
                  {repo.Collaborators.map((collaborator, index) => (
                    <CollaboratorCard key={index}>
                      <CollaboratorAvatar>
                        {collaborator.charAt(0).toUpperCase()}
                      </CollaboratorAvatar>
                      <CollaboratorName>{collaborator}</CollaboratorName>
                    </CollaboratorCard>
                  ))}
                </CollaboratorGrid>
              ) : (
                <EmptyState>
                  <Users size={32} />
                  <EmptyStateText>No collaborators yet</EmptyStateText>
                </EmptyState>
              )}
            </Section>

            <Section>
              <SectionHeader>
                <SectionIcon><Activity size={20} /></SectionIcon>
                <SectionTitle>Recent Activity</SectionTitle>
              </SectionHeader>
              {repo.Activity && repo.Activity.length > 0 ? (
                <ActivityList>
                  {repo.Activity.map((activity, index) => (
                    <ActivityItem key={index}>
                      <ActivityTime>
                        {new Date(activity.Date * 1000).toLocaleDateString()}
                      </ActivityTime>
                      <ActivityDescription>{activity.Description}</ActivityDescription>
                    </ActivityItem>
                  ))}
                </ActivityList>
              ) : (
                <EmptyState>
                  <Activity size={32} />
                  <EmptyStateText>No recent activity</EmptyStateText>
                </EmptyState>
              )}
            </Section>
          </MainContent>

          <Sidebar>
            <Section>
              <SectionHeader>
                <SectionIcon><Clock size={20} /></SectionIcon>
                <SectionTitle>Timeline</SectionTitle>
              </SectionHeader>
              <TimelineItem>
                <TimelineIcon><Calendar size={16} /></TimelineIcon>
                <TimelineContent>
                  <TimelineLabel>Created</TimelineLabel>
                  <TimelineValue>
                    {new Date(repo.CreatedAt * 1000).toLocaleDateString()}
                  </TimelineValue>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineIcon><Clock size={16} /></TimelineIcon>
                <TimelineContent>
                  <TimelineLabel>Last Updated</TimelineLabel>
                  <TimelineValue>
                    {repo.UpdatedAt 
                      ? new Date(repo.UpdatedAt * 1000).toLocaleDateString()
                      : "Never"
                    }
                  </TimelineValue>
                </TimelineContent>
              </TimelineItem>
            </Section>

            <Section>
              <SectionHeader>
                <SectionIcon><GitBranch size={20} /></SectionIcon>
                <SectionTitle>Branches</SectionTitle>
                <CollaboratorCount>{repo.Branches?.length || 0}</CollaboratorCount>
              </SectionHeader>
              {repo.Branches && repo.Branches.length > 0 ? (
                <BranchList>
                  {repo.Branches.map((branch, index) => (
                    <BranchItem key={index}>
                      <GitBranch size={14} />
                      <BranchName>{branch.name}</BranchName>
                    </BranchItem>
                  ))}
                </BranchList>
              ) : (
                <EmptyState>
                  <GitBranch size={32} />
                  <EmptyStateText>No branches available</EmptyStateText>
                </EmptyState>
              )}
            </Section>

            <Section>
              <SectionHeader>
                <SectionIcon><Music size={20} /></SectionIcon>
                <SectionTitle>Versions</SectionTitle>
                <CollaboratorCount>{repo.Versions?.length || 0}</CollaboratorCount>
              </SectionHeader>
              {repo.Versions && repo.Versions.length > 0 ? (
                <VersionList>
                  {repo.Versions.map((version, index) => (
                    <VersionItem key={index}>
                      <VersionNumber>v{index + 1}</VersionNumber>
                      <VersionName>{version}</VersionName>
                    </VersionItem>
                  ))}
                </VersionList>
              ) : (
                <EmptyState>
                  <Music size={32} />
                  <EmptyStateText>No versions available</EmptyStateText>
                </EmptyState>
              )}
            </Section>
          </Sidebar>
        </ContentGrid>
      </ContentWrapper>
    </Container>
  );
};

export default RepoDetails;

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

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  color: white;
`;

const ErrorIcon = styled.div`
  margin-bottom: 2rem;
  opacity: 0.7;
  color: #ff6b6b;
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
`;

const ErrorDescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
`;

const HeaderSection = styled.div`
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-5px);
  }
`;

const ProjectHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ProjectTitleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ProjectTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(45deg, #fff, #f8f9fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  background: ${props => props.isPublic 
    ? 'linear-gradient(45deg, #48bb78, #38a169)' 
    : 'linear-gradient(45deg, #ed8936, #dd6b20)'};
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px ${props => props.isPublic 
    ? 'rgba(72, 187, 120, 0.3)' 
    : 'rgba(237, 137, 54, 0.3)'};
`;

const StatusText = styled.span`
  font-size: 0.9rem;
`;

const QuickStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  color: white;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
    }
  `}
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.6s ease;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionIcon = styled.div`
  color: #667eea;
  display: flex;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin: 0;
  flex: 1;
`;

const CollaboratorCount = styled.span`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const DetailIcon = styled.div`
  color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  padding: 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DetailInfo = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
`;

const CollaboratorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const CollaboratorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.5s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const CollaboratorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`;

const CollaboratorName = styled.div`
  color: white;
  font-weight: 500;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border-left: 4px solid #667eea;
  animation: ${slideIn} 0.5s ease;
`;

const ActivityTime = styled.div`
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 100px;
`;

const ActivityDescription = styled.div`
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
`;

const TimelineIcon = styled.div`
  color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimelineValue = styled.div`
  color: white;
  font-weight: 500;
`;

const BranchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BranchItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const BranchName = styled.span`
  font-weight: 500;
`;

const VersionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VersionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const VersionNumber = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`;

const VersionName = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  flex: 1;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  gap: 1rem;
`;

const EmptyStateText = styled.p`
  font-size: 0.9rem;
  margin: 0;
`;