import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { loading, handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required");
            return;
        }

        try {
            await handleRegister({
                name: username.trim(),
                email: email.trim(),
                password
            });
            navigate("/");
        } catch (err) {
            console.error("Register error:", err);
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setError(msg);
        }
    };

    if (loading) {
        return (
            <main>
                <div className="form-container">
                    <h1>Loading...</h1>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                {error && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        backgroundColor: "rgba(229, 62, 62, 0.15)",
                        border: "1px solid #e53e3e",
                        color: "#fc8181",
                        fontSize: "0.9rem",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value); setError(""); }}
                            type="text"
                            name="name"
                            id="username"
                            value={username}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            placeholder="Enter email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="button primary-button" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    );
};

export default Register;
