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
  // Get Customer ID/Code for single operations
  let customerCode = '';
  if (['get', 'update'].includes(operation)) {
    customerCode = this.getNodeParameter('customerCode', itemIndex) as string;
  }
  
  // Handle operations
  if (operation === 'get') {
    // Get a single customer
    return await unleashedApiRequest.call(this, 'GET', `/Customers/${customerCode}`);
  }
  
  if (operation === 'getAll') {
    // Get all customers with optional filters
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as {
      modifiedSince?: string;
      customerType?: string;
      email?: string;
      phoneNumber?: string;
    };
    
    const qs: any = {};
    
    // Add filters to query string
    if (filters.modifiedSince) qs.modifiedSince = filters.modifiedSince;
    if (filters.customerType) qs.customerType = filters.customerType;
    if (filters.email) qs.email = filters.email;
    if (filters.phoneNumber) qs.phoneNumber = filters.phoneNumber;
    
    if (returnAll) {
      // Get all results
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/Customers', {}, qs);
    } else {
      // Get limited results
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/Customers', {}, qs);
      return response.Items || [];
    }
  }
  
  if (operation === 'create') {
    // Create a new customer
    const customerDetails = this.getNodeParameter('customerDetails', itemIndex) as {
      customerCode: string;
      customerName: string;
      customerType?: string;
      email?: string;
      phone?: string;
      mobile?: string;
      fax?: string;
      website?: string;
      discount?: number;
      comments?: string;
    };
    
    const customerAddresses = this.getNodeParameter('customerAddresses', itemIndex, {
      addresses: [],
    }) as { addresses: Array<{
      addressType: string;
      addressLine1: string;
      addressLine2?: string;
      city?: string;
      region?: string;
      country?: string;
      postalCode?: string;
    }>};
    
    // Build request body
    const body: any = {
      CustomerCode: customerDetails.customerCode,
      CustomerName: customerDetails.customerName,
    };
    
    // Add optional fields if provided
    if (customerDetails.customerType) body.CustomerType = customerDetails.customerType;
    if (customerDetails.email) body.Email = customerDetails.email;
    if (customerDetails.phone) body.Phone = customerDetails.phone;
    if (customerDetails.mobile) body.Mobile = customerDetails.mobile;
    if (customerDetails.fax) body.Fax = customerDetails.fax;
    if (customerDetails.website) body.Website = customerDetails.website;
    if (customerDetails.discount) body.Discount = customerDetails.discount;
    if (customerDetails.comments) body.Comments = customerDetails.comments;
    
    // Add addresses if provided
    if (customerAddresses.addresses.length > 0) {
      body.Addresses = customerAddresses.addresses.map(address => ({
        AddressType: address.addressType,
        AddressLine1: address.addressLine1,
        AddressLine2: address.addressLine2 || '',
        City: address.city || '',
        Region: address.region || '',
        Country: address.country || '',
        PostalCode: address.postalCode || '',
      }));
    }
    
    return await unleashedApiRequest.call(this, 'POST', '/Customers', body);
  }
  
  if (operation === 'update') {
    // Update an existing customer
    // First, get the current customer data
    const currentCustomer = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerCode}`);
    
    const customerDetails = this.getNodeParameter('customerDetails', itemIndex, {}) as {
      customerName?: string;
      customerType?: string;
      email?: string;
      phone?: string;
      mobile?: string;
      fax?: string;
      website?: string;
      discount?: number;
      comments?: string;
    };
    
    const customerAddresses = this.getNodeParameter('customerAddresses', itemIndex, {
      addresses: [],
    }) as { addresses: Array<{
      addressType: string;
      addressLine1: string;
      addressLine2?: string;
      city?: string;
      region?: string;
      country?: string;
      postalCode?: string;
    }>};
    
    // Prepare the update body with existing data
    const body = { ...currentCustomer };
    
    // Update fields if provided
    if (customerDetails.customerName) body.CustomerName = customerDetails.customerName;
    if (customerDetails.customerType) body.CustomerType = customerDetails.customerType;
    if (customerDetails.email) body.Email = customerDetails.email;
    if (customerDetails.phone) body.Phone = customerDetails.phone;
    if (customerDetails.mobile) body.Mobile = customerDetails.mobile;
    if (customerDetails.fax) body.Fax = customerDetails.fax;
    if (customerDetails.website) body.Website = customerDetails.website;
    if (customerDetails.discount) body.Discount = customerDetails.discount;
    if (customerDetails.comments) body.Comments = customerDetails.comments;
    
    // Update addresses if provided
    if (customerAddresses.addresses.length > 0) {
      body.Addresses = customerAddresses.addresses.map(address => ({
        AddressType: address.addressType,
        AddressLine1: address.addressLine1,
        AddressLine2: address.addressLine2 || '',
        City: address.city || '',
        Region: address.region || '',
        Country: address.country || '',
        PostalCode: address.postalCode || '',
      }));
    }
    
    return await unleashedApiRequest.call(this, 'PUT', `/Customers/${customerCode}`, body);
  }
  
  return null;
}
