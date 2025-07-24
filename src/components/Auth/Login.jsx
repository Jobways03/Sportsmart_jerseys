import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// reuse the same spinner
function LoadingSpinner({ small }) {
  return <div className={`spinner ${small ? "spinner-sm" : ""}`}></div>;
}

export default function Login() {
  const { login, api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate a single field, return error message or empty string
  const validateField = (name, value) => {
    if (name === "phone") {
      if (!/^\d{10}$/.test(value)) {
        return "Phone number must be exactly 10 digits.";
      }
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // allow up to 10 digits only
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
    // Validate before sending: show first error found
    const msg = validateField("phone", form.phone);
    if (msg) {
      setError(msg);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      login(data.token);
      localStorage.setItem("teamName", data.teamName);
      navigate("/team", { replace: true });
    } catch {
      setLoading(false);
      setError("Please register before logging in.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ORDER YOUR CUSTOMISED JERSEYS</h1>
          <h2>Log In to Your Account</h2>
          <p style={{ color: "red" }}>(No OTP or Password Required)</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="10"
              inputMode="numeric"
              pattern="\d*"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <LoadingSpinner small /> : "Login Now"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-link">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
