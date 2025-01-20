import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/user' });

export const signUp = (formData) => API.post('/signup', formData);//working
export const getUser = (id) => API.get(`/${id}`);//working
export const updateUser = (id, formData) => API.put(`/${id}`, formData);//working
export const getUserRepos = (id) => API.get(`/${id}/repos`);//working