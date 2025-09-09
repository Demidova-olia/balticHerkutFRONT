// components/NavBar/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || 'en') as 'en'|'ru'|'fi';

  const setLang = (lng: 'en'|'ru'|'fi') => {
    i18n.changeLanguage(lng);           // <-- одна команда меняет язык везде
    document.documentElement.lang = lng; // a11y/SEO
    localStorage.setItem('i18nextLng', lng); // и так сохранится
  };

  return (
    <div style={{ display:'flex', gap:8 }}>
      <button aria-pressed={current==='en'} onClick={() => setLang('en')}>EN</button>
      <button aria-pressed={current==='ru'} onClick={() => setLang('ru')}>RU</button>
      <button aria-pressed={current==='fi'} onClick={() => setLang('fi')}>FI</button>
    </div>
  );
}
