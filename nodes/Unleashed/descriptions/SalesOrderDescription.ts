import { INodeProperties } from 'n8n-workflow';

export const salesOrderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a sales order',
        action: 'Create a sales order',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a sales order',
        action: 'Get a sales order',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many sales orders',
        action: 'Get many sales orders',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a sales order',
        action: 'Update a sales order',
      },
      {
        name: 'Complete',
        value: 'complete',
        description: 'Complete a sales order',
        action: 'Complete a sales order',
      },
    ],
    default: 'get',
  },
];

export const salesOrderFields: INodeProperties[] = [
  // GET operations
  {
    displayName: 'Sales Order ID',
    name: 'salesOrderId',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['get', 'update', 'complete'],
      },
    },
    default: '',
    required: true,
    description: 'The ID of the sales order',
  },
  
  // GET ALL operations
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['salesOrder'],
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
        resource: ['salesOrder'],
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
        resource: ['salesOrder'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Start date for filtering the sales orders',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'End date for filtering the sales orders',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        default: '',
        description: 'Filter by customer ID',
      },
      {
        displayName: 'Order Status',
        name: 'orderStatus',
        type: 'options',
        options: [
          {
            name: 'Open',
            value: 'Open',
          },
          {
            name: 'Completed',
            value: 'Completed',
          },
          {
            name: 'Cancelled',
            value: 'Cancelled',
          },
        ],
        default: 'Open',
        description: 'The status of the sales order',
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
        resource: ['salesOrder'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The customer code for the sales order',
  },
  {
    displayName: 'Sales Order Details',
    name: 'salesOrderDetails',
    type: 'collection',
    placeholder: 'Add Sales Order Detail',
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Order Number',
        name: 'orderNumber',
        type: 'string',
        default: '',
        description: 'The order number for the sales order',
      },
      {
        displayName: 'Order Date',
        name: 'orderDate',
        type: 'dateTime',
        default: '',
        description: 'The date of the sales order',
      },
      {
        displayName: 'Required Date',
        name: 'requiredDate',
        type: 'dateTime',
        default: '',
        description: 'The required date for the sales order',
      },
      {
        displayName: 'Tax Rate',
        name: 'taxRate',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 0,
        description: 'The tax rate for the sales order',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'string',
        default: '',
        description: 'The currency for the sales order',
      },
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Comments for the sales order',
      },
      {
        displayName: 'Delivery Instructions',
        name: 'deliveryInstruction',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Special instructions for the delivery driver',
      },
    ],
  },
  {
    displayName: 'Sales Order Line Items',
    name: 'salesOrderLineItems',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    displayOptions: {
      show: {
        resource: ['salesOrder'],
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
