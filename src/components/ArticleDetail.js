import React from 'react';
import { Card, Badge, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const ArticleDetail = ({ article }) => {
  return (
    <div>
      <Button as={Link} to="/" variant="outline-primary" className="mb-3">
        ← Back to Articles
      </Button>
      
      <Card>
        <Card.Body>
          <h1 className="mb-3">{article.title}</h1>
          
          <div className="mb-3">
            {article.category && (
              <Badge bg="primary" className="me-2">{article.category}</Badge>
            )}
            {article.tags && article.tags.map((tag, index) => (
              <Badge key={index} bg="secondary" className="me-1">{tag}</Badge>
            ))}
          </div>

          {article.summary && (
            <Card className="mb-4 bg-light">
              <Card.Body>
                <h5>Summary</h5>
                <p className="mb-0">{article.summary}</p>
              </Card.Body>
            </Card>
          )}

          <div className="mb-4">
  <h5>Content</h5>
  <div className="article-content">
    <ReactMarkdown>{article.content}</ReactMarkdown>
  </div>
</div>

          {article.referenceRanges && article.referenceRanges.length > 0 && (
            <div className="mb-4">
              <h5>Reference Ranges</h5>
              <Table striped bordered hover responsive className="reference-ranges-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Range</th>
                    <th>Unit</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {article.referenceRanges.map((range, index) => (
                    <tr key={index}>
                      <td>{range.parameter}</td>
                      <td>{range.range}</td>
                      <td>{range.unit}</td>
                      <td>{range.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {article.clinicalSignificance && (
  <div className="mb-4">
    <h5>Clinical Significance</h5>
    <div className="clinical-significance">
      <ReactMarkdown>{article.clinicalSignificance}</ReactMarkdown>
    </div>
  </div>
)}

          {article.relatedTests && article.relatedTests.length > 0 && (
            <div className="mb-4">
              <h5>Related Tests</h5>
              <ul>
                {article.relatedTests.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-muted small">
            <p className="mb-1">Views: {article.views || 0}</p>
            {article.createdAt && (
              <p className="mb-1">
                Created: {new Date(article.createdAt).toLocaleDateString()}
              </p>
            )}
            {article.updatedAt && (
              <p className="mb-0">
                Updated: {new Date(article.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ArticleDetail;
