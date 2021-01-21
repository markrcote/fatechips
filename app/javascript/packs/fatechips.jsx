import { setHeader, GraphQLClient } from 'graphql-request'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import useSWR, { SWRConfig } from 'swr'
import { Router, Link } from "@reach/router"

const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const USER_EMAIL_KEY = 'userEmail';
const API = '/graphql';
const csrfToken = document.querySelector('meta[name="csrf-token"]').attributes.content.value;
const authToken = localStorage.getItem(AUTH_TOKEN_KEY);

const client = new GraphQLClient(API);
client.setHeaders({
  'X-CSRF-Token': csrfToken,
  authorization: authToken ? `Bearer ${authToken}` : '',
});
const fetcher = query => client.request(query);

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
                  const result = await client.request(`mutation {
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
        let result = await client.request(`mutation {
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

function SignIn() {
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
          let result = await client.request(`mutation {
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

          localStorage.setItem(AUTH_TOKEN_KEY, result.signIn.user.authenticationToken);
          localStorage.setItem(USER_ID_KEY, result.signIn.user.id);
          localStorage.setItem(USER_EMAIL_KEY, result.signIn.user.email);
          }}>Sign In</button>
      </div>
    </div>
  );
}

function RegisterUser() {
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
          const result = await client.request(`mutation {
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
          }`)
        }}>Sign Up</button>
      </div>
    </div>
  )
}

function SignOut() {
  return (
    <div>
      <h2>Sign Out</h2>
      <div>Click to sign out:</div>
      <div>
        <button onClick={async () => {
          const result = await client.request(`mutation {
            signOut(input: {}) {
              user {
                id
                email
              }
            }
          }`);

          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_ID_KEY);
          localStorage.removeItem(USER_EMAIL_KEY);
        }}>Sign Out</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <SWRConfig
      value={{
        refreshInterval: 10000,
        fetcher: (...args) => fetch(...args).then(res => res.json())
      }}
    >
      <h1>Fate Chips</h1>
      <Router>
        <Games path="/" />
        <Game path="game/:gameId" />
        <RegisterUser path="/register" />
        <SignIn path="/signin" />
        <SignOut path="/signout" />
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
