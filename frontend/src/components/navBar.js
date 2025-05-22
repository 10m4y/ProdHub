import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Music, FolderPlus, Users, Settings, Search, LogOut, Bell, User } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <NavContent>
        <LeftSection>
          <Logo to="/">
            <LogoIcon size={28} />
            <LogoText>FLPCloud</LogoText>
            <LogoBeta>STUDIO</LogoBeta>
          </Logo>
        </LeftSection>

        <CenterSection>
          <SearchContainer>
            <SearchWrapper>
              <SearchInput placeholder="Search projects, collaborators..." />
              <SearchIconWrapper>
                <SearchIcon size={18} />
              </SearchIconWrapper>
            </SearchWrapper>
          </SearchContainer>
        </CenterSection>

        <RightSection>
          <NavLinks>
            <NavLink to="/" $active={location.pathname === '/'}>
              <NavIconWrapper>
                <Music size={18} />
              </NavIconWrapper>
              <NavText>Projects</NavText>
              {location.pathname === '/' && <ActiveIndicator />}
            </NavLink>
            
            <NavLink to="/collaborations" $active={location.pathname === '/collaborations'}>
              <NavIconWrapper>
                <Users size={18} />
              </NavIconWrapper>
              <NavText>Collaborations</NavText>
              {location.pathname === '/collaborations' && <ActiveIndicator />}
            </NavLink>
            
            <NavLink to="/settings" $active={location.pathname === '/settings'}>
              <NavIconWrapper>
                <Settings size={18} />
              </NavIconWrapper>
              <NavText>Settings</NavText>
              {location.pathname === '/settings' && <ActiveIndicator />}
            </NavLink>
          </NavLinks>

          <ActionButtons>
            <NotificationButton>
              <Bell size={18} />
              <NotificationDot />
            </NotificationButton>

            <CreateButton to="/create">
              <ButtonGlow />
              <FolderPlus size={18} />
              <ButtonText>New Project</ButtonText>
            </CreateButton>

            <ProfileSection>
              <ProfileButton>
                <User size={18} />
              </ProfileButton>
              <LogoutButton to="/logout">
                <LogOut size={18} />
              </LogoutButton>
            </ProfileSection>
          </ActionButtons>
        </RightSection>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation;

// Animations
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.5); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
`;

// Styled Components
const NavContainer = styled.nav`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${slideIn} 0.6s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(245, 87, 108, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoIcon = styled(Music)`
  color: #667eea;
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.5));
  animation: ${float} 3s ease-in-out infinite;
`;

const LogoText = styled.span`
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
`;

const LogoBeta = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(102, 126, 234, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  margin-left: 0.5rem;
  letter-spacing: 1px;
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 0.75rem 1.5rem 0.75rem 3.5rem;
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    transform: scale(1.02);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  transition: color 0.3s ease;
  
  ${SearchInput}:focus ~ & {
    color: #667eea;
  }
`;

const SearchIcon = styled(Search)``;

const NavLinks = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  position: relative;
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.15)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(102, 126, 234, 0.3)' : 'transparent'};
  
  &:hover {
    color: white;
    background: rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  }
`;

const NavIconWrapper = styled.div`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  
  ${NavLink}:hover & {
    transform: scale(1.1);
  }
`;

const NavText = styled.span`
  font-size: 0.9rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationButton = styled.button`
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  }
`;

const NotificationDot = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border-radius: 50%;
  border: 2px solid #1a1a2e;
`;

const CreateButton = styled(Link)`
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  overflow: hidden;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  
  ${CreateButton}:hover & {
    animation: ${shimmer} 0.6s ease;
  }
`;

const ButtonText = styled.span`
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfileButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

const LogoutButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border-color: rgba(255, 107, 107, 0.2);
    transform: rotate(10deg) translateY(-2px);
  }
`;