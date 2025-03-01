import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Import Google Font using Global Styles
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sigmar&display=swap');

  body {
    font-family: 'Sigmar', cursive;
  }
`;

const Home = () => {
        useEffect(() => {
                gsap.to('.hero-text', {
                        y: 0,
                        opacity: 1,
                        duration: 1.5,
                        ease: 'power3.out',
                });

                gsap.to('.hero-btn', {
                        y: 0,
                        opacity: 1,
                        duration: 1.5,
                        ease: 'power3.out',
                        delay: 0.5,
                });
        }, []);

        return (
                <>
                        <GlobalStyle /> {/* Apply the global font style */}
                        <Container>
                                <ParallaxBackground>
                                        <Overlay />
                                        <Content>
                                                <motion.h1
                                                        className="hero-text"
                                                        initial={{ y: 50, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ duration: 1 }}
                                                >
                                                        Welcome to ProdHub
                                                </motion.h1>
                                                <motion.p
                                                        className="hero-text"
                                                        initial={{ y: 50, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                >
                                                        Collaborate with producers & musicians worldwide!
                                                </motion.p>
                                                <motion.div
                                                        className="hero-btn"
                                                        initial={{ y: 30, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ duration: 1, delay: 0.6 }}
                                                >
                                                        <StyledLink to="/signup">Get Started</StyledLink>
                                                        <StyledLink to="/signin" secondary>Login</StyledLink>
                                                </motion.div>
                                        </Content>
                                </ParallaxBackground>
                        </Container>
                </>
        );
};

export default Home;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ParallaxBackground = styled.div`
  background: url('/music_bg.jpg') no-repeat center center/cover;
  height: auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
`;

const Content = styled.div`
  position: relative;
  text-align: center;
  color: #fff;
  z-index: 2;

  h1 {
    font-size: 4rem;
    font-weight: bold;
    font-family: 'Sigmar', cursive;
    text-shadow: 0px 0px 20px rgba(255, 255, 255, 0.3);
  }

  p {
    font-size: 1.5rem;
    margin-top: 0.5rem;
    font-family: 'Sigmar', cursive;
  }
`;

const StyledLink = styled(Link)`
  display: inline-block;
  margin: 1rem;
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  font-family: 'Sigmar', cursive;
  color: ${(props) => (props.secondary ? '#fff' : '#000')};
  background: ${(props) => (props.secondary ? 'transparent' : '#00f5d4')};
  border: ${(props) => (props.secondary ? '2px solid #00f5d4' : 'none')};
  border-radius: 50px;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.secondary ? '#00f5d4' : '#00b8ff')};
    color: #000;
    transform: scale(1.05);
  }
`;
