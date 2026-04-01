import { IExecuteFunctions } from 'n8n-workflow';
import { unleashedApiRequest, unleashedApiRequestAllItems } from '../GenericFunctions';

/**
 * Handle all Customer operations
 */
export async function handleCustomer(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  // Get Customer GUID or Code for single operations
  let customerGuid = '';
  if (['get', 'update'].includes(operation)) {
    customerGuid = this.getNodeParameter('customerGuid', itemIndex) as string;
  }

  // Handle operations
  if (operation === 'get') {
    // Get a single customer by GUID
    return await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
  }

  if (operation === 'getAll') {
    // Get all customers with optional filters
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as {
      customer?: string;
      customerCode?: string;
      customerName?: string;
      customerType?: string;
      contactEmail?: string;
      currency?: string;
      sellPriceTier?: string;
      salesOrderGroup?: string;
      modifiedSince?: string;
      includeObsolete?: boolean;
      includeAllContacts?: boolean;
      stopCredit?: boolean;
      xeroContactId?: string;
      orderBy?: string;
      sort?: string;
    };

    const qs: any = {};

    // Add filters to query string
    if (filters.customer) qs.customer = filters.customer;
    if (filters.customerCode) qs.customerCode = filters.customerCode;
    if (filters.customerName) qs.customerName = filters.customerName;
    if (filters.customerType) qs.customerType = filters.customerType;
    if (filters.contactEmail) qs.contactEmail = filters.contactEmail;
    if (filters.currency) qs.currency = filters.currency;
    if (filters.sellPriceTier) qs.sellPriceTier = filters.sellPriceTier;
    if (filters.salesOrderGroup) qs.salesOrderGroup = filters.salesOrderGroup;
    if (filters.modifiedSince) qs.modifiedSince = filters.modifiedSince;
    if (filters.includeObsolete != null) qs.includeObsolete = filters.includeObsolete;
    if (filters.includeAllContacts != null) qs.includeAllContacts = filters.includeAllContacts;
    if (filters.stopCredit != null) qs.stopCredit = filters.stopCredit;
    if (filters.xeroContactId) qs.xeroContactId = filters.xeroContactId;
    if (filters.orderBy) qs.orderBy = filters.orderBy;
    if (filters.sort) qs.sort = filters.sort;

    if (returnAll) {
      // Get all results
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/Customers', {}, qs);
    } else {
      // Get limited results
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/Customers/1', {}, qs);
      return response.Items || [];
    }
  }

  if (operation === 'create') {
    // Create a new customer
    const customerCode = this.getNodeParameter('customerCode', itemIndex) as string;
    const customerName = this.getNodeParameter('customerName', itemIndex) as string;
    const customerDetails = this.getNodeParameter('customerDetails', itemIndex, {}) as Record<string, any>;

    const customerAddresses = this.getNodeParameter('customerAddresses', itemIndex, {
      addresses: [],
    }) as { addresses: Array<Record<string, any>> };

    // Build request body
    const body: any = {
      CustomerCode: customerCode,
      CustomerName: customerName,
    };

    // Map flat detail fields to API body
    applyCustomerDetails(body, customerDetails);

    // Add addresses if provided
    if (customerAddresses.addresses.length > 0) {
      body.Addresses = customerAddresses.addresses.map(mapAddress);
    }

    return await unleashedApiRequest.call(this, 'POST', '/Customers', body);
  }

  if (operation === 'update') {
    // Update an existing customer — fetch current data first since the API
    // does not support partial updates (missing fields get blanked)
    const currentCustomer = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);

    const customerDetails = this.getNodeParameter('customerDetails', itemIndex, {}) as Record<string, any>;

    const customerAddresses = this.getNodeParameter('customerAddresses', itemIndex, {
      addresses: [],
    }) as { addresses: Array<Record<string, any>> };

    // Prepare the update body with existing data
    const body = { ...currentCustomer };

    // Apply updated fields
    applyCustomerDetails(body, customerDetails);

    // Update addresses if provided
    if (customerAddresses.addresses.length > 0) {
      body.Addresses = customerAddresses.addresses.map(mapAddress);
    }

    return await unleashedApiRequest.call(this, 'POST', `/Customers/${customerGuid}`, body);
  }

  return null;
}

/**
 * Map flat customer detail fields from the n8n description to the Unleashed API body
 */
function applyCustomerDetails(body: any, d: Record<string, any>) {
  // Simple string fields
  const stringMap: Record<string, string> = {
    customerName: 'CustomerName',
    customerType: 'CustomerType',
    customerTypeGuid: 'CustomerTypeGuid',
    contactFirstName: 'ContactFirstName',
    contactLastName: 'ContactLastName',
    email: 'Email',
    emailCC: 'EmailCC',
    phoneNumber: 'PhoneNumber',
    mobileNumber: 'MobileNumber',
    faxNumber: 'FaxNumber',
    ddiNumber: 'DDINumber',
    tollFreeNumber: 'TollFreeNumber',
    website: 'Website',
    notes: 'Notes',
    taxCode: 'TaxCode',
    gstVatNumber: 'GSTVATNumber',
    bankName: 'BankName',
    bankBranch: 'BankBranch',
    bankAccount: 'BankAccount',
    sellPriceTier: 'SellPriceTier',
    paymentTerm: 'PaymentTerm',
    deliveryMethod: 'DeliveryMethod',
    deliveryInstruction: 'DeliveryInstruction',
    salesOrderGroup: 'SalesOrderGroup',
    xeroCostOfGoodsAccount: 'XeroCostOfGoodsAccount',
    xeroSalesAccount: 'XeroSalesAccount',
  };
  for (const [key, apiKey] of Object.entries(stringMap)) {
    if (d[key]) body[apiKey] = d[key];
  }

  // Numeric fields (use != null so 0 is valid)
  const numericMap: Record<string, string> = {
    discountRate: 'DiscountRate',
    taxRate: 'TaxRate',
    creditLimit: 'CreditLimit',
  };
  for (const [key, apiKey] of Object.entries(numericMap)) {
    if (d[key] != null) body[apiKey] = d[key];
  }

  // Boolean fields
  const boolMap: Record<string, string> = {
    hasCreditLimit: 'HasCreditLimit',
    stopCredit: 'StopCredit',
    printInvoice: 'PrintInvoice',
    printPackingSlipInsteadOfInvoice: 'PrintPackingSlipInsteadOfInvoice',
    taxable: 'Taxable',
    obsolete: 'Obsolete',
  };
  for (const [key, apiKey] of Object.entries(boolMap)) {
    if (d[key] != null) body[apiKey] = d[key];
  }

  // Nested objects built from flat fields
  if (d.salespersonGuid) {
    body.Salesperson = { Guid: d.salespersonGuid };
    if (d.salespersonFullName) body.Salesperson.FullName = d.salespersonFullName;
    if (d.salespersonEmail) body.Salesperson.Email = d.salespersonEmail;
  }
  if (d.currencyCode || d.currencyGuid) {
    body.Currency = {};
    if (d.currencyCode) body.Currency.CurrencyCode = d.currencyCode;
    if (d.currencyGuid) body.Currency.Guid = d.currencyGuid;
  }
  if (d.defaultWarehouseCode || d.defaultWarehouseGuid) {
    body.DefaultWarehouse = {};
    if (d.defaultWarehouseCode) body.DefaultWarehouse.WarehouseCode = d.defaultWarehouseCode;
    if (d.defaultWarehouseGuid) body.DefaultWarehouse.Guid = d.defaultWarehouseGuid;
  }
}

function mapAddress(address: Record<string, any>) {
  return {
    AddressType: address.addressType,
    AddressName: address.addressName || address.addressType,
    StreetAddress: address.streetAddress || '',
    StreetAddress2: address.streetAddress2 || '',
    Suburb: address.suburb || '',
    City: address.city || '',
    Region: address.region || '',
    Country: address.country || '',
    PostalCode: address.postalCode || '',
  };
}
