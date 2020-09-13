import { request } from 'graphql-request'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import useSWR, { SWRConfig } from 'swr'
import { Router, Link } from "@reach/router"

const API = '/graphql'
const fetcher = query => request(API, query)

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
          { data.game.chips.sort((a, b) => a.chipType - b.chipType).map(chipCount => (
            <tr key={chipCount.chipType}>
              <td>{chipCount.chipType}</td><td>{chipCount.count}</td>
              <td><button onClick={async () => {
                  const result = await request(API, `mutation {
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
        let result = await request(API, `mutation {
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
