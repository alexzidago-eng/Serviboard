"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  MapPin,
  X,
  Loader2,
  Briefcase,
  Camera,
  User,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const CATEGORIES = [
  { id: "plomberie", label: "Plomberie" },
  { id: "electricite", label: "Électricité" },
  { id: "menage", label: "Ménage" },
  { id: "couture", label: "Couture" },
  { id: "cours", label: "Cours particuliers" },
  { id: "livraison", label: "Livraison" },
  { id: "coiffure", label: "Coiffure / Beauté" },
  { id: "menuiserie", label: "Menuiserie" },
  { id: "peinture", label: "Peinture" },
  { id: "mecanique", label: "Mécanique" },
  { id: "informatique", label: "Informatique" },
  { id: "autre", label: "Autre" },
];

function catLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}

export default function ServiceBoard() {
  const [providers, setProviders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    categorie: "",
    quartier: "",
    telephone: "",
    description: "",
    photo_url: "",
  });

  const load = useCallback(async () => {
    setLoadError(false);
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoadError(true);
    } else {
      setProviders(data || []);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Merci de choisir un fichier image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image trop lourde (max 5 Mo).");
      return;
    }

    setUploadingPhoto(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error(uploadError);
      showToast("Erreur lors de l'envoi de la photo.");
      setUploadingPhoto(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    setForm((f) => ({ ...f, photo_url: publicUrlData.publicUrl }));
    setUploadingPhoto(false);
  }

  async function submitProvider(e) {
    e.preventDefault();
    if (!form.nom.trim() || !form.categorie || !form.quartier.trim() || !form.telephone.trim())
      return;

    setSaving(true);
    const { error } = await supabase.from("providers").insert([
      {
        nom: form.nom.trim(),
        categorie: form.categorie,
        quartier: form.quartier.trim(),
        telephone: form.telephone.trim(),
        description: form.description.trim(),
        photo_url: form.photo_url || null,
      },
    ]);

    if (error) {
      console.error(error);
      showToast("Erreur : impossible d'enregistrer le profil.");
    } else {
      setForm({
        nom: "",
        categorie: "",
        quartier: "",
        telephone: "",
        description: "",
        photo_url: "",
      });
      setShowForm(false);
      showToast("Profil publié avec succès.");
      load();
    }
    setSaving(false);
  }

  const filtered = providers.filter((p) => {
    const matchesCat = !activeCat || p.categorie === activeCat;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.nom.toLowerCase().includes(q) ||
      p.quartier.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      catLabel(p.categorie).toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  function whatsappLink(phone) {
    const digits = phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${digits}`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FBF8F2",
        fontFamily: "'Manrope', -apple-system, sans-serif",
        color: "#1E2A22",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #E8883A; color: #FBF8F2; }

        .shell { max-width: 1080px; margin: 0 auto; padding: 28px 20px 100px; }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; gap: 12px; flex-wrap: wrap;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark {
          width: 34px; height: 34px; border-radius: 8px;
          background: #1E5C42; color: #FBF8F2;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-weight: 700; font-size: 16px;
        }
        .brand-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 20px; }
        .brand-sub { font-size: 11.5px; color: #7A7266; letter-spacing: 0.03em; }

        .btn-primary {
          background: #E8883A; color: #FBF8F2; border: none;
          padding: 12px 20px; border-radius: 8px; font-weight: 700;
          font-size: 14px; display: inline-flex; align-items: center; gap: 8px;
          cursor: pointer; transition: background 0.15s ease, transform 0.1s ease;
          box-shadow: 0 4px 14px -4px rgba(232,136,58,0.55);
        }
        .btn-primary:hover { background: #D9762A; }
        .btn-primary:active { transform: translateY(1px); }

        .hero {
          background: #1E5C42;
          border-radius: 16px;
          padding: 34px 30px;
          margin-bottom: 24px;
          color: #FBF8F2;
          position: relative;
          overflow: hidden;
        }
        .hero::after {
          content: '';
          position: absolute; right: -60px; top: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(232,136,58,0.35), transparent 70%);
        }
        .hero h1 {
          font-family: 'Fraunces', serif; font-weight: 600;
          font-size: clamp(24px, 4vw, 32px); margin: 0 0 8px; max-width: 520px;
          position: relative;
        }
        .hero p { font-size: 14.5px; color: #CFE3D6; margin: 0; max-width: 480px; position: relative; }

        .search-bar {
          display: flex; align-items: center; gap: 10px;
          background: #FFFFFF; border: 1px solid #E4DDCC;
          border-radius: 10px; padding: 12px 16px; margin-bottom: 18px;
        }
        .search-bar input {
          border: none; outline: none; flex: 1; font-size: 15px;
          font-family: 'Manrope', sans-serif; background: transparent; color: #1E2A22;
        }
        .search-bar input::placeholder { color: #A39C8C; }

        .cats {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 22px;
          scrollbar-width: thin;
        }
        .cat-chip {
          font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 999px;
          border: 1px solid #E4DDCC; background: #FFFFFF; color: #5A5344;
          white-space: nowrap; cursor: pointer; transition: all 0.15s ease;
        }
        .cat-chip.active { background: #1E5C42; border-color: #1E5C42; color: #FBF8F2; }
        .cat-chip:hover:not(.active) { border-color: #1E5C42; color: #1E5C42; }

        .grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        .card {
          background: #FFFFFF; border: 1px solid #E4DDCC; border-radius: 12px;
          padding: 20px; display: flex; flex-direction: column; gap: 10px;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .card:hover { box-shadow: 0 10px 24px -14px rgba(30,42,34,0.3); transform: translateY(-2px); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .card-identity { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .card-avatar {
          width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
          flex-shrink: 0; border: 1px solid #E4DDCC; background: #FBEEDF;
        }
        .card-avatar-fallback {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          background: #FBEEDF; color: #B5641E;
          display: flex; align-items: center; justify-content: center;
        }
        .card-name-wrap { min-width: 0; }
        .card-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 17px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .card-cat {
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
          background: #FBEEDF; color: #B5641E; padding: 4px 9px; border-radius: 999px; white-space: nowrap;
        }
        .card-loc { font-size: 12.5px; color: #7A7266; display: flex; align-items: center; gap: 5px; }
        .card-desc { font-size: 13.5px; color: #47493F; line-height: 1.5; flex: 1; margin: 0; }

        .card-actions { display: flex; gap: 8px; margin-top: 6px; }
        .icon-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 12.5px; font-weight: 700; padding: 9px; border-radius: 8px;
          text-decoration: none; cursor: pointer; border: none; transition: opacity 0.15s ease;
        }
        .icon-btn.call { background: #1E2A22; color: #FBF8F2; }
        .icon-btn.wa { background: #E8883A; color: #FBF8F2; }
        .icon-btn:hover { opacity: 0.88; }

        .empty { text-align: center; padding: 60px 20px; color: #A39C8C; }
        .empty-icon { margin-bottom: 12px; opacity: 0.5; }

        .overlay {
          position: fixed; inset: 0; background: rgba(30,42,34,0.5);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 50;
        }
        .modal {
          background: #FBF8F2; width: 100%; max-width: 480px;
          border-radius: 16px 16px 0 0; padding: 26px 24px 30px;
          max-height: 88vh; overflow-y: auto;
        }
        @media (min-width: 560px) {
          .overlay { align-items: center; }
          .modal { border-radius: 16px; }
        }

        .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .modal-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 20px; margin: 0; }
        .close-btn { background: none; border: none; cursor: pointer; color: #7A7266; padding: 4px; }

        label.field-label { font-size: 12.5px; font-weight: 700; color: #47493F; margin-bottom: 6px; display: block; }
        .field { margin-bottom: 16px; }
        input.field-input, select.field-input, textarea.field-input {
          width: 100%; border: 1px solid #E4DDCC; border-radius: 8px; padding: 11px 13px;
          font-family: 'Manrope', sans-serif; font-size: 14.5px; outline: none; background: #FFFFFF;
          color: #1E2A22;
        }
        input.field-input:focus, select.field-input:focus, textarea.field-input:focus { border-color: #1E5C42; }
        textarea.field-input { resize: vertical; min-height: 72px; }

        .photo-upload-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .photo-preview {
          width: 64px; height: 64px; border-radius: 50%; object-fit: cover;
          border: 1px solid #E4DDCC; flex-shrink: 0; background: #FBEEDF;
        }
        .photo-preview-fallback {
          width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
          background: #FBEEDF; color: #B5641E;
          display: flex; align-items: center; justify-content: center;
        }
        .photo-upload-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: #1E5C42;
          background: #FFFFFF; border: 1px solid #E4DDCC; border-radius: 8px;
          padding: 9px 14px; cursor: pointer;
        }
        .photo-upload-btn input { display: none; }

        .submit-btn {
          width: 100%; background: #1E5C42; color: #FBF8F2; border: none;
          padding: 14px; border-radius: 8px; font-weight: 700; font-size: 14.5px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 6px;
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: #1E2A22; color: #FBF8F2; padding: 12px 20px; border-radius: 999px;
          font-size: 13.5px; font-weight: 600; z-index: 60;
        }

        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 2px solid #1E5C42; outline-offset: 2px;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">SB</div>
            <div>
              <div className="brand-name">ServiBoard</div>
              <div className="brand-sub">Trouve un prestataire près de chez toi</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Proposer mes services
          </button>
        </div>

        <div className="hero">
          <h1>Un besoin ? Un savoir-faire ? On vous met en relation.</h1>
          <p>
            Plombiers, couturières, répétiteurs, livreurs — trouvez quelqu'un de
            confiance dans votre quartier, ou faites-vous connaître gratuitement.
          </p>
        </div>

        <div className="search-bar">
          <Search size={18} color="#A39C8C" />
          <input
            placeholder="Rechercher un métier, un nom, un quartier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cats">
          <div
            className={`cat-chip ${!activeCat ? "active" : ""}`}
            onClick={() => setActiveCat(null)}
          >
            Toutes catégories
          </div>
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              className={`cat-chip ${activeCat === c.id ? "active" : ""}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </div>
          ))}
        </div>

        {!loaded ? (
          <div className="empty">
            <Loader2 size={26} className="empty-icon" style={{ animation: "spin 0.8s linear infinite" }} />
            <div>Chargement des annonces...</div>
          </div>
        ) : loadError ? (
          <div className="empty">
            <Briefcase size={30} className="empty-icon" />
            <div>
              Impossible de charger les annonces. Vérifie la configuration Supabase
              (variables d'environnement).
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <Briefcase size={30} className="empty-icon" />
            <div>
              {providers.length === 0
                ? "Aucun prestataire pour l'instant. Soyez le premier à publier votre profil !"
                : "Aucun résultat pour cette recherche."}
            </div>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <div className="card" key={p.id}>
                <div className="card-top">
                  <div className="card-identity">
                    {p.photo_url ? (
                      <img className="card-avatar" src={p.photo_url} alt={p.nom} />
                    ) : (
                      <div className="card-avatar-fallback">
                        <User size={20} />
                      </div>
                    )}
                    <div className="card-name-wrap">
                      <h3 className="card-name">{p.nom}</h3>
                    </div>
                  </div>
                  <span className="card-cat">{catLabel(p.categorie)}</span>
                </div>
                <div className="card-loc">
                  <MapPin size={13} />
                  {p.quartier}
                </div>
                {p.description && <p className="card-desc">{p.description}</p>}
                <div className="card-actions">
                  <a className="icon-btn call" href={`tel:${p.telephone.replace(/\s/g, "")}`}>
                    <Phone size={14} />
                    Appeler
                  </a>
                  <a
                    className="icon-btn wa"
                    href={whatsappLink(p.telephone)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">Proposer mes services</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitProvider}>
              <div className="photo-upload-row">
                {form.photo_url ? (
                  <img className="photo-preview" src={form.photo_url} alt="Aperçu" />
                ) : (
                  <div className="photo-preview-fallback">
                    <User size={26} />
                  </div>
                )}
                <label className="photo-upload-btn">
                  {uploadingPhoto ? (
                    <>
                      <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Camera size={15} />
                      Ajouter une photo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div className="field">
                <label className="field-label">Nom complet</label>
                <input
                  className="field-input"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex : Aya Koffi"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Catégorie de service</label>
                <select
                  className="field-input"
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  required
                >
                  <option value="">Choisir...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Quartier / ville</label>
                <input
                  className="field-input"
                  value={form.quartier}
                  onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                  placeholder="Ex : Cocody, Abidjan"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Téléphone (WhatsApp de préférence)</label>
                <input
                  className="field-input"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="Ex : 07 00 00 00 00"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Description (facultatif)</label>
                <textarea
                  className="field-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décris ton expérience, tes disponibilités..."
                />
              </div>
              <button className="submit-btn" type="submit" disabled={saving || uploadingPhoto}>
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                    Publication...
                  </>
                ) : (
                  "Publier mon profil"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
