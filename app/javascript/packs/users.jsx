import React, { useState } from 'react'
import { Link, navigate } from '@reach/router'

import { gqlClient, mutateWithAuth, setAuthHeader } from './client.js';

const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const USER_EMAIL_KEY = 'userEmail';

export function saveUser(user) {
  if (user === null) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    setAuthHeader(null);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, user.authenticationToken);
    localStorage.setItem(USER_ID_KEY, user.id);
    localStorage.setItem(USER_EMAIL_KEY, user.email);
    setAuthHeader(user.authenticationToken);
  }
}

export function loadUser() {
  const userId = localStorage.getItem(USER_ID_KEY);
  if (userId === null) {
    return null;
  }

  return {
    id: userId,
    email: localStorage.getItem(USER_EMAIL_KEY),
    authenticationToken: localStorage.getItem(AUTH_TOKEN_KEY),
  };
}

export function SignIn(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);

  return (
    <div>
      <h2>Sign In</h2>
      <div>
        <label>Email</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button onClick={async () => {
          let result = await mutateWithAuth(`mutation {
            signIn(input: {
              email: "${email}"
              password: "${password}"
            }) {
              user {
                id
                authenticationToken
                email
              }
            }
          }`, (e)=>{setAuthError(e.response.errors[0].message)});

          if (result === null) {
            return;
          }

          props.onUserChange(result.signIn.user);
          navigate("/");
          }}>Sign In</button>
      </div>
      <div>
        <p>Or <Link to="/register">register</Link> a new account</p>
      </div>
      <div>
        <p>{authError}</p>
      </div>
    </div>
  );
}

export function RegisterUser(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h2>Register new user</h2>
      <div>
        <label>Email</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button onClick={async () => {
          const result = await gqlClient.request(`mutation {
            registerUser(input: {
              email: "${email}"
              password: "${password}"
            }) {
              user {
                id
                email
                authenticationToken
              }
            }
          }`);

          props.onUserChange(result.registerUser.user);
          navigate("/");
        }}>Sign Up</button>
      </div>
    </div>
  )
}

export function SignOut(props) {
  return (
    <div>
      <div>Click to sign out:</div>
      <div>
        <button onClick={async () => {
          const result = await gqlClient.request(`mutation {
            signOut(input: {}) {
              user {
                id
                email
              }
            }
          }`);

          props.onUserChange(null);
          navigate("/signin");
        }}>Sign Out</button>
      </div>
    </div>
  );
}
