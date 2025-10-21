import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './AboutPage.css';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page py-4">
      <Container>
        <Card className="about-card">
          <Card.Body>
            <h2 className="mb-3">{t('page.title', 'Om')}</h2>
            <p>{t('page.about', 'Utvecklas av Filip Landgren (filip.landgren@gmail.com)')}</p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AboutPage;