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
  // Get Customer GUID for single-record operations
  let customerGuid = '';
  const guidOps = ['addAddress', 'addContact', 'get', 'removeAddress', 'removeContact', 'update', 'updateAddress', 'updateContact'];
  if (guidOps.includes(operation)) {
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

  if (operation === 'addContact') {
    const current = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
    const details = this.getNodeParameter('contactDetails', itemIndex, {}) as Record<string, any>;
    const newContact = mapContact(details);
    const body = { ...current };
    body.Contacts = [...(body.Contacts || []), newContact];
    return await unleashedApiRequest.call(this, 'POST', `/Customers/${customerGuid}`, body);
  }

  if (operation === 'updateContact') {
    const current = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
    const contactGuid = this.getNodeParameter('contactGuid', itemIndex) as string;
    const details = this.getNodeParameter('contactDetails', itemIndex, {}) as Record<string, any>;
    const body = { ...current };
    const contacts = [...(body.Contacts || [])];
    const idx = contacts.findIndex((c: any) => c.Guid === contactGuid);
    if (idx === -1) throw new Error(`Contact with GUID ${contactGuid} not found on this customer`);
    contacts[idx] = { ...contacts[idx], ...mapContact(details, contacts[idx]) };
    body.Contacts = contacts;
    return await unleashedApiRequest.call(this, 'POST', `/Customers/${customerGuid}`, body);
  }

  if (operation === 'removeContact') {
    const current = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
    const contactGuid = this.getNodeParameter('contactGuid', itemIndex) as string;
    const body = { ...current };
    const before = (body.Contacts || []).length;
    body.Contacts = (body.Contacts || []).filter((c: any) => c.Guid !== contactGuid);
    if (body.Contacts.length === before) throw new Error(`Contact with GUID ${contactGuid} not found on this customer`);
    return await unleashedApiRequest.call(this, 'POST', `/Customers/${customerGuid}`, body);
  }

  if (operation === 'addAddress') {
    const current = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
    const details = this.getNodeParameter('addressDetails', itemIndex, {}) as Record<string, any>;
    const newAddress = mapAddressDetails(details);
    const body = { ...current };
    body.Addresses = [...(body.Addresses || []), newAddress];
    return await unleashedApiRequest.call(this, 'POST', `/Customers/${customerGuid}`, body);
  }

  if (operation === 'updateAddress') {
    const current = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
    const addressGuid = this.getNodeParameter('addressGuid', itemIndex) as string;
    const details = this.getNodeParameter('addressDetails', itemIndex, {}) as Record<string, any>;
    const body = { ...current };
    const addresses = [...(body.Addresses || [])];
    const idx = addresses.findIndex((a: any) => a.Guid === addressGuid);
    if (idx === -1) throw new Error(`Address with GUID ${addressGuid} not found on this customer`);
    addresses[idx] = { ...addresses[idx], ...mapAddressDetails(details, addresses[idx]) };
    body.Addresses = addresses;
    return await unleashedApiRequest.call(this, 'POST', `/Customers/${customerGuid}`, body);
  }

  if (operation === 'removeAddress') {
    const current = await unleashedApiRequest.call(this, 'GET', `/Customers/${customerGuid}`);
    const addressGuid = this.getNodeParameter('addressGuid', itemIndex) as string;
    const body = { ...current };
    const before = (body.Addresses || []).length;
    body.Addresses = (body.Addresses || []).filter((a: any) => a.Guid !== addressGuid);
    if (body.Addresses.length === before) throw new Error(`Address with GUID ${addressGuid} not found on this customer`);
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

/**
 * Map contact detail fields from the n8n UI to the Unleashed API format.
 * When `existing` is provided (update), only override fields that are set.
 */
function mapContact(details: Record<string, any>, existing?: any): any {
  const contact: any = existing ? { ...existing } : {};
  const fieldMap: Record<string, string> = {
    firstName: 'FirstName',
    lastName: 'LastName',
    emailAddress: 'EmailAddress',
    phoneNumber: 'PhoneNumber',
    mobilePhone: 'MobilePhone',
    officePhone: 'OfficePhone',
    ddiNumber: 'DDINumber',
    faxNumber: 'FaxNumber',
    tollFreeNumber: 'TollFreeNumber',
    website: 'Website',
    notes: 'Notes',
    deliveryAddress: 'DeliveryAddress',
  };
  for (const [key, apiKey] of Object.entries(fieldMap)) {
    if (details[key] !== undefined && details[key] !== '') contact[apiKey] = details[key];
  }
  const boolMap: Record<string, string> = {
    forInvoicing: 'ForInvoicing',
    forShipping: 'ForShipping',
    forOrdering: 'ForOrdering',
    isDefault: 'IsDefault',
  };
  for (const [key, apiKey] of Object.entries(boolMap)) {
    if (details[key] != null) contact[apiKey] = details[key];
  }
  return contact;
}

/**
 * Map address detail fields from the n8n UI to the Unleashed API format.
 * When `existing` is provided (update), only override fields that are set.
 */
function mapAddressDetails(details: Record<string, any>, existing?: any): any {
  const address: any = existing ? { ...existing } : {};
  const fieldMap: Record<string, string> = {
    addressType: 'AddressType',
    addressName: 'AddressName',
    streetAddress: 'StreetAddress',
    streetAddress2: 'StreetAddress2',
    suburb: 'Suburb',
    city: 'City',
    region: 'Region',
    country: 'Country',
    postalCode: 'PostalCode',
    deliveryInstruction: 'DeliveryInstruction',
  };
  for (const [key, apiKey] of Object.entries(fieldMap)) {
    if (details[key] !== undefined && details[key] !== '') address[apiKey] = details[key];
  }
  return address;
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

  // Tier 1: exact/narrow filters
  if (inputs.customerCode) {
    merge(await fetch({ customerCode: inputs.customerCode }));
  }
  if (inputs.email) {
    merge(await fetch({ contactEmail: inputs.email }));
    // Domain-only search (catches other contacts at the same company)
    const domain = inputs.email.split('@')[1];
    if (domain) {
      merge(await fetch({ contactEmail: domain }));
      // Also search by domain base as customer code
      const domainBase = domain.split('.')[0];
      if (domainBase.length >= 3) {
        merge(await fetch({ customerCode: domainBase }));
        merge(await fetch({ customer: domainBase }));
      }
    }
  }
  if (inputs.customerName) {
    merge(await fetch({ customerName: inputs.customerName }));
    // Also try acronym of the name as customer code search
    const words = inputs.customerName
      .replace(/\b(ltd|limited|inc|corp|llc|pty|group|co|nz|au)\b\.?/gi, '')
      .trim().split(/\s+/).filter((w) => w.length > 0);
    if (words.length >= 2) {
      const acronym = words.map((w) => w[0]).join('');
      if (acronym.length >= 2) {
        merge(await fetch({ customer: acronym }));
      }
    }
  }

  // Tier 2: broader search if we still have few candidates
  if (candidates.length < 5) {
    if (inputs.customerName) {
      merge(await fetch({ customer: inputs.customerName }));
    }
    if (inputs.contactName && candidates.length < 5) {
      merge(await fetch({ customer: inputs.contactName }));
    }
  }

  // Tier 3: fetch all only if all targeted searches returned nothing
  if (candidates.length === 0) {
    merge(await fetch({}));
  }

  return candidates;
}

// ── Fuzzy matching: scoring ──
//
// Designed for B2B customer matching where:
// - Email domain is near-conclusive (same domain = same company)
// - Company names are often abbreviated/acronyms
// - Delivery addresses change constantly (new sites, projects)
// - Contact names change (new employees placing orders)
// - Phone numbers may be personal mobiles, not company lines
//
// Uses evidence accumulation (not averaging) so non-matching fields
// don't penalize strong matches elsewhere.

/**
 * Bigram-based Dice coefficient (0–1).
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

const COMPANY_SUFFIXES = /\b(ltd|limited|inc|incorporated|corp|corporation|llc|pty|group|co|company|holdings|trust|services|solutions|industries|international|enterprises|nz|au|uk|us)\b\.?/gi;

/**
 * Strip common company suffixes for cleaner comparison.
 */
function stripSuffixes(name: string): string {
  return name.replace(COMPANY_SUFFIXES, '').replace(/\s+/g, ' ').trim();
}

/**
 * Check if `short` could be an acronym of `long`.
 * e.g. "ABC" matches "Alpha Beta Corp", "ABC NZ" matches too.
 */
function isAcronymOf(short: string, long: string): boolean {
  const shortClean = stripSuffixes(short).toUpperCase().replace(/[^A-Z]/g, '');
  const longWords = stripSuffixes(long).split(/\s+/).filter((w) => w.length > 0);
  if (shortClean.length < 2 || longWords.length < 2) return false;
  const initials = longWords.map((w) => w[0].toUpperCase()).join('');
  return initials === shortClean || shortClean === initials;
}

/**
 * Compare company names with suffix stripping and token-level matching.
 */
function nameSimilarity(query: string, customerName: string): number {
  if (!query || !customerName) return 0;
  const q = query.toLowerCase().trim();
  const c = customerName.toLowerCase().trim();

  // Exact match
  if (q === c) return 1;

  // Acronym match (either direction)
  if (isAcronymOf(q, c) || isAcronymOf(c, q)) return 0.75;

  // Strip suffixes and compare
  const qStripped = stripSuffixes(q);
  const cStripped = stripSuffixes(c);
  if (qStripped && cStripped) {
    if (qStripped.toLowerCase() === cStripped.toLowerCase()) return 0.95;
    const strippedDice = dice(qStripped.toLowerCase(), cStripped.toLowerCase());
    if (strippedDice > 0.5) return strippedDice;
  }

  // Token-level: match significant words (ignoring common suffixes)
  const qTokens = qStripped.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  const cTokens = cStripped.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (qTokens.length > 0 && cTokens.length > 0) {
    let matched = 0;
    for (const qt of qTokens) {
      let bestMatch = 0;
      for (const ct of cTokens) {
        bestMatch = Math.max(bestMatch, dice(qt, ct));
      }
      if (bestMatch >= 0.6) matched += bestMatch;
    }
    const tokenScore = matched / Math.max(qTokens.length, cTokens.length);
    if (tokenScore > 0) return tokenScore;
  }

  return dice(q, c);
}

/**
 * Extract the domain from an email, stripping common prefixes.
 */
function emailDomain(email: string): string {
  return (email.split('@')[1] || '').toLowerCase().trim();
}

/**
 * Normalize phone to digits only.
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Score a customer against structured search inputs (0–100).
 *
 * Uses evidence accumulation: each signal earns points. Non-matching
 * fields score 0 but don't reduce the total. The final score is
 * earned / max possible for provided inputs, scaled to 0–100.
 *
 * Designed so a single very strong signal (exact email, exact code)
 * can clear the 80% auto-match threshold on its own, while weaker
 * signals (domain match, name similarity) need corroboration.
 *
 * Point budgets — max earnable per signal:
 *   Exact email:     35  (known contact at known company)
 *   Email domain:    30  (new contact, same domain — strong but not conclusive
 *                         as one company may order on behalf of another)
 *   Customer code:   35  (exact) / scaled (partial)
 *   Customer name:   25  (with acronym + suffix stripping)
 *   Contact name:    10  (contacts come and go in B2B)
 *   Phone:           15
 *   Address:          5  (delivery addresses change constantly)
 *   Website:         10
 *   Cross-signals:   20  (domain ↔ code, name initials ↔ code,
 *                         delivery country ↔ customer country)
 *
 * Max points adapt to which inputs are provided, so the denominator
 * only counts signals you actually gave.
 */
function scoreCustomer(inputs: SearchInputs, customer: any): number {
  let earned = 0;
  let maxPoints = 0;

  // Collect all customer emails and phones
  const custEmails = [
    customer.Email, customer.EmailCC,
    ...(customer.Contacts || []).map((c: any) => c.EmailAddress || c.Email),
  ].filter(Boolean);

  const custPhones = [
    customer.PhoneNumber, customer.MobileNumber, customer.DDINumber, customer.FaxNumber,
    ...(customer.Contacts || []).map((c: any) => c.PhoneNumber),
    ...(customer.Contacts || []).map((c: any) => c.MobilePhone),
    ...(customer.Contacts || []).map((c: any) => c.OfficePhone),
  ].filter(Boolean);

  const custDomains = [...new Set(custEmails.map(emailDomain).filter(Boolean))];
  const custCode = (customer.CustomerCode || '').toLowerCase();
  const custName = customer.CustomerName || '';

  // ── Email (max 35) ──
  if (inputs.email) {
    maxPoints += 35;
    const inputEmail = inputs.email.toLowerCase().trim();
    const inputDomain = emailDomain(inputEmail);

    const exactMatch = custEmails.some((ce: string) => ce.toLowerCase() === inputEmail);
    if (exactMatch) {
      earned += 35;
    } else if (inputDomain) {
      if (custDomains.includes(inputDomain)) {
        // Domain match: strong signal but not conclusive (distributors
        // may order on behalf of other companies)
        earned += 30;
      } else {
        // Fuzzy domain (typos)
        const bestDomainDice = Math.max(0, ...custDomains.map((cd) => dice(inputDomain, cd)));
        if (bestDomainDice >= 0.7) earned += 25 * bestDomainDice;
      }
    }
  }

  // ── Customer code (max 35) ──
  if (inputs.customerCode) {
    maxPoints += 35;
    const inputCode = inputs.customerCode.toLowerCase().trim();
    if (inputCode === custCode) {
      earned += 35;
    } else {
      const sim = dice(inputCode, custCode);
      if (sim >= 0.5) earned += 30 * sim;
    }
  }

  // ── Customer name (max 25) ──
  if (inputs.customerName) {
    maxPoints += 25;
    const sim = nameSimilarity(inputs.customerName, custName);
    earned += 25 * sim;
  }

  // ── Contact name (max 10) ──
  if (inputs.contactName) {
    maxPoints += 10;
    const contactNames = [
      `${customer.ContactFirstName || ''} ${customer.ContactLastName || ''}`.trim(),
      ...(customer.Contacts || []).map(
        (c: any) => `${c.FirstName || ''} ${c.LastName || ''}`.trim(),
      ),
    ].filter(Boolean);

    let bestSim = 0;
    const q = inputs.contactName.toLowerCase().trim();
    for (const cn of contactNames) {
      const c = cn.toLowerCase();
      bestSim = Math.max(bestSim, dice(q, c));
      // First-name or last-name partial match
      const qParts = q.split(/\s+/);
      const cParts = c.split(/\s+/);
      for (const qp of qParts) {
        for (const cp of cParts) {
          if (qp.length > 2 && cp.length > 2) {
            bestSim = Math.max(bestSim, dice(qp, cp) * 0.7);
          }
        }
      }
    }
    earned += 10 * bestSim;
  }

  // ── Phone (max 15) ──
  if (inputs.phone) {
    maxPoints += 15;
    const ip = normalizePhone(inputs.phone);
    if (ip.length >= 6) {
      for (const cp of custPhones) {
        const np = normalizePhone(cp);
        if (np.length < 6) continue;
        if (ip === np) { earned += 15; break; }
        if (ip.includes(np) || np.includes(ip)) { earned += 13; break; }
        if (ip.length >= 7 && np.length >= 7 && ip.slice(-7) === np.slice(-7)) { earned += 11; break; }
      }
    }
  }

  // ── Address (max 5) ──
  if (inputs.address) {
    maxPoints += 5;
    const inputAddr = inputs.address.toLowerCase();
    const addressStrings = (customer.Addresses || []).map((a: any) =>
      [a.StreetAddress, a.StreetAddress2, a.Suburb, a.City, a.Region, a.Country, a.PostalCode]
        .filter(Boolean).join(' ').toLowerCase(),
    );

    let bestAddrSim = 0;
    for (const addr of addressStrings) {
      bestAddrSim = Math.max(bestAddrSim, dice(inputAddr, addr));
      const addrTokens = addr.split(/[\s,]+/).filter((t: string) => t.length > 2);
      const inputTokens = inputAddr.split(/[\s,\-]+/).filter((t) => t.length > 2);
      let tokenMatches = 0;
      for (const it of inputTokens) {
        if (addrTokens.some((at: string) => dice(it, at) >= 0.8)) tokenMatches++;
      }
      if (inputTokens.length > 0) {
        bestAddrSim = Math.max(bestAddrSim, tokenMatches / inputTokens.length);
      }
    }
    earned += 5 * bestAddrSim;
  }

  // ── Website (max 10) ──
  if (inputs.website) {
    maxPoints += 10;
    const inputSite = inputs.website.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    const custSite = (customer.Website || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

    if (custSite && inputSite) {
      if (inputSite === custSite) {
        earned += 10;
      } else {
        const sim = dice(inputSite, custSite);
        if (sim >= 0.5) earned += 10 * sim;
      }
    }

    // Website input is actually an email — cross-check domain
    if (inputSite.includes('@')) {
      const domain = emailDomain(inputSite);
      if (domain && custDomains.includes(domain)) earned += 8;
    }
  }

  // ── Cross-signal bonuses (max 20) ──
  // Corroboration between different input fields and customer record fields.
  maxPoints += 20;

  // Email domain ↔ customer code
  if (inputs.email) {
    const inputDomain = emailDomain(inputs.email);
    if (inputDomain) {
      const domainBase = inputDomain.split('.')[0];
      if (custCode && (custCode === domainBase || custCode.includes(domainBase) || domainBase.includes(custCode))) {
        earned += 8;
      } else if (custCode && dice(domainBase, custCode) >= 0.7) {
        earned += 5;
      }
    }
  }

  // Customer name initials ↔ customer code
  if (inputs.customerName && custCode) {
    const inputStripped = stripSuffixes(inputs.customerName);
    const inputWords = inputStripped.split(/\s+/).filter((w) => w.length > 0);
    if (inputWords.length >= 2) {
      const initials = inputWords.map((w) => w[0].toLowerCase()).join('');
      if (custCode.startsWith(initials) || custCode.includes(initials)) {
        earned += 7;
      }
    }
  }

  // Delivery address country ↔ customer country
  // If the input address mentions a country that matches the customer's
  // addresses, it's a corroborating signal (e.g. NZ distributor getting
  // a domestic delivery vs a foreign company ordering on their behalf).
  if (inputs.address) {
    const inputAddrLower = inputs.address.toLowerCase();
    const custCountries: string[] = [...new Set<string>(
      (customer.Addresses || [])
        .map((a: any) => (a.Country || '').toLowerCase())
        .filter(Boolean),
    )];
    for (const country of custCountries) {
      if (inputAddrLower.includes(country) || country.includes(inputAddrLower.split(',').pop()?.trim() || '')) {
        earned += 5;
        break;
      }
      // Also check common abbreviations (NZ ↔ New Zealand, AU ↔ Australia)
      const countryAbbrevs: Record<string, string[]> = {
        'new zealand': ['nz', 'new zealand'],
        'australia': ['au', 'aus', 'australia'],
        'united states': ['us', 'usa', 'united states'],
        'united kingdom': ['uk', 'united kingdom'],
      };
      const abbrevs = countryAbbrevs[country as keyof typeof countryAbbrevs] || [];
      if (abbrevs.some((a) => inputAddrLower.includes(a))) {
        earned += 5;
        break;
      }
    }
  }

  if (maxPoints === 0) return 0;
  return Math.min(100, (earned / maxPoints) * 100);
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
