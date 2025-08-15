import { IExecuteFunctions } from 'n8n-workflow';
import { unleashedApiRequest, unleashedApiRequestAllItems } from '../GenericFunctions';

/**
 * Handle all Product operations
 */
export async function handleProduct(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  // Get Product ID/Code for single operations
  let productCode = '';
  if (['get', 'update'].includes(operation)) {
    productCode = this.getNodeParameter('productCode', itemIndex) as string;
  }
  
  // Handle operations
  if (operation === 'get') {
    // Get a single product
    return await unleashedApiRequest.call(this, 'GET', `/Products/${productCode}`);
  }
  
  if (operation === 'getAll') {
    // Get all products with optional filters
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as {
      modifiedSince?: string;
      productGroup?: string;
      barcode?: string;
      supplier?: string;
      brand?: string;
    };
    
    const qs: any = {};
    
    // Add filters to query string
    if (filters.modifiedSince) qs.modifiedSince = filters.modifiedSince;
    if (filters.productGroup) qs.productGroup = filters.productGroup;
    if (filters.barcode) qs.barcode = filters.barcode;
    if (filters.supplier) qs.supplier = filters.supplier;
    if (filters.brand) qs.brand = filters.brand;
    
    if (returnAll) {
      // Get all results
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/Products', {}, qs);
    } else {
      // Get limited results
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/Products', {}, qs);
      return response.Items || [];
    }
  }
  
  if (operation === 'create') {
    // Create a new product
    const productDetails = this.getNodeParameter('productDetails', itemIndex) as {
      productCode: string;
      productDescription: string;
      productGroup?: string;
      barcode?: string;
      brand?: string;
      averageCost?: number;
      defaultSellPrice?: number;
      minimumSellPrice?: number;
      weight?: number;
      width?: number;
      height?: number;
      depth?: number;
      notes?: string;
      isComponent?: boolean;
    };
    
    // Build request body
    const body: any = {
      ProductCode: productDetails.productCode,
      ProductDescription: productDetails.productDescription,
    };
    
    // Add optional fields if provided
    if (productDetails.productGroup) body.ProductGroup = { GroupName: productDetails.productGroup };
    if (productDetails.barcode) body.Barcode = productDetails.barcode;
    if (productDetails.brand) body.Brand = productDetails.brand;
    if (productDetails.averageCost) body.AverageCost = productDetails.averageCost;
    if (productDetails.defaultSellPrice) body.DefaultSellPrice = productDetails.defaultSellPrice;
    if (productDetails.minimumSellPrice) body.MinimumSellPrice = productDetails.minimumSellPrice;
    if (productDetails.weight) body.Weight = productDetails.weight;
    if (productDetails.width) body.Width = productDetails.width;
    if (productDetails.height) body.Height = productDetails.height;
    if (productDetails.depth) body.Depth = productDetails.depth;
    if (productDetails.notes) body.Notes = productDetails.notes;
    if (productDetails.isComponent !== undefined) body.IsComponent = productDetails.isComponent;
    
    return await unleashedApiRequest.call(this, 'POST', '/Products', body);
  }
  
  if (operation === 'update') {
    // Update an existing product
    // First, get the current product data
    const currentProduct = await unleashedApiRequest.call(this, 'GET', `/Products/${productCode}`);
    
    const productDetails = this.getNodeParameter('productDetails', itemIndex, {}) as {
      productDescription?: string;
      productGroup?: string;
      barcode?: string;
      brand?: string;
      averageCost?: number;
      defaultSellPrice?: number;
      minimumSellPrice?: number;
      weight?: number;
      width?: number;
      height?: number;
      depth?: number;
      notes?: string;
      isComponent?: boolean;
    };
    
    // Prepare the update body with existing data
    const body = { ...currentProduct };
    
    // Update fields if provided
    if (productDetails.productDescription) body.ProductDescription = productDetails.productDescription;
    if (productDetails.productGroup) {
      body.ProductGroup = { GroupName: productDetails.productGroup };
    }
    if (productDetails.barcode) body.Barcode = productDetails.barcode;
    if (productDetails.brand) body.Brand = productDetails.brand;
    if (productDetails.averageCost) body.AverageCost = productDetails.averageCost;
    if (productDetails.defaultSellPrice) body.DefaultSellPrice = productDetails.defaultSellPrice;
    if (productDetails.minimumSellPrice) body.MinimumSellPrice = productDetails.minimumSellPrice;
    if (productDetails.weight) body.Weight = productDetails.weight;
    if (productDetails.width) body.Width = productDetails.width;
    if (productDetails.height) body.Height = productDetails.height;
    if (productDetails.depth) body.Depth = productDetails.depth;
    if (productDetails.notes) body.Notes = productDetails.notes;
    if (productDetails.isComponent !== undefined) body.IsComponent = productDetails.isComponent;
    
    return await unleashedApiRequest.call(this, 'PUT', `/Products/${productCode}`, body);
  }
  
  return null;
}
