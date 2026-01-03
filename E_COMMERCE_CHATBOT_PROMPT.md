# E-Commerce Chatbot Flow Implementation Prompt

## Overview
This prompt defines the complete e-commerce conversation flow for both text-based and voice-to-voice chatbots in the VistaView application. The system should handle product browsing, detailed information, alternatives, cart management, payment processing, and order completion.

## Core Flow Implementation

### 1. Product Discovery Phase
**User Intent**: "Show me some products" / "I want to see products" / "What products do you have?"

**AI Response**: 
- Display products as interactive cards (using existing ProductCard component)
- Show 4-6 products in a grid layout
- Include: product image, name, price, rating, key features
- Add "View Details" and "Add to Cart" buttons on each card
- Use friendly, engaging language: "Here are some amazing products I think you'll love! Each one is carefully selected for quality and value."

### 2. Product Details Phase
**User Intent**: "Tell me details about [product name]" / "What's special about [product name]?" / "More info on [product name]"

**AI Response**:
- Provide comprehensive product description
- Include specifications, features, warranty information
- Mention customer reviews and ratings
- Highlight unique selling points
- Suggest related products or accessories
- End with: "Would you like to add this to your cart or see similar products?"

### 3. Alternative & Premium Products Phase
**User Intent**: "Give me alternatives" / "Show me premium options" / "What else do you have like this?"

**AI Response**:
- Display 3-4 alternative products as cards
- Include budget-friendly alternatives and premium upgrades
- Explain the differences and benefits of each option
- Use product matching logic based on:
  - Same category
  - Similar price range (±20%)
  - Complementary features
  - Customer preference patterns

**Product Matching Logic**:
```json
{
  "alternatives": [
    {
      "type": "budget",
      "priceRange": "original_price * 0.7 to original_price * 0.9",
      "description": "Great value option with essential features"
    },
    {
      "type": "premium", 
      "priceRange": "original_price * 1.2 to original_price * 1.5",
      "description": "Premium version with advanced features"
    },
    {
      "type": "similar",
      "priceRange": "original_price * 0.9 to original_price * 1.1", 
      "description": "Similar quality with different style/features"
    }
  ]
}
```

### 4. Cart Management Phase
**User Intent**: "Add to cart" / "Add [product name] to cart" / "I want to buy this"

**AI Response**:
- Add product to cart with quantity
- Show confirmation message with cart summary
- Display current cart items and total
- Suggest: "Ready to checkout? Or would you like to browse more products?"
- Include cart management options: "You can also view your cart, update quantities, or remove items."

### 5. Checkout Initiation Phase
**User Intent**: "Checkout" / "Proceed to payment" / "Buy now" / "Complete purchase"

**AI Response**:
- Display final cart summary with all items and total
- Show available payment gateways:
  - Credit/Debit Card
  - UPI (PhonePe, Google Pay, Paytm)
  - Net Banking
  - EMI Options
- Ask: "Please choose your preferred payment method to proceed with the secure checkout."

### 6. Payment Gateway Selection Phase
**User Intent**: "I'll pay with [payment method]" / "Use [gateway name]" / "Credit card"

**AI Response**:
- Confirm payment method selection
- Display message: "Perfect! I'm proceeding with your payment using [selected method]. I'll use the payment details we have on file for your account."
- Add: "For security, I'll need to verify this transaction with an OTP. Please check your registered mobile number for the verification code."
- Show loading animation while processing

### 7. OTP Verification Phase
**User Intent**: "OTP is [6-digit number]" / "The code is [number]" / "Here's my OTP: [number]"

**AI Response**:
- Validate OTP (correct OTP: 111222, all others are wrong)
- If correct: "OTP verified successfully! Your payment has been processed."
- If incorrect: "The OTP you entered is incorrect. Please check and try again. You have 2 more attempts."
- After 3 failed attempts: "For security reasons, this transaction has been cancelled. Please try again later or contact support."

### 8. Order Confirmation Phase
**AI Response** (after successful OTP):
- "🎉 Congratulations! Your order has been placed successfully!"
- Display order details:
  - Order Number: VV-[timestamp]-[random]
  - Items ordered with quantities
  - Total amount paid
  - Estimated delivery: [current date + 3-7 days]
  - Tracking information will be sent to your email
- Add: "Thank you for choosing VistaView! Your products will be delivered to your registered address. You'll receive SMS and email updates about your order status."

## Enhanced Product Data Structure

Update the products.json to include alternatives and premium options:

```json
{
  "id": 1,
  "name": "Premium Marble Tiles",
  "description": "High-quality Italian marble tiles for flooring and walls",
  "category": "Flooring",
  "price": 25000.00,
  "mrp": 30000.00,
  "vendor": "Luxury Tiles Co.",
  "warranty": "10 years",
  "alternatives": {
    "budget": {
      "id": 101,
      "name": "Classic Ceramic Tiles",
      "price": 18000.00,
      "description": "High-quality ceramic tiles with marble finish"
    },
    "premium": {
      "id": 102, 
      "name": "Luxury Granite Tiles",
      "price": 35000.00,
      "description": "Premium granite tiles with natural stone finish"
    },
    "similar": {
      "id": 103,
      "name": "Modern Porcelain Tiles", 
      "price": 22000.00,
      "description": "Durable porcelain tiles with contemporary design"
    }
  },
  "relatedProducts": [4, 6],
  "accessories": [7, 8],
  "image": "/assets/images/v3.2/property-images/living.png",
  "rating": 4.8,
  "reviews": 124,
  "inStock": true,
  "features": ["Water resistant", "Scratch proof", "Easy maintenance"],
  "specifications": {
    "material": "Italian Marble",
    "size": "12x12 inches", 
    "thickness": "10mm",
    "finish": "Polished"
  }
}
```

## Cart Management System

Implement cart state management:

```typescript
interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  discount?: number;
  shipping?: number;
}
```

## Payment Integration

### Payment Gateway Options:
1. **Razorpay** - Primary payment processor
2. **PayU** - Alternative payment gateway  
3. **Stripe** - International payments
4. **UPI Integration** - Direct UPI payments

### OTP Verification:
- Generate OTP: 111222 (for testing)
- All other OTPs should be rejected
- 3 attempts maximum
- 5-minute timeout

## Order Management

### Order Structure:
```typescript
interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  deliveryDate: Date;
  trackingNumber?: string;
  createdAt: Date;
}
```

## Voice-to-Voice Implementation

For voice interactions, implement the same flow with:

1. **Voice Recognition**: Convert speech to text using existing STT
2. **Intent Detection**: Identify user intent from speech
3. **Response Generation**: Generate appropriate response
4. **Text-to-Speech**: Convert response to speech using ElevenLabs
5. **Visual Feedback**: Show product cards and cart updates visually

## Error Handling & Edge Cases

### Common Scenarios:
1. **Product Out of Stock**: "I'm sorry, this product is currently out of stock. Would you like to see similar alternatives?"
2. **Payment Failure**: "Payment could not be processed. Please try a different payment method."
3. **Invalid Product**: "I couldn't find that product. Let me show you our available products."
4. **Empty Cart**: "Your cart is empty. Would you like to browse our products?"
5. **Network Issues**: "I'm having trouble connecting. Please try again in a moment."

### Fallback Responses:
- "I'm not sure I understood that. Could you please rephrase?"
- "Let me help you with that. What would you like to do?"
- "I can help you browse products, check your cart, or process payments. What would you prefer?"

## Implementation Notes

### For ChatbotModal.tsx:
- Add cart state management
- Implement product card interactions
- Add payment flow UI components
- Include order confirmation display

### For VoiceToVoiceModal.tsx:
- Maintain same conversation flow
- Add visual product displays during voice interaction
- Implement voice confirmation for critical actions
- Add audio feedback for successful operations

### API Integration:
- Create cart management endpoints
- Implement payment processing APIs
- Add order management system
- Include OTP verification service

## Testing Scenarios

1. **Complete Purchase Flow**: Browse → Details → Add to Cart → Checkout → Payment → OTP → Order
2. **Alternative Products**: Request alternatives and verify matching logic
3. **Cart Management**: Add/remove items, update quantities
4. **Payment Failure**: Test with wrong OTP, network issues
5. **Voice Interaction**: Complete flow using voice commands
6. **Edge Cases**: Empty cart, out of stock, invalid products

## Success Metrics

- **Conversion Rate**: Percentage of users who complete purchase
- **Cart Abandonment**: Users who add to cart but don't checkout
- **Payment Success Rate**: Successful payment completions
- **User Satisfaction**: Feedback on chatbot experience
- **Voice Interaction Success**: Successful voice-to-voice completions

This comprehensive flow ensures a seamless e-commerce experience through both text and voice interactions, with proper error handling and user guidance at every step.
