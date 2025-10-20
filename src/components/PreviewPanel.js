import React, { useState } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import ArticlePreview from './ArticlePreview';
import './PreviewPanel.css';

const PreviewPanel = ({ 
  title, 
  summary, 
  content, 
  category, 
  tags, 
  referenceRanges,
  featuredImage 
}) => {
  const [deviceMode, setDeviceMode] = useState('desktop');

  return (
    <div className="preview-panel">
      <div className="preview-panel-header">
        <h5 className="mb-0">Preview</h5>
        <ButtonGroup size="sm">
          <Button
            variant={deviceMode === 'desktop' ? 'primary' : 'outline-primary'}
            onClick={() => setDeviceMode('desktop')}
            title="Desktop Preview"
          >
            🖥️ Desktop
          </Button>
          <Button
            variant={deviceMode === 'mobile' ? 'primary' : 'outline-primary'}
            onClick={() => setDeviceMode('mobile')}
            title="Mobile Preview"
          >
            📱 Mobile
          </Button>
        </ButtonGroup>
      </div>
      <div className="preview-panel-content">
        <ArticlePreview
          title={title}
          summary={summary}
          content={content}
          category={category}
          tags={tags}
          referenceRanges={referenceRanges}
          featuredImage={featuredImage}
          deviceMode={deviceMode}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
