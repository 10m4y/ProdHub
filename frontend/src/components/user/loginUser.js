"use client"

import { useState } from "react"
import { Headphones, Mail, Lock, User } from "lucide-react"
import styled, { keyframes } from "styled-components"
import {login} from '../../api/user'
import { useNavigate } from "react-router-dom"


const Login= () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response=await login(formData);
      console.log("Response: ", response);
      const receivedToken = response.data.token;
      console.log("Received token: ", receivedToken);
      setMessage("Welcome back to ProHub!")
    
      setError("")
      if (receivedToken) {
        localStorage.setItem('token', receivedToken); // Save token for future requests
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Save user details
        alert('Login successful!');
        navigate('/'); // Redirect to dashboard after login
      } else {
        alert('Login failed! No token received.');
      }

      setTimeout(()=>{
        navigate("/")
      },1000)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to Login. Please try again.")
    }
  }

  return (
    <Container>
      <FormContainer>
        <LogoContainer>
          <Logo />
        </LogoContainer>
        <Title>Login to ProHub</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <Mail size={16} />
            </InputIcon>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </InputGroup>
          <InputGroup>
            <InputIcon>
              <Lock size={16} />
            </InputIcon>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </InputGroup>
          <Button type="submit">Login</Button>
        </Form>
        {message && <Message>{message}</Message>}
        {error && <Message isError>{error}</Message>}
      </FormContainer>
    </Container>
  )
}

export default Login

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
`

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
`

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.25rem;
  text-align: center;
  color: #f0f0f0;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6a5acd;
    box-shadow: 0 0 0 2px rgba(106, 90, 205, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const InputIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`

const Button = styled.button`
  background: linear-gradient(45deg, #6a5acd, #ff1493);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 90, 205, 0.3);
  }
`

const Message = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.isError ? "#ff6b6b" : "#4cd964")};
  font-size: 0.9rem;
`

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`

const Logo = styled(Headphones)`
  width: 48px;
  height: 48px;
  color: #6a5acd;
`