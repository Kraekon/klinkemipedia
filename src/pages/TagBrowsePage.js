import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import TagCloud from '../components/TagCloud';
import TagList from '../components/TagList';
import { getTagsWithCounts } from '../services/api';

const TagBrowsePage = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cloud');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTagsWithCounts();
      setTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="mb-4">{t('tags.browseByTag')}</h1>
          
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="cloud" title={t('tags.tagCloud')}>
                  <TagCloud tags={tags} />
                </Tab>
                <Tab eventKey="list" title={t('tags.allTags')}>
                  <TagList tags={tags} showCounts={true} />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>

          {tags.length === 0 && (
            <Alert variant="info" className="mt-3">
              {t('tags.noTags')}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TagBrowsePage;
