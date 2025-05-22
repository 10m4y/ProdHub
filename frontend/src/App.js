import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// Importing Components
import CreateRepo from "./components/repo/createRepo";
import UpdateRepo from "./components/repo/updateRepo";
import RepoDetails from "./components/repo/repoDetails";
import RepoHistory from "./components/repo/repoHistory";
import UploadVersion from "./components/repo/uploadVersion";
import RepoList from "./components/repo/repoList";
import CreateUser from "./components/user/createUser";
import Login from "./components/user/loginUser";
import GetUser from "./components/user/getUser";
import UpdateUser from "./components/user/updateUser";
import GetUserRepos from "./components/user/getUserRepos";
import Home from "./components/Home";
import "./app.css"



const App = () => {
  return (
    <>
      {/* <SmoothScroll />
      <ScrollAnimations /> */}

      <Router>
        <div>
          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/repos" element={<RepoList />} />
            <Route path="/create" element={<CreateRepo />} />
            <Route path="/repo/:id/update" element={<UpdateRepo/>}/>
            <Route path="/repo/:id" element={<RepoDetails />} />
            <Route path="/repo/:id/history" element={<RepoHistory />} />
            <Route path="/repo/:id/upload" element={<UploadVersion />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/signup" element={<CreateUser />} />
            <Route path="/user/:id" element={<GetUser />} />
            <Route path="/user/update/:id" element={<UpdateUser />} />
            <Route path="/user/repos/:id" element={<GetUserRepos />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
