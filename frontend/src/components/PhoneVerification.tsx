import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axios';
import type { MeResponse, RegisterResponse, User, VerifyResponse } from '../types/user';

const tokenKey = 'phone-verification-token';
const userKey = 'phone-verification-user';

function readStoredUser(): User | null {
  const stored = localStorage.getItem(userKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function PhoneVerification() {
  const [name, setName] = useState('John Doe');
  const [phone, setPhone] = useState('+919999999999');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '');
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [message, setMessage] = useState('Register a user to begin the verification flow.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    api
      .get<MeResponse>('/api/auth/me')
      .then((response) => {
        if (!mounted) {
          return;
        }

        setUser(response.data.user);
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }

        setMessage(getErrorMessage(error, 'Failed to load user profile'));
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const persistSession = (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(tokenKey, nextToken);
    localStorage.setItem(userKey, JSON.stringify(nextUser));
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage('Registering user...');

    try {
      const response = await api.post<RegisterResponse>('/api/auth/register', { name, phone });
      persistSession(response.data.token, response.data.user);
      setMessage('User registered successfully. You can now send a code.');
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setMessage('Sending verification code...');

    try {
      await api.post('/api/verification/send-code', { phone });
      setMessage('Verification code sent. Check your SMS or backend logs in development.');
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'Failed to send verification code'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setMessage('Verifying code...');

    try {
      const response = await api.post<VerifyResponse>('/api/verification/verify-code', {
        phone,
        code
      });

      const nextUser: User = {
        id: response.data.user.id,
        name: user?.name || name,
        phone: response.data.user.phone,
        isPhoneVerified: response.data.user.isPhoneVerified
      };

      setUser(nextUser);
      localStorage.setItem(userKey, JSON.stringify(nextUser));
      setMessage(response.data.message);
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'Failed to verify code'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken('');
    setUser(null);
    setCode('');
    setMessage('Session cleared. Register again to continue.');
  };

  return (
    <div className="shell">
      <section className="hero">
        <p className="eyebrow">AWS Lambda + MongoDB + Twilio</p>
        <h1>Phone verification demo</h1>
        <p className="lede">
          Register a user, send a 6-digit OTP, verify it, and watch the verification status update in MongoDB.
        </p>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Verification flow</h2>
            <p className="muted">JWT is stored in localStorage only for demo purposes.</p>
          </div>

          {token ? (
            <button className="ghost-button" onClick={handleLogout} type="button">
              Clear session
            </button>
          ) : null}
        </div>

        <div className="grid">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" />
          </label>

          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+919999999999" />
          </label>

          <label className="full">
            OTP Code
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" maxLength={6} />
          </label>
        </div>

        <div className="actions">
          <button onClick={handleRegister} disabled={loading} type="button">
            Register / Login
          </button>
          <button onClick={handleSendCode} disabled={loading || !token} type="button">
            Send OTP
          </button>
          <button onClick={handleVerifyCode} disabled={loading || !token} type="button">
            Verify OTP
          </button>
        </div>

        <div className="message-box">
          <strong>Status</strong>
          <p>{message}</p>
        </div>
      </section>

      <section className="card user-card">
        <h2>Current user</h2>
        {user ? (
          <dl>
            <div>
              <dt>ID</dt>
              <dd>{user.id}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
            <div>
              <dt>Verified</dt>
              <dd>{user.isPhoneVerified ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">No user loaded yet.</p>
        )}
      </section>
    </div>
  );
}
