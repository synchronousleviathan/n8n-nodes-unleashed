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
  // Get Product Code/GUID for single operations
  let productCode = '';
  if (['get', 'update'].includes(operation)) {
    productCode = this.getNodeParameter('productCode', itemIndex) as string;
  }

  // Handle operations
  if (operation === 'get') {
    return await unleashedApiRequest.call(this, 'GET', `/Products/${productCode}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
    const filters = this.getNodeParameter('filters', itemIndex, {}) as Record<string, any>;

    const qs: any = {};

    if (filters.modifiedSince) qs.modifiedSince = filters.modifiedSince;
    if (filters.productGroup) qs.productGroup = filters.productGroup;
    if (filters.barcode) qs.barcode = filters.barcode;
    if (filters.supplier) qs.supplier = filters.supplier;
    if (filters.supplierCode) qs.supplierCode = filters.supplierCode;
    if (filters.brand) qs.brand = filters.brand;
    if (filters.search) qs.search = filters.search;
    if (filters.sellPriceTier) qs.sellPriceTier = filters.sellPriceTier;
    if (filters.includeObsolete != null) qs.includeObsolete = filters.includeObsolete;
    if (filters.excludeAssembled != null) qs.excludeAssembled = filters.excludeAssembled;
    if (filters.excludeComponents != null) qs.excludeComponents = filters.excludeComponents;
    if (filters.orderBy) qs.orderBy = filters.orderBy;
    if (filters.sort) qs.sort = filters.sort;

    if (returnAll) {
      return await unleashedApiRequestAllItems.call(this, 'Items', 'GET', '/Products', {}, qs);
    } else {
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      qs.pageSize = limit;
      const response = await unleashedApiRequest.call(this, 'GET', '/Products/1', {}, qs);
      return response.Items || [];
    }
  }

  if (operation === 'create') {
    const productCodeValue = this.getNodeParameter('productCodeCreate', itemIndex) as string;
    const productDescriptionValue = this.getNodeParameter('productDescription', itemIndex) as string;
    const productDetails = this.getNodeParameter('productDetails', itemIndex, {}) as Record<string, any>;

    const body: any = {
      ProductCode: productCodeValue,
      ProductDescription: productDescriptionValue,
    };

    applyProductDetails(body, productDetails);

    return await unleashedApiRequest.call(this, 'POST', '/Products', body);
  }

  if (operation === 'update') {
    // Fetch current product first — the API does not support partial updates
    const currentProduct = await unleashedApiRequest.call(this, 'GET', `/Products/${productCode}`);

    const productDetails = this.getNodeParameter('productDetails', itemIndex, {}) as Record<string, any>;

    const body = { ...currentProduct };

    applyProductDetails(body, productDetails);

    return await unleashedApiRequest.call(this, 'PUT', `/Products/${productCode}`, body);
  }

  return null;
}

function applyProductDetails(body: any, d: Record<string, any>) {
  // String fields
  if (d.productDescription) body.ProductDescription = d.productDescription;
  if (d.barcode) body.Barcode = d.barcode;
  if (d.brand) body.Brand = d.brand;
  if (d.notes) body.Notes = d.notes;
  if (d.binLocation) body.BinLocation = d.binLocation;
  if (d.supplierCode) body.SupplierCode = d.supplierCode;
  if (d.supplierProductCode) body.SupplierProductCode = d.supplierProductCode;
  if (d.unitOfMeasure) body.UnitOfMeasure = { Name: d.unitOfMeasure };
  if (d.xeroCostOfGoodsAccount) body.XeroCostOfGoodsAccount = d.xeroCostOfGoodsAccount;
  if (d.xeroSalesAccount) body.XeroSalesAccount = d.xeroSalesAccount;
  if (d.taxablePurchase) body.TaxablePurchase = d.taxablePurchase;
  if (d.taxableSales) body.TaxableSales = d.taxableSales;

  // Product group as nested object
  if (d.productGroup) body.ProductGroup = { GroupName: d.productGroup };

  // Numeric fields
  const numericFields: Record<string, string> = {
    averageCost: 'AverageCost',
    defaultSellPrice: 'DefaultSellPrice',
    defaultPurchasePrice: 'DefaultPurchasePrice',
    minimumSellPrice: 'MinimumSellPrice',
    lastCost: 'LastCost',
    weight: 'Weight',
    width: 'Width',
    height: 'Height',
    depth: 'Depth',
    packSize: 'PackSize',
    minStockAlertLevel: 'MinStockAlertLevel',
    maxStockAlertLevel: 'MaxStockAlertLevel',
    reOrderLevel: 'ReOrderLevel',
    minimumOrderQuantity: 'MinimumOrderQuantity',
    sellPriceTier1: 'SellPriceTier1',
    sellPriceTier2: 'SellPriceTier2',
    sellPriceTier3: 'SellPriceTier3',
    sellPriceTier4: 'SellPriceTier4',
    sellPriceTier5: 'SellPriceTier5',
    sellPriceTier6: 'SellPriceTier6',
    sellPriceTier7: 'SellPriceTier7',
    sellPriceTier8: 'SellPriceTier8',
    sellPriceTier9: 'SellPriceTier9',
    sellPriceTier10: 'SellPriceTier10',
  };
  for (const [key, apiKey] of Object.entries(numericFields)) {
    if (d[key] != null) body[apiKey] = d[key];
  }

  // Boolean fields
  const boolFields: Record<string, string> = {
    isComponent: 'IsComponent',
    isAssembled: 'IsAssembledProduct',
    isSellable: 'IsSellable',
    neverDiminishing: 'NeverDiminishing',
    obsolete: 'Obsolete',
  };
  for (const [key, apiKey] of Object.entries(boolFields)) {
    if (d[key] != null) body[apiKey] = d[key];
  }
}
