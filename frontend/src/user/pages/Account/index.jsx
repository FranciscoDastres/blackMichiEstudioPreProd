import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "./Profile";
import Security from "./Security";

export default function AccountRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="security" element={<Security />} />
        </Routes>
    );
}
