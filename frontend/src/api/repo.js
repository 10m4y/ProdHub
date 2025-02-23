import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/repo' });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},(error)=>{
    return Promise.reject(error);
});

export const createRepo = (data) => API.post('/create', data);
export const getRepo = (id) => API.get(`/${id}`);//working
export const deleteRepo = (id) => API.delete(`/${id}`);
export const addVersion = (id, formData) => API.post(`/upload/${id}`, formData);
export const getRepoVersions = (id) => API.get(`/history/${id}`);
export const getAllRepos = () => API.get('/');//working