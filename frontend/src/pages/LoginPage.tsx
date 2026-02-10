import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { RootState } from '../store/store';
import { authService } from '../services/auth';
import { setUser, setTokens, setError } from '../store/slices/authSlice';
import '../styles/LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [hasAttemptedAutoLogin, setHasAttemptedAutoLogin] = useState(false);

  // Auto-login function wrapped in useCallback
  const performAutoLogin = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      const response = await authService.login('admin@demo.com', 'demo123456');

      if (response.success) {
        dispatch(setUser(response.data.user));
        dispatch(
          setTokens({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
          })
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      // If auto-login fails, show the form so user can try manually
      setErrorState(
        err.response?.data?.error?.message || 'Auto-login failed. Please login manually.'
      );
      dispatch(setError(err.message));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate]);

  // Auto-login in development mode
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Auto-login only once in development mode
    if (process.env.NODE_ENV === 'development' && !hasAttemptedAutoLogin) {
      setHasAttemptedAutoLogin(true);
      performAutoLogin();
    }
  }, [isAuthenticated, hasAttemptedAutoLogin, navigate, performAutoLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState(null);

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        dispatch(setUser(response.data.user));
        dispatch(
          setTokens({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
          })
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorState(
        err.response?.data?.error?.message || 'Login failed. Please try again.'
      );
      dispatch(setError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Card className="login-card">
          <Card.Body>
            <div className="login-header">
              <h1>MRMS</h1>
              <p>Material Requirements Management System</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>

            <div className="login-footer">
              <small>
                Demo Credentials:<br />
                Email: admin@demo.com<br />
                Password: demo123456
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LoginPage;
