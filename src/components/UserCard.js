import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FollowButton from './FollowButton';
import './UserCard.css';

const UserCard = ({ user, currentUserId, showFollowButton = true }) => {
  const { t } = useTranslation();

  if (!user) return null;

  const displayName = user.username;
  const specialty = user.profile?.specialty || '';
  const reputation = user.reputation || 0;
  const avatar = user.avatar || '';
  const badges = user.badges || [];

  // Check if this is the current user's card
  const isCurrentUser = currentUserId && user._id === currentUserId;

  // Get initials for default avatar
  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="user-card">
      <Card.Body>
        <div className="user-card-header">
          <Link to={`/profile/${displayName}`} className="user-avatar-link">
            {avatar ? (
              <img src={avatar} alt={displayName} className="user-avatar" />
            ) : (
              <div className="user-avatar-default">
                {getInitials(displayName)}
              </div>
            )}
          </Link>
          <div className="user-info">
            <Link to={`/profile/${displayName}`} className="user-name">
              {displayName}
            </Link>
            {specialty && <div className="user-specialty">{specialty}</div>}
          </div>
          {showFollowButton && !isCurrentUser && (
            <FollowButton userId={user._id} />
          )}
        </div>
        
        <div className="user-card-stats">
          <div className="stat-item">
            <span className="stat-label">{t('profile.reputation')}</span>
            <span className="stat-value reputation">{reputation}</span>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="user-badges">
            {badges.slice(0, 3).map((badge, index) => (
              <span key={index} className="badge-icon" title={badge}>
                {getBadgeIcon(badge)}
              </span>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

const getBadgeIcon = (badgeName) => {
  const icons = {
    'Contributor': '✍️',
    'Prolific Writer': '📚',
    'Expert': '🎓',
    'Master': '👑',
    'Helpful': '🤝',
    'Veteran': '⭐',
    'Moderator': '🛡️',
    'Community Leader': '🌟'
  };
  return icons[badgeName] || '🏆';
};

export default UserCard;
