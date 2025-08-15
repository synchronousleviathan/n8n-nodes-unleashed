import { IExecuteFunctions } from 'n8n-workflow';
import { unleashedApiRequest, unleashedApiRequestAllItems } from '../GenericFunctions';

/**
 * Handle all SalesOrder operations
 */
export async function handleSalesOrder(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  // Get SalesOrder ID for single operations
  let salesOrderId = '';
  if (['get', 'update', 'complete'].includes(operation)) {
    salesOrderId = this.getNodeParameter('salesOrderId', itemIndex) as string;
  }
  
  // Handle operations
  if (operation === 'get') {
    // Get a single sales order
    return await unleashedApiRequest.call(this, 'GET', `/SalesOrders/${salesOrderId}`);
  }
  
  if (operation === 'getAll') {
    // Get all sales orders with optional filters
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as {
      startDate?: string;
      endDate?: string;
      customerId?: string;
      orderStatus?: string;
    };
    
    const qs: any = {};
    
    // Add filters to query string
    if (filters.startDate) qs.startDate = filters.startDate;
    if (filters.endDate) qs.endDate = filters.endDate;
    if (filters.customerId) qs.customerId = filters.customerId;
    if (filters.orderStatus) qs.orderStatus = filters.orderStatus;
    
    if (returnAll) {
      // Get all results
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/SalesOrders', {}, qs);
    } else {
      // Get limited results
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/SalesOrders', {}, qs);
      return response.Items || [];
    }
  }
  
  if (operation === 'create') {
    // Create a new sales order
    const customerCode = this.getNodeParameter('customerCode', itemIndex) as string;
    const salesOrderDetails = this.getNodeParameter('salesOrderDetails', itemIndex, {}) as {
      orderNumber?: string;
      orderDate?: string;
      requiredDate?: string;
      taxRate?: number;
      currency?: string;
      comments?: string;
      deliveryInstruction?: string;
    };
    
    const salesOrderLineItems = this.getNodeParameter('salesOrderLineItems', itemIndex, {
      lineItems: [],
    }) as { lineItems: Array<{
      productCode: string;
      quantity: number;
      unitPrice?: number;
      discountPercentage?: number;
    }>};
    
    // Build request body
    const body: any = {
      Customer: {
        CustomerCode: customerCode,
      },
      SalesOrderLines: salesOrderLineItems.lineItems.map(item => ({
        Product: {
          ProductCode: item.productCode,
        },
        OrderQuantity: item.quantity,
        UnitPrice: item.unitPrice || 0,
        DiscountRate: item.discountPercentage || 0,
      })),
    };
    
    // Add optional fields if provided
    if (salesOrderDetails.orderNumber) body.OrderNumber = salesOrderDetails.orderNumber;
    if (salesOrderDetails.orderDate) body.OrderDate = salesOrderDetails.orderDate;
    if (salesOrderDetails.requiredDate) body.RequiredDate = salesOrderDetails.requiredDate;
    if (salesOrderDetails.taxRate) body.TaxRate = salesOrderDetails.taxRate;
    if (salesOrderDetails.currency) body.Currency = salesOrderDetails.currency;
    if (salesOrderDetails.comments) body.Comments = salesOrderDetails.comments;
    if (salesOrderDetails.deliveryInstruction !== undefined) body.DeliveryInstruction = salesOrderDetails.deliveryInstruction;
    
    return await unleashedApiRequest.call(this, 'POST', '/SalesOrders', body);
  }
  
  if (operation === 'update') {
    // Update an existing sales order
    // First, get the current sales order data
    const currentSalesOrder = await unleashedApiRequest.call(this, 'GET', `/SalesOrders/${salesOrderId}`);
    
    const salesOrderDetails = this.getNodeParameter('salesOrderDetails', itemIndex, {}) as {
      orderNumber?: string;
      orderDate?: string;
      requiredDate?: string;
      taxRate?: number;
      currency?: string;
      comments?: string;
      deliveryInstruction?: string;
    };
    
    const salesOrderLineItems = this.getNodeParameter('salesOrderLineItems', itemIndex, {
      lineItems: [],
    }) as { lineItems: Array<{
      productCode: string;
      quantity: number;
      unitPrice?: number;
      discountPercentage?: number;
    }>};
    
    // Prepare the update body with existing data
    const body = { ...currentSalesOrder };
    
    // Update fields if provided
    if (salesOrderDetails.orderNumber) body.OrderNumber = salesOrderDetails.orderNumber;
    if (salesOrderDetails.orderDate) body.OrderDate = salesOrderDetails.orderDate;
    if (salesOrderDetails.requiredDate) body.RequiredDate = salesOrderDetails.requiredDate;
    if (salesOrderDetails.taxRate) body.TaxRate = salesOrderDetails.taxRate;
    if (salesOrderDetails.currency) body.Currency = salesOrderDetails.currency;
    if (salesOrderDetails.comments) body.Comments = salesOrderDetails.comments;
    if (salesOrderDetails.deliveryInstruction !== undefined) body.DeliveryInstruction = salesOrderDetails.deliveryInstruction;
    
    // Update line items if provided
    if (salesOrderLineItems.lineItems.length > 0) {
      body.SalesOrderLines = salesOrderLineItems.lineItems.map(item => ({
        Product: {
          ProductCode: item.productCode,
        },
        OrderQuantity: item.quantity,
        UnitPrice: item.unitPrice || 0,
        DiscountRate: item.discountPercentage || 0,
      }));
    }
    
    return await unleashedApiRequest.call(this, 'PUT', `/SalesOrders/${salesOrderId}`, body);
  }
  
  if (operation === 'complete') {
    // Complete a sales order
    return await unleashedApiRequest.call(this, 'POST', `/SalesOrders/${salesOrderId}/Complete`);
  }
  
  return null;
}
