import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { authService } from '@services/auth';
import { setUser, setTokens, setError } from '@store/slices/authSlice';
import '../styles/LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
                Email: admin@company.com<br />
                Password: password123
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LoginPage;
