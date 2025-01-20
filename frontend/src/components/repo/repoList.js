import React from 'react';
import { Link } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { getAllRepos } from '../../api/repo';

const RepoList = () => {

  const [repos,setRepos]=useState([]);
  // Assume repos are fetched and passed as props or context.

  const fetchRepos=async()=>{
    try{
      console.log('fetching repos');
      const repos=await getAllRepos();
      console.log(repos);
      setRepos(repos.data);
    }catch(err){
      console.error(err);
    }

  }
  useEffect(()=>{
    fetchRepos();
  },[]);
  


  return (
    <div>
      <h1>Repos</h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo.repoId}>
            <Link to={`/repo/${repo.RepoID}`}>{repo.Name}</Link>
            <p>Public: {repo.public ? 'Yes' : 'No'}</p>
            <p>Last updated at: {new Date(repo.UpdatedAt * 1000).toLocaleString()}</p>
            <p>BPM: {repo.Description.BPM}</p>
            <p>Scale: {repo.Description.Scale}</p>
            <p>Genre: {repo.Description.Genre}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepoList;