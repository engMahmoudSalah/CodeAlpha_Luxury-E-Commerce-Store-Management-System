import { Router } from 'express';
import {
  getProducts,
  getProduct,
  listCategories,
  getPriceRangeHandler,
  getSearchSuggestionsHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler
} from '../controllers/productController.js';
import { validateProductId } from '../middleware/validator.js';

const router = Router();

router.get('/', getProducts);
router.get('/categories', listCategories);
router.get('/price-range', getPriceRangeHandler);
router.get('/suggestions', getSearchSuggestionsHandler);
router.get('/:id', validateProductId, getProduct);

// Mutations synced with Firestore and SQLite
router.post('/', createProductHandler);
router.put('/:id', validateProductId, updateProductHandler);
router.delete('/:id', validateProductId, deleteProductHandler);

export default router;

