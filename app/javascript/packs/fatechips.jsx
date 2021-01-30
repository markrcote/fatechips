import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import useSWR, { SWRConfig } from 'swr'
import { Link, Router, navigate } from '@reach/router'

import { fetcher, mutateWithAuth } from './client.js';
import { SignIn, RegisterUser, SignOut, loadUser, saveUser } from './users'

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

function ChipPool(props) {
  return (
    <div>
      <table>
        <tbody>
          { props.chipPool.chipCount.sort((a, b) => sortStrings(a.chipType, b.chipType)).map(chipCount => (
            <tr key={chipCount.chipType}>
              <td>{chipCount.chipType}</td><td>{chipCount.count}</td>
              { 
                props.onReturnChip &&
                <td><button onClick={async () => props.onReturnChip(chipCount.chipType)}>Return chip</button></td>
              }
            </tr>
          ))}
        </tbody>
      </table>

      { props.onTakeChip && <button onClick={props.onTakeChip}>Take chip</button> }
    </div>
  );
}

function Game(props) {
  // FIXME: Lots of refactoring to do here.
  const [messages, setMessages] = useState([]);

  async function handleReturnChip(chipType) {
    const result = await mutateWithAuth(`mutation {
      returnChip(input: {gameId: ${props.gameId}, chipType: "${chipType}"}) {
        chipCount {
          chipType
        }
        game {
          name
          chipPool {
            chipCount {
              chipType
              count
            }
          }
          player {
            chipPool {
              chipCount {
                chipType
                count
              }
            }
          }
        }
      }
    }`, props.onUserError);

    if (result === null) {
      return;
    }

    setMessages([`returned a ${result.returnChip.chipCount.chipType} chip`].concat(messages));
    mutate({ ...data, game: result.returnChip.game }, false);
  }

  async function handleTakeChip() {
    let result = await mutateWithAuth(`mutation {
      takeChip(input: {gameId: ${props.gameId}}) {
        chipType
        game {
          name
          chipPool {
            chipCount {
              chipType
              count
            }
          }
          player {
            chipPool {
              chipCount {
                chipType
                count
              }
            }
          }
        }
      }
    }`, props.onUserError);

    if (result === null) {
      return;
    }

    setMessages([`got a ${result.takeChip.chipType} chip`].concat(messages));
    mutate({ ...data, game: result.takeChip.game }, false);
  }

  const { data, mutate } = useSWR(
    `{
       game(id: ${props.gameId}) {
         name
         chipPool {
           chipCount {
             chipType
             count
           }
         }
         player {
           chipPool {
             chipCount {
               chipType
               count
             }
           }
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

      <ChipPool chipPool={data.game.chipPool} onReturnChip={handleReturnChip} onTakeChip={handleTakeChip} />

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
        <Game path="game/:gameId" onUserError={() => {setUser(null)}} />
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
