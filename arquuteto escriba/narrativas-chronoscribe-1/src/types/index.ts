// This file exports TypeScript types and interfaces used throughout the application.

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Content {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardData {
    totalUsers: number;
    totalContent: number;
    recentActivities: Array<Activity>;
}

export interface Activity {
    id: string;
    type: string;
    timestamp: Date;
    user: User;
}