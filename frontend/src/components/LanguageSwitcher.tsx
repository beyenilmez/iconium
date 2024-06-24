import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <button onClick={() => changeLanguage('en')} className="btn">English</button>
      <button onClick={() => changeLanguage('tr')} className="btn">Türkçe</button>
    </div>
  );
};

export default LanguageSwitcher;
