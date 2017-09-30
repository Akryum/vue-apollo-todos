import Vue from 'vue'
import { ApolloClient, createBatchingNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'

const apolloClient = new ApolloClient({
	networkInterface: createBatchingNetworkInterface({
		uri: 'https://api.graph.cool/simple/v1/cj1jvw20v3n310152sv0sirl7',
	}),
	connectToDevTools: true,
})

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
	defaultClient: apolloClient,
})

export default apolloProvider
