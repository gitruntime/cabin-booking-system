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
export const getDepartments = () => api.get(`/cabins/getDepartments`);
export const getRoomTypes = () => api.get(`/cabins/getTypes`);
export const getRoomFacilities = () => api.get(`/cabins/getFacilities`);
export const bookCabin = (data: any) => api.post('/bookings/create', data)
export const getBookingsByCabinId = (cabinId: string) => api.get(`/bookings/getBookingByCabinId/${cabinId}`);
export const getMyBookings = () => api.get(`/bookings/getMyBookings`);
export const checkInMyBookings = (id: string) => api.put(`/bookings/checkInMyBooking/${id}`);
export const rescheduleMyBookings = (id: string, data: any) => api.put(`/bookings/rescheduleBooking/${id}`, data);
export const cancelMyBookings = (id: string) => api.put(`/bookings/cancelBooking/${id}`);
export const masterData = () => api.get(`/bookings/master-data`)
export const calenderData = (params?: any) => api.get(`/bookings/calendar`, { params })





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
export const createDepartment = (data: any) => api.post("/cabins/createDepartment", data);
export const updateDepartment = (id: string, data: any) => api.put(`/cabins/updateDepartment/${id}`, data)
export const deleteDepartment = (id: string) => api.delete(`/cabins/deleteDepartment/${id}`)
export const createType = (data: any) => api.post("/cabins/createType", data);
export const updateType = (id: string, data: any) => api.put(`/cabins/updateType/${id}`, data)
export const deleteType = (id: string) => api.delete(`/cabins/deleteType/${id}`)
export const createFacility = (data: any) => api.post("/cabins/createFacility", data);
export const updateFacility = (id: string, data: any) => api.put(`/cabins/updateFacility/${id}`, data)
export const deleteFacility = (id: string) => api.delete(`/cabins/deleteFacility/${id}`)

export default api;