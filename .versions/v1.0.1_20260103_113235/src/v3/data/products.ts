// Import product images
import product1 from '../../assets/images/v3.2/product1.jpg';
import product11 from '../../assets/images/v3.2/product11.jpg';
import product2 from '../../assets/images/v3.2/product2.jpg';
import product22 from '../../assets/images/v3.2/product22.jpg';
import product3 from '../../assets/images/v3.2/product3.jpg';
import product33 from '../../assets/images/v3.2/product33.jpg';
import product4 from '../../assets/images/v3.2/product4.jpg';
import product44 from '../../assets/images/v3.2/product44.jpg';
import product5 from '../../assets/images/v3.2/product5.jpg';
import product55 from '../../assets/images/v3.2/product55.jpg';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  establishedYear: number;
  specialties: string[];
  website?: string;
  logo?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  currentPrice: string;
  originalPrice?: string;
  discount?: string;
  badge?: 'new' | 'discount';
  image: string;
  materialDescription?: string;
  dimensions?: string;
  productNo?: string;
  images?: string[];
  supplier?: Supplier;
}

export const products: Product[] = [
  {
    id: 'cz-089',
    name: 'Zenith Marble Dining Table',
    description: 'Premium dining table with natural stone inlay',
    currentPrice: '$2400',
    badge: 'new',
    image: product1,
    images: [product1, product11],
    materialDescription: 'The table top is made of black matte painted wood, with a natural stone inlay featuring tea ceremony elements. The legs are made of marble with a unique black and white veining pattern.',
    dimensions: '2400*1000*750',
    productNo: 'CZ-089',
    supplier: {
      id: 'supplier-001',
      name: 'Luxury Furniture Co.',
      email: 'contact@luxuryfurniture.com',
      phone: '+1 (555) 123-4567',
      address: '123 Artisan Street',
      city: 'New York',
      country: 'United States',
      rating: 4.8,
      reviewCount: 156,
      establishedYear: 1995,
      specialties: ['Premium Dining Tables', 'Marble Furniture', 'Custom Design'],
      website: 'https://luxuryfurniture.com'
    }
  },
  {
    id: 'cz-120b',
    name: 'Fusion Modern Dining Table',
    description: 'Modern dining table with marble and wood combination',
    currentPrice: '$2000',
    image: product2,
    images: [product2, product22],
    materialDescription: 'The tabletop features a combination of marble and wood. The table is supported by a curved wooden pedestal on one side and metal legs on the other.',
    dimensions: '1800-3200*800*750',
    productNo: 'CZ-120B',
    supplier: {
      id: 'supplier-002',
      name: 'Modern Design Studio',
      email: 'info@moderndesign.com',
      phone: '+1 (555) 987-6543',
      address: '456 Design Avenue',
      city: 'Los Angeles',
      country: 'United States',
      rating: 4.6,
      reviewCount: 89,
      establishedYear: 2010,
      specialties: ['Modern Furniture', 'Contemporary Design', 'Sustainable Materials'],
      website: 'https://moderndesign.com'
    }
  },
  {
    id: 'cz-127',
    name: 'Tea Master Dining Table',
    description: 'Luxury dining table with built-in tea preparation space',
    currentPrice: '$2000',
    image: product3,
    images: [product3, product33],
    materialDescription: 'Crafted from multilayer solid wood with a rich walnut veneer and a smooth matte finish, featuring built-in tea preparation space and storage cabinets with metallic base detailing.',
    dimensions: '2200–3200*800*750',
    productNo: 'CZ-127',
    supplier: {
      id: 'supplier-003',
      name: 'Artisan Woodworks',
      email: 'craftsmen@artisanwoodworks.com',
      phone: '+1 (555) 456-7890',
      address: '789 Craft Lane',
      city: 'Portland',
      country: 'United States',
      rating: 4.9,
      reviewCount: 203,
      establishedYear: 1988,
      specialties: ['Handcrafted Furniture', 'Tea Ceremony Tables', 'Walnut Wood'],
      website: 'https://artisanwoodworks.com'
    }
  },
  {
    id: 'cz-126',
    name: 'Oak Elegance Dining Table',
    description: 'Elegant dining table with black oak veneer finish',
    currentPrice: '$2100',
    image: product4,
    images: [product4, product44],
    materialDescription: 'The tabletop is crafted from solid multilayer wood with a black oak veneer finish, paired with matte-finished legs and a built-in tea preparation section featuring a storage cabinet below.',
    dimensions: '1800–3200*800*750',
    productNo: 'CZ-126',
    supplier: {
      id: 'supplier-004',
      name: 'Elegant Interiors Ltd.',
      email: 'sales@elegantinteriors.com',
      phone: '+1 (555) 321-9876',
      address: '321 Elegance Boulevard',
      city: 'Chicago',
      country: 'United States',
      rating: 4.7,
      reviewCount: 134,
      establishedYear: 2005,
      specialties: ['Elegant Furniture', 'Oak Wood', 'Interior Design'],
      website: 'https://elegantinteriors.com'
    }
  },
  {
    id: 'cd-102',
    name: 'Stone Harmony Bench',
    description: 'Premium bench with natural stone and leather cushion',
    currentPrice: '$2200',
    badge: 'new',
    image: product5,
    images: [product5, product55],
    materialDescription: 'There is a round natural stone on the right side of the soft leather seat cushion. The bench and legs are made of solid wood multi-layer board with red oak veneer and skin-friendly black matte paint.',
    dimensions: '1400*400*450',
    productNo: 'CD-102',
    supplier: {
      id: 'supplier-005',
      name: 'Natural Elements Furniture',
      email: 'hello@naturalelements.com',
      phone: '+1 (555) 654-3210',
      address: '654 Nature Way',
      city: 'Seattle',
      country: 'United States',
      rating: 4.8,
      reviewCount: 178,
      establishedYear: 2012,
      specialties: ['Natural Materials', 'Stone Furniture', 'Eco-Friendly Design'],
      website: 'https://naturalelements.com'
    }
  }
];
