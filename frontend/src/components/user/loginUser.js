"use client"

import { useState } from "react"
import { Headphones, Mail, Lock } from "lucide-react"
import styled, { keyframes } from "styled-components"
import { login } from "../../api/user"
import { useNavigate, Link } from "react-router-dom"

const Login = () => {
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
      const response = await login(formData)
      console.log("Response: ", response)
      const receivedToken = response.data.token
      console.log("Received token: ", receivedToken)
      setMessage("Welcome back to ProHub!")

      setError("")
      if (receivedToken) {
        localStorage.setItem("token", receivedToken)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        alert("Login successful!")
        navigate("/")
      } else {
        alert("Login failed! No token received.")
      }

      setTimeout(() => {
        navigate("/")
      }, 1000)
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
        <Title>Login to ProdHub</Title>
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

        {/* Sign Up Link */}
        <SignupLink>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </SignupLink>
      </FormContainer>
    </Container>
  )
}

export default Login

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`

// Fullscreen Background Container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: url("/image2.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: rgb(0, 0, 0);
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
`

// Glassmorphic Form Container
const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
`

// Login Title
const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.25rem;
  text-align: center;
  color: rgb(4, 1, 1);
`

// Form
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

// Input Group with Icons
const InputGroup = styled.div`
  position: relative;
  width: 100%;
`

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.25rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: rgb(13, 4, 4);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6a5acd;
    box-shadow: 0 0 8px rgba(106, 90, 205, 0.5);
  }

  &::placeholder {
    color: rgba(7, 6, 6, 0.6);
  }
`

const InputIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(18, 15, 15, 0.6);
`

// Login Button
const Button = styled.button`
  background: linear-gradient(45deg, #6a5acd, #ff1493);
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 90, 205, 0.3);
  }
`

// Success & Error Messages
const Message = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.isError ? "#ff6b6b" : "#4cd964")};
  font-size: 0.9rem;
`

// Signup Link
const SignupLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);

  a {
    color: #6a5acd;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s ease;

    &:hover {
      color: #ff1493;
    }
  }
`

// Logo
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
