/* cspell:ignore gmaps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import NavBar from "../../components/NavBar/NavBar";
import axiosInstance from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AboutUs.module.css";
import { useTranslation } from "react-i18next";

type Localized = string | { en?: string; ru?: string; fi?: string };

type AboutContent = {
  heroImageUrl: string;
  title: Localized;
  subtitle: Localized;
  storeImageUrl: string;
  descriptionIntro: Localized;
  descriptionMore: Localized;
  address: Localized;
  hours: Localized;
  gmapsUrl: string;
  requisitesImageUrl: string;
  socialsHandle: Localized;
};

const ABOUT_URL = "/about";

function pickText(val: Localized, lang: string) {
  if (val && typeof val === "object") {
    const v =
      val[lang as "en" | "ru" | "fi"] ??
      val.en ??
      val.ru ??
      val.fi ??
      "";
    return typeof v === "string" ? v : "";
  }
  return (val as string) ?? "";
}

const DEFAULT_CONTENT: AboutContent = {
  heroImageUrl: "/assets/Logo.jpg",
  title: "About Us",
  subtitle: "Baltic Herkut — your favorite Baltic foods in Oulu.",
  storeImageUrl: "/assets/storefront.jpg",
  descriptionIntro:
    "We bring fresh and trusted products from the Baltic region: dairy and meat products, fish, preserves, sweets, beverages and more.",
  descriptionMore:
    "We work daily to keep fair prices and friendly service. You're always welcome to discover new flavors!",
  address: "Limingantie 9, Oulu",
  hours: "Mon–Fri 12:00–19:00, Sat 12:00–17:00, Sun 12:00–16:00",
  gmapsUrl: "https://maps.google.com/?q=Limingantie+9,+Oulu",
  requisitesImageUrl: "/assets/banner_margins.jpg",
  socialsHandle: "@balticherkut",
};

function normalize(data?: Partial<AboutContent>): AboutContent {
  const base = { ...DEFAULT_CONTENT, ...(data || {}) } as AboutContent;
  return {
    heroImageUrl: base.heroImageUrl ?? "",
    title: base.title ?? "",
    subtitle: base.subtitle ?? "",
    storeImageUrl: base.storeImageUrl ?? "",
    descriptionIntro: base.descriptionIntro ?? "",
    descriptionMore: base.descriptionMore ?? "",
    address: base.address ?? "",
    hours: base.hours ?? "",
    gmapsUrl: base.gmapsUrl ?? "",
    requisitesImageUrl: base.requisitesImageUrl ?? "",
    socialsHandle: base.socialsHandle ?? "",
  };
}

function deepEqual(a: any, b: any) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

const AboutUs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth() as { user?: any };
  const role = String(user?.role || user?.user?.role || "").toLowerCase();
  const isAdmin = Boolean(user?.isAdmin || role === "admin");

  const [content, setContent] = useState<AboutContent>(DEFAULT_CONTENT);
  const [draft, setDraft] = useState<AboutContent>(DEFAULT_CONTENT);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [storeFile, setStoreFile] = useState<File | null>(null);
  const [reqFile, setReqFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastSavedRef = useRef<AboutContent | null>(null);

  useEffect(() => {
    document.title = `${t("about.headTitle")} — Baltic Herkut`;
  }, [i18n.language, t]);

  const fetchAbout = async () => {
    const res = await axiosInstance.get<{ data?: Partial<AboutContent> }>(ABOUT_URL, {
      params: { _t: Date.now() },
      headers: { "Accept-Language": i18n.language },
    });
    return normalize(res?.data?.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const serverData = await fetchAbout();
        setContent(serverData);
        setDraft(serverData);
      } catch {
        const fallback = normalize(DEFAULT_CONTENT);
        setContent(fallback);
        setDraft(fallback);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editMode) {
      const n = normalize(content);
      setDraft(n);
      setHeroFile(null);
      setStoreFile(null);
      setReqFile(null);
      setError(null);
    }
  }, [editMode, content]);

  const c = useMemo<AboutContent>(() => (editMode ? draft : content), [editMode, draft, content]);

  const startEdit = () => {
    if (!isAdmin || loading) return;
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDraft(normalize(content));
    setHeroFile(null);
    setStoreFile(null);
    setReqFile(null);
    setEditMode(false);
    setError(null);
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload: AboutContent = normalize(draft);
      const hasFiles = Boolean(heroFile || storeFile || reqFile);

      if (!hasFiles) {
        await axiosInstance.put<{ data?: Partial<AboutContent> }>(ABOUT_URL, payload, {
          headers: { "Accept-Language": i18n.language },
        });
      } else {
        const fd = new FormData();
        (Object.entries(payload) as [keyof AboutContent, any][])
          .forEach(([k, v]) => fd.append(k, typeof v === "string" ? v : JSON.stringify(v)));
        if (heroFile) fd.append("heroImage", heroFile);
        if (storeFile) fd.append("storeImage", storeFile);
        if (reqFile) fd.append("requisitesImage", reqFile);

        await axiosInstance.put<{ data?: Partial<AboutContent> }>(ABOUT_URL, fd, {
          headers: { "Accept-Language": i18n.language },
        });
      }

      let serverAfter = await fetchAbout();

      if (deepEqual(serverAfter, content)) {
        serverAfter = payload;
      }

      setContent(serverAfter);
      setDraft(serverAfter);
      lastSavedRef.current = serverAfter;

      setHeroFile(null);
      setStoreFile(null);
      setReqFile(null);
      setEditMode(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        setError(t("about.errors.unauthorized"));
      } else if (status === 403) {
        setError(t("about.errors.forbidden"));
      } else if (status === 404) {
        setError(t("about.errors.notFound", { url: ABOUT_URL }));
      } else {
        setError(e?.response?.data?.message || e?.message || t("about.errors.generic"));
      }
    } finally {
      setSaving(false);
    }
  };

  const p = (v: Localized) => pickText(v, i18n.language);

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroWrap}>
            {!editMode ? (
              <img
                src={p(c.heroImageUrl as any) || (c.heroImageUrl as string)}
                alt="Baltic Herkut"
                className={styles.heroImg}
                loading="eager"
                decoding="async"
              />
            ) : (
              <>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.heroUrl")}</label>
                  <input
                    className={styles.input}
                    value={p(draft.heroImageUrl as any) || (draft.heroImageUrl as string)}
                    onChange={(e) => setDraft((d) => ({ ...d, heroImageUrl: e.target.value }))}
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.heroUpload")}</label>
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* HEADER */}
        <header className={styles.header}>
          {!editMode ? (
            <>
              <h1 className={styles.title}>{p(c.title)}</h1>
              <p className={styles.subtitle}>{p(c.subtitle)}</p>
            </>
          ) : (
            <div className={styles.formGrid}>
              <div className={styles.fieldCol}>
                <label className={styles.label}>{t("about.form.title")}</label>
                <input
                  className={styles.input}
                  value={p(draft.title)}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </div>
              <div className={styles.fieldCol}>
                <label className={styles.label}>{t("about.form.subtitle")}</label>
                <input
                  className={styles.input}
                  value={p(draft.subtitle)}
                  onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                />
              </div>
            </div>
          )}
        </header>

        {/* STORE CARD */}
        <section className={styles.card}>
          <div className={styles.mediaWrap}>
            {!editMode ? (
              <img
                src={p(c.storeImageUrl as any) || (c.storeImageUrl as string)}
                alt={t("about.alt.storefront")}
                className={styles.media}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.storeUrl")}</label>
                  <input
                    className={styles.input}
                    value={p(draft.storeImageUrl as any) || (draft.storeImageUrl as string)}
                    onChange={(e) => setDraft((d) => ({ ...d, storeImageUrl: e.target.value }))}
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.storeUpload")}</label>
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStoreFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </>
            )}
          </div>

          <div className={styles.content}>
            {!editMode ? (
              <>
                <h2>{t("about.ourStore.title")}</h2>
                <p>{p(c.descriptionIntro)}</p>
                <p>{p(c.descriptionMore)}</p>

                <div className={styles.infoList}>
                  <div>
                    <strong>{t("about.ourStore.address")}:</strong> {p(c.address)}
                  </div>
                  <div>
                    <strong>{t("about.ourStore.hours")}:</strong> {p(c.hours)}
                  </div>
                </div>

                <a className={styles.mapBtn} href={c.gmapsUrl} target="_blank" rel="noreferrer">
                  {t("about.ourStore.openInMaps")}
                </a>
              </>
            ) : (
              <>
                <h2>{t("about.ourStore.title")}</h2>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.intro")}</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={p(draft.descriptionIntro)}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, descriptionIntro: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.more")}</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={p(draft.descriptionMore)}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, descriptionMore: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldCol}>
                    <label className={styles.label}>{t("about.form.address")}</label>
                    <input
                      className={styles.input}
                      value={p(draft.address)}
                      onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                    />
                  </div>
                  <div className={styles.fieldCol}>
                    <label className={styles.label}>{t("about.form.hours")}</label>
                    <input
                      className={styles.input}
                      value={p(draft.hours)}
                      onChange={(e) => setDraft((d) => ({ ...d, hours: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <label className={styles.label}>Google Maps URL</label>
                  <input
                    className={styles.input}
                    value={draft.gmapsUrl}
                    onChange={(e) => setDraft((d) => ({ ...d, gmapsUrl: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* WHY CARD */}
        <section className={styles.cardAlt}>
          {!editMode ? (
            <div className={styles.content}>
              <h2>{t("about.why.title")}</h2>
              <ul className={styles.bullets}>
                <li>{t("about.why.point1")}</li>
                <li>{t("about.why.point2")}</li>
                <li>{t("about.why.point3")}</li>
              </ul>
              <p>
                {t("about.why.follow")} <strong>{p(c.socialsHandle)}</strong>.
              </p>
            </div>
          ) : (
            <div className={styles.formGrid}>
              <div className={styles.fieldCol}>
                <label className={styles.label}>{t("about.form.social")}</label>
                <input
                  className={styles.input}
                  value={p(draft.socialsHandle)}
                  onChange={(e) => setDraft((d) => ({ ...d, socialsHandle: e.target.value }))}
                />
              </div>
            </div>
          )}
        </section>

        {/* REQUISITES CARD */}
        <section className={styles.card}>
          <div className={styles.mediaWrap}>
            {!editMode ? (
              <img
                src={p(c.requisitesImageUrl as any) || (c.requisitesImageUrl as string)}
                alt={t("about.alt.requisites")}
                className={styles.media}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.reqUrl")}</label>
                  <input
                    className={styles.input}
                    value={p(draft.requisitesImageUrl as any) || (draft.requisitesImageUrl as string)}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, requisitesImageUrl: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.reqUpload")}</label>
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReqFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </>
            )}
          </div>
          <div className={styles.content}>
            {!editMode ? (
              <>
                <h2>{t("about.req.title")}</h2>
                <p className={styles.muted}>{t("about.req.hint")}</p>
              </>
            ) : (
              <>
                <h2>{t("about.req.title")}</h2>
                <p className={styles.muted}>{t("about.req.hintEdit")}</p>
              </>
            )}
          </div>
        </section>

        {/* ADMIN CONTROLS */}
        {isAdmin && (
          <div className={styles.adminBar}>
            {!editMode ? (
              <button className={styles.primary} onClick={startEdit} disabled={loading}>
                {t("about.buttons.edit")}
              </button>
            ) : (
              <div className={styles.btnRow}>
                <button className={styles.secondary} onClick={cancelEdit} disabled={saving}>
                  {t("about.buttons.cancel")}
                </button>
                <button className={styles.primary} onClick={saveEdit} disabled={saving}>
                  {saving ? t("about.buttons.saving") : t("about.buttons.save")}
                </button>
              </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
          </div>
        )}

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
      </main>
    </>
  );
};

export default AboutUs;
