import React,{useState,useEffect} from "react";
import axios from 'axios';
import { getUser } from "../../api/user";
import { useParams } from "react-router-dom";

const GetUser=()=>{

    const{id}=useParams();

    const [user,setUser]=useState();
    const [error,setError]=useState('');

    useEffect(()=>{
        const fetchUser=async()=>{
            try{
                const response=await getUser(id);
                setUser(response.data);
            }catch(err){
                setError(err.message  || 'error to fetch error');
            }
        }
        fetchUser();
    },[id]);

    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>Loading...</div>;

    return(
        <div>
            <p>email: {user.email}</p>
            <p>username: {user.username}</p>
            <p>repos: {user.repo_ids.join(', ')}</p>
        </div>

    )

}

export default GetUser;