import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en/common.json";
import ru from "./ru/common.json";
import fi from "./fi/common.json";

i18n
  .use(LanguageDetector)    
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      ru: { common: ru },
      fi: { common: fi }
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "fi"],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "querystring", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupQuerystring: "lng"
    }
  });


document.documentElement.lang = i18n.resolvedLanguage || "en";

export default i18n;
