import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export const Protected = ({ children }) => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>Loading...</h1>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
