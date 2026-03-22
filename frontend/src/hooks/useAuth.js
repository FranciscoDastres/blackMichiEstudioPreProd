import { useState, useEffect } from 'react';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const userData = localStorage.getItem("user");
            setUser(userData ? JSON.parse(userData) : { id: "unknown" });
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return { user, loading, isLoggedIn: !!localStorage.getItem("token"), logout };
}