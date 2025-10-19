import React, { useState, useEffect } from 'react';
import { Container, Card, Table, ButtonGroup, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all-time');
  const [category, setCategory] = useState('reputation');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, category, page]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/leaderboard', {
        params: {
          period,
          category,
          page,
          limit: 50
        }
      });
      setUsers(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getScoreValue = (user) => {
    if (category === 'articles') {
      return user.stats?.articlesWritten || 0;
    } else if (category === 'helpful') {
      return user.stats?.upvotesReceived || 0;
    }
    return user.reputation || 0;
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

  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="leaderboard-page">
      <div className="leaderboard-header">
        <h1 className="page-title">{t('leaderboard.title')}</h1>
        <p className="page-subtitle">{t('leaderboard.topContributors')}</p>
      </div>

      <Card className="leaderboard-card">
        <Card.Body>
          {/* Filters */}
          <div className="leaderboard-filters">
            <div className="filter-group">
              <label>{t('common.filter')}:</label>
              <ButtonGroup>
                <Button
                  variant={period === 'all-time' ? 'success' : 'outline-success'}
                  onClick={() => { setPeriod('all-time'); setPage(1); }}
                >
                  {t('leaderboard.allTime')}
                </Button>
                <Button
                  variant={period === 'month' ? 'success' : 'outline-success'}
                  onClick={() => { setPeriod('month'); setPage(1); }}
                >
                  {t('leaderboard.thisMonth')}
                </Button>
                <Button
                  variant={period === 'week' ? 'success' : 'outline-success'}
                  onClick={() => { setPeriod('week'); setPage(1); }}
                >
                  {t('leaderboard.thisWeek')}
                </Button>
              </ButtonGroup>
            </div>

            <div className="filter-group">
              <label>{t('common.sort')}:</label>
              <ButtonGroup>
                <Button
                  variant={category === 'reputation' ? 'success' : 'outline-success'}
                  onClick={() => { setCategory('reputation'); setPage(1); }}
                >
                  {t('leaderboard.byReputation')}
                </Button>
                <Button
                  variant={category === 'articles' ? 'success' : 'outline-success'}
                  onClick={() => { setCategory('articles'); setPage(1); }}
                >
                  {t('leaderboard.byArticles')}
                </Button>
                <Button
                  variant={category === 'helpful' ? 'success' : 'outline-success'}
                  onClick={() => { setCategory('helpful'); setPage(1); }}
                >
                  {t('leaderboard.byHelpful')}
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="leaderboard-table-wrapper">
            <Table hover className="leaderboard-table">
              <thead>
                <tr>
                  <th className="col-rank">{t('leaderboard.rank')}</th>
                  <th className="col-user">{t('leaderboard.user')}</th>
                  <th className="col-badges">{t('profile.badges')}</th>
                  <th className="col-score">{t('leaderboard.score')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const rank = (page - 1) * 50 + index + 1;
                  return (
                    <tr key={user._id} className={getRankClass(rank)}>
                      <td className="rank-cell">
                        <span className="rank-number">{getRankIcon(rank)}</span>
                      </td>
                      <td className="user-cell">
                        <Link to={`/profile/${user.username}`} className="user-link">
                          <div className="user-info-row">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="user-avatar-small" />
                            ) : (
                              <div className="user-avatar-small user-avatar-default-small">
                                {getInitials(user.username)}
                              </div>
                            )}
                            <div className="user-details">
                              <div className="user-name">{user.username}</div>
                              {user.profile?.specialty && (
                                <div className="user-specialty">{user.profile.specialty}</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="badges-cell">
                        {user.badges && user.badges.slice(0, 3).map((badge, i) => (
                          <span key={i} className="badge-icon" title={badge}>
                            {getBadgeIcon(badge)}
                          </span>
                        ))}
                      </td>
                      <td className="score-cell">
                        <span className="score-value">{getScoreValue(user)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="leaderboard-pagination">
              <Pagination>
                <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === page}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LeaderboardPage;
