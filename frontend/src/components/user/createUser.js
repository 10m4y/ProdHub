import { useState } from "react";
import { Headphones, Mail, Lock, User } from "lucide-react";
import styled, { keyframes } from "styled-components";
import { signUp } from "../../api/user";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp(formData);
      setMessage("Welcome to ProHub! Your account has been created.");
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <Container>
      <ParticleBackground />
      <FormContainer>
        <LogoContainer>
          <Logo />
        </LogoContainer>
        <Title>Join ProHub</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <Mail size={16} />
            </InputIcon>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          </InputGroup>
          <InputGroup>
            <InputIcon>
              <Lock size={16} />
            </InputIcon>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
          </InputGroup>
          <InputGroup>
            <InputIcon>
              <User size={16} />
            </InputIcon>
            <Input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
          </InputGroup>
          <Button type="submit">Create Account</Button>
        </Form>
        {message && <Message>{message}</Message>}
        {error && <Message isError>{error}</Message>}

        {/* Login Link */}
        <LoginLink onClick={() => navigate("/signin")}>
          Already have an account? <span>Login</span>
        </LoginLink>
      </FormContainer>
    </Container>
  );
};

export default SignUp;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #ff1493; }
  50% { box-shadow: 0 0 15px #6a5acd; }
  100% { box-shadow: 0 0 5px #ff1493; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: url('/image2.jpg') no-repeat center center/cover;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  positon: absolute;
  top: 0;
  left: 0;
`;

const ParticleBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
  z-index: 2;
`;

const Title = styled.h2`
  font-size: 2rem;
  text-align: center;
  color: #f0f0f0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

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
    border-color: #ff1493;
    box-shadow: 0 0 10px rgba(255, 20, 147, 0.6);
  }
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const InputIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff1493, #6a5acd);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${glow} 1.5s infinite alternate;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 20, 147, 0.5);
  }
`;

const Message = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.isError ? "#ff6b6b" : "#4cd964")};
  font-size: 0.9rem;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Logo = styled(Headphones)`
  width: 48px;
  height: 48px;
  color: #ff1493;
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.3s ease;
  
  span {
    color: #ff1493;
    font-weight: bold;
    transition: all 0.3s ease;
  }

  &:hover {
    color: #ffffff;
    span {
      text-decoration: underline;
    }
  }
`;
