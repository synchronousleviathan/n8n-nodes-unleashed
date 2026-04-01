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
  // Get Invoice GUID for single operations
  let invoiceGuid = '';
  if (['get', 'update'].includes(operation)) {
    invoiceGuid = this.getNodeParameter('invoiceGuid', itemIndex) as string;
  }

  // Handle operations
  if (operation === 'get') {
    return await unleashedApiRequest.call(this, 'GET', `/Invoices/${invoiceGuid}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as Record<string, any>;

    const qs: any = {};

    if (filters.startDate) qs.startDate = filters.startDate;
    if (filters.endDate) qs.endDate = filters.endDate;
    if (filters.modifiedSince) qs.modifiedSince = filters.modifiedSince;
    if (filters.invoiceStatus) qs.invoiceStatus = filters.invoiceStatus;
    if (filters.invoiceNumber) qs.invoiceNumber = filters.invoiceNumber;
    if (filters.orderNumber) qs.orderNumber = filters.orderNumber;
    if (filters.customerCode) qs.customerCode = filters.customerCode;
    if (filters.customerName) qs.customerName = filters.customerName;
    if (filters.warehouseCode) qs.warehouseCode = filters.warehouseCode;
    if (filters.warehouseName) qs.warehouseName = filters.warehouseName;
    if (filters.serials) qs.serials = filters.serials;
    if (filters.batchNumbers) qs.batchNumbers = filters.batchNumbers;
    if (filters.orderBy) qs.orderBy = filters.orderBy;
    if (filters.sort) qs.sort = filters.sort;

    if (returnAll) {
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/Invoices', {}, qs);
    } else {
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/Invoices/1', {}, qs);
      return response.Items || [];
    }
  }

  if (operation === 'create') {
    const customerCode = this.getNodeParameter('customerCode', itemIndex) as string;
    const invoiceDetails = this.getNodeParameter('invoiceDetails', itemIndex, {}) as Record<string, any>;
    const invoiceLineItems = this.getNodeParameter('invoiceLineItems', itemIndex, {
      lineItems: [],
    }) as { lineItems: Array<Record<string, any>> };

    const body: any = {
      Customer: {
        CustomerCode: customerCode,
      },
      InvoiceLines: invoiceLineItems.lineItems.map(mapInvoiceLine),
    };

    applyInvoiceDetails(body, invoiceDetails);

    return await unleashedApiRequest.call(this, 'POST', '/Invoices', body);
  }

  if (operation === 'update') {
    // Fetch current invoice first — the API does not support partial updates
    const currentInvoice = await unleashedApiRequest.call(this, 'GET', `/Invoices/${invoiceGuid}`);

    const invoiceDetails = this.getNodeParameter('invoiceDetails', itemIndex, {}) as Record<string, any>;
    const invoiceLineItems = this.getNodeParameter('invoiceLineItems', itemIndex, {
      lineItems: [],
    }) as { lineItems: Array<Record<string, any>> };

    const body = { ...currentInvoice };

    applyInvoiceDetails(body, invoiceDetails);

    if (invoiceLineItems.lineItems.length > 0) {
      body.InvoiceLines = invoiceLineItems.lineItems.map(mapInvoiceLine);
    }

    return await unleashedApiRequest.call(this, 'POST', `/Invoices/${invoiceGuid}`, body);
  }

  return null;
}

function applyInvoiceDetails(body: any, d: Record<string, any>) {
  if (d.invoiceNumber) body.InvoiceNumber = d.invoiceNumber;
  if (d.invoiceDate) body.InvoiceDate = d.invoiceDate;
  if (d.dueDate) body.DueDate = d.dueDate;
  if (d.invoiceStatus) body.InvoiceStatus = d.invoiceStatus;
  if (d.taxRate != null) body.TaxRate = d.taxRate;
  if (d.taxCode) body.Tax = { TaxCode: d.taxCode };
  if (d.comments) body.Comments = d.comments;
  if (d.customerRef) body.CustomerRef = d.customerRef;
  if (d.exchangeRate != null) body.ExchangeRate = d.exchangeRate;
  if (d.discountRate != null) body.DiscountRate = d.discountRate;
  if (d.paymentDueDate) body.PaymentDueDate = d.paymentDueDate;
  if (d.salesOrderNumber) body.SalesOrderNumber = d.salesOrderNumber;
  if (d.deliveryName) body.DeliveryName = d.deliveryName;
  if (d.deliveryStreetAddress) body.DeliveryStreetAddress = d.deliveryStreetAddress;
  if (d.deliveryStreetAddress2) body.DeliveryStreetAddress2 = d.deliveryStreetAddress2;
  if (d.deliverySuburb) body.DeliverySuburb = d.deliverySuburb;
  if (d.deliveryCity) body.DeliveryCity = d.deliveryCity;
  if (d.deliveryRegion) body.DeliveryRegion = d.deliveryRegion;
  if (d.deliveryCountry) body.DeliveryCountry = d.deliveryCountry;
  if (d.deliveryPostCode) body.DeliveryPostCode = d.deliveryPostCode;

  if (d.currencyCode) {
    body.Currency = { CurrencyCode: d.currencyCode };
  }
  if (d.warehouseCode) {
    body.Warehouse = { WarehouseCode: d.warehouseCode };
  }
}

function mapInvoiceLine(item: Record<string, any>) {
  const line: any = {
    Product: {
      ProductCode: item.productCode,
    },
    InvoiceQuantity: item.quantity,
  };
  if (item.unitPrice != null) line.UnitPrice = item.unitPrice;
  if (item.discountRate != null) line.DiscountRate = item.discountRate;
  if (item.lineNumber != null) line.LineNumber = item.lineNumber;
  if (item.comments) line.Comments = item.comments;
  if (item.taxCode) line.LineTax = { TaxCode: item.taxCode };
  return line;
}
