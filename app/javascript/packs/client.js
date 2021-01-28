import { GraphQLClient } from 'graphql-request'

const API = '/graphql';
const csrfToken = document.querySelector('meta[name="csrf-token"]').attributes.content.value;

export const gqlClient = new GraphQLClient(API);
export const fetcher = query => gqlClient.request(query);

gqlClient.setHeader('X-CSRF-Token', csrfToken);

export async function mutateWithAuth(mutation, onUserError) {
  try {
    return await gqlClient.request(mutation);
  } catch (e) {
    if (e && e.response && e.response.errors && e.response.errors[0]
       && e.response.errors[0].message == 'User not signed in') {
         onUserError(e);
    } else {
      throw e;
    }
  }
  return null;
}

export function setAuthHeader(authToken) {
  gqlClient.setHeader('authorization', authToken ? `Bearer ${authToken}` : '');  
}
