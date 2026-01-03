# E-Commerce Chatbot Flow Implementation Prompt

## Overview
This prompt will guide you through implementing a complete e-commerce conversation flow in your VistaView chatbot and voice-to-voice chatbot. The system will handle product browsing, detailed information, alternatives, cart management, payment processing, and order completion.

## Step 1: Enhanced Product Data Structure

### Task: Update products.json with alternatives and relationships

**File**: `src/v3/data/products.json`

**Instructions**:
1. Add `alternatives` object to each product with:
   - `budget`: Lower-priced alternative (70-90% of original price)
   - `premium`: Higher-priced alternative (120-150% of original price)  
   - `similar`: Similar-priced alternative (90-110% of original price)

2. Add `relatedProducts` array with product IDs
3. Add `accessories` array with accessory product IDs

**Example Structure**:
```json
{
  "id": 1,
  "name": "Premium Marble Tiles",
  "alternatives": {
    "budget": {
      "id": 101,
      "name": "Classic Ceramic Tiles",
      "price": 18000.00,
      "description": "High-quality ceramic tiles with marble finish",
      "image": "/assets/images/v3.2/property-images/living.png",
      "rating": 4.5,
      "vendor": "Budget Tiles Co."
    },
    "premium": {
      "id": 102, 
      "name": "Luxury Granite Tiles",
      "price": 35000.00,
      "description": "Premium granite tiles with natural stone finish",
      "image": "/assets/images/v3.2/property-images/living.png",
      "rating": 4.9,
      "vendor": "Premium Stone Co."
    },
    "similar": {
      "id": 103,
      "name": "Modern Porcelain Tiles", 
      "price": 22000.00,
      "description": "Durable porcelain tiles with contemporary design",
      "image": "/assets/images/v3.2/property-images/living.png",
      "rating": 4.7,
      "vendor": "Modern Tiles Co."
    }
  },
  "relatedProducts": [4, 6],
  "accessories": [7, 8]
}
```

## Step 2: Cart Management System

### Task: Create CartContext for state management

**File**: `src/contexts/CartContext.tsx`

**Instructions**:
1. Create React context with cart state management
2. Implement functions: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`
3. Add order creation and OTP verification (correct OTP: 111222)
4. Include TypeScript interfaces for CartItem, CartState, and Order

**Key Features**:
- Cart items with product details
- Total calculation and item count
- Order generation with unique IDs
- OTP verification with attempt limits

## Step 3: E-Commerce Flow Utilities

### Task: Create conversation flow logic

**File**: `src/utils/ecommerceFlow.ts`

**Instructions**:
1. Implement intent detection function `detectEcommerceIntent()`
2. Create response generators for each flow phase:
   - `generateProductDetailsResponse()`
   - `generateAlternativesResponse()`
   - `generateCartResponse()`
   - `generateCheckoutResponse()`
   - `generatePaymentConfirmationResponse()`
   - `generateOTPResponse()`
   - `generateOrderConfirmationResponse()`

3. Add utility functions:
   - `extractProductName()` - Find products from user input
   - `getProductAlternatives()` - Get alternative products
   - `getRandomProducts()` - Get random products for browsing

## Step 4: ChatbotModal Integration

### Task: Integrate e-commerce flow into text chatbot

**File**: `src/components/ChatbotModal.tsx`

**Instructions**:
1. Import CartContext and e-commerce utilities
2. Add e-commerce flow state management
3. Update Message interface to include ecommerceFlow data
4. Create `handleEcommerceFlow()` function with switch cases for each intent
5. Integrate e-commerce detection in `handleSendMessage()`

**Flow Implementation**:
```typescript
const handleEcommerceFlow = async (intent: string, message: string, products: any[]) => {
  switch (intent) {
    case 'browse-products':
      // Show random products as cards
    case 'product-details':
      // Show detailed product information
    case 'show-alternatives':
      // Show alternative products
    case 'add-to-cart':
      // Add product to cart
    case 'view-cart':
      // Show cart contents
    case 'checkout':
      // Show checkout summary
    case 'select-payment':
      // Process payment method selection
    case 'verify-otp':
      // Verify OTP and complete order
  }
};
```

## Step 5: VoiceToVoiceModal Integration

### Task: Integrate e-commerce flow into voice chatbot

**File**: `src/components/VoiceToVoiceModal.tsx`

**Instructions**:
1. Import CartContext and e-commerce utilities
2. Add e-commerce flow state management
3. Update Message interface to include ecommerceFlow data
4. Create `handleEcommerceFlow()` function (same as ChatbotModal)
5. Integrate e-commerce detection in `generateAIResponse()`

**Voice Integration**:
- Speech-to-text converts voice to text for processing
- Same e-commerce logic processes the text
- Text-to-speech converts responses back to voice
- Visual product displays during voice conversations

## Step 6: App Integration

### Task: Add CartProvider to app context

**File**: `src/App.tsx`

**Instructions**:
1. Import CartProvider from contexts
2. Wrap ChatbotProvider with CartProvider
3. Ensure proper context hierarchy

**Context Structure**:
```tsx
<FloatingAskBarProvider>
  <CartProvider>
    <ChatbotProvider>
      <AIModeProvider>
        {/* App content */}
      </AIModeProvider>
    </ChatbotProvider>
  </CartProvider>
</FloatingAskBarProvider>
```

## Step 7: Conversation Flow Implementation

### Complete E-Commerce Flow

**Phase 1: Product Discovery**
- **User Input**: "Show me some products" / "I want to see products"
- **AI Response**: Display 4-6 products as interactive cards
- **Implementation**: Use `getRandomProducts()` and display as ProductCard components

**Phase 2: Product Details**
- **User Input**: "Tell me details about [product name]"
- **AI Response**: Show comprehensive product information
- **Implementation**: Use `generateProductDetailsResponse()` with product specifications

**Phase 3: Alternatives**
- **User Input**: "Give me alternatives" / "Show me premium options"
- **AI Response**: Display budget, premium, and similar alternatives
- **Implementation**: Use `getProductAlternatives()` and `generateAlternativesResponse()`

**Phase 4: Cart Management**
- **User Input**: "Add to cart" / "Add [product name] to cart"
- **AI Response**: Add product and show cart summary
- **Implementation**: Use `addToCart()` and `generateCartResponse()`

**Phase 5: Checkout**
- **User Input**: "Checkout" / "Proceed to payment"
- **AI Response**: Show final summary and payment options
- **Implementation**: Use `generateCheckoutResponse()` with payment gateways

**Phase 6: Payment Selection**
- **User Input**: "I'll pay with [payment method]"
- **AI Response**: Confirm payment and request OTP
- **Implementation**: Use `generatePaymentConfirmationResponse()`

**Phase 7: OTP Verification**
- **User Input**: "OTP is [6-digit number]"
- **AI Response**: Verify OTP (111222 works, others fail)
- **Implementation**: Use `verifyOTP()` and `generateOTPResponse()`

**Phase 8: Order Confirmation**
- **AI Response**: Show order details and delivery information
- **Implementation**: Use `generateOrderConfirmationResponse()` with order details

## Step 8: Intent Detection Patterns

### E-Commerce Intent Keywords

**Product Browsing**:
- "show products", "browse", "see products", "what products"

**Product Details**:
- "details", "tell me about", "more info", "specifications"

**Alternatives**:
- "alternatives", "premium", "similar", "other options", "budget"

**Cart Management**:
- "add to cart", "buy this", "purchase", "view cart", "show cart"

**Checkout**:
- "checkout", "proceed to payment", "buy now", "complete purchase"

**Payment**:
- "pay with", "credit card", "upi", "payment method", "net banking"

**OTP Verification**:
- "otp", "verification code", 6-digit numbers

## Step 9: Error Handling

### Common Error Scenarios

1. **Product Not Found**: "I couldn't find that product. Let me show you our available products."
2. **Empty Cart**: "Your cart is empty. Would you like to browse our products first?"
3. **Invalid OTP**: "The OTP you entered is incorrect. Please try again."
4. **Payment Failure**: "Payment could not be processed. Please try a different method."
5. **Network Issues**: "I'm having trouble connecting. Please try again in a moment."

## Step 10: Testing Scenarios

### Test Cases

1. **Complete Purchase Flow**:
   - Browse → Details → Add to Cart → Checkout → Payment → OTP → Order

2. **Alternative Products**:
   - Select product → Request alternatives → View different options

3. **Cart Management**:
   - Add multiple items → Update quantities → Remove items

4. **Payment Failure**:
   - Test with wrong OTP → Verify attempt limits → Test cancellation

5. **Voice Interaction**:
   - Complete flow using voice commands → Verify TTS responses

## Step 11: Success Criteria

### Implementation Checklist

- [ ] Product data enhanced with alternatives
- [ ] Cart management system implemented
- [ ] E-commerce flow utilities created
- [ ] ChatbotModal integrated with e-commerce flow
- [ ] VoiceToVoiceModal integrated with e-commerce flow
- [ ] App context updated with CartProvider
- [ ] All conversation phases working
- [ ] Intent detection functioning
- [ ] Error handling implemented
- [ ] OTP verification working (111222 correct)
- [ ] Order confirmation displaying
- [ ] Voice integration working
- [ ] Visual product cards displaying
- [ ] Cart updates in real-time

## Step 12: Deployment Notes

### Key Configuration

1. **OTP Verification**: Only "111222" is accepted, all others fail
2. **Order IDs**: Format "VV-[timestamp]-[random]"
3. **Delivery Dates**: 3-7 days from order date
4. **Payment Methods**: Credit/Debit Card, UPI, Net Banking, EMI
5. **Product Display**: 4-6 products for browsing, 3-4 for alternatives

### Performance Considerations

- Use React.memo for product cards
- Implement proper loading states
- Handle large product catalogs efficiently
- Optimize voice processing for real-time interaction

## Final Implementation Summary

This implementation provides a complete e-commerce chatbot experience with:

✅ **Smart Intent Detection**: Natural language understanding
✅ **Product Management**: Browsing, details, alternatives
✅ **Cart Functionality**: Add, remove, update, checkout
✅ **Payment Processing**: Multiple gateways with OTP verification
✅ **Order Management**: Confirmation, tracking, delivery
✅ **Voice Integration**: Full voice-to-voice support
✅ **Error Handling**: Comprehensive error scenarios
✅ **Visual Feedback**: Interactive product cards and displays

The system is designed to handle the complete customer journey from product discovery to order completion, with both text and voice interaction support.
