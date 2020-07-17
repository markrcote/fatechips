// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import { request } from 'graphql-request'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import useSWR, { SWRConfig } from 'swr'
import { Router, Link } from "@reach/router"

const API = '/graphql'
const fetcher = query => request(API, query)

function Messages(props) {
  return (
    <div>
      { props.messages }
    </div>
  )
}

function Game(props) {
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
    fetcher
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
          { data.game.chips.map(chipCount => (
            <tr key={chipCount.chipType}>
              <td>{chipCount.chipType}</td><td>{chipCount.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={async () => {
        request(API, `mutation {
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
        }`).then((result) => {
          setMessages("got a " + result.takeChip.chipType + " chip");
          mutate(API, result.takeChip.game, false);
        })
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

  let body = null;

  if (!data) {
    body = <div>loading...</div>;
  } else {
    body = <div>
      <ul>
        { data.games.map(game => (
          <li key={game.id}><Link to={"game/" + game.id}>{game.name}</Link></li>
        ))}
      </ul>
    </div>;
  }

  return (
    <div className="games">
      <h2>Games</h2>
      {body}
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
