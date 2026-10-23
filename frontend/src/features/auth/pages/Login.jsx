import React, { useState } from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOrName.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await handleLogin({
        emailOrName: emailOrName.trim(),
        password,
      });
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
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
        <h1>Login</h1>

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
            <label htmlFor="emailOrName">
              Email or Username
            </label>

            <input
              type="text"
              name="emailOrName"
              id="emailOrName"
              placeholder="Enter email or username"
              value={emailOrName}
              onChange={(e) => { setEmailOrName(e.target.value); setError(""); }}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
            />
          </div>

          <button
            type="submit"
            className="button primary-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;