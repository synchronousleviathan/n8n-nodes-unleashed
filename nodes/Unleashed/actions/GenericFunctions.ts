import {
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
} from 'n8n-workflow';
import { createHmac } from 'crypto';

const BASE_URL = 'https://api.unleashedsoftware.com';

/**
 * Build a raw query string from key/value pairs.
 *
 * The Unleashed API requires the HMAC signature to be computed over the
 * raw (unencoded) query string. Using URLSearchParams or encodeURIComponent
 * causes encoding (e.g. @ → %40, space → +) that produces a signature
 * mismatch → 403. We build the string manually and use it for both
 * the signature and the URL so they can never diverge.
 *
 * Null, undefined, and empty-string values are stripped.
 */
function buildQueryString(params: Record<string, any> | undefined): string {
  if (!params) return '';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      parts.push(`${key}=${String(value)}`);
    }
  }
  return parts.join('&');
}

/**
 * Make an authenticated API request to Unleashed.
 */
export async function unleashedApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: any,
  qs?: Record<string, any>,
): Promise<any> {
  const credentials = await this.getCredentials('unleashedApi');

  // One query string used for both signing and the URL
  const queryString = buildQueryString(qs);

  const signature = createHmac('sha256', credentials.apiKey as string)
    .update(queryString)
    .digest('base64');

  const url = queryString
    ? `${BASE_URL}${endpoint}?${queryString}`
    : `${BASE_URL}${endpoint}`;

  const options: IHttpRequestOptions = {
    method,
    body,
    url,
    headers: {
      'api-auth-id': credentials.apiId,
      'api-auth-signature': signature,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'client-type': 'n8nnodesunleashed/n8n',
    },
  };

  try {
    return await this.helpers.httpRequest(options);
  } catch (error) {
    // Always throw a plain Error to avoid circular-reference crashes
    // when n8n serializes the Axios error object.
    const status = error.statusCode || error.response?.status || 'unknown';
    const errBody = error.response?.body || error.response?.data;
    if (errBody) {
      const msg = (typeof errBody === 'object' && errBody.Message) ? errBody.Message
        : (typeof errBody === 'string') ? errBody
        : JSON.stringify(errBody);
      throw new Error(`Unleashed API error [${status}]: ${msg}`);
    }
    throw new Error(`Unleashed API error [${status}]: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Paginate through all results from an Unleashed API endpoint.
 */
export async function unleashedApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: any,
  query: Record<string, any> = {},
): Promise<any> {
  const returnData: any[] = [];
  let page = 1;

  // Spread to avoid mutating the caller's object
  const qs = { ...query, pageSize: 1000 };

  let responseData;
  do {
    responseData = await unleashedApiRequest.call(
      this, method, `${endpoint}/${page}`, body, qs,
    );
    returnData.push(...(responseData[propertyName] || []));
    page++;
  } while (
    responseData.Pagination &&
    responseData.Pagination.PageNumber < responseData.Pagination.NumberOfPages
  );

  return returnData;
}
