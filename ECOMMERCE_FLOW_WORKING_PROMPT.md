# Complete E-Commerce Flow Working Prompt for VistaView

## 🎯 **Overview**
This prompt provides comprehensive guidance for working with the fully implemented e-commerce flow in the VistaView application. The system supports both text-based and voice-to-voice interactions for complete product browsing, cart management, payment processing, and order completion.

## 🏗️ **System Architecture**

### **Core Components**
- **ChatbotModal**: Text-based e-commerce interactions
- **VoiceToVoiceModal**: Voice-based e-commerce interactions  
- **CartContext**: State management for cart and orders
- **EcommerceFlow**: Intent detection and response generation
- **Product Data**: JSON-based product catalog with alternatives

### **Key Files Structure**
```
src/
├── components/
│   ├── ChatbotModal.tsx          # Text chatbot with e-commerce
│   ├── VoiceToVoiceModal.tsx     # Voice chatbot with e-commerce
│   └── ProductCard.tsx           # Product display component
├── contexts/
│   └── CartContext.tsx           # Cart state management
├── utils/
│   └── ecommerceFlow.ts          # E-commerce logic & responses
└── v3/data/
    └── products.json             # Product catalog (USD pricing)
```

## 🛒 **Complete E-Commerce Flow**

### **Phase 1: Product Discovery**
**User Intent Detection**: `browse-products`
- **Triggers**: "show products", "browse items", "what products do you have"
- **Response**: Display 4-6 random products as interactive cards
- **Features**: Product images, names, prices ($), ratings, key features
- **Actions**: "View Details" and "Add to Cart" buttons

**Example Interaction**:
```
User: "Show me some products"
AI: "Here are some amazing products I think you'll love! Each one is carefully selected for quality and value."
[Displays 6 product cards with $ pricing]
```

### **Phase 2: Product Details**
**User Intent Detection**: `product-details`
- **Triggers**: "details about [product]", "tell me more", "what's special about"
- **Response**: Comprehensive product information
- **Includes**: Price ($), MRP, savings %, specifications, features, warranty, insurance
- **Actions**: "Add to Cart" or "See Alternatives"

**Example Response**:
```
Here are the details for *Premium Marble Tiles*:

*Price:* $301.20 (MRP: $361.45) - *17% OFF*
*Category:* Flooring
*Vendor:* Luxury Tiles Co.
*Rating:* 4.8★ (124 reviews)
*Warranty:* 10 years

*Key Features:*
• Water resistant
• Scratch proof
• Easy maintenance

*Insurance Available:* Damage protection - $12.05

Would you like to add this to your cart or see similar products?
```

### **Phase 3: Alternative Products**
**User Intent Detection**: `show-alternatives`
- **Triggers**: "alternatives", "premium options", "similar products"
- **Response**: 3-4 alternative products (budget, premium, similar)
- **Logic**: Same category, ±20% price range, complementary features

### **Phase 4: Cart Management**
**User Intent Detection**: `add-to-cart`
- **Triggers**: "add to cart", "buy this", "purchase", "add [product] to cart"
- **Response**: Product added confirmation with cart summary
- **Features**: Quantity management, total calculation, item count

**Example Response**:
```
✅ *Premium Marble Tiles* has been added to your cart!

*Your Cart:*
1. *Premium Marble Tiles*
   Quantity: 1 | Price: $301.20 each
   Subtotal: $301.20

*Total: $301.20*

Ready to checkout? Or would you like to browse more products?
```

### **Phase 5: Checkout Initiation**
**User Intent Detection**: `checkout`
- **Triggers**: "checkout", "proceed to payment", "buy now", "complete purchase"
- **Response**: Final cart summary with payment options
- **Payment Methods**: Credit/Debit Card, UPI, Net Banking, EMI

### **Phase 6: Payment Method Selection**
**User Intent Detection**: `select-payment`
- **Triggers**: "pay with card", "credit card", "upi", "net banking"
- **Response**: Payment method confirmation and OTP request

### **Phase 7: OTP Verification**
**User Intent Detection**: `verify-otp`
- **Triggers**: 6-digit number input, "otp is [number]"
- **Validation**: Correct OTP is `111222`, all others fail
- **Attempts**: Maximum 3 attempts, then transaction cancelled

### **Phase 8: Order Confirmation**
**Response**: Complete order details with tracking information
- **Order ID**: VV-[timestamp]-[random]
- **Delivery**: 3-7 days from order date
- **Tracking**: SMS and email updates

## 🎤 **Voice-to-Voice Implementation**

### **Voice Flow Features**
- **Speech-to-Text**: Converts voice to text for processing
- **Same Logic**: Uses identical e-commerce flow as text chatbot
- **Text-to-Speech**: Converts responses back to voice
- **Visual Feedback**: Shows product cards during voice conversations
- **Enhanced Responses**: Detailed spoken product information

### **Voice Response Example**:
```
"Our extended warranty covers manufacturing defects and functional failures after the standard warranty period. You can extend coverage by 1, 2, or 3 years. Here are the pricing options: 1 year for $0.20 total ($0.18 + $0.02 service charge), 2 years for $0.32 total ($0.30 + $0.02 service charge, recommended with $0.06 savings), or 3 years for $0.48 total ($0.46 + $0.02 service charge). Available plans: 1 year plan for $0.20 ($0.18 plus $0.02 service charge), 2 year plan for $0.32 ($0.30 plus $0.02 service charge) - this is our recommended option with $0.06 savings, 3 year plan for $0.48 ($0.46 plus $0.02 service charge)."
```

## 💰 **Pricing & Currency**

### **Current Pricing (USD)**
- **Products**: $180.72 - $1,445.78 range
- **Warranty Plans**: $0.20 - $0.48 (1-3 years)
- **Insurance Plans**: $1.20 - $3.01 (1-3 years)
- **All prices display with $ symbol**

### **Product Categories**
1. **Flooring**: Premium Marble Tiles ($301.20)
2. **Furniture**: Modern Dining Set ($542.17), Luxury Sofa ($903.61)
3. **Lighting**: Smart LED Kit ($180.72)
4. **Appliances**: Kitchen Set ($1,445.78)
5. **Bathroom**: Luxury Fittings ($421.69)

## 🔧 **Technical Implementation**

### **Intent Detection System**
```typescript
const detectEcommerceIntent = (message: string): string | null => {
  // Detects: browse-products, product-details, show-alternatives,
  // add-to-cart, view-cart, checkout, select-payment, verify-otp
}
```

### **Cart State Management**
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
}
```

### **E-commerce Flow State**
```typescript
interface EcommerceFlowState {
  currentPhase: 'browsing' | 'product-details' | 'alternatives' | 
                'cart' | 'checkout' | 'payment' | 'otp' | 'order-confirmation';
  selectedProduct?: any;
  cartItems: any[];
  paymentMethod?: string;
  orderDetails?: any;
  otpAttempts: number;
}
```

## 🎯 **Working with the E-commerce Flow**

### **For Developers**

#### **Adding New Products**
1. Update `src/v3/data/products.json`
2. Include all required fields: price, mrp, warranty, insurance, alternatives
3. Use USD pricing format
4. Add product images and specifications

#### **Modifying Flow Logic**
1. Edit `src/utils/ecommerceFlow.ts` for response generation
2. Update intent detection patterns
3. Modify response templates and pricing

#### **Enhancing UI Components**
1. Update `ProductCard.tsx` for visual changes
2. Modify `ChatbotModal.tsx` for text interactions
3. Enhance `VoiceToVoiceModal.tsx` for voice features

### **For Testing**

#### **Complete Purchase Flow**
```
1. "Show me some products" → Browse products
2. "Tell me about Premium Marble Tiles" → Product details
3. "Add to cart" → Add product
4. "Checkout" → Payment options
5. "Pay with card" → Payment method
6. "111222" → OTP verification
7. Order confirmation with tracking
```

#### **Alternative Scenarios**
```
1. "Show me alternatives" → Alternative products
2. "View my cart" → Cart management
3. "Remove item" → Cart updates
4. "Wrong OTP" → Error handling
```

### **For Product Management**

#### **Warranty & Insurance**
- **Warranty**: Manufacturing defects, 1-3 year extensions
- **Insurance**: Accidental damage, comprehensive protection
- **Pricing**: Service charges for warranty, flat rates for insurance

#### **Product Alternatives**
- **Budget**: 70-90% of original price
- **Premium**: 120-150% of original price  
- **Similar**: 90-110% of original price

## 🚀 **Advanced Features**

### **Smart Recommendations**
- Category-based filtering
- Price range matching
- Rating-based suggestions
- Vendor preference learning

### **Cart Intelligence**
- Quantity optimization
- Bundle suggestions
- Price drop alerts
- Abandoned cart recovery

### **Payment Security**
- OTP verification (111222)
- 3-attempt limit
- Transaction timeout
- Secure order processing

## 📊 **Monitoring & Analytics**

### **Key Metrics**
- **Conversion Rate**: Browse → Purchase completion
- **Cart Abandonment**: Add to cart → Checkout
- **Payment Success**: OTP verification success rate
- **Voice Interaction**: Voice-to-voice completion rate

### **Error Tracking**
- Failed OTP attempts
- Payment processing errors
- Product not found scenarios
- Network connectivity issues

## 🎨 **UI/UX Guidelines**

### **Product Cards**
- Clear pricing with $ symbol
- Prominent "Add to Cart" button
- Rating and review display
- Insurance/warranty indicators

### **Cart Interface**
- Item quantity controls
- Total calculation display
- Remove item options
- Checkout progression

### **Payment Flow**
- Clear payment method selection
- OTP input validation
- Order confirmation display
- Tracking information access

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Products not loading**: Check products.json format
2. **Cart not updating**: Verify CartContext implementation
3. **Payment failing**: Confirm OTP is 111222
4. **Voice not working**: Check ElevenLabs integration

### **Debug Commands**
```typescript
// Test intent detection
testIntentDetection();

// Check cart state
console.log(cart.items, cart.total);

// Verify product data
console.log(v3Products);
```

## 📝 **Best Practices**

### **Response Generation**
- Use friendly, conversational tone
- Include specific pricing details
- Provide clear next steps
- Handle errors gracefully

### **State Management**
- Maintain cart consistency
- Track flow progression
- Handle edge cases
- Provide fallback options

### **User Experience**
- Clear visual feedback
- Intuitive navigation
- Helpful error messages
- Smooth transitions

This comprehensive e-commerce flow provides a complete shopping experience through both text and voice interactions, with robust error handling, secure payments, and detailed product information. The system is fully functional and ready for production use with USD pricing and comprehensive warranty/insurance options.
