import v3Products from '../v3/data/products.json';

export interface EcommerceFlowState {
  currentPhase: 'browsing' | 'product-details' | 'alternatives' | 'cart' | 'checkout' | 'payment' | 'otp' | 'order-confirmation';
  selectedProduct?: any;
  cartItems: any[];
  paymentMethod?: string;
  orderDetails?: any;
  otpAttempts: number;
}

export const detectEcommerceIntent = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  console.log('=== DETECT ECOMMERCE INTENT DEBUG ===');
  console.log('Original message:', message);
  console.log('Lower message:', lowerMessage);
  
  // Product browsing intents
  if (lowerMessage.includes('show') && (lowerMessage.includes('product') || lowerMessage.includes('item'))) {
    console.log('Detected: browse-products (show + product/item)');
    return 'browse-products';
  }
  
  if (lowerMessage.includes('browse') || lowerMessage.includes('see products') || lowerMessage.includes('what products')) {
    console.log('Detected: browse-products (browse/see products)');
    return 'browse-products';
  }
  
  // Product details intents
  if (lowerMessage.includes('details') || lowerMessage.includes('tell me about') || lowerMessage.includes('more info')) {
    console.log('Detected: product-details');
    return 'product-details';
  }
  
  // Alternative products intents
  if (lowerMessage.includes('alternative') || lowerMessage.includes('premium') || lowerMessage.includes('similar') || lowerMessage.includes('other options')) {
    console.log('Detected: show-alternatives');
    return 'show-alternatives';
  }
  
  // Cart management intents
  if (lowerMessage.includes('add to cart') || lowerMessage.includes('add this') || lowerMessage.includes('buy this') || lowerMessage.includes('purchase') || lowerMessage.includes('add to my cart') || lowerMessage.includes('put in cart')) {
    console.log('Detected: add-to-cart');
    return 'add-to-cart';
  }
  
  if (lowerMessage.includes('cart') && (lowerMessage.includes('view') || lowerMessage.includes('show'))) {
    console.log('Detected: view-cart');
    return 'view-cart';
  }
  
  // Checkout intents
  if (lowerMessage.includes('checkout') || lowerMessage.includes('check out') || lowerMessage.includes('proceed to payment') || lowerMessage.includes('buy now') || lowerMessage.includes('place order') || lowerMessage.includes('complete order')) {
    console.log('Detected: checkout');
    return 'checkout';
  }
  
  // Payment method intents
  if (lowerMessage.includes('pay with') || lowerMessage.includes('credit card') || lowerMessage.includes('debit card') || lowerMessage.includes('card') || lowerMessage.includes('upi') || lowerMessage.includes('payment method') || lowerMessage.includes('net banking') || lowerMessage.includes('emi')) {
    console.log('Detected: select-payment');
    console.log('Pay with check:', lowerMessage.includes('pay with'));
    console.log('Card check:', lowerMessage.includes('card'));
    console.log('Credit card check:', lowerMessage.includes('credit card'));
    return 'select-payment';
  }
  
  // OTP intents
  if (lowerMessage.includes('otp') || lowerMessage.includes('verification code') || lowerMessage.match(/\b\d{6}\b/)) {
    console.log('Detected: verify-otp');
    return 'verify-otp';
  }
  
  console.log('No intent detected');
  console.log('=====================================');
  return null;
};

export const extractProductName = (message: string, products: any[]): any | null => {
  const lowerMessage = message.toLowerCase();
  
  for (const product of products) {
    const productName = product.name.toLowerCase();
    if (lowerMessage.includes(productName) || 
        productName.split(' ').some(word => lowerMessage.includes(word))) {
      return product;
    }
  }
  
  return null;
};

export const getProductAlternatives = (product: any): any[] => {
  if (!product.alternatives) return [];
  
  const alternatives = [];
  if (product.alternatives.budget) alternatives.push({ ...product.alternatives.budget, type: 'budget' });
  if (product.alternatives.premium) alternatives.push({ ...product.alternatives.premium, type: 'premium' });
  if (product.alternatives.similar) alternatives.push({ ...product.alternatives.similar, type: 'similar' });
  
  return alternatives;
};

export const generateProductDetailsResponse = (product: any): string => {
  const savings = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  
  return `Here are the details for *${product.name}*:

*Price:* $${product.price.toLocaleString()} (MRP: $${product.mrp.toLocaleString()}) - *${savings}% OFF*
*Category:* ${product.category}
*Vendor:* ${product.vendor}
*Rating:* ${product.rating}★ (${product.reviews} reviews)
*Warranty:* ${product.warranty}

*Key Features:*
${product.features.map((feature: string) => `• ${feature}`).join('\n')}

*Specifications:*
${Object.entries(product.specifications).map(([key, value]) => `• ${key}: ${value}`).join('\n')}

*Description:* ${product.description}

${product.insurance?.available ? `*Insurance Available:* ${product.insurance.coverage} - $${product.insurance.price}` : ''}

Would you like to add this to your cart or see similar products?`;
};

export const generateAlternativesResponse = (product: any, alternatives: any[]): string => {
  let response = `Here are some great alternatives to *${product.name}*:\n\n`;
  
  alternatives.forEach((alt, index) => {
    const savings = alt.mrp ? Math.round(((alt.mrp - alt.price) / alt.mrp) * 100) : 0;
    const typeLabel = alt.type === 'budget' ? '💰 Budget Option' : 
                     alt.type === 'premium' ? '⭐ Premium Option' : 
                     '🔄 Similar Option';
    
    response += `*${typeLabel}*\n`;
    response += `*${alt.name}* - $${alt.price.toLocaleString()}\n`;
    response += `${alt.description}\n`;
    response += `Rating: ${alt.rating}★ | Vendor: ${alt.vendor}\n\n`;
  });
  
  response += `Each option offers great value in its category. Would you like to see details of any specific alternative or add one to your cart?`;
  
  return response;
};

export const generateCartResponse = (cartItems: any[], total: number): string => {
  if (cartItems.length === 0) {
    return `Your cart is empty. Would you like to browse our amazing products?`;
  }
  
  let response = `*Your Cart Summary:*\n\n`;
  
  cartItems.forEach((item, index) => {
    response += `${index + 1}. *${item.name}*\n`;
    response += `   Quantity: ${item.quantity} | Price: $${item.price.toLocaleString('en-US')} each\n`;
    response += `   Subtotal: $${(item.price * item.quantity).toLocaleString('en-US')}\n\n`;
  });
  
  response += `*Total: $${total.toLocaleString('en-US')}*\n\n`;
  response += `Ready to checkout? Or would you like to browse more products?`;
  
  return response;
};

export const generateCheckoutResponse = (cartItems: any[], total: number): string => {
  let response = `*Final Order Summary:*\n\n`;
  
  cartItems.forEach((item, index) => {
    response += `${index + 1}. *${item.name}* (Qty: ${item.quantity})\n`;
    response += `   $${(item.price * item.quantity).toLocaleString('en-US')}\n\n`;
  });
  
  response += `*Total Amount: $${total.toLocaleString('en-US')}*\n\n`;
  response += `*Available Payment Methods:*\n`;
  response += `• 💳 Credit/Debit Card\n`;
  response += `• 🏦 Net Banking\n`;
  response += `• 💰 EMI Options\n\n`;
  response += `Please choose your preferred payment method to proceed with the secure checkout.`;
  
  return response;
};

export const generatePaymentConfirmationResponse = (paymentMethod: string): string => {
  const method = paymentMethod === 'Credit/Debit Card' ? 'your saved card' : paymentMethod;
  return `Great! We'll use ${method} on file for this order.

For security, please enter the 6-digit OTP sent to your registered mobile number to authorize the payment.`;
};

export const generateOTPResponse = (isValid: boolean, attempts: number): string => {
  if (isValid) {
    return `OTP verified successfully! Your payment has been processed. 🎉`;
  } else {
    const remainingAttempts = 3 - attempts;
    if (remainingAttempts > 0) {
      return `The OTP you entered is incorrect. Please check and try again. You have ${remainingAttempts} more attempts.`;
    } else {
      return `For security reasons, this transaction has been cancelled. Please try again later or contact support.`;
    }
  }
};

export const generateOrderConfirmationResponse = (order: any): string => {
  const deliveryDate = order.deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `🎉 *Congratulations! Your order has been placed successfully!*

*Order Details:*
• Order Number: *${order.orderId}*
• Payment Method: ${order.paymentMethod}
• Total Amount: $${order.totalAmount.toLocaleString()}
• Estimated Delivery: *${deliveryDate}*

*Items Ordered:*
${order.items.map((item: any, index: number) => 
  `${index + 1}. ${item.name} (Qty: ${item.quantity})`
).join('\n')}

*What's Next:*
• You'll receive SMS and email updates about your order status
• Tracking information will be sent once your order is shipped
• Your products will be delivered to your registered address

Thank you for choosing VistaView! 🏠✨`;
};

export const getRandomProducts = (count: number = 4): any[] => {
  const shuffled = [...v3Products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Test function to verify intent detection
export const testIntentDetection = () => {
  const testCases = [
    'pay with card',
    'use credit card',
    'pay with credit card',
    'card payment',
    'checkout',
    'check out',
    'add to cart',
    '111222'
  ];
  
  console.log('=== TESTING INTENT DETECTION ===');
  testCases.forEach(testCase => {
    const result = detectEcommerceIntent(testCase);
    console.log(`"${testCase}" -> ${result}`);
  });
  console.log('================================');
};
