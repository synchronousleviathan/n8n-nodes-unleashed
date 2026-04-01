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
  // Get SalesOrder GUID for single operations
  let salesOrderGuid = '';
  if (['get', 'update', 'complete'].includes(operation)) {
    salesOrderGuid = this.getNodeParameter('salesOrderGuid', itemIndex) as string;
  }

  // Handle operations
  if (operation === 'get') {
    return await unleashedApiRequest.call(this, 'GET', `/SalesOrders/${salesOrderGuid}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as Record<string, any>;

    const qs: any = {};

    // Add filters to query string
    if (filters.startDate) qs.startDate = filters.startDate;
    if (filters.endDate) qs.endDate = filters.endDate;
    if (filters.modifiedSince) qs.modifiedSince = filters.modifiedSince;
    if (filters.orderStatus) qs.orderStatus = filters.orderStatus;
    if (filters.customerCode) qs.customerCode = filters.customerCode;
    if (filters.customerName) qs.customerName = filters.customerName;
    if (filters.orderNumber) qs.orderNumber = filters.orderNumber;
    if (filters.warehouseCode) qs.warehouseCode = filters.warehouseCode;
    if (filters.warehouseName) qs.warehouseName = filters.warehouseName;
    if (filters.salesPerson) qs.salesPerson = filters.salesPerson;
    if (filters.deliveryMethod) qs.deliveryMethod = filters.deliveryMethod;
    if (filters.deliveryName) qs.deliveryName = filters.deliveryName;
    if (filters.serials) qs.serials = filters.serials;
    if (filters.batchNumbers) qs.batchNumbers = filters.batchNumbers;
    if (filters.sourceId) qs.sourceId = filters.sourceId;
    if (filters.orderBy) qs.orderBy = filters.orderBy;
    if (filters.sort) qs.sort = filters.sort;

    if (returnAll) {
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/SalesOrders', {}, qs);
    } else {
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/SalesOrders/1', {}, qs);
      return response.Items || [];
    }
  }

  if (operation === 'create') {
    const customerCode = this.getNodeParameter('customerCode', itemIndex) as string;
    const salesOrderDetails = this.getNodeParameter('salesOrderDetails', itemIndex, {}) as Record<string, any>;
    const salesOrderLineItems = this.getNodeParameter('salesOrderLineItems', itemIndex, {
      lineItems: [],
    }) as { lineItems: Array<Record<string, any>> };

    // Build request body
    const body: any = {
      Customer: {
        CustomerCode: customerCode,
      },
      SalesOrderLines: salesOrderLineItems.lineItems.map(mapLineItem),
    };

    // Apply optional details
    applySalesOrderDetails(body, salesOrderDetails);

    return await unleashedApiRequest.call(this, 'POST', '/SalesOrders', body);
  }

  if (operation === 'update') {
    // Fetch current order first — the API does not support partial updates
    const currentSalesOrder = await unleashedApiRequest.call(this, 'GET', `/SalesOrders/${salesOrderGuid}`);

    const salesOrderDetails = this.getNodeParameter('salesOrderDetails', itemIndex, {}) as Record<string, any>;
    const salesOrderLineItems = this.getNodeParameter('salesOrderLineItems', itemIndex, {
      lineItems: [],
    }) as { lineItems: Array<Record<string, any>> };

    const body = { ...currentSalesOrder };

    // Apply updated fields
    applySalesOrderDetails(body, salesOrderDetails);

    // Update line items if provided
    if (salesOrderLineItems.lineItems.length > 0) {
      body.SalesOrderLines = salesOrderLineItems.lineItems.map(mapLineItem);
    }

    return await unleashedApiRequest.call(this, 'POST', `/SalesOrders/${salesOrderGuid}`, body);
  }

  if (operation === 'complete') {
    return await unleashedApiRequest.call(this, 'POST', `/SalesOrders/${salesOrderGuid}/Complete`);
  }

  return null;
}

function applySalesOrderDetails(body: any, d: Record<string, any>) {
  if (d.orderNumber) body.OrderNumber = d.orderNumber;
  if (d.orderDate) body.OrderDate = d.orderDate;
  if (d.requiredDate) body.RequiredDate = d.requiredDate;
  if (d.completedDate) body.CompletedDate = d.completedDate;
  if (d.orderStatus) body.OrderStatus = d.orderStatus;
  if (d.taxRate != null) body.TaxRate = d.taxRate;
  if (d.taxCode) body.Tax = { TaxCode: d.taxCode };
  if (d.comments) body.Comments = d.comments;
  if (d.deliveryInstruction) body.DeliveryInstruction = d.deliveryInstruction;
  if (d.deliveryName) body.DeliveryName = d.deliveryName;
  if (d.deliveryMethod) body.DeliveryMethod = d.deliveryMethod;
  if (d.deliveryStreetAddress) body.DeliveryStreetAddress = d.deliveryStreetAddress;
  if (d.deliveryStreetAddress2) body.DeliveryStreetAddress2 = d.deliveryStreetAddress2;
  if (d.deliverySuburb) body.DeliverySuburb = d.deliverySuburb;
  if (d.deliveryCity) body.DeliveryCity = d.deliveryCity;
  if (d.deliveryRegion) body.DeliveryRegion = d.deliveryRegion;
  if (d.deliveryCountry) body.DeliveryCountry = d.deliveryCountry;
  if (d.deliveryPostCode) body.DeliveryPostCode = d.deliveryPostCode;
  if (d.customerRef) body.CustomerRef = d.customerRef;
  if (d.exchangeRate != null) body.ExchangeRate = d.exchangeRate;
  if (d.discountRate != null) body.DiscountRate = d.discountRate;
  if (d.paymentDueDate) body.PaymentDueDate = d.paymentDueDate;
  if (d.sourceId) body.SourceId = d.sourceId;

  // Nested objects from flat fields
  if (d.currencyCode) {
    body.Currency = { CurrencyCode: d.currencyCode };
  }
  if (d.salespersonEmail || d.salespersonFullName) {
    body.SalesPerson = {};
    if (d.salespersonEmail) body.SalesPerson.Email = d.salespersonEmail;
    if (d.salespersonFullName) body.SalesPerson.FullName = d.salespersonFullName;
  }
  if (d.warehouseCode) {
    body.Warehouse = { WarehouseCode: d.warehouseCode };
  }
  if (d.paymentTerm) body.PaymentTerm = d.paymentTerm;
  if (d.salesOrderGroup) body.SalesOrderGroup = d.salesOrderGroup;
}

function mapLineItem(item: Record<string, any>) {
  const line: any = {
    Product: {
      ProductCode: item.productCode,
    },
    OrderQuantity: item.quantity,
  };
  if (item.unitPrice != null) line.UnitPrice = item.unitPrice;
  if (item.discountRate != null) line.DiscountRate = item.discountRate;
  if (item.lineNumber != null) line.LineNumber = item.lineNumber;
  if (item.comments) line.Comments = item.comments;
  if (item.taxCode) line.LineTax = { TaxCode: item.taxCode };
  if (item.dueDate) line.DueDate = item.dueDate;
  return line;
}
