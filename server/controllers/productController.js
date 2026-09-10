import {
  getAllProducts,
  getProductById,
  getCategories,
  getCategoryCounts,
  getPriceRange,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/productService.js';

/**
 * Get all products (with optional search, category, minPrice, maxPrice, sort, instock, page, limit)
 */
export function getProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, sort, instock, page, limit } = req.query;

    const products = getAllProducts({ search, category, minPrice, maxPrice, sort, instock, page, limit });

    const total = products.total !== undefined ? products.total : products.length;
    const totalPages = products.totalPages !== undefined ? products.totalPages : 1;
    const currentPage = products.page !== undefined ? products.page : 1;
    const currentLimit = products.limit !== undefined ? products.limit : products.length;

    return res.status(200).json({
      success: true,
      data: {
        products,
        total,
        totalPages,
        page: currentPage,
        limit: currentLimit,
        pagination: {
          total,
          totalPages,
          page: currentPage,
          limit: currentLimit
        }
      },
      message: 'Products retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single product by ID
 */
export function getProduct(req, res, next) {
  try {
    const id = req.numericProductId;
    const product = getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${id} was not found.`
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product
      },
      message: 'Product details retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get distinct list of product categories
 */
export function listCategories(req, res, next) {
  try {
    const categories = getCategories();
    const counts = getCategoryCounts();
    return res.status(200).json({
      success: true,
      data: {
        categories,
        counts
      },
      message: 'Categories retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get price range across products
 */
export function getPriceRangeHandler(req, res, next) {
  try {
    const range = getPriceRange();
    return res.status(200).json({
      success: true,
      data: range,
      message: 'Price range retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get instant search suggestions
 */
export function getSearchSuggestionsHandler(req, res, next) {
  try {
    const { q } = req.query;
    const suggestions = getSearchSuggestions(q);
    return res.status(200).json({
      success: true,
      data: suggestions,
      message: 'Search suggestions retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new product
 * POST /api/products
 */
export function createProductHandler(req, res, next) {
  try {
    const { name, description, price, image_url, stock, category } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Product name and price are required.' }
      });
    }

    const product = createProduct({ name, description, price, image_url, stock, category });
    return res.status(201).json({
      success: true,
      data: { product },
      message: 'Product created and synced successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update product
 * PUT /api/products/:id
 */
export function updateProductHandler(req, res, next) {
  try {
    const id = req.numericProductId || Number(req.params.id);
    const updated = updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Product ${id} not found.` }
      });
    }

    return res.status(200).json({
      success: true,
      data: { product: updated },
      message: 'Product updated and synced successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete product
 * DELETE /api/products/:id
 */
export function deleteProductHandler(req, res, next) {
  try {
    const id = req.numericProductId || Number(req.params.id);
    const deleted = deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Product ${id} not found.` }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted and synced successfully.'
    });
  } catch (error) {
    next(error);
  }
}
