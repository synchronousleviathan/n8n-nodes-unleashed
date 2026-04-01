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
  // GET / UPDATE — Invoice GUID
  {
    displayName: 'Invoice GUID',
    name: 'invoiceGuid',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['get', 'update'],
      },
    },
    default: '',
    required: true,
    description: 'The GUID of the invoice',
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
      maxValue: 200,
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
        displayName: 'Batch Numbers',
        name: 'batchNumbers',
        type: 'string',
        default: '',
        description: 'Filter by batch numbers',
      },
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
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'End date for filtering invoices',
      },
      {
        displayName: 'Invoice Number',
        name: 'invoiceNumber',
        type: 'string',
        default: '',
        description: 'Filter by invoice number',
      },
      {
        displayName: 'Invoice Status',
        name: 'invoiceStatus',
        type: 'options',
        options: [
          { name: 'Completed', value: 'Completed' },
          { name: 'Parked', value: 'Parked' },
          { name: 'Deleted', value: 'Deleted' },
        ],
        default: 'Completed',
        description: 'Filter by invoice status',
      },
      {
        displayName: 'Modified Since',
        name: 'modifiedSince',
        type: 'dateTime',
        default: '',
        description: 'Filter invoices modified since this date/time',
      },
      {
        displayName: 'Order By',
        name: 'orderBy',
        type: 'string',
        default: '',
        description: 'Field to order results by',
      },
      {
        displayName: 'Order Number',
        name: 'orderNumber',
        type: 'string',
        default: '',
        description: 'Filter by associated sales order number',
      },
      {
        displayName: 'Serials',
        name: 'serials',
        type: 'string',
        default: '',
        description: 'Filter by serial numbers',
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        options: [
          { name: 'Ascending', value: 'asc' },
          { name: 'Descending', value: 'desc' },
        ],
        default: 'asc',
        description: 'Sort direction for results',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Start date for filtering invoices',
      },
      {
        displayName: 'Warehouse Code',
        name: 'warehouseCode',
        type: 'string',
        default: '',
        description: 'Filter by warehouse code',
      },
      {
        displayName: 'Warehouse Name',
        name: 'warehouseName',
        type: 'string',
        default: '',
        description: 'Filter by warehouse name',
      },
    ],
  },

  // CREATE — required fields
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

  // CREATE/UPDATE — Invoice Details collection
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
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        description: 'Comments for the invoice',
      },
      {
        displayName: 'Currency Code',
        name: 'currencyCode',
        type: 'string',
        default: '',
        description: 'The currency code (e.g. NZD, USD)',
      },
      {
        displayName: 'Customer Ref',
        name: 'customerRef',
        type: 'string',
        default: '',
        description: 'The customer reference',
      },
      {
        displayName: 'Delivery City',
        name: 'deliveryCity',
        type: 'string',
        default: '',
        description: 'Delivery address city',
      },
      {
        displayName: 'Delivery Country',
        name: 'deliveryCountry',
        type: 'string',
        default: '',
        description: 'Delivery address country',
      },
      {
        displayName: 'Delivery Name',
        name: 'deliveryName',
        type: 'string',
        default: '',
        description: 'Delivery recipient name',
      },
      {
        displayName: 'Delivery Post Code',
        name: 'deliveryPostCode',
        type: 'string',
        default: '',
        description: 'Delivery address postal code',
      },
      {
        displayName: 'Delivery Region',
        name: 'deliveryRegion',
        type: 'string',
        default: '',
        description: 'Delivery address region/state',
      },
      {
        displayName: 'Delivery Street Address',
        name: 'deliveryStreetAddress',
        type: 'string',
        default: '',
        description: 'Delivery street address line 1',
      },
      {
        displayName: 'Delivery Street Address 2',
        name: 'deliveryStreetAddress2',
        type: 'string',
        default: '',
        description: 'Delivery street address line 2',
      },
      {
        displayName: 'Delivery Suburb',
        name: 'deliverySuburb',
        type: 'string',
        default: '',
        description: 'Delivery address suburb',
      },
      {
        displayName: 'Discount Rate',
        name: 'discountRate',
        type: 'number',
        typeOptions: { numberPrecision: 2, minValue: 0, maxValue: 100 },
        default: 0,
        description: 'The overall discount rate percentage',
      },
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        description: 'The due date for payment',
      },
      {
        displayName: 'Exchange Rate',
        name: 'exchangeRate',
        type: 'number',
        typeOptions: { numberPrecision: 6 },
        default: 0,
        description: 'The exchange rate for the invoice currency',
      },
      {
        displayName: 'Invoice Date',
        name: 'invoiceDate',
        type: 'dateTime',
        default: '',
        description: 'The date of the invoice',
      },
      {
        displayName: 'Invoice Number',
        name: 'invoiceNumber',
        type: 'string',
        default: '',
        description: 'The invoice number',
      },
      {
        displayName: 'Payment Due Date',
        name: 'paymentDueDate',
        type: 'dateTime',
        default: '',
        description: 'The payment due date',
      },
      {
        displayName: 'Sales Order Number',
        name: 'salesOrderNumber',
        type: 'string',
        default: '',
        description: 'The related sales order number',
      },
      {
        displayName: 'Tax Code',
        name: 'taxCode',
        type: 'string',
        default: '',
        description: 'The tax code for the invoice',
      },
      {
        displayName: 'Tax Rate',
        name: 'taxRate',
        type: 'number',
        typeOptions: { numberPrecision: 4 },
        default: 0,
        description: 'The tax rate for the invoice',
      },
      {
        displayName: 'Warehouse Code',
        name: 'warehouseCode',
        type: 'string',
        default: '',
        description: 'The warehouse code',
      },
    ],
  },

  // CREATE/UPDATE — Line Items
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
            description: 'The product code',
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            typeOptions: { numberPrecision: 4 },
            default: 1,
            required: true,
            description: 'The invoice quantity',
          },
          {
            displayName: 'Unit Price',
            name: 'unitPrice',
            type: 'number',
            typeOptions: { numberPrecision: 4 },
            default: 0,
            description: 'The unit price',
          },
          {
            displayName: 'Discount Rate',
            name: 'discountRate',
            type: 'number',
            typeOptions: { numberPrecision: 2, minValue: 0, maxValue: 100 },
            default: 0,
            description: 'The discount rate percentage for this line',
          },
          {
            displayName: 'Line Number',
            name: 'lineNumber',
            type: 'number',
            default: 0,
            description: 'The line number (for ordering)',
          },
          {
            displayName: 'Tax Code',
            name: 'taxCode',
            type: 'string',
            default: '',
            description: 'The tax code for this line item',
          },
          {
            displayName: 'Comments',
            name: 'comments',
            type: 'string',
            default: '',
            description: 'Comments for this line item',
          },
        ],
      },
    ],
  },
];
