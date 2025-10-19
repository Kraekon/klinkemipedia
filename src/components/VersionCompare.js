import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { compareArticleRevisions } from '../services/api';
import AdminNavbar from './AdminNavbar';
import './VersionCompare.css';

const VersionCompare = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const v1 = parseInt(searchParams.get('v1'));
  const v2 = parseInt(searchParams.get('v2'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    if (slug && v1 && v2) {
      fetchComparison();
    } else {
      setError('Invalid version comparison parameters');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, v1, v2]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await compareArticleRevisions(slug, v1, v2);
      setComparison(response.data);
    } catch (err) {
      console.error('Error comparing versions:', err);
      setError(err.response?.data?.message || 'Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, field1, field2, isDifferent) => {
    return (
      <div className={`compare-field ${isDifferent ? 'different' : ''}`}>
        <h6>{label}</h6>
        <Row>
          <Col md={6} className="version-column left">
            <div className="version-label">
              <Badge bg="primary">Version {v1}</Badge>
            </div>
            <div className="field-content">
              {typeof field1 === 'object' ? (
                <pre>{JSON.stringify(field1, null, 2)}</pre>
              ) : (
                <div>{field1 || <em className="text-muted">Empty</em>}</div>
              )}
            </div>
          </Col>
          <Col md={6} className="version-column right">
            <div className="version-label">
              <Badge bg="primary">Version {v2}</Badge>
            </div>
            <div className="field-content">
              {typeof field2 === 'object' ? (
                <pre>{JSON.stringify(field2, null, 2)}</pre>
              ) : (
                <div>{field2 || <em className="text-muted">Empty</em>}</div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading comparison...</p>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
          <Button variant="secondary" onClick={() => window.close()}>
            Close
          </Button>
        </Container>
      </>
    );
  }

  if (!comparison) {
    return null;
  }

  const { version1, version2, differences } = comparison;

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <div className="compare-header mb-4">
          <h2>Version Comparison</h2>
          <p className="text-muted">
            Comparing version {v1} with version {v2}
          </p>
          <div className="legend">
            <Badge bg="warning" className="me-2">Yellow background = Changed field</Badge>
            <Badge bg="secondary">Gray = Unchanged field</Badge>
          </div>
        </div>

        <div className="comparison-content">
          {renderField('Title', version1.title, version2.title, differences.title)}
          {renderField('Category', version1.category, version2.category, differences.category)}
          {renderField('Summary', version1.summary, version2.summary, differences.summary)}
          {renderField('Content', version1.content, version2.content, differences.content)}
          {renderField('Status', version1.status, version2.status, differences.status)}
          {renderField('Clinical Significance', version1.clinicalSignificance, version2.clinicalSignificance, differences.clinicalSignificance)}
          {renderField('Interpretation', version1.interpretation, version2.interpretation, differences.interpretation)}
          {renderField('Tags', version1.tags, version2.tags, differences.tags)}
          {renderField('Related Tests', version1.relatedTests, version2.relatedTests, differences.relatedTests)}
          {renderField('References', version1.references, version2.references, differences.references)}
          {renderField('Reference Ranges', version1.referenceRanges, version2.referenceRanges, differences.referenceRanges)}
          {renderField('Images', version1.images, version2.images, differences.images)}
        </div>

        <div className="compare-actions mt-4">
          <Button variant="secondary" onClick={() => window.close()}>
            Close
          </Button>
        </div>
      </Container>
    </>
  );
};

export default VersionCompare;
