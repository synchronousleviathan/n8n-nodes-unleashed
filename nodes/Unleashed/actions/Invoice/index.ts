import { IExecuteFunctions } from 'n8n-workflow';
import { unleashedApiRequest, unleashedApiRequestAllItems } from '../GenericFunctions';

/**
 * Handle all Invoice operations
 */
export async function handleInvoice(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  // Get Invoice ID for single operations
  let invoiceId = '';
  if (['get'].includes(operation)) {
    invoiceId = this.getNodeParameter('invoiceId', itemIndex) as string;
  }
  
  // Handle operations
  if (operation === 'get') {
    // Get a single invoice
    return await unleashedApiRequest.call(this, 'GET', `/Invoices/${invoiceId}`);
  }
  
  if (operation === 'getAll') {
    // Get all invoices with optional filters
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as {
      startDate?: string;
      endDate?: string;
      customerId?: string;
      invoiceStatus?: string;
    };
    
    const qs: any = {};
    
    // Add filters to query string
    if (filters.startDate) qs.startDate = filters.startDate;
    if (filters.endDate) qs.endDate = filters.endDate;
    if (filters.customerId) qs.customerId = filters.customerId;
    if (filters.invoiceStatus) qs.invoiceStatus = filters.invoiceStatus;
    
    if (returnAll) {
      // Get all results
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/Invoices', {}, qs);
    } else {
      // Get limited results
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/Invoices', {}, qs);
      return response.Items || [];
    }
  }
  
  return null;
}
