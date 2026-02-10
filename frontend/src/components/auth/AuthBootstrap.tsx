import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { authService } from '../../services/auth';
import { setUser, setTokens } from '../../store/slices/authSlice';

const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'demo123456';

const isLocalHost = () =>
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const shouldForceAdmin = () =>
  process.env.REACT_APP_ENV === 'development' ||
  process.env.NODE_ENV === 'development' ||
  isLocalHost();

export const AuthBootstrap: React.FC = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!shouldForceAdmin() || hasAttempted.current) {
      return;
    }

    hasAttempted.current = true;

    const needsAdmin =
      !accessToken || !user || user.role !== 'admin' || user.email !== ADMIN_EMAIL;

    if (!needsAdmin) {
      return;
    }

    const run = async () => {
      const response = await authService.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      if (response.success) {
        dispatch(setUser(response.data.user));
        dispatch(
          setTokens({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
          })
        );
      }
    };

    run();
  }, [accessToken, dispatch, user]);

  return null;
};

export default AuthBootstrap;
