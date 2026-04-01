import { INodeProperties } from 'n8n-workflow';

export const customerOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['customer'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a customer',
        action: 'Create a customer',
      },
      {
        name: 'Fuzzy Search',
        value: 'fuzzySearch',
        description: 'Search customers by matching against a block of text',
        action: 'Fuzzy search customers',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a customer',
        action: 'Get a customer',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many customers',
        action: 'Get many customers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a customer',
        action: 'Update a customer',
      },
    ],
    default: 'get',
  },
];

export const customerFields: INodeProperties[] = [
  // GET / UPDATE — Customer GUID
  {
    displayName: 'Customer GUID',
    name: 'customerGuid',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['get', 'update'],
      },
    },
    default: '',
    required: true,
    description: 'The GUID of the customer',
  },

  // GET ALL operations
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 50,
    description: 'Max number of results to return',
  },
  // FUZZY SEARCH — structured input fields
  {
    displayName: 'Search Inputs',
    name: 'searchInputs',
    type: 'collection',
    placeholder: 'Add Search Field',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['fuzzySearch'],
      },
    },
    default: {},
    description: 'Provide as many fields as you have — the more you provide, the better the match quality',
    options: [
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        typeOptions: { rows: 2 },
        default: '',
        description: 'Full or partial address (street, city, region, country, postal code)',
      },
      {
        displayName: 'Company / Customer Name',
        name: 'customerName',
        type: 'string',
        default: '',
        description: 'The company or customer name to search for',
      },
      {
        displayName: 'Contact Name',
        name: 'contactName',
        type: 'string',
        default: '',
        description: 'A contact person\'s name (first, last, or full)',
      },
      {
        displayName: 'Customer Code',
        name: 'customerCode',
        type: 'string',
        default: '',
        description: 'A known or partial customer code',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'An email address associated with the customer',
      },
      {
        displayName: 'Phone Number',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'A phone, mobile, or fax number (any format)',
      },
      {
        displayName: 'Website',
        name: 'website',
        type: 'string',
        default: '',
        description: 'The customer\'s website URL or domain',
      },
    ],
  },
  {
    displayName: 'Max Results',
    name: 'maxResults',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['fuzzySearch'],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 5,
    description: 'Maximum number of matching customers to return',
  },
  {
    displayName: 'Minimum Confidence %',
    name: 'minConfidence',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['fuzzySearch'],
      },
    },
    typeOptions: {
      minValue: 0,
      maxValue: 100,
    },
    default: 10,
    description: 'Only return matches with at least this confidence percentage',
  },

  // GET ALL — Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Contact Email',
        name: 'contactEmail',
        type: 'string',
        default: '',
        description: 'Filter by contact email address',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'string',
        default: '',
        description: 'Filter by currency code (e.g. NZD, USD)',
      },
      {
        displayName: 'Customer',
        name: 'customer',
        type: 'string',
        default: '',
        description: 'Filter by customer (searches code and name)',
      },
      {
        displayName: 'Customer Code',
        name: 'customerCode',
        type: 'string',
        default: '',
        description: 'Filter by exact customer code',
      },
      {
        displayName: 'Customer Name',
        name: 'customerName',
        type: 'string',
        default: '',
        description: 'Filter by customer name',
      },
      {
        displayName: 'Customer Type',
        name: 'customerType',
        type: 'string',
        default: '',
        description: 'Filter by customer type',
      },
      {
        displayName: 'Include All Contacts',
        name: 'includeAllContacts',
        type: 'boolean',
        default: false,
        description: 'Whether to include all contacts for each customer',
      },
      {
        displayName: 'Include Obsolete',
        name: 'includeObsolete',
        type: 'boolean',
        default: false,
        description: 'Whether to include obsolete customers',
      },
      {
        displayName: 'Modified Since',
        name: 'modifiedSince',
        type: 'dateTime',
        default: '',
        description: 'Filter customers modified since this date/time',
      },
      {
        displayName: 'Order By',
        name: 'orderBy',
        type: 'string',
        default: '',
        description: 'Field to order results by (e.g. CustomerCode, CustomerName, LastModifiedOn)',
      },
      {
        displayName: 'Sales Order Group',
        name: 'salesOrderGroup',
        type: 'string',
        default: '',
        description: 'Filter by sales order group',
      },
      {
        displayName: 'Sell Price Tier',
        name: 'sellPriceTier',
        type: 'string',
        default: '',
        description: 'Filter by sell price tier',
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        options: [
          {
            name: 'Ascending',
            value: 'asc',
          },
          {
            name: 'Descending',
            value: 'desc',
          },
        ],
        default: 'asc',
        description: 'Sort direction for results',
      },
      {
        displayName: 'Stop Credit',
        name: 'stopCredit',
        type: 'boolean',
        default: false,
        description: 'Whether to filter by stop credit status',
      },
      {
        displayName: 'Xero Contact ID',
        name: 'xeroContactId',
        type: 'string',
        default: '',
        description: 'Filter by Xero contact ID',
      },
    ],
  },

  // CREATE — required top-level fields
  {
    displayName: 'Customer Code',
    name: 'customerCode',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The unique customer code',
  },
  {
    displayName: 'Customer Name',
    name: 'customerName',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
  },

  // CREATE/UPDATE — Customer Details collection
  {
    displayName: 'Customer Details',
    name: 'customerDetails',
    type: 'collection',
    placeholder: 'Add Customer Detail',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Bank Account',
        name: 'bankAccount',
        type: 'string',
        default: '',
        description: 'The customer bank account number',
      },
      {
        displayName: 'Bank Branch',
        name: 'bankBranch',
        type: 'string',
        default: '',
        description: 'The customer bank branch',
      },
      {
        displayName: 'Bank Name',
        name: 'bankName',
        type: 'string',
        default: '',
        description: 'The customer bank name',
      },
      {
        displayName: 'Contact First Name',
        name: 'contactFirstName',
        type: 'string',
        default: '',
        description: 'The primary contact first name',
      },
      {
        displayName: 'Contact Last Name',
        name: 'contactLastName',
        type: 'string',
        default: '',
        description: 'The primary contact last name',
      },
      {
        displayName: 'Credit Limit',
        name: 'creditLimit',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 0,
        description: 'The credit limit for the customer',
      },
      {
        displayName: 'Currency Code',
        name: 'currencyCode',
        type: 'string',
        default: '',
        description: 'The default currency code (e.g. NZD, USD)',
      },
      {
        displayName: 'Currency GUID',
        name: 'currencyGuid',
        type: 'string',
        default: '',
        description: 'The GUID of the currency',
      },
      {
        displayName: 'Customer Name',
        name: 'customerName',
        type: 'string',
        default: '',
        description: 'The customer name (for update)',
        displayOptions: {
          show: {
            '/operation': ['update'],
          },
        },
      },
      {
        displayName: 'Customer Type',
        name: 'customerType',
        type: 'string',
        default: '',
        description: 'The customer type name',
      },
      {
        displayName: 'Customer Type GUID',
        name: 'customerTypeGuid',
        type: 'string',
        default: '',
        description: 'The GUID of the customer type',
      },
      {
        displayName: 'DDI Number',
        name: 'ddiNumber',
        type: 'string',
        default: '',
        description: 'The direct dial-in number',
      },
      {
        displayName: 'Default Warehouse Code',
        name: 'defaultWarehouseCode',
        type: 'string',
        default: '',
        description: 'The default warehouse code for this customer',
      },
      {
        displayName: 'Default Warehouse GUID',
        name: 'defaultWarehouseGuid',
        type: 'string',
        default: '',
        description: 'The GUID of the default warehouse',
      },
      {
        displayName: 'Delivery Instruction',
        name: 'deliveryInstruction',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Default delivery instructions',
      },
      {
        displayName: 'Delivery Method',
        name: 'deliveryMethod',
        type: 'string',
        default: '',
        description: 'The default delivery method',
      },
      {
        displayName: 'Discount Rate',
        name: 'discountRate',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
          minValue: 0,
          maxValue: 100,
        },
        default: 0,
        description: 'The default discount rate percentage',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        description: 'The primary email address',
      },
      {
        displayName: 'Email CC',
        name: 'emailCC',
        type: 'string',
        placeholder: 'cc@email.com',
        default: '',
        description: 'CC email address',
      },
      {
        displayName: 'Fax Number',
        name: 'faxNumber',
        type: 'string',
        default: '',
      },
      {
        displayName: 'GST/VAT Number',
        name: 'gstVatNumber',
        type: 'string',
        default: '',
        description: 'The GST or VAT registration number',
      },
      {
        displayName: 'Has Credit Limit',
        name: 'hasCreditLimit',
        type: 'boolean',
        default: false,
        description: 'Whether the customer has a credit limit',
      },
      {
        displayName: 'Mobile Number',
        name: 'mobileNumber',
        type: 'string',
        default: '',
        description: 'The mobile phone number',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Notes about the customer',
      },
      {
        displayName: 'Obsolete',
        name: 'obsolete',
        type: 'boolean',
        default: false,
        description: 'Whether the customer is obsolete',
      },
      {
        displayName: 'Payment Term',
        name: 'paymentTerm',
        type: 'string',
        default: '',
        description: 'The payment term (e.g. 30 Days, COD)',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Print Invoice',
        name: 'printInvoice',
        type: 'boolean',
        default: true,
        description: 'Whether to print invoices for this customer',
      },
      {
        displayName: 'Print Packing Slip Instead of Invoice',
        name: 'printPackingSlipInsteadOfInvoice',
        type: 'boolean',
        default: false,
        description: 'Whether to print packing slips instead of invoices',
      },
      {
        displayName: 'Sales Order Group',
        name: 'salesOrderGroup',
        type: 'string',
        default: '',
        description: 'The sales order group for the customer',
      },
      {
        displayName: 'Salesperson Email',
        name: 'salespersonEmail',
        type: 'string',
        default: '',
        description: 'The email of the assigned salesperson',
      },
      {
        displayName: 'Salesperson Full Name',
        name: 'salespersonFullName',
        type: 'string',
        default: '',
        description: 'The full name of the assigned salesperson',
      },
      {
        displayName: 'Salesperson GUID',
        name: 'salespersonGuid',
        type: 'string',
        default: '',
        description: 'The GUID of the assigned salesperson',
      },
      {
        displayName: 'Sell Price Tier',
        name: 'sellPriceTier',
        type: 'string',
        default: '',
        description: 'The sell price tier for the customer',
      },
      {
        displayName: 'Stop Credit',
        name: 'stopCredit',
        type: 'boolean',
        default: false,
        description: 'Whether credit is stopped for this customer',
      },
      {
        displayName: 'Tax Code',
        name: 'taxCode',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Tax Rate',
        name: 'taxRate',
        type: 'number',
        typeOptions: {
          numberPrecision: 4,
        },
        default: 0,
      },
      {
        displayName: 'Taxable',
        name: 'taxable',
        type: 'boolean',
        default: true,
        description: 'Whether the customer is taxable',
      },
      {
        displayName: 'Toll Free Number',
        name: 'tollFreeNumber',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Website',
        name: 'website',
        type: 'string',
        default: '',
        description: 'The customer website URL',
      },
      {
        displayName: 'Xero Cost of Goods Account',
        name: 'xeroCostOfGoodsAccount',
        type: 'string',
        default: '',
        description: 'The Xero cost of goods account code',
      },
      {
        displayName: 'Xero Sales Account',
        name: 'xeroSalesAccount',
        type: 'string',
        default: '',
        description: 'The Xero sales account code',
      },
    ],
  },

  // CREATE/UPDATE — Addresses
  {
    displayName: 'Addresses',
    name: 'customerAddresses',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    placeholder: 'Add Address',
    options: [
      {
        name: 'addresses',
        displayName: 'Address',
        values: [
          {
            displayName: 'Address Type',
            name: 'addressType',
            type: 'options',
            options: [
              {
                name: 'Postal',
                value: 'Postal',
              },
              {
                name: 'Physical',
                value: 'Physical',
              },
              {
                name: 'Shipping',
                value: 'Shipping',
              },
            ],
            default: 'Postal',
            description: 'The type of address',
          },
          {
            displayName: 'Address Name',
            name: 'addressName',
            type: 'string',
            default: '',
            description: 'The name for this address (defaults to address type if empty)',
          },
          {
            displayName: 'Street Address',
            name: 'streetAddress',
            type: 'string',
            default: '',
            description: 'The street address line 1',
          },
          {
            displayName: 'Street Address 2',
            name: 'streetAddress2',
            type: 'string',
            default: '',
            description: 'The street address line 2',
          },
          {
            displayName: 'Suburb',
            name: 'suburb',
            type: 'string',
            default: '',
          },
          {
            displayName: 'City',
            name: 'city',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Region',
            name: 'region',
            type: 'string',
            default: '',
            description: 'The region/state/province',
          },
          {
            displayName: 'Country',
            name: 'country',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Postal Code',
            name: 'postalCode',
            type: 'string',
            default: '',
            description: 'The postal/zip code',
          },
        ],
      },
    ],
  },
];
