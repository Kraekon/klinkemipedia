import React from 'react';
import CommentItem from './CommentItem';

const CommentList = ({ 
  comments, 
  articleSlug, 
  onCommentUpdated, 
  onCommentDeleted, 
  onReplyAdded,
  depth = 0 
}) => {
  return (
    <div className={`comment-list ${depth > 0 ? 'nested' : ''}`}>
      {comments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          articleSlug={articleSlug}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
          onReplyAdded={onReplyAdded}
          depth={depth}
        />
      ))}
    </div>
  );
};

export default CommentList;
