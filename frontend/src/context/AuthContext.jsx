import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            getUser();
        } else {
            setLoading(false);
        }
    }, []);

    const getUser = async () => {
        try {
            const response = await api.get("/me");

            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load user:", error);

            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post("/login", {
            email,
            password,
        });

        if (response.data.success) {

            // Laravel response:
            // data.token
            // data.user

            const token = response.data.data.token;
            const user = response.data.data.user;

            localStorage.setItem("token", token);

            setUser(user);
        }

        return response.data;
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};