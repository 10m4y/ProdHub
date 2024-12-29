import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🎵 Music Collab</h2>
        <ul style={styles.navList}>
          <li style={styles.navItem}>My Projects</li>
          <li style={styles.navItem}>Collaborations</li>
          <li style={styles.navItem}>Upload Files</li>
          <li style={styles.navItem}>Settings</li>
        </ul>
      </aside>

      {/* Main Content Section */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h1>Welcome Back!</h1>
            <p>Your music projects at a glance.</p>
          </div>
          <div style={styles.profileSection}>
            <div 
              style={styles.profile} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img 
                src="https://i.pravatar.cc/40" 
                alt="User Avatar" 
                style={styles.avatar} 
              />
              <span style={styles.userName}>John Doe</span>
            </div>
            {dropdownOpen && (
              <div style={styles.dropdown}>
                <p onClick={handleLogout}>Logout</p>
              </div>
            )}
          </div>
        </header>

        {/* Cards Section */}
        <section style={styles.cards}>
          <div style={styles.card}>
            <h3>🎸 My Tracks</h3>
            <p>12 Uploaded</p>
          </div>
          <div style={styles.card}>
            <h3>🤝 Collaborations</h3>
            <p>5 Active</p>
          </div>
          <div style={styles.card}>
            <h3>📂 Files Shared</h3>
            <p>28 Files</p>
          </div>
        </section>
      </main>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  dashboard: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#1e1e2f',
    color: 'white',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  logo: {
    fontSize: '1.8rem',
    marginBottom: '2rem',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    margin: '1rem 0',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.5rem 0',
    transition: 'background-color 0.3s ease',
  },
  navItemHover: {
    backgroundColor: '#333352',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: '2rem',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  profileSection: {
    position: 'relative',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '0.8rem',
  },
  userName: {
    color: '#333',
    fontSize: '1rem',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '5px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    zIndex: 10,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  },
  cardHover: {
    transform: 'translateY(-5px)',
  },
};

export default Dashboard;
