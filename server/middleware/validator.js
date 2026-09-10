/**
 * Request Validation Helpers and Middleware
 */

// Email regex pattern (RFC 5322 standard compliance)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate registration payload
 */
export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name is required.'
      }
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name cannot exceed 100 characters.'
      }
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A valid email address is required.'
      }
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Password is required.'
      }
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 6 characters long.'
      }
    });
  }

  if (password.length > 128) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Password cannot exceed 128 characters.'
      }
    });
  }

  next();
}

/**
 * Validate login payload
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email is required.'
      }
    });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Password is required.'
      }
    });
  }

  next();
}

/**
 * Validate Product ID parameter
 */
export function validateProductId(req, res, next) {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Product ID must be a valid positive integer.'
      }
    });
  }

  const numericId = parseInt(id, 10);
  if (numericId <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Product ID must be a positive integer.'
      }
    });
  }

  req.numericProductId = numericId;
  next();
}

/**
 * Validate Order ID parameter
 */
export function validateOrderId(req, res, next) {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Order ID must be a valid positive integer.'
      }
    });
  }

  const numericId = parseInt(id, 10);
  if (numericId <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Order ID must be a positive integer.'
      }
    });
  }

  req.numericOrderId = numericId;
  next();
}

/**
 * Validate order creation payload
 */
export function validateCreateOrder(req, res, next) {
  const { items, customer } = req.body;

  // Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_CART',
        message: 'Order must contain at least one item.'
      }
    });
  }

  if (items.length > 50) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Order cannot contain more than 50 distinct items.'
      }
    });
  }

  const seenProductIds = new Set();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Item at index ${i} is invalid.`
        }
      });
    }

    const { productId, quantity } = item;

    // Validate productId
    if (
      productId === undefined ||
      productId === null ||
      typeof productId !== 'number' ||
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Item at index ${i} has an invalid productId. Must be a positive integer.`
        }
      });
    }

    // Check for duplicate product IDs
    if (seenProductIds.has(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_PRODUCT_IN_CART',
          message: `Duplicate productId ${productId} found in order items. Merge quantities before submitting.`
        }
      });
    }
    seenProductIds.add(productId);

    // Validate quantity
    if (
      quantity === undefined ||
      quantity === null ||
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: `Item at index ${i} (productId: ${productId}) has an invalid quantity. Must be an integer greater than 0.`
        }
      });
    }

    if (quantity > 1000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: `Item at index ${i} quantity exceeds maximum limit of 1000.`
        }
      });
    }
  }

  // Extract and normalize customer/shipping details from customer or shippingAddress payload
  let rawCustomer = customer || req.body.shippingAddress;

  if (!rawCustomer || typeof rawCustomer !== 'object') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Customer and shipping details are required.'
      }
    });
  }

  const name = rawCustomer.name || rawCustomer.recipient_name || req.body.shippingAddress?.recipient_name || req.body.shippingAddress?.name || req.user?.name;
  const email = rawCustomer.email || req.body.shippingAddress?.email || req.user?.email || 'customer@luxestore.com';
  const address = rawCustomer.address || 
    [rawCustomer.address_line1, rawCustomer.address_line2].filter(Boolean).join(', ') || 
    [req.body.shippingAddress?.address_line1, req.body.shippingAddress?.address_line2].filter(Boolean).join(', ') || 
    req.body.shippingAddress?.address;
  const city = rawCustomer.city || req.body.shippingAddress?.city;
  const resolvedPostalCode = rawCustomer.postalCode || rawCustomer.postal_code || req.body.shippingAddress?.postal_code || req.body.shippingAddress?.postalCode;
  const phone = rawCustomer.phone || req.body.shippingAddress?.phone || req.user?.phone;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Customer name is required.'
      }
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Customer name cannot exceed 100 characters.'
      }
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A valid customer email is required.'
      }
    });
  }

  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Shipping address is required.'
      }
    });
  }

  if (address.trim().length > 255) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Shipping address cannot exceed 255 characters.'
      }
    });
  }

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Shipping city is required.'
      }
    });
  }

  if (city.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'City cannot exceed 100 characters.'
      }
    });
  }

  if (!resolvedPostalCode || typeof resolvedPostalCode !== 'string' || resolvedPostalCode.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Postal code is required.'
      }
    });
  }

  if (resolvedPostalCode.trim().length > 20) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Postal code cannot exceed 20 characters.'
      }
    });
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 6 || phone.trim().length > 30) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A valid contact phone number is required (6-30 characters).'
      }
    });
  }

  // Attach normalized customer details to request
  req.normalizedCustomer = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    address: address.trim(),
    city: city.trim(),
    postalCode: resolvedPostalCode.trim(),
    phone: phone.trim()
  };

  next();
}
