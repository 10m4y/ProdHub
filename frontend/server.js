import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';


const app = express();
app.use(bodyParser.json());

const users = [];

app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  users.push({ username, email, password });
  res.status(201).send('User created');
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = jwt.sign({ email }, 'secretKey', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
