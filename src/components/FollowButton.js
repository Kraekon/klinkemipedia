import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './FollowButton.css';

const FollowButton = ({ userId, initialFollowing = false, onFollowChange }) => {
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      
      const endpoint = `/api/users/${userId}/follow`;
      
      if (isFollowing) {
        await axios.delete(endpoint, { withCredentials: true });
      } else {
        await axios.post(endpoint, {}, { withCredentials: true });
      }
      
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={`follow-button ${isFollowing ? 'following' : ''}`}
      variant={isFollowing ? 'success' : 'outline-success'}
      size="sm"
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? '...' : isFollowing ? t('profile.following') : t('profile.follow')}
    </Button>
  );
};

export default FollowButton;
