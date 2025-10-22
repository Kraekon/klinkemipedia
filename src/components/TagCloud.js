import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TagCloud.css';

const TagCloud = ({ tags = [], minSize = 0.8, maxSize = 2 }) => {
  const { t } = useTranslation();

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center text-muted p-4">
        {t('tags.noTags')}
      </div>
    );
  }

  // Find min and max counts for scaling
  const counts = tags.map(t => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = maxCount - minCount || 1;

  // Calculate font size for each tag
  const getSize = (count) => {
    const normalized = (count - minCount) / range;
    return minSize + (normalized * (maxSize - minSize));
  };

  return (
    <div className="tag-cloud">
      {tags.map((tagObj, index) => {
        const size = getSize(tagObj.count);
        return (
          <Link
            key={index}
            to={`/tag/${encodeURIComponent(tagObj.tag)}`}
            // use Bootstrap 'primary' badge for blue badges
            className="tag-cloud-item badge bg-primary text-white rounded-pill text-decoration-none"
            style={{ fontSize: `${size}rem` }}
            title={t('tags.tagCount', { count: tagObj.count })}
          >
            {tagObj.tag}
          </Link>
        );
      })}
    </div>
  );
};

export default TagCloud;