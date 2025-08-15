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
  // GET operations
  {
    displayName: 'Customer ID',
    name: 'customerId',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['get', 'update'],
      },
    },
    default: '',
    required: true,
    description: 'The ID of the customer',
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
      maxValue: 100,
    },
    default: 50,
    description: 'Max number of results to return',
  },
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
        displayName: 'Customer Code',
        name: 'customerCode',
        type: 'string',
        default: '',
        description: 'Filter by customer code',
      },
      {
        displayName: 'Customer Name',
        name: 'customerName',
        type: 'string',
        default: '',
        description: 'Filter by customer name',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Filter by customer email',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Filter by customer phone',
      },
    ],
  },
  
  // CREATE/UPDATE operations
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
    description: 'The customer name',
  },
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
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        description: 'The customer email address',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'The customer phone number',
      },
      {
        displayName: 'Fax',
        name: 'fax',
        type: 'string',
        default: '',
        description: 'The customer fax number',
      },
      {
        displayName: 'Discount',
        name: 'discount',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
          minValue: 0,
          maxValue: 100,
        },
        default: 0,
        description: 'The default discount percentage for the customer',
      },
      {
        displayName: 'Payment Terms',
        name: 'paymentTerms',
        type: 'string',
        default: '',
        description: 'The payment terms for the customer',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'string',
        default: '',
        description: 'The default currency for the customer',
      },
      {
        displayName: 'Tax Code',
        name: 'taxCode',
        type: 'string',
        default: '',
        description: 'The tax code for the customer',
      },
    ],
  },
  {
    displayName: 'Addresses',
    name: 'addresses',
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
        name: 'addressDetails',
        displayName: 'Address',
        values: [
          {
            displayName: 'Address Type',
            name: 'addressType',
            type: 'options',
            options: [
              {
                name: 'Billing',
                value: 'Billing',
              },
              {
                name: 'Shipping',
                value: 'Shipping',
              },
            ],
            default: 'Billing',
            description: 'The type of address',
          },
          {
            displayName: 'Street',
            name: 'street',
            type: 'string',
            default: '',
            description: 'The street address',
          },
          {
            displayName: 'City',
            name: 'city',
            type: 'string',
            default: '',
            description: 'The city',
          },
          {
            displayName: 'Region',
            name: 'region',
            type: 'string',
            default: '',
            description: 'The region/state/province',
          },
          {
            displayName: 'Postal Code',
            name: 'postalCode',
            type: 'string',
            default: '',
            description: 'The postal/zip code',
          },
          {
            displayName: 'Country',
            name: 'country',
            type: 'string',
            default: '',
            description: 'The country',
          },
        ],
      },
    ],
  },
];
