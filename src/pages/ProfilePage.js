import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    website: '',
    profile: {
      firstName: '',
      lastName: '',
      specialty: '',
      institution: ''
    }
  });

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    // Otherwise, prepend backend URL
    return `${BACKEND_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  };

  // Fetch current logged-in user from API using cookie-based auth
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true
        });
        setCurrentUsername(response.data.user.username);
      } catch (error) {
        setCurrentUsername(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const isOwnProfile = currentUsername && currentUsername === username;

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users/profile/${username}`);
      setUser(response.data.data);
      
      // Populate edit form with current data
      setEditForm({
        bio: response.data.data.bio || '',
        location: response.data.data.location || '',
        website: response.data.data.website || '',
        profile: {
          firstName: response.data.data.profile?.firstName || '',
          lastName: response.data.data.profile?.lastName || '',
          specialty: response.data.data.profile?.specialty || '',
          institution: response.data.data.profile?.institution || ''
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);
    setSaving(true);

    try {
      await axios.put(
        `${API_BASE_URL}/users/profile`,
        editForm,
        {
          withCredentials: true
        }
      );
      
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        fetchUserProfile();
      }, 1500);
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setEditError('Image must be smaller than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setEditError('Please select an image file');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setEditError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      await axios.post(
        `${API_BASE_URL}/users/avatar`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setEditSuccess(true);
      setTimeout(() => {
        setShowAvatarModal(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        fetchUserProfile();
      }, 1500);
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h2>User not found</h2>
      </Container>
    );
  }

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <Container className="profile-page my-4">
      <Row>
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center">
              {/* User Avatar with hover effect */}
              <div 
                className="mb-3 position-relative d-inline-block" 
                style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
                onClick={isOwnProfile ? () => setShowAvatarModal(true) : undefined}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={user.username} 
                    className="rounded-circle border border-3 border-primary"
                    style={{ 
                      width: '180px', 
                      height: '180px', 
                      objectFit: 'cover',
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => isOwnProfile && (e.target.style.opacity = '0.8')}
                    onMouseLeave={(e) => isOwnProfile && (e.target.style.opacity = '1')}
                    onError={(e) => {
                      console.error('Avatar failed to load:', avatarUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div 
                    className="rounded-circle border border-3 border-primary d-inline-flex align-items-center justify-content-center"
                    style={{ 
                      width: '180px', 
                      height: '180px', 
                      background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)',
                      fontSize: '3.5rem',
                      fontWeight: 'bold',
                      color: 'white',
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => isOwnProfile && (e.target.style.opacity = '0.8')}
                    onMouseLeave={(e) => isOwnProfile && (e.target.style.opacity = '1')}
                  >
                    {getInitials(user.username)}
                  </div>
                )}
                
                {/* Camera overlay - appears on hover for own profile */}
                {isOwnProfile && (
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      background: 'rgba(0, 0, 0, 0)',
                      transition: 'background 0.3s ease',
                      pointerEvents: 'none'
                    }}
                  >
                    <i 
                      className="bi bi-camera-fill text-white" 
                      style={{ 
                        fontSize: '2rem',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                    ></i>
                  </div>
                )}
              </div>

              {/* Click to change hint */}
              {isOwnProfile && (
                <p className="text-muted small mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  Click avatar to change
                </p>
              )}

              {/* Username */}
              <h3 className="mb-2">{user.username}</h3>

              {/* Role Badge */}
              <Badge 
                bg={user.role === 'admin' ? 'danger' : user.role === 'contributor' ? 'primary' : 'secondary'}
                className="mb-3"
              >
                <i className={`bi ${user.role === 'admin' ? 'bi-shield-fill-check' : user.role === 'contributor' ? 'bi-pencil-square' : 'bi-person'} me-1`}></i>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>

              {/* Edit Profile Button - Only show for own profile */}
              {isOwnProfile && (
                <div className="mb-3">
                  <Button 
                    variant="primary"
                    size="sm" 
                    onClick={() => setShowEditModal(true)}
                    className="w-100"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Profile
                  </Button>
                </div>
              )}

              {/* Show login prompt if not logged in */}
              {!currentUsername && (
                <div className="mb-3">
                  <Button 
                    variant="outline-primary"
                    size="sm" 
                    onClick={() => navigate('/login')}
                    className="w-100"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login to Edit
                  </Button>
                </div>
              )}

              {/* Profile Info */}
              {user.profile?.specialty && (
                <p className="text-muted mb-2">
                  <i className="bi bi-briefcase me-2"></i>
                  {user.profile.specialty}
                </p>
              )}
              
              {user.profile?.institution && (
                <p className="text-muted mb-2">
                  <i className="bi bi-building me-2"></i>
                  {user.profile.institution}
                </p>
              )}

              {user.location && (
                <p className="text-muted mb-2">
                  <i className="bi bi-geo-alt me-2"></i>
                  {user.location}
                </p>
              )}

              {user.website && (
                <p className="mb-2">
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <i className="bi bi-link-45deg me-2"></i>
                    Website
                  </a>
                </p>
              )}

              {/* Member Since */}
              <p className="text-muted small mt-3">
                <i className="bi bi-calendar-check me-2"></i>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white">
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="overview">
                    <i className="bi bi-person-circle me-2"></i>
                    Overview
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="articles">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Articles
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {activeTab === 'overview' && (
                <div className="profile-overview">
                  <h5 className="mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    About
                  </h5>
                  
                  {user.bio ? (
                    <p className="mb-4">{user.bio}</p>
                  ) : (
                    <p className="text-muted mb-4">
                      <i className="bi bi-chat-left-text me-2"></i>
                      {isOwnProfile ? "You haven't added a bio yet. Click 'Edit Profile' to add one!" : "No bio available"}
                    </p>
                  )}

                  {(user.profile?.firstName || user.profile?.lastName) && (
                    <div className="mt-4">
                      <h5 className="mb-3">
                        <i className="bi bi-person-badge me-2"></i>
                        Full Name
                      </h5>
                      <p>
                        {user.profile.firstName} {user.profile.lastName}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'articles' && (
                <div className="profile-articles">
                  <p className="text-muted">
                    <i className="bi bi-inbox me-2"></i>
                    No articles yet
                  </p>
                  <small className="text-muted">
                    Article listing coming soon
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Avatar Upload Modal */}
      <Modal show={showAvatarModal} onHide={() => {
        setShowAvatarModal(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        setEditError(null);
        setEditSuccess(false);
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-camera me-2"></i>
            Change Profile Picture
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && (
            <Alert variant="danger" dismissible onClose={() => setEditError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {editError}
            </Alert>
          )}
          
          {editSuccess && (
            <Alert variant="success">
              <i className="bi bi-check-circle-fill me-2"></i>
              Profile picture updated successfully!
            </Alert>
          )}

          <div className="text-center">
            {/* Preview */}
            <div className="mb-3">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Preview" 
                  className="rounded-circle border border-3 border-primary"
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                />
              ) : avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Current" 
                  className="rounded-circle border border-3 border-primary"
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="rounded-circle border border-3 border-primary d-inline-flex align-items-center justify-content-center"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)',
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  {getInitials(user.username)}
                </div>
              )}
            </div>

            {/* File Input */}
            <Form.Group>
              <Form.Label className="btn btn-outline-primary mb-0">
                <i className="bi bi-upload me-2"></i>
                Choose Image
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="d-none"
                />
              </Form.Label>
              <Form.Text className="d-block mt-2 text-muted">
                JPG, PNG or GIF. Max size 2MB.
              </Form.Text>
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowAvatarModal(false);
              setAvatarFile(null);
              setAvatarPreview(null);
              setEditError(null);
              setEditSuccess(false);
            }} 
            disabled={uploadingAvatar}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAvatarUpload} 
            disabled={!avatarFile || uploadingAvatar}
          >
            {uploadingAvatar ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Upload
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && (
            <Alert variant="danger" dismissible onClose={() => setEditError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {editError}
            </Alert>
          )}
          
          {editSuccess && (
            <Alert variant="success">
              <i className="bi bi-check-circle-fill me-2"></i>
              Profile updated successfully!
            </Alert>
          )}

          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-person me-2"></i>
                    First Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.profile.firstName}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      profile: { ...editForm.profile, firstName: e.target.value }
                    })}
                    placeholder="Enter first name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-person me-2"></i>
                    Last Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.profile.lastName}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      profile: { ...editForm.profile, lastName: e.target.value }
                    })}
                    placeholder="Enter last name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-chat-left-text me-2"></i>
                Bio
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {editForm.bio.length}/500 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-briefcase me-2"></i>
                Specialty
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.profile.specialty}
                onChange={(e) => setEditForm({
                  ...editForm,
                  profile: { ...editForm.profile, specialty: e.target.value }
                })}
                placeholder="e.g., Clinical Chemistry"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-building me-2"></i>
                Institution
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.profile.institution}
                onChange={(e) => setEditForm({
                  ...editForm,
                  profile: { ...editForm.profile, institution: e.target.value }
                })}
                placeholder="e.g., University Hospital"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-geo-alt me-2"></i>
                Location
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="e.g., Stockholm, Sweden"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-link-45deg me-2"></i>
                Website
              </Form.Label>
              <Form.Control
                type="url"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://example.com"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={saving}>
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit} disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;