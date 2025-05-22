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

// Register GSAP Plugin
// gsap.registerPlugin(ScrollTrigger);

// // Smooth Scrolling Function
// const SmoothScroll = () => {
//   useEffect(() => {
//     const lenis = new Lenis({
//       duration: 1.5,
//       easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//     });

//     function raf(time) {
//       lenis.raf(time);
//       requestAnimationFrame(raf);
//     }

//     requestAnimationFrame(raf);

//     return () => lenis.destroy();
//   }, []);

//   return null;
// };

// // Scroll Animations Function
// const ScrollAnimations = () => {
//   useEffect(() => {
//     gsap.from(".fade-in", {
//       opacity: 0,
//       y: 50,
//       duration: 1.2,
//       stagger: 0.3,
//       scrollTrigger: {
//         trigger: ".fade-in",
//         start: "top 80%",
//         end: "bottom 50%",
//         scrub: 1,
//       },
//     });

//     gsap.from(".slide-left", {
//       opacity: 0,
//       x: -100,
//       duration: 1.5,
//       scrollTrigger: {
//         trigger: ".slide-left",
//         start: "top 85%",
//         end: "bottom 60%",
//         scrub: 1,
//       },
//     });

//     gsap.from(".slide-right", {
//       opacity: 0,
//       x: 100,
//       duration: 1.5,
//       scrollTrigger: {
//         trigger: ".slide-right",
//         start: "top 85%",
//         end: "bottom 60%",
//         scrub: 1,
//       },
//     });
//   }, []);

//   return null;
// };

const App = () => {
  return (
    <>
      {/* <SmoothScroll />
      <ScrollAnimations /> */}

      <Router>
        <div style={styles.container}>
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

// Custom Scrollbar & Styling
const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#111",
    color: "white",
    minHeight: "100vh",
  },
};

// Scrollbar Styling (Injected into head)
const styleSheet = `
  html {
    scrollbar-width: thin;
    scrollbar-color: #6a5acd #222;
    scroll-behavior: smooth;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #222;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #6a5acd, #ff1493);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #ff1493;
  }
`;
const styleElement = document.createElement("style");
styleElement.innerHTML = styleSheet;
document.head.appendChild(styleElement);

export default App;
