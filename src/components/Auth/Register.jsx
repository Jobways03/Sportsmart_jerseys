import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// simple spinner – you can drop this into its own file if you like
function LoadingSpinner({ small }) {
  return <div className={`spinner ${small ? "spinner-sm" : ""}`}></div>;
}

export default function Register() {
  const { api } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    teamName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);
      setLoading(false);
      setSuccess(true);

      // wait a moment so user sees success message, then go to login
      setTimeout(() => nav("/login", { replace: true }), 2000);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.msg || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>SPORTSMART ELITE JERSEYS</h1>
          <h2>Create New Account</h2>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-success">
            Registered successfully! Redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading || success}
            />
          </div>

          <div className="auth-field">
            <label>Team Name</label>
            <input
              type="text"
              name="teamName"
              value={form.teamName}
              onChange={handleChange}
              required
              disabled={loading || success}
            />
          </div>

          <div className="auth-field">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  handleChange(e);
                }
              }}
              required
              maxLength="10"
              inputMode="numeric"
              pattern="\d*"
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || success}
          >
            {loading ? (
              <LoadingSpinner small />
            ) : success ? (
              "Registered!"
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
