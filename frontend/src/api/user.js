import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/' });

export const signUp = (formData) => API.post('/user/create', formData);//working
export const getUser = (id) => API.get(`/user/${id}`);//working
export const updateUser = (id, formData) => API.put(`/user/${id}`, formData);//working
export const getUserRepos = (id) => API.get(`/user/${id}/repos`);//working
// export const login = (formData) => API.post(`/auth/login`);//working
export const login = (formData) => API.post('/auth/login', formData);//working