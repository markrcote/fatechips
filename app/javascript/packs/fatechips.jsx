import { setHeader, GraphQLClient } from 'graphql-request'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import useSWR, { SWRConfig } from 'swr'
import { Link, Router, navigate, redirectTo } from "@reach/router"

const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const USER_EMAIL_KEY = 'userEmail';
const API = '/graphql';
const csrfToken = document.querySelector('meta[name="csrf-token"]').attributes.content.value;
const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
const userId = localStorage.getItem(USER_ID_KEY);
const userEmail = localStorage.getItem(USER_EMAIL_KEY);

const gqlClient = new GraphQLClient(API);
gqlClient.setHeader('X-CSRF-Token', csrfToken);
const fetcher = query => gqlClient.request(query);

function sortStrings(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  if (a > b) {
    return 1;
  }

  if (a < b) {
    return -1;
  }

  return 0;
}

function setAuthHeader(authToken) {
  gqlClient.setHeader('authorization', authToken ? `Bearer ${authToken}` : '');  
}

function saveUser(user) {
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

function loadUser() {
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

function UserStatus(props) {
  if (props.user === null) {
    return null;
  }

  return (
    <div>
      <p>
        <span>{props.user.email}</span>
        <Link to="/signout">sign out</Link>
      </p>
    </div>
  )
}

function Messages(props) {
  if (props.messages.length == 0) {
    return <div></div>;
  }

  let messages = [<p key="0"><b>{props.messages[0]}</b></p>].concat(
    props.messages.slice(1).map((message, idx) => <p key={idx + 1}>{message}</p>)
  );

  return (
    <div>
      { messages }
    </div>
  )
}

function Game(props) {
  // FIXME: Lots of refactoring to do here.
  const [messages, setMessages] = useState([]);

  const { data, mutate } = useSWR(
    `{
      game(id: ${props.gameId}) {
        name
        chips {
          chipType
          count
        }
      }
    }`,
    fetcher, { refreshInterval: 2000 }
  );

  let body = null;

  if (!data || !data.game) {
    return (
      <div>loading...</div>
    );
  }

  return (
    <div>
      <h2>Game "{data.game.name}"</h2>

      <table>
        <tbody>
          { data.game.chips.sort((a, b) => sortStrings(a.chipType, b.chipType)).map(chipCount => (
            <tr key={chipCount.chipType}>
              <td>{chipCount.chipType}</td><td>{chipCount.count}</td>
              <td><button onClick={async () => {
                  const result = await gqlClient.request(`mutation {
                    returnChip(input: {gameId: ${props.gameId}, chipType: "${chipCount.chipType}"}) {
                      chipCount {
                        chipType
                      }
                      game {
                        name
                        chips {
                          chipType
                          count
                        }
                      }
                    }
                  }`);

                  setMessages([`returned a ${result.returnChip.chipCount.chipType} chip`].concat(messages));
                  mutate({ ...data, game: result.returnChip.game }, false);
                }}>Return chip</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={async () => {
        let result = await gqlClient.request(`mutation {
          takeChip(input: {gameId: ${props.gameId}}) {
            chipType
            game {
              name
              chips {
                chipType
                count
              }
            }
          }
        }`);

        setMessages([`got a ${result.takeChip.chipType} chip`].concat(messages));
        mutate({ ...data, game: result.takeChip.game }, false);
      }}>Take chip</button>

      <p>
        <Link to="/">Back to games</Link>
      </p>
      <Messages messages={messages}/>
    </div>
  );
}

function Games() {
  const { data } = useSWR(
    `{
      games {
        id
        name
      }
    }`,
    fetcher
  );

  if (!data) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>Games</h2>
      <div>
        <ul>
          { data.games.map(game => (
            <li key={game.id}><Link to={"game/" + game.id}>{game.name}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SignIn(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          let result = await gqlClient.request(`mutation {
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
          }`);

          props.onUserChange(result.signIn.user);
          navigate("/");
          }}>Sign In</button>
      </div>
      <div>
        <p>Or <Link to="/register">register</Link> a new account</p>
      </div>
    </div>
  );
}

function RegisterUser(props) {
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

function SignOut(props) {
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

function App() {
  const [user, setUser] = useState(loadUser());
  useEffect(() => {
    saveUser(user);
    const pathname = window.location.pathname;
    if (user === null && pathname != "/signin" && pathname != "/register") {
      navigate("/signin");
    }
  });

  return (
    <SWRConfig
      value={{
        refreshInterval: 10000,
        fetcher: (...args) => fetch(...args).then(res => res.json())
      }}
    >
      <h1>Fate Chips</h1>
      <UserStatus user={user} />
      <Router>
        <Games path="/" />
        <Game path="game/:gameId" />
        <RegisterUser path="/register" onUserChange={setUser} />
        <SignIn path="/signin" onUserChange={setUser} />
        <SignOut path="/signout" onUserChange={setUser} />
      </Router>
    </SWRConfig>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <App />,
    document.body.appendChild(document.createElement('div')),
  );
})
