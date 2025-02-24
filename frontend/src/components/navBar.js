import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Music, FolderPlus, Users, Settings, Search, LogOut } from 'lucide-react';

const NavContainer = styled.nav`
  background: #1a1a1a;
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #00f5d4;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    text-shadow: 0 0 10px rgba(0, 245, 212, 0.5);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.active ? '#00f5d4' : '#b3b3b3'};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    color: #00f5d4;
    background: rgba(0, 245, 212, 0.1);
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-right: 2rem;
`;

const SearchInput = styled.input`
  background: #242424;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  color: white;
  width: 200px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00f5d4;
    width: 300px;
    box-shadow: 0 0 0 2px rgba(0, 245, 212, 0.1);
  }

  &::placeholder {
    color: #666;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
`;

const CreateButton = styled(Link)`
  background: linear-gradient(90deg, #00f5d4, #00b8ff);
  color: #1a1a1a;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 245, 212, 0.3);
  }
`;

const Navigation = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/">
          <Music size={24} />
          FLPCloud
        </Logo>

        <SearchBar>
          <SearchIcon size={16} />
          <SearchInput placeholder="Search projects..." />
        </SearchBar>

        <NavLinks>
          <NavLink to="/" active={location.pathname === '/'}>
            <Music size={18} />
            Projects
          </NavLink>
          
          <NavLink to="/collaborations" active={location.pathname === '/collaborations'}>
            <Users size={18} />
            Collaborations
          </NavLink>
          
          <NavLink to="/settings" active={location.pathname === '/settings'}>
            <Settings size={18} />
            Settings
          </NavLink>

          <CreateButton to="/create">
            <FolderPlus size={18} />
            New Project
          </CreateButton>

          <NavLink to="/logout" active={false}>
            <LogOut size={18} />
          </NavLink>
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation;