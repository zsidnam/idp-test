const express = require('express');
const morgan = require('morgan');
const Provider = require('oidc-provider');

const app = express();
app.use(morgan('dev'));

const clients = [{
    client_id: 'test_implicit_app',
    client_secret: 'notSoSecret',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    redirect_uris: ['http://localhost:1337/auth/oauth2/callback/oauthtest'],
    token_endpoint_auth_method: 'client_secret_post'
}];

const oidc = new Provider('http://localhost:3500', {
    claims: {
        profile: ['birthdate']
    },
    // We want access token to be in form of JWT and to include basic user
    // info as Passport OAuth2.0 does not return the generated id token
    formats: {
        AccessToken: 'jwt'
    },
    features: {
        sessionManagement: true
    },
    async findById(ctx, id) {
        return {
            accountId: id,
            async claims() { return { sub: id, test: 'zac' }; }
        };
    }
});

oidc.initialize({
    clients
}).then(() => {
    app.use('/', oidc.callback);
    app.listen(3500);
});