import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// reuse the same spinner
function LoadingSpinner({ small }) {
  return <div className={`spinner ${small ? "spinner-sm" : ""}`}></div>;
}

export default function Login() {
  const { login, api } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({ phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", form);
      login(data.token);
      localStorage.setItem("teamName", data.teamName);
      // you can clear loading after nav, but nav replaces anyway
      nav("/team", { replace: true });
    } catch (err) {
      setLoading(false);
      setError("Please Register before logging in.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ORDER YOUR CUSTOMISED JERSEYS</h1>
          <h2>Log In to Your Account</h2>
          <p style={{color:"red"}}>(No OTP or Password Required)</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d{0,10}$/.test(v)) handleChange(e);
              }}
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
