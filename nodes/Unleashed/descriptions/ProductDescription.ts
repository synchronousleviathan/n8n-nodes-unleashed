import { INodeProperties } from 'n8n-workflow';

export const productOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['product'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        action: 'Get a product',
        description: 'Get a single product by Guid or Product Code',
      },
      {
        name: 'Get All',
        value: 'getAll',
        action: 'Get all products',
        description: 'Get a list of products',
      },
    ],
    default: 'get',
  },
];

export const productFields: INodeProperties[] = [
  // Get operation
  {
    displayName: 'Product Code',
    name: 'productCode',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['get'],
      },
    },
    default: '',
    description: 'Code of the product to retrieve',
  },
  
  // Get All operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['product'],
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
        resource: ['product'],
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
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Product Group',
        name: 'productGroup',
        type: 'string',
        default: '',
        description: 'Filter products by product group',
      },
      {
        displayName: 'Search Term',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search term to filter products (searches in code, description, etc.)',
      },
      {
        displayName: 'Last Modified Since',
        name: 'modifiedSince',
        type: 'dateTime',
        default: '',
        description: 'Filter products modified since this date/time',
      },
    ],
  },
];
