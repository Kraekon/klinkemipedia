import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TagList = ({ tags = [], showCounts = true }) => {
  const { t } = useTranslation();

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center text-muted p-4">
        {t('tags.noTags')}
      </div>
    );
  }

  return (
    <ListGroup>
      {tags.map((tagObj, index) => (
        <ListGroup.Item
          key={index}
          as={Link}
          to={`/tag/${encodeURIComponent(tagObj.tag)}`}
          action
          className="d-flex justify-content-between align-items-center"
        >
          <span>{tagObj.tag}</span>
          {showCounts && (
            <Badge bg="primary" pill>
              {tagObj.count}
            </Badge>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default TagList;
