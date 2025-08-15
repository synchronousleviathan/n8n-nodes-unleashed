import { INodeProperties } from 'n8n-workflow';

export const invoiceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['invoice'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create an invoice',
        action: 'Create an invoice',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an invoice',
        action: 'Get an invoice',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many invoices',
        action: 'Get many invoices',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an invoice',
        action: 'Update an invoice',
      },
    ],
    default: 'get',
  },
];

export const invoiceFields: INodeProperties[] = [
  // GET operations
  {
    displayName: 'Invoice ID',
    name: 'invoiceId',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['get', 'update'],
      },
    },
    default: '',
    required: true,
    description: 'The ID of the invoice',
  },
  
  // GET ALL operations
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['invoice'],
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
        resource: ['invoice'],
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
        resource: ['invoice'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Start date for filtering the invoices',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'End date for filtering the invoices',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        default: '',
        description: 'Filter by customer ID',
      },
      {
        displayName: 'Invoice Status',
        name: 'invoiceStatus',
        type: 'options',
        options: [
          {
            name: 'Open',
            value: 'Open',
          },
          {
            name: 'Paid',
            value: 'Paid',
          },
          {
            name: 'Voided',
            value: 'Voided',
          },
        ],
        default: 'Open',
        description: 'The status of the invoice',
      },
    ],
  },
  
  // CREATE operations
  {
    displayName: 'Customer Code',
    name: 'customerCode',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The customer code for the invoice',
  },
  {
    displayName: 'Sales Order ID',
    name: 'salesOrderId',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The related sales order ID for the invoice (optional)',
  },
  {
    displayName: 'Invoice Details',
    name: 'invoiceDetails',
    type: 'collection',
    placeholder: 'Add Invoice Detail',
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Invoice Number',
        name: 'invoiceNumber',
        type: 'string',
        default: '',
        description: 'The invoice number',
      },
      {
        displayName: 'Invoice Date',
        name: 'invoiceDate',
        type: 'dateTime',
        default: '',
        description: 'The date of the invoice',
      },
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        description: 'The due date for the invoice payment',
      },
      {
        displayName: 'Tax Rate',
        name: 'taxRate',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 0,
        description: 'The tax rate for the invoice',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'string',
        default: '',
        description: 'The currency for the invoice',
      },
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Comments for the invoice',
      },
    ],
  },
  {
    displayName: 'Invoice Line Items',
    name: 'invoiceLineItems',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    placeholder: 'Add Line Item',
    options: [
      {
        name: 'lineItems',
        displayName: 'Line Item',
        values: [
          {
            displayName: 'Product Code',
            name: 'productCode',
            type: 'string',
            default: '',
            required: true,
            description: 'The product code for the line item',
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            typeOptions: {
              numberPrecision: 2,
            },
            default: 1,
            required: true,
            description: 'The quantity for the line item',
          },
          {
            displayName: 'Unit Price',
            name: 'unitPrice',
            type: 'number',
            typeOptions: {
              numberPrecision: 2,
            },
            default: 0,
            description: 'The unit price for the line item',
          },
          {
            displayName: 'Discount Percentage',
            name: 'discountPercentage',
            type: 'number',
            typeOptions: {
              numberPrecision: 2,
              minValue: 0,
              maxValue: 100,
            },
            default: 0,
            description: 'The discount percentage for the line item',
          },
        ],
      },
    ],
  },
];
