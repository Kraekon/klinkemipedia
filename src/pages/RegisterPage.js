import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = t('auth.errors.usernameRequired');
    else if (username.length < 3) newErrors.username = t('auth.errors.usernameTooShort');
    else if (username.length > 20) newErrors.username = t('auth.errors.usernameTooLong');

    if (!email) newErrors.email = t('auth.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.errors.invalidEmail');

    if (!password) newErrors.password = t('auth.errors.passwordRequired');
    else if (password.length < 6) newErrors.password = t('auth.errors.passwordTooShort');

    if (!confirmPassword) newErrors.confirmPassword = t('auth.errors.passwordRequired');
    else if (password !== confirmPassword) newErrors.confirmPassword = t('auth.errors.passwordMismatch');

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    setApiError('');
    const result = await register(username, email, password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setApiError(result.message || t('auth.errors.registrationFailed'));
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Container>
        <div className="register-wrapper">
          <Card className="register-card">
            <Card.Body>
              <h2 className="text-center mb-4">{t('auth.registerTitle')}</h2>

              {apiError && <Alert variant="danger">{apiError}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>{t('auth.username')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    placeholder={t('auth.username')}
                    autoComplete="username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>{t('auth.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="user@example.com"
                    autoComplete="email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>{t('auth.password')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    placeholder="••••••"
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>{t('auth.confirmPassword')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="••••••"
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 register-button"
                  disabled={loading}
                >
                  {loading ? t('auth.registering') : t('auth.registerButton')}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  {t('auth.haveAccount')}{' '}
                  <Link to="/login" className="login-link">
                    {t('auth.loginLink')}
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;