import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import useSWR, { SWRConfig } from 'swr'
import { Link, Router, navigate } from '@reach/router'

import { fetcher, mutateWithAuth } from './client.js';
import { SignIn, RegisterUser, SignOut, loadUser, saveUser } from './users'

let chipTypeWeights = new Map([
  ['white', 3],
  ['blue', 2],
  ['red', 1],
  ['legend', 0],
]);

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

function sortChipTypes(a, b) {
  let weightA = chipTypeWeights.get(a.toLowerCase());
  let weightB = chipTypeWeights.get(b.toLowerCase());

  if (weightA === undefined && weightB === undefined) {
    return sortStrings(a, b);
  }

  if (weightA === undefined) {
    return 1;
  }

  if (weightB === undefined) {
    return -1;
  }

  return weightB - weightA;
}

function UserStatus(props) {
  if (props.user === null) {
    return null;
  }

  return (
    <div className="userstatus">
      <div className="signoutlink">
        <Link to="/signout">sign out</Link>
      </div>
      <div className="useremail">{props.user.email}</div>
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
          { props.chipPool.chipCount.sort((a, b) => sortChipTypes(a.chipType, b.chipType)).map(chipCount => (
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

function Player(props) {
  return (
    <div>
      <h3>Your chips</h3>
      <ChipPool chipPool={props.player.chipPool} onReturnChip={props.onReturnChip} />
    </div>
  )
}

function Game(props) {
  // FIXME: This leads to a memory-leak error.
  if (props.user === null) {
    return null;
  }
  const [messages, setMessages] = useState([]);

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
           id
           chipPool {
             chipCount {
               chipType
               count
             }
           }
           user {
             id
           }
         }
       }
     }`,
    fetcher, { refreshInterval: 2000 }
  );

  if (!data || !data.game) {
    return (
      <div>loading...</div>
    );
  }

  let currentPlayer = data.game.player.find(player => player.user.id == props.user.id);
  let currentPlayerComp = currentPlayer ? <Player player={currentPlayer} onReturnChip={handleReturnChip} /> : <div>you have no player in this game</div>;

  async function handleReturnChip(chipType) {
    const result = await mutateWithAuth(`mutation {
      returnChip(input: {playerId: ${currentPlayer.id}, chipType: "${chipType}"}) {
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
            id
            chipPool {
              chipCount {
                chipType
                count
              }
            }
            user {
              id
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
      takeChip(input: {playerId: ${currentPlayer.id}}) {
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
            id
            chipPool {
              chipCount {
                chipType
                count
              }
            }
            user {
              id
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

  return (
    <div>
      <h2>Game "{data.game.name}"</h2>

      <div className="primarycontainer">
        <div className="primary">
          {currentPlayerComp}
        </div>
        <div className="primary">
          <h3>Pool</h3>
          <ChipPool chipPool={data.game.chipPool} onTakeChip={handleTakeChip} />
        </div>
      </div>

      <p className="backlink">
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
      <div className="header">
        <UserStatus user={user} />
        <h1 className="pagetitle">Fate Chips</h1>
      </div>
      <div className="content">
        <Router>
          <Games path="/" />
          <Game path="game/:gameId" user={user} onUserError={() => {setUser(null)}} />
          <RegisterUser path="/register" onUserChange={setUser} />
          <SignIn path="/signin" onUserChange={setUser} />
          <SignOut path="/signout" onUserChange={setUser} />
        </Router>
      </div>
    </SWRConfig>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <App />,
    document.body.appendChild(document.createElement('div')),
  );
})
