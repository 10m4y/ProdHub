import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  const handleAuth = () => {
    isAuthenticated ? logout({ returnTo: window.location.origin }) : loginWithRedirect();
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={{ 
          ...styles.link, 
          borderBottom: location.pathname === '/' ? '2px solid #00bcd4' : 'none' 
        }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ 
          ...styles.link, 
          borderBottom: location.pathname === '/dashboard' ? '2px solid #00bcd4' : 'none' 
        }}>
          Dashboard
        </Link>
      </div>

      <div style={styles.right}>
        {isLoading ? (
          <p style={styles.loading}>Loading...</p>
        ) : isAuthenticated ? (
          <div style={styles.userInfo}>
            <img src={user.picture} alt={user.name} style={styles.avatar} />
            <span style={styles.userName}>{user.name}</span>
            <button onClick={handleAuth} style={styles.button}>
              Logout
            </button>
          </div>
        ) : (
          <button onClick={handleAuth} style={styles.button}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1f1f1f',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  link: {
    color: 'white',
    margin: '0 1rem',
    textDecoration: 'none',
    fontSize: '1.2rem',
    padding: '0.5rem',
    transition: 'color 0.3s ease',
  },
  button: {
    backgroundColor: '#00bcd4',
    color: '#fff',
    border: 'none',
    padding: '0.7rem 1.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  loading: {
    color: '#aaa',
    fontSize: '1rem',
    marginRight: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  userName: {
    color: 'white',
    fontSize: '1rem',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default Navbar;
