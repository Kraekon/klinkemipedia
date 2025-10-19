import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    website: '',
    firstName: '',
    lastName: '',
    specialty: '',
    institution: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Pre-fill form with user data
    setFormData({
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      specialty: user.profile?.specialty || '',
      institution: user.profile?.institution || ''
    });

    if (user.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'danger', text: 'File size must be less than 2MB' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Update profile
      const profileUpdate = {
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialty: formData.specialty,
          institution: formData.institution
        }
      };

      await axios.put('/api/users/profile', profileUpdate, {
        withCredentials: true
      });

      // Upload avatar if changed
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);

        await axios.post('/api/users/avatar', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      }

      // Refresh user data
      if (updateUser) {
        updateUser();
      }

      setMessage({ type: 'success', text: t('profile.profileUpdated') });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/profile/${user.username}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'danger', text: t('form.passwordMismatch') });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setMessage({ type: 'danger', text: t('auth.errors.passwordTooShort') });
        return;
      }

      await axios.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });

      setMessage({ type: 'success', text: t('profile.passwordChanged') });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const bioLength = formData.bio.length;

  return (
    <Container className="edit-profile-page">
      <h1 className="page-title">{t('profile.editProfile')}</h1>

      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
          {message.text}
        </Alert>
      )}

      {/* Profile Form */}
      <Card className="edit-card">
        <Card.Body>
          <h3 className="section-title">{t('user.profile')}</h3>
          <Form onSubmit={handleProfileSubmit}>
            {/* Avatar Upload */}
            <Form.Group className="mb-4">
              <Form.Label>{t('profile.uploadAvatar')}</Form.Label>
              <div className="avatar-upload-section">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    // avatarPreview is either from URL.createObjectURL (user's selected file)
                    // or from user.avatar (server-provided URL). React escapes attributes by default.
                    <img src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <Form.Control
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange}
                />
                <Form.Text className="text-muted">
                  JPG, PNG or GIF. Max 2MB.
                </Form.Text>
              </div>
            </Form.Group>

            {/* Bio */}
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.bio')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {bioLength}/500 {t('profile.bioMaxLength')}
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('user.firstName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('user.lastName')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.specialty')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g., Hematology"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.institution')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="e.g., Karolinska Hospital"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.location')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Stockholm, Sweden"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('profile.website')}</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="form-actions">
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('profile.saveProfile')}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                {t('profile.cancel')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Password Change Form */}
      <Card className="edit-card">
        <Card.Body>
          <h3 className="section-title">{t('profile.changePassword')}</h3>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.currentPassword')}</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('profile.newPassword')}</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('profile.confirmPassword')}</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Button variant="success" type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('profile.changePassword')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditProfilePage;
