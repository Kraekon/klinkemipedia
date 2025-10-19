import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import FollowButton from '../components/FollowButton';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const response = await axios.get(`${API_BASE_URL}/users/profile/${username}`);
      setUser(response.data.data);
      
      // Fetch activity
      const activityResponse = await axios.get(`${API_BASE_URL}/users/profile/${username}/activity`);
      setActivity(activityResponse.data.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h2>{t('profile.notFound')}</h2>
      </Container>
    );
  }

  return (
    <Container className="profile-page my-4">
      <Row>
        <Col lg={4}>
          <UserCard user={user} onFollow={fetchUserProfile} />
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="overview">{t('profile.overview')}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="articles">{t('profile.articles')}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="activity">{t('profile.activity')}</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {activeTab === 'overview' && (
                <div className="profile-overview">
                  <h5>{t('profile.stats')}</h5>
                  <Row className="text-center my-3">
                    <Col>
                      <h3>{user.stats?.articlesWritten || 0}</h3>
                      <small>{t('profile.articlesWritten')}</small>
                    </Col>
                    <Col>
                      <h3>{user.stats?.articlesEdited || 0}</h3>
                      <small>{t('profile.articlesEdited')}</small>
                    </Col>
                    <Col>
                      <h3>{user.stats?.commentsPosted || 0}</h3>
                      <small>{t('profile.comments')}</small>
                    </Col>
                  </Row>
                  
                  {user.badges && user.badges.length > 0 && (
                    <div className="mt-4">
                      <h5>{t('profile.badges')}</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {user.badges.map((badge, index) => (
                          <Badge key={index} bg="primary">{badge}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'articles' && (
                <div className="profile-articles">
                  <p>{t('profile.noArticles')}</p>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="profile-activity">
                  {activity.length > 0 ? (
                    activity.map((item, index) => (
                      <div key={index} className="activity-item mb-3">
                        <small className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</small>
                        <p>{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p>{t('profile.noActivity')}</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;