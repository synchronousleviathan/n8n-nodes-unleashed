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

  // Build query string manually without URL-encoding values.
  // The Unleashed API expects the HMAC signature to be computed over
  // the raw query string, and URL-encoding (e.g. @ → %40) causes
  // a signature mismatch → 403.
  const queryParts: string[] = [];
  for (const [key, value] of Object.entries(qs || {})) {
    if (value != null && value !== '') {
      queryParts.push(`${key}=${String(value)}`);
    }
  }
  const queryString = queryParts.join('&');
  
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
    // Extract a clean error message to avoid circular reference issues
    // when n8n tries to serialize the Axios error object
    const status = error.statusCode || error.response?.status || 'unknown';
    const body = error.response?.body || error.response?.data;
    if (body) {
      const msg = (typeof body === 'object' && body.Message) ? body.Message
        : (typeof body === 'string') ? body
        : JSON.stringify(body);
      throw new Error(`Unleashed API error [${status}]: ${msg}`);
    }
    throw new Error(`Unleashed API error [${status}]: ${error.message || 'Unknown error'}`);
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
