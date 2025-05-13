import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoadingSpinner({ small }) {
  return <div className={`spinner ${small ? "spinner-sm" : ""}`}></div>;
}

export default function TeamPage() {
  const { api, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [logoPreviews, setLogoPreviews] = useState([]);
  const [players, setPlayers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const EMPTY = {
    name: "",
    jerseyNumber: "",
    tshirtSize: "M",
    trackSize: "M",
    sleeveType: "half",
  };
  const [form, setForm] = useState(EMPTY);
  const [isUploadingLogos, setIsUploadingLogos] = useState(false);
  const [removingLogoId, setRemovingLogoId] = useState(null);
  const [deletingPlayerIdx, setDeletingPlayerIdx] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const teamName = localStorage.getItem("teamName");

  useEffect(() => {
    api
      .get("/api/team/logos")
      .then((r) =>
        setLogoPreviews(r.data.logos.map((u, i) => ({ id: i, url: u })))
      );
    api.get("/api/team").then((r) => setPlayers(r.data));
  }, [api]);

   const handleLogout = () => {
     logout();
     navigate("/login", { replace: true });
   };


  // File input change
  const onFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingLogos(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("logo", f);
        const res = await api.post("/api/team/logos", fd);
        setLogoPreviews((p) => [
          ...p,
          { id: Date.now() + Math.random(), url: res.data.url },
        ]);
      }
    } finally {
      setIsUploadingLogos(false);
    }
  };

  // Remove one logo
 const removeLogo = async (id) => {
   setRemovingLogoId(id);
   try {
     const lp = logoPreviews.find((x) => x.id === id);
     await api.delete("/api/team/logos", { data: { url: lp.url } });
     setLogoPreviews((p) => p.filter((x) => x.id !== id));
   } finally {
     setRemovingLogoId(null);
   }
 };

  // Player modal handlers
  const openAdd = () => {
    setForm(EMPTY);
    setEditIdx(null);
    setModalOpen(true);
  };
  const openEdit = (idx) => {
    const p = players[idx];
    setForm({
      name: p.name,
      jerseyNumber: p.jerseyNumber,
      tshirtSize: p.tshirtSize,
      trackSize: p.trackSize,
      sleeveType: p.sleeveType,
    });
    setEditIdx(idx);
    setModalOpen(true);
  };
 
  const deletePlayer = async (idx) => {
    setDeletingPlayerIdx(idx);
    try {
      await api.delete(`/api/team/${players[idx]._id}`);
      setPlayers((pl) => pl.filter((_, i) => i !== idx));
    } finally {
      setDeletingPlayerIdx(null);
    }
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const onFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      let res;
      if (editIdx === null) {
        res = await api.post("/api/team", fd);
        setPlayers((pl) => [...pl, res.data]);
      } else {
        const id = players[editIdx]._id;
        res = await api.put(`/api/team/${id}`, fd);
        setPlayers((pl) => pl.map((p, i) => (i === editIdx ? res.data : p)));
      }
      setModalOpen(false);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Submit players + logos
  const submitOrder = async () => {
    setIsSubmittingOrder(true);
    try {
      await api.post("/api/order", {
        players,
        teamLogos: logoPreviews.map((x) => x.url),
      });
      alert("Order sent!");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="team-container">
      <h1 className="page-title">{teamName}</h1>
      <hr />
      {/* Players Section */}
      <section className="players-section">
        <div className="section-header">
          <h2 className="page-title2">PLAYERS LIST</h2>
        </div>
        {/* <div className="fab-container">
          <button className="fab-button" onClick={openAdd}>
            +
          </button>
        </div> */}
        <div className="fab-container">
          <button className="fab-button" onClick={openAdd}>
            +
          </button>
          {/* Logout button below the plus */}
          <br />
          <button
            className="fab-button logout-button"
            onClick={handleLogout}
            title="Log Out"
          >
            {/* power icon */}
            <svg
              width="70px"
              height="70px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className="log-icon"
            >
              <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 0 1-112.7-75.9 353.28 353.28 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z" />
            </svg>
          </button>
        </div>
        <div className="players-grid">
          {players.map((p, i) => (
            <div className="player-card" key={p._id}>
              <div className="player-header">
                <span className="jersey-number">#{p.jerseyNumber}</span>
                <h3 className="player-name">{p.name}</h3>
              </div>
              <div className="player-details">
                <div className="detail-item">
                  <span>T-Shirt Size</span>
                  <strong>{p.tshirtSize}</strong>
                </div>
                <div className="detail-item">
                  <span>Track Size</span>
                  <strong>{p.trackSize}</strong>
                </div>
                <div className="detail-item">
                  <span>Sleeves </span>
                  <strong>{p.sleeveType}</strong>
                </div>
              </div>
              <div className="player-actions">
                <button className="btn icon" onClick={() => openEdit(i)}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1.0 1.0 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
                <button
                  className="btn icon danger"
                  onClick={() => deletePlayer(i)}
                  disabled={deletingPlayerIdx === i}
                >
                  {deletingPlayerIdx === i ? (
                    <LoadingSpinner small />
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logos Section */}
      <section className="logos-section">
        <h2>TEAM LOGOS</h2>
        <div className="logo-upload-card">
          <div className="upload-controls">
            <input
              type="file"
              id="logo-upload"
              multiple
              accept="image/*"
              onChange={onFileChange}
              className="hidden-input"
            />
            <label
              htmlFor="logo-upload"
              className="btn primary"
              disabled={isUploadingLogos}
            >
              {isUploadingLogos ? <LoadingSpinner /> : "Upload Files"}
            </label>
          </div>

          <div className="logos-grid">
            {logoPreviews.map((lp) => (
              <div className="logo-card" key={lp.id}>
                <img src={lp.url} alt="Team logo" />
                <button
                  className="remove-logo"
                  onClick={() => removeLogo(lp.id)}
                  disabled={removingLogoId === lp.id}
                >
                  {removingLogoId === lp.id ? <LoadingSpinner small /> : "×"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Submission */}
      <div className="order-submit">
        <button
          className="btn success"
          onClick={submitOrder}
          disabled={isSubmittingOrder}
        >
          {isSubmittingOrder ? <LoadingSpinner /> : "Submit Final Order"}
        </button>
      </div>

      {/* Player Modal */}
      {modalOpen && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editIdx === null ? "Add Player" : "Edit Player"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={onFormSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name on T-shirt</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onFormChange}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Jersey Number</label>
                    <input
                      name="jerseyNumber"
                      type="text"
                      value={form.jerseyNumber}
                      onChange={onFormChange}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="row">
                    {["tshirtSize", "trackSize", "sleeveType"].map((field) => (
                      <div className="col" key={field}>
                        <label className="form-label">
                          {field === "sleeveType"
                            ? "Sleeves"
                            : field === "tshirtSize"
                            ? "T-shirt Size"
                            : "Track Size"}
                        </label>
                        <select
                          name={field}
                          value={form[field]}
                          onChange={onFormChange}
                          className="form-select"
                        >
                          {field === "sleeveType"
                            ? ["half", "full"].map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))
                            : ["S", "M", "L", "XL", "XXL", "XXXL"].map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmittingForm}
                    >
                      {isSubmittingForm ? (
                        <LoadingSpinner small />
                      ) : editIdx === null ? (
                        "Add"
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
