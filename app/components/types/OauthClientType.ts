type OauthClientType = {
    id: string,
    client_name: string,
    redirect_uris: string[],
    grant_types: string[],
    response_types: string[],
    scope: string,
    token_endpoint_auth_method: string,
    application_type: string
};