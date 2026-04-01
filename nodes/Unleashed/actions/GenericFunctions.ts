import {
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
} from 'n8n-workflow';
import { createHmac } from 'crypto';

/**
 * Make an API request to Unleashed
 */
export async function unleashedApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: any,
  qs?: any,
): Promise<any> {
  const credentials = await this.getCredentials('unleashedApi');
  const options: IHttpRequestOptions = {
    method,
    body,
    url: '',
    headers: {},
  };

  // Convert query parameters to string
  const queryString = new URLSearchParams(qs || {}).toString();
  
  // Create the API signature using the API key
  const signature = createHmac('sha256', credentials.apiKey as string)
    .update(queryString)
    .digest('base64');

  // Set the request headers
  options.headers = {
    'api-auth-id': credentials.apiId,
    'api-auth-signature': signature,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'client-type': 'n8nnodesunleashed/n8n',
  };

  // Build the URL
  const baseUrl = 'https://api.unleashedsoftware.com';
  options.url = `${baseUrl}${endpoint}`;
  
  // Add query parameters to URL if they exist
  if (queryString) {
    options.url += `?${queryString}`;
  }

  try {
    return await this.helpers.httpRequest(options);
  } catch (error) {
    if (error.response?.body) {
      // Try to return the error prettier
      const errorBody = error.response.body;
      if (errorBody.Message) {
        throw new Error(`Unleashed error response [${error.statusCode}]: ${errorBody.Message}`);
      } else if (typeof errorBody === 'string') {
        throw new Error(`Unleashed error response [${error.statusCode}]: ${errorBody}`);
      }
    }
    throw error;
  }
}

/**
 * Make an API request to fetch all items
 */
export async function unleashedApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: any,
  query: any = {},
): Promise<any> {
  const returnData: any[] = [];
  
  let responseData;
  let page = 1;
  query.pageSize = 1000; // Maximum page size

  do {
    responseData = await unleashedApiRequest.call(this, method, `${endpoint}/${page}`, body, query);
    returnData.push.apply(returnData, responseData[propertyName] || []);
    page++;
  } while (
    responseData.Pagination &&
    responseData.Pagination.PageNumber < responseData.Pagination.NumberOfPages
  );
  
  return returnData;
}
