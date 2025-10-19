import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Button } from 'react-bootstrap';

const LanguageSwitcher = ({ variant = 'navbar', showLabel = false }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  const languages = {
    sv: { name: t('language.swedish'), flag: '🇸🇪' },
    en: { name: t('language.english'), flag: '🇬🇧' }
  };

  if (variant === 'navbar') {
    return (
      <Dropdown align="end">
        <Dropdown.Toggle variant="outline-light" size="sm" id="language-dropdown">
          {languages[currentLanguage]?.flag || '🌐'} {showLabel && t('language.label')}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item 
            active={currentLanguage === 'sv'} 
            onClick={() => changeLanguage('sv')}
          >
            {languages.sv.flag} {languages.sv.name}
          </Dropdown.Item>
          <Dropdown.Item 
            active={currentLanguage === 'en'} 
            onClick={() => changeLanguage('en')}
          >
            {languages.en.flag} {languages.en.name}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="language-switcher-footer">
        <label className="me-2">{t('language.label')}:</label>
        <Button
          variant={currentLanguage === 'sv' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => changeLanguage('sv')}
          className="me-2"
        >
          {languages.sv.flag} {languages.sv.name}
        </Button>
        <Button
          variant={currentLanguage === 'en' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => changeLanguage('en')}
        >
          {languages.en.flag} {languages.en.name}
        </Button>
      </div>
    );
  }

  return null;
};

export default LanguageSwitcher;
