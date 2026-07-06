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
export const getCabinsByFloorId = (floorId: string) => api.get(`/cabins/getCabinsByFloorId/${floorId}`);



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
export const updateBuilding = (id: string, data: any) => api.post(`/cabins/updateBuilding/${id}`, data);
export const deleteBuilding = (id: string) => api.delete(`/cabins/deleteBuilding/${id}`);
export const createFloor = (buildingId: string, data: any) => api.post(`/cabins/createFloor/${buildingId}`, data);
export const updateFloor = (id: string, data: any) => api.post(`/cabins/updateFloor/${id}`, data);
export const deleteFloor = (id: string) => api.delete(`/cabins/deleteFloor/${id}`);

export default api;