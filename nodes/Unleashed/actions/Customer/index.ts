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

  if (operation === 'fuzzySearch') {
    const inputs = this.getNodeParameter('searchInputs', itemIndex, {}) as {
      customerName?: string;
      customerCode?: string;
      contactName?: string;
      email?: string;
      phone?: string;
      address?: string;
      website?: string;
    };
    const maxResults = this.getNodeParameter('maxResults', itemIndex, 5) as number;
    const minConfidence = this.getNodeParameter('minConfidence', itemIndex, 10) as number;

    const candidates = await fetchCandidates.call(this, inputs);

    // Score and rank
    const scored = candidates
      .map((customer: any) => {
        const confidence = scoreCustomer(inputs, customer);
        return { ...customer, _confidence: Math.round(confidence * 100) / 100 };
      })
      .filter((c: any) => c._confidence >= minConfidence)
      .sort((a: any, b: any) => b._confidence - a._confidence)
      .slice(0, maxResults);

    return scored;
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

// ── Fuzzy search: candidate fetching ──

interface SearchInputs {
  customerName?: string;
  customerCode?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

/**
 * Intelligently fetch candidate customers using progressive API filtering.
 * Tries narrow filters first, broadens only if needed.
 */
async function fetchCandidates(
  this: IExecuteFunctions,
  inputs: SearchInputs,
): Promise<any[]> {
  const seen = new Set<string>();
  const candidates: any[] = [];

  const merge = (items: any[]) => {
    for (const c of items) {
      if (!seen.has(c.Guid)) {
        seen.add(c.Guid);
        candidates.push(c);
      }
    }
  };

  const fetch = async (qs: any) => {
    qs.includeAllContacts = true;
    return await unleashedApiRequestAllItems.call(
      this, 'Items', 'GET', '/Customers', {}, qs,
    );
  };

  // Tier 1: exact/narrow filters — customer code, email, exact name
  if (inputs.customerCode) {
    merge(await fetch({ customerCode: inputs.customerCode }));
  }
  if (inputs.email) {
    merge(await fetch({ contactEmail: inputs.email }));
    // Also try domain-only match
    const domain = inputs.email.split('@')[1];
    if (domain && candidates.length < 3) {
      merge(await fetch({ contactEmail: domain }));
    }
  }
  if (inputs.customerName) {
    merge(await fetch({ customerName: inputs.customerName }));
  }

  // Tier 2: broader search if we still have few candidates
  if (candidates.length < 5) {
    if (inputs.customerName) {
      // Use the generic "customer" param which searches code + name loosely
      merge(await fetch({ customer: inputs.customerName }));
    }
    if (inputs.contactName && candidates.length < 5) {
      // Try contact name as a customer search (contacts may share company name fragments)
      merge(await fetch({ customer: inputs.contactName }));
    }
  }

  // Tier 3: fetch all only if we have nothing useful to filter on,
  // or if all targeted searches returned nothing
  if (candidates.length === 0) {
    merge(await fetch({}));
  }

  return candidates;
}

// ── Fuzzy matching: scoring ──

/**
 * Bigram-based Dice coefficient (0–1). Handles typos, abbreviations, partial strings.
 */
function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigramsA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.substring(i, i + 2);
    bigramsA.set(bg, (bigramsA.get(bg) || 0) + 1);
  }
  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.substring(i, i + 2);
    const count = bigramsA.get(bg) || 0;
    if (count > 0) {
      bigramsA.set(bg, count - 1);
      intersection++;
    }
  }
  return (2 * intersection) / (a.length - 1 + b.length - 1);
}

/**
 * Compare a query string against one or more customer field values.
 * Returns the best Dice similarity found (0–1).
 */
function fieldSimilarity(query: string, ...fieldValues: string[]): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  let best = 0;
  for (const val of fieldValues) {
    if (!val) continue;
    const v = val.toLowerCase().trim();
    // Full-string Dice
    best = Math.max(best, dice(q, v));
    // Also try token-level matching for multi-word fields
    const qTokens = q.split(/\s+/);
    const vTokens = v.split(/\s+/);
    if (qTokens.length > 1 || vTokens.length > 1) {
      let tokenSum = 0;
      for (const qt of qTokens) {
        let bestToken = 0;
        for (const vt of vTokens) {
          bestToken = Math.max(bestToken, dice(qt, vt));
        }
        tokenSum += bestToken;
      }
      best = Math.max(best, tokenSum / qTokens.length);
    }
  }
  return best;
}

/**
 * Normalize phone to digits only, keeping last 7+ digits for comparison.
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

function phoneSimilarity(inputPhone: string, ...custPhones: string[]): number {
  const ip = normalizePhone(inputPhone);
  if (ip.length < 6) return 0;
  for (const cp of custPhones) {
    if (!cp) continue;
    const np = normalizePhone(cp);
    if (np.length < 6) continue;
    // Exact digit match
    if (ip === np) return 1;
    // One contains the other (handles country code prefixes)
    if (ip.includes(np) || np.includes(ip)) return 0.95;
    // Last 7 digits match
    if (ip.length >= 7 && np.length >= 7 && ip.slice(-7) === np.slice(-7)) return 0.9;
    // Last 6 digits (handles minor differences)
    if (ip.length >= 6 && np.length >= 6 && ip.slice(-6) === np.slice(-6)) return 0.7;
  }
  return 0;
}

/**
 * Score a customer against structured search inputs (0–100).
 */
function scoreCustomer(inputs: SearchInputs, customer: any): number {
  const scores: Array<{ score: number; weight: number }> = [];

  // Collect all customer emails and phones for reuse
  const custEmails = [
    customer.Email, customer.EmailCC,
    ...(customer.Contacts || []).map((c: any) => c.Email),
  ].filter(Boolean);

  const custPhones = [
    customer.PhoneNumber, customer.MobileNumber, customer.DDINumber, customer.FaxNumber,
    ...(customer.Contacts || []).map((c: any) => c.PhoneNumber),
    ...(customer.Contacts || []).map((c: any) => c.MobileNumber),
  ].filter(Boolean);

  // Customer name (weight: 30)
  if (inputs.customerName) {
    const sim = fieldSimilarity(inputs.customerName, customer.CustomerName || '');
    scores.push({ score: sim, weight: 30 });
  }

  // Customer code (weight: 20)
  if (inputs.customerCode) {
    const sim = fieldSimilarity(inputs.customerCode, customer.CustomerCode || '');
    scores.push({ score: sim, weight: 20 });
  }

  // Contact name — match against primary contact and all contacts (weight: 20)
  if (inputs.contactName) {
    const contactFields = [
      `${customer.ContactFirstName || ''} ${customer.ContactLastName || ''}`.trim(),
      ...(customer.Contacts || []).map(
        (c: any) => `${c.FirstName || ''} ${c.LastName || ''}`.trim(),
      ),
    ].filter(Boolean);
    const sim = fieldSimilarity(inputs.contactName, ...contactFields);
    scores.push({ score: sim, weight: 20 });
  }

  // Email — exact match is very strong, domain match is moderate (weight: 25)
  if (inputs.email) {
    const inputEmail = inputs.email.toLowerCase().trim();
    const inputDomain = inputEmail.split('@')[1] || '';

    // Check exact email match first
    let emailScore = 0;
    for (const ce of custEmails) {
      const cel = ce.toLowerCase();
      if (cel === inputEmail) { emailScore = 1; break; }
      emailScore = Math.max(emailScore, dice(inputEmail, cel));
    }

    // Domain match bonus
    if (emailScore < 0.9 && inputDomain) {
      const custDomains = custEmails.map((e: string) => (e.split('@')[1] || '').toLowerCase());
      const website = (customer.Website || '').toLowerCase();
      for (const cd of custDomains) {
        if (cd === inputDomain) { emailScore = Math.max(emailScore, 0.7); break; }
        if (dice(cd, inputDomain) > 0.8) emailScore = Math.max(emailScore, 0.6);
      }
      if (website.includes(inputDomain.split('.')[0])) {
        emailScore = Math.max(emailScore, 0.5);
      }
    }

    scores.push({ score: emailScore, weight: 25 });
  }

  // Phone (weight: 20)
  if (inputs.phone) {
    const sim = phoneSimilarity(inputs.phone, ...custPhones);
    scores.push({ score: sim, weight: 20 });
  }

  // Address — match against all customer addresses (weight: 15)
  if (inputs.address) {
    const addressStrings = (customer.Addresses || []).map((a: any) =>
      [a.StreetAddress, a.StreetAddress2, a.Suburb, a.City, a.Region, a.Country, a.PostalCode]
        .filter(Boolean).join(' '),
    );
    const sim = fieldSimilarity(inputs.address, ...addressStrings);
    scores.push({ score: sim, weight: 15 });
  }

  // Website (weight: 10)
  if (inputs.website) {
    const sim = fieldSimilarity(
      inputs.website.replace(/^https?:\/\//, '').replace(/^www\./, ''),
      (customer.Website || '').replace(/^https?:\/\//, '').replace(/^www\./, ''),
    );
    scores.push({ score: sim, weight: 10 });
  }

  if (scores.length === 0) return 0;

  // Weighted average
  let totalWeight = 0;
  let totalScore = 0;
  for (const s of scores) {
    totalScore += s.score * s.weight;
    totalWeight += s.weight;
  }

  return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
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
