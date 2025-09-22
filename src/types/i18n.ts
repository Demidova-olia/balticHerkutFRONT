export type Lang = "en" | "ru" | "fi";

export interface LocalizedString {
  ru?: string;
  en?: string;
  fi?: string;
  _source?: Lang;
  _mt?: Record<string, boolean>;
}

export type LocalizedField = string | LocalizedString;

export const getCurrentLang = (): Lang => {
  try {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("i18nextLng");
      if (fromStorage) return (fromStorage.slice(0, 2).toLowerCase() as Lang) || "en";
      const htmlLang = document.documentElement.lang;
      if (htmlLang) return (htmlLang.slice(0, 2).toLowerCase() as Lang) || "en";
      const navLang = (navigator as any).language || ((navigator as any).languages || [])[0];
      if (navLang) return (String(navLang).slice(0, 2).toLowerCase() as Lang) || "en";
    }
  } catch {}
  return "en";
};

export const asText = (value: LocalizedField, lang: Lang = getCurrentLang()): string => {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.ru || value?.fi || "";
};

export const setLangValue = (value: LocalizedField, lang: Lang, text: string): LocalizedString => {
  if (typeof value === "string") return { [lang]: text, _source: lang };
  return { ...(value || {}), [lang]: text, _source: value?._source || lang };
};
