// src/components/CategoryTree/CategoryTree.tsx
import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { CategoryWithSubcategories } from "../../types/category";
import styles from "./CategoryTree.module.css";

interface Props {
  categories: CategoryWithSubcategories[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onCategoryToggle: (categoryId: string) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
}

type LocalizedField = { ru?: string; en?: string; fi?: string; _source?: string };

function pickLocalizedName(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const v = value as LocalizedField;
  const short = (lang || "en").slice(0, 2) as keyof LocalizedField;
  return (
    (v[short] as string | undefined)?.trim() ||
    (v._source ? (v[v._source as keyof LocalizedField] as string | undefined) : "")?.trim() ||
    (v.en || "").trim() ||
    (v.ru || "").trim() ||
    (v.fi || "").trim() ||
    ""
  );
}

type Anchor = { top: number; left: number; right: number; bottom: number; width: number };

const CategoryTree: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryToggle,
  onSubcategorySelect,
}) => {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  const list = useMemo(
    () =>
      (categories || []).map((c: any) => ({
        ...c,
        _name: pickLocalizedName(c.name_i18n ?? c.name, lang) || "—",
        _subs: (c.subcategories || []).map((s: any) => ({
          ...s,
          _name: pickLocalizedName(s.name_i18n ?? s.name, lang) || "—",
        })),
      })),
    [categories, lang]
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const closeTimer = useRef<number | null>(null);

  const clearClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setOpenId(null), 150);
  };

  const measure = (id: string) => {
    const el = itemRefs.current[id];
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width });
  };

  useLayoutEffect(() => {
    const onUpdate = () => {
      if (openId) measure(openId);
    };
    window.addEventListener("scroll", onUpdate, true);
    window.addEventListener("resize", onUpdate);
    return () => {
      window.removeEventListener("scroll", onUpdate, true);
      window.removeEventListener("resize", onUpdate);
    };
  }, [openId]);

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <aside className={styles.tree} aria-label={t("categories.title", { defaultValue: "Categories" })}>
      <h3 className={styles.title}>{t("categories.title", { defaultValue: "Categories" })}</h3>

      <ul className={styles.catList} role="list">
        {list.map((cat) => {
          const isOpen = openId === cat._id;

          let flyNode: React.ReactNode = null;
          if (isOpen && anchor && portalTarget) {
            const margin = 8;
            const minWidth = 260;
            const leftCandidate = anchor.left + Math.round(anchor.width * 0.6); 
            const left = Math.min(leftCandidate, window.innerWidth - minWidth - margin);
            const top = anchor.bottom + 6;

            flyNode = createPortal(
              <div
                id={`drop-${cat._id}`}
                className={styles.fly}
                style={{ top, left }}
                role="listbox"
                aria-label={cat._name}
                onMouseEnter={clearClose}
                onMouseLeave={scheduleClose}
              >
                <div className={styles.flyArrow} />
                {(cat._subs || []).length ? (
                  <ul className={styles.subList} role="list">
                    {cat._subs.map((sub: any) => (
                      <li key={sub._id} className={styles.subItem}>
                        <button
                          type="button"
                          className={`${styles.subBtn} ${
                            selectedSubcategoryId === sub._id ? styles.subBtnActive : ""
                          }`}
                          onClick={() => onSubcategorySelect(sub._id)}
                        >
                          {sub._name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.subEmpty}>
                    {t("categories.noSubcategories", { defaultValue: "No subcategories" })}
                  </div>
                )}
              </div>,
              portalTarget
            );
          }

          return (
            <li
              key={cat._id}
              ref={(el) => {
                itemRefs.current[cat._id] = el;
              }}
              className={styles.catItem}
              onMouseEnter={() => {
                clearClose();
                setOpenId(cat._id);
                measure(cat._id);
              }}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={`${styles.catBtn} ${selectedCategoryId === cat._id ? styles.catBtnActive : ""}`}
                onClick={() => {
                  onCategoryToggle(cat._id);
                  setOpenId(cat._id);
                  measure(cat._id);
                }}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`drop-${cat._id}`}
                title={cat._name}
              >
                <span className={styles.catText}>{cat._name}</span>
                <span className={`${styles.caret} ${isOpen ? styles.caretOpen : ""}`} aria-hidden>
                  ▾
                </span>
              </button>

              {flyNode}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default CategoryTree;
