/* cspell:ignore gmaps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./AboutUs.module.css";

import { useAuth } from "../../hooks/useAuth";
import type { AboutContent } from "../../types/about";
import { asText, Lang } from "../../types/i18n";
import { getAbout, saveAbout } from "../../services/AboutService";

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
  reasons: [],
};

function normalize(d?: Partial<AboutContent>): AboutContent {
  return { ...DEFAULT_CONTENT, ...(d || {}) };
}
function deepEqual(a: any, b: any) {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
}

/** достаём «сырой» текст нужного языка БЕЗ фолбэка */
const raw = (v: any, L: Lang): string =>
  v && typeof v === "object" ? (v[L] ?? "") : "";

/** собираем {en,ru,fi} для одного поля:
 *  - текущий lang берём из draft
 *  - остальные — РОВНО из БД без фолбэка (или пусто)
 */
function buildLoc3(
  key: keyof AboutContent,
  lang: Lang,
  draft: AboutContent,
  content: AboutContent
) {
  const prev = (content as any)[key];
  const curr = asText((draft as any)[key], lang); // текст текущего языка

  return {
    en: lang === "en" ? curr : raw(prev, "en"),
    ru: lang === "ru" ? curr : raw(prev, "ru"),
    fi: lang === "fi" ? curr : raw(prev, "fi"),
    _source: lang,
  };
}

const AboutUs: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2) as Lang;

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
  }, [t, i18n.language]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const server = await getAbout();
        const merged = normalize(server);
        setContent(merged);
        setDraft(merged);
      } catch (e: any) {
        setContent(DEFAULT_CONTENT);
        setDraft(DEFAULT_CONTENT);
        setError(e?.message || "Load error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!editMode) return;
    const n = normalize(content);
    setDraft(n);
    setHeroFile(null);
    setStoreFile(null);
    setReqFile(null);
    setError(null);
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

      const payload: AboutContent = {
        ...normalize(draft),
        title:            buildLoc3("title",            lang, draft, content) as any,
        subtitle:         buildLoc3("subtitle",         lang, draft, content) as any,
        descriptionIntro: buildLoc3("descriptionIntro", lang, draft, content) as any,
        descriptionMore:  buildLoc3("descriptionMore",  lang, draft, content) as any,
        address:          buildLoc3("address",          lang, draft, content) as any,
        hours:            buildLoc3("hours",            lang, draft, content) as any,
        socialsHandle:    buildLoc3("socialsHandle",    lang, draft, content) as any,
        reasonsTitle:     buildLoc3("reasonsTitle",     lang, draft, content) as any,
        requisitesTitle:  buildLoc3("requisitesTitle",  lang, draft, content) as any,
      };

      const saved = await saveAbout(payload, {
        heroImage: heroFile ?? undefined,
        storeImage: storeFile ?? undefined,
        requisitesImage: reqFile ?? undefined,
      });

      let serverAfter = normalize(saved);
      if (deepEqual(serverAfter, content)) serverAfter = payload;

      setContent(serverAfter);
      setDraft(serverAfter);
      lastSavedRef.current = serverAfter;

      setHeroFile(null);
      setStoreFile(null);
      setReqFile(null);
      setEditMode(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setError(t("about.errors.unauthorized"));
      else if (status === 403) setError(t("about.errors.forbidden"));
      else if (status === 404) setError(t("about.errors.notFound", { url: "/about" }));
      else setError(e?.response?.data?.message || e?.message || t("about.errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <main className={styles.page}>
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroWrap}>
            {!editMode ? (
              <img
                src={c.heroImageUrl}
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
                    value={draft.heroImageUrl}
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
              <h1 className={styles.title}>{asText(c.title, lang)}</h1>
              <p className={styles.subtitle}>{asText(c.subtitle, lang)}</p>
            </>
          ) : (
            <div className={styles.formGrid}>
              <div className={styles.fieldCol}>
                <label className={styles.label}>{t("about.form.title")}</label>
                <input
                  className={styles.input}
                  value={asText(draft.title, lang)}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </div>
              <div className={styles.fieldCol}>
                <label className={styles.label}>{t("about.form.subtitle")}</label>
                <input
                  className={styles.input}
                  value={asText(draft.subtitle, lang)}
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
                src={c.storeImageUrl}
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
                    value={draft.storeImageUrl}
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
                <p>{asText(c.descriptionIntro, lang)}</p>
                <p>{asText(c.descriptionMore, lang)}</p>

                <div className={styles.infoList}>
                  <div>
                    <strong>{t("about.ourStore.address")}:</strong> {asText(c.address, lang)}
                  </div>
                  <div>
                    <strong>{t("about.ourStore.hours")}:</strong> {asText(c.hours, lang)}
                  </div>
                </div>

                {c.gmapsUrl && (
                  <a className={styles.mapBtn} href={c.gmapsUrl} target="_blank" rel="noreferrer">
                    {t("about.ourStore.openInMaps")}
                  </a>
                )}
              </>
            ) : (
              <>
                <h2>{t("about.ourStore.title")}</h2>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.intro")}</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={asText(draft.descriptionIntro, lang)}
                    onChange={(e) => setDraft((d) => ({ ...d, descriptionIntro: e.target.value }))}
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>{t("about.form.more")}</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={asText(draft.descriptionMore, lang)}
                    onChange={(e) => setDraft((d) => ({ ...d, descriptionMore: e.target.value }))}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldCol}>
                    <label className={styles.label}>{t("about.form.address")}</label>
                    <input
                      className={styles.input}
                      value={asText(draft.address, lang)}
                      onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                    />
                  </div>
                  <div className={styles.fieldCol}>
                    <label className={styles.label}>{t("about.form.hours")}</label>
                    <input
                      className={styles.input}
                      value={asText(draft.hours, lang)}
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
                {t("about.why.follow")} <strong>{asText(c.socialsHandle, lang)}</strong>.
              </p>
            </div>
          ) : (
            <div className={styles.formGrid}>
              <div className={styles.fieldCol}>
                <label className={styles.label}>{t("about.form.social")}</label>
                <input
                  className={styles.input}
                  value={asText(draft.socialsHandle, lang)}
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
                src={c.requisitesImageUrl}
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
                    value={draft.requisitesImageUrl}
                    onChange={(e) => setDraft((d) => ({ ...d, requisitesImageUrl: e.target.value }))}
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
      </main>
    </>
  );
};

export default AboutUs;


