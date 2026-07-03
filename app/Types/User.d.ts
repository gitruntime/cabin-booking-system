export interface User {
    department: String | null;
    avatar: String | null;
    gender: String | null;
    designation: String | null;
    _id: String;
    name: String;
    email: String;
    role: String;
    createdAt: String;
    updatedAt: String;
}

export interface UserList {
    count: number;
    users: User[];
}