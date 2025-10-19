import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Tabs, Tab } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import FollowButton from '../components/FollowButton';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const { t } = useTranslation();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState({ articles: [], comments: [] });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (activeTab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (activeTab === 'following' && following.length === 0) {
      fetchFollowing();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/profile/${username}`);
      setUser(response.data.data);
      
      // Fetch activity
      const activityResponse = await axios.get(`/api/users/profile/${username}/activity`);
      setActivity(activityResponse.data.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`/api/users/profile/${username}/followers`);
      setFollowers(response.data.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axios.get(`/api/users/profile/${username}/following`);
      setFollowing(response.data.data);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h2>User not found</h2>
        </div>
      </Container>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;
  const memberSince = new Date(user.createdAt).toLocaleDateString();
  const displayName = user.username;
  const avatar = user.avatar || '';
  const bio = user.bio || '';
  const specialty = user.profile?.specialty || '';
  const institution = user.profile?.institution || '';
  const location = user.location || '';
  const website = user.website || '';
  const reputation = user.reputation || 0;
  const badges = user.badges || [];
  const stats = user.stats || {};

  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
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

  return (
    <Container className="profile-page">
      {/* Header Section */}
      <Card className="profile-header-card">
        <Card.Body>
          <Row>
            <Col md={3} className="text-center">
              {avatar ? (
                <img src={avatar} alt={displayName} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-large profile-avatar-default">
                  {getInitials(displayName)}
                </div>
              )}
            </Col>
            <Col md={9}>
              <div className="profile-header-info">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h1 className="profile-username">{displayName}</h1>
                    {specialty && <p className="profile-specialty">{specialty}</p>}
                  </div>
                  <div className="profile-actions">
                    {isOwnProfile ? (
                      <Button as={Link} to="/profile/edit" variant="outline-success">
                        {t('profile.editProfile')}
                      </Button>
                    ) : (
                      <FollowButton userId={user._id} />
                    )}
                  </div>
                </div>

                {bio && <p className="profile-bio">{bio}</p>}

                <div className="profile-meta">
                  {institution && (
                    <div className="meta-item">
                      <span className="meta-icon">🏥</span>
                      {institution}
                    </div>
                  )}
                  {location && (
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      {location}
                    </div>
                  )}
                  {website && (
                    <div className="meta-item">
                      <span className="meta-icon">🌐</span>
                      <a href={website} target="_blank" rel="noopener noreferrer">
                        {website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="profile-stats-row">
                  <div className="stat-box">
                    <div className="stat-value reputation-large">{reputation}</div>
                    <div className="stat-label">{t('profile.reputation')}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{user.followers?.length || 0}</div>
                    <div className="stat-label">{t('profile.followers')}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{user.following?.length || 0}</div>
                    <div className="stat-label">{t('profile.following')}</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Badges Section */}
      {badges.length > 0 && (
        <Card className="profile-section-card">
          <Card.Body>
            <h3 className="section-title">{t('profile.badges')}</h3>
            <div className="badges-grid">
              {badges.map((badge, index) => (
                <div key={index} className="badge-item" title={badge}>
                  <span className="badge-icon-large">{getBadgeIcon(badge)}</span>
                  <span className="badge-name">{badge}</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Stats Section */}
      <Card className="profile-section-card">
        <Card.Body>
          <h3 className="section-title">{t('profile.stats')}</h3>
          <Row>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-card-value">{stats.articlesWritten || 0}</div>
                <div className="stat-card-label">{t('profile.articlesWritten')}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-card-value">{stats.commentsPosted || 0}</div>
                <div className="stat-card-label">{t('profile.commentsPosted')}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-card-value">{stats.upvotesReceived || 0}</div>
                <div className="stat-card-label">{t('profile.upvotesReceived')}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-card-value">{memberSince}</div>
                <div className="stat-card-label">{t('profile.memberSince')}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Activity Tabs */}
      <Card className="profile-section-card">
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="profile-tabs">
            <Tab eventKey="articles" title={t('profile.articles')}>
              <div className="tab-content-area">
                {activity.articles.length === 0 ? (
                  <p className="no-content">{t('profile.noArticles')}</p>
                ) : (
                  <div className="articles-list">
                    {activity.articles.map(article => (
                      <div key={article._id} className="article-item">
                        <Link to={`/article/${article.slug}`} className="article-title">
                          {article.title}
                        </Link>
                        <div className="article-meta">
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          <span>{article.views} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
            <Tab eventKey="comments" title={t('profile.comments')}>
              <div className="tab-content-area">
                {activity.comments.length === 0 ? (
                  <p className="no-content">{t('profile.noComments')}</p>
                ) : (
                  <div className="comments-list">
                    {activity.comments.map(comment => (
                      <div key={comment._id} className="comment-item">
                        <div className="comment-content">{comment.content}</div>
                        <div className="comment-meta">
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          {comment.articleId && (
                            <Link to={`/article/${comment.articleId.slug}`}>
                              on {comment.articleId.title}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
            <Tab eventKey="followers" title={`${t('profile.followers')} (${followers.length})`}>
              <div className="tab-content-area">
                {followers.length === 0 ? (
                  <p className="no-content">No followers yet</p>
                ) : (
                  <Row>
                    {followers.map(follower => (
                      <Col key={follower._id} md={6} lg={4}>
                        <UserCard user={follower} currentUserId={currentUser?._id} />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>
            <Tab eventKey="following" title={`${t('profile.following')} (${following.length})`}>
              <div className="tab-content-area">
                {following.length === 0 ? (
                  <p className="no-content">Not following anyone yet</p>
                ) : (
                  <Row>
                    {following.map(followedUser => (
                      <Col key={followedUser._id} md={6} lg={4}>
                        <UserCard user={followedUser} currentUserId={currentUser?._id} />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfilePage;
