import React, { useState, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { upvoteComment, downvoteComment, removeVote } from '../services/api';
import './CommentVotes.css';

const CommentVotes = ({ comment, onVoteUpdate }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [isVoting, setIsVoting] = useState(false);
  const [localScore, setLocalScore] = useState(comment.score || 0);
  const [localUserVote, setLocalUserVote] = useState(comment.userVote || null);

  const handleVote = async (voteType) => {
    if (!user) {
      alert(t('comments.loginToVote'));
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      let response;
      
      // Toggle logic: if clicking the same vote, remove it
      if (localUserVote === voteType) {
        response = await removeVote(comment._id);
      } else if (voteType === 'upvote') {
        response = await upvoteComment(comment._id);
      } else {
        response = await downvoteComment(comment._id);
      }

      // Update local state immediately for responsiveness
      setLocalScore(response.data.score);
      setLocalUserVote(response.data.userVote);
      
      // Notify parent component
      if (onVoteUpdate) {
        onVoteUpdate({
          ...comment,
          score: response.data.score,
          userVote: response.data.userVote,
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
      alert(err.response?.data?.message || t('comments.voteError'));
    } finally {
      setIsVoting(false);
    }
  };

  const getScoreClass = () => {
    if (localScore > 0) return 'positive';
    if (localScore < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="comment-votes">
      <Button
        variant="link"
        size="sm"
        className={`vote-btn upvote ${localUserVote === 'upvote' ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={isVoting}
        title={t('comments.upvote')}
      >
        <i className="bi bi-arrow-up"></i>
      </Button>
      
      <span className={`vote-score ${getScoreClass()}`}>
        {localScore}
      </span>
      
      <Button
        variant="link"
        size="sm"
        className={`vote-btn downvote ${localUserVote === 'downvote' ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={isVoting}
        title={t('comments.downvote')}
      >
        <i className="bi bi-arrow-down"></i>
      </Button>
    </div>
  );
};

export default CommentVotes;
