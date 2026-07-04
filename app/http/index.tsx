import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
});


export const login = (data: any) => api.post("/auth/login", data);
export const profile = () => api.get("/auth/me");
export const logoutUser = () => api.post("/auth/logout");
export const getCabins = () => api.get("/cabins");
export const getAllBuildings = () => api.get("/cabins/getBuildings");



// Admin endpoints
export const listOfUsers = () => api.get("/users/getAllUsers");
export const register = (data: any) => api.post("/auth/register", data);
export const updateUser = (id: string, data: any) => api.put(`/users/updateUser/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/deleteUser/${id}`);

export const deleteCabin = (id: string) => api.delete(`/cabins/delete/${id}`)
export const createCabin = (data: any) => api.post("/cabins/create", data);
export const updateCabin = (id: string, data: any) => api.put(`/cabins/update/${id}`, data);
export const toggleMaintainance = (id: string) => api.put(`/cabins/toggle-maintenance/${id}`);
export const createBuilding = (data: any) => api.post("/cabins/createBuilding", data);

export default api;