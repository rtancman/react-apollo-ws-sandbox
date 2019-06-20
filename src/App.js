import React, { Component } from 'react';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider, Subscription, Query } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import gql from 'graphql-tag';

import logo from './logo.svg';
import './App.css';

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/graphql'
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:8080/subscriptions?tenantID=280921027681`,
  options: {
    reconnect: true,
    lazy: true,
  },
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link:  link,
  cache: new InMemoryCache()
});

const CONTACT_SUBSCRIPTION = gql`
  subscription sub($entityUuid: String!) {
    contact(entity_uuid: $entityUuid){
      entity_uuid
      name
      website
      email
      conversions_sum
    }
  }
`;

const Messages = ({ entityUuid }) => (
  <Subscription
    subscription={CONTACT_SUBSCRIPTION}
    variables={{entityUuid}}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :</p>;
      return (
        <div>
          <h1>Meus novos leads:</h1>
          <h2>{data.contact.name}</h2>
          <h2>{data.contact.email}</h2>
        </div>
      );
    }}
  </Subscription>
);

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <Messages entityUuid="90f76931-1017-4d3c-b75b-4bd95a6a553a" />
          </header>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;