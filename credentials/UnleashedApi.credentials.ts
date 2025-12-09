import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class UnleashedApi implements ICredentialType {
  name = 'unleashedApi';
  displayName = 'Unleashed API';
  documentationUrl = 'https://apidocs.unleashedsoftware.com/';
  properties: INodeProperties[] = [
    {
      displayName: 'API ID',
      name: 'apiId',
      type: 'string',
      default: '',
      required: true,
      description: 'The Unleashed API ID',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The Unleashed API Key',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'api-auth-id': '={{$credentials.apiId}}',
        'api-auth-signature': '={{$credentials.apiKey}}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
				'client-type': 'n8nnodesunleashed/n8n'
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.unleashedsoftware.com',
      url: '/Customers',
      method: 'GET',
    },
  };
}
