import React from 'react';
import CommentList from './CommentList';

const CommentThread = ({ 
  comments, 
  articleSlug, 
  onCommentUpdated, 
  onCommentDeleted, 
  onReplyAdded,
  depth 
}) => {
  return (
    <div className="comment-thread">
      <CommentList
        comments={comments}
        articleSlug={articleSlug}
        onCommentUpdated={onCommentUpdated}
        onCommentDeleted={onCommentDeleted}
        onReplyAdded={onReplyAdded}
        depth={depth}
      />
    </div>
  );
};

export default CommentThread;
