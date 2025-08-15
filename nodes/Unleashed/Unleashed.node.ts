import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';

import {
  salesOrderFields,
  salesOrderOperations,
} from './descriptions/SalesOrderDescription.js';

import {
  invoiceFields,
  invoiceOperations,
} from './descriptions/InvoiceDescription.js';

import {
  customerFields,
  customerOperations,
} from './descriptions/CustomerDescription.js';

import {
  productFields,
  productOperations,
} from './descriptions/ProductDescription.js';

export class Unleashed implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Unleashed',
    name: 'unleashed',
    // Using a generic icon since we're having build issues with the file reference
    icon: 'file:unleashed.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Unleashed inventory management API',
    defaults: {
      name: 'Unleashed',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'unleashedApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Sales Order',
            value: 'salesOrder',
          },
          {
            name: 'Invoice',
            value: 'invoice',
          },
          {
            name: 'Customer',
            value: 'customer',
          },
          {
            name: 'Product',
            value: 'product',
          },
        ],
        default: 'salesOrder',
      },
      ...salesOrderOperations,
      ...invoiceOperations,
      ...customerOperations,
      ...productOperations,
      ...salesOrderFields,
      ...invoiceFields,
      ...customerFields,
      ...productFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0);
    const operation = this.getNodeParameter('operation', 0);

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;
        
        if (resource === 'salesOrder') {
          // Import and use sales order actions
          const { handleSalesOrder } = await import('./actions/SalesOrder/index.js');
          responseData = await handleSalesOrder.call(this, operation, i);
        } else if (resource === 'invoice') {
          // Import and use invoice actions
          const { handleInvoice } = await import('./actions/Invoice/index.js');
          responseData = await handleInvoice.call(this, operation, i);
        } else if (resource === 'customer') {
          // Import and use customer actions
          const { handleCustomer } = await import('./actions/Customer/index.js');
          responseData = await handleCustomer.call(this, operation, i);
        } else if (resource === 'product') {
          // Import and use product actions
          const { handleProduct } = await import('./actions/Product/index.js');
          responseData = await handleProduct.call(this, operation, i);
        }

        if (Array.isArray(responseData)) {
          returnData.push(...responseData);
        } else {
          returnData.push({ json: responseData });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
