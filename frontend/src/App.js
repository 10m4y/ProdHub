import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateRepo from './components/repo/createRepo'
import RepoDetails from './components/repo/repoDetails';
import RepoHistory from './components/repo/repoHistory';
import UploadVersion from './components/repo/uploadVersion';
import RepoList from './components/repo/repoList';
import CreateUser from './components/user/createUser';
import Login from './components/user/loginUser';
import GetUser from './components/user/getUser';
import UpdateUser from './components/user/updateUser';
import GetUserRepos from './components/user/getUserRepos';
// import Navigation from './components/navBar';

const App = () => {
  return (

  
    <Router>
      <Routes>
        
        <Route path="/" element={<RepoList/>} />
        <Route path="/create" element={<CreateRepo />} />
        <Route path="/repo/:id" element={<RepoDetails />}/>
        <Route path="/repo/:id/history" element={<RepoHistory />}/>
        <Route path="/repo/:id/upload" element={<UploadVersion />}/>
        <Route path='/signin' element={<Login/>}/>
        <Route path='/signup' element={<CreateUser/>}/>
        <Route path='/user/:id' element={<GetUser/>}/>
        <Route path='/user/update/:id' element={<UpdateUser/>}/>
        <Route path='/user/repos/:id' element={<GetUserRepos/>}/>
        
      </Routes>
    </Router>
    
  );
};

export default App;