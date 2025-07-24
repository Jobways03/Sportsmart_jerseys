import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// simple spinner – you can drop this into its own file if you like
function LoadingSpinner({ small }) {
  return <div className={`spinner ${small ? "spinner-sm" : ""}`}></div>;
}

export default function Register() {
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    teamName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!/^[A-Za-z ]{2,}$/.test(value.trim())) {
          return "Name must be at least 2 letters long and contain only letters and spaces.";
        }
        break;
      case "teamName":
        if (!/^[A-Za-z0-9 &-]{3,}$/.test(value.trim())) {
          return "Team Name must be at least 3 characters.";
        }
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) {
          return "Phone number must be exactly 10 digits.";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // allow up to 10 digits for phone
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    setError(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // check all fields in order, show first error
    for (let key of ["name", "teamName", "phone"]) {
      const msg = validateField(key, form[key]);
      if (msg) {
        setError(msg);
        return;
      }
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
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
          <h1>ORDER YOUR CUSTOMISED JERSEYS</h1>
          <h2>Create New Account</h2>
          <p style={{ color: "red" }}>(No OTP or Password Required)</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-success">
            Registered successfully! Redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading || success}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="teamName">Team Name</label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              value={form.teamName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading || success}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
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
