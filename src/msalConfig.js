import { LogLevel, PublicClientApplication }  from '@azure/msal-browser';

// Config object to be passed to Msal on creation
const msalConfig = {
  auth: {
    clientId: '3c597909-2ef8-4e62-b43b-6b3493857fb8',
    authority: 'https://login.microsoftonline.com/509e9f09-231d-4d91-ba4a-bbe87d51d16d',
    redirectUri: '/', // Must be registered as a SPA redirectURI on your app registration
    postLogoutRedirectUri: '/' // Must be registered as a SPA redirectURI on your app registration
  },
  cache: {
    cacheLocation: 'localStorage'
  },
  system: {
      loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
              if (containsPii) {
                  return;
              }
              switch (level) {
                  case LogLevel.Error:
                      console.error(message);
                      return;
                  case LogLevel.Info:
                      console.info(message);
                      return;
                  case LogLevel.Verbose:
                      console.debug(message);
                      return;
                  case LogLevel.Warning:
                      console.warn(message);
                      return;
                  default:
                      return;
              }
          },
          logLevel: LogLevel.Verbose
      }
  }
};

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize()
// Add here scopes for id token to be used at MS Identity Platform endpoints.
const loginRequest = {
  scopes: ['User.Read'],
};

// Add here the endpoints for MS Graph API services you would like to use.
const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// In msalConfig.js
export default {
    msalConfig,
    msalInstance,
    loginRequest,
    graphConfig
  };
  
