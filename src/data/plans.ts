export interface Plan {
  name: string;
  features: string;
  priceAnnual: string;
  priceMonthly: string;
  billingAnnual: string;
  billingMonthly: string;
  featureCount: number;
  isPopular?: boolean;
}

export const plans: Plan[] = [
  {
    name: 'Basic',
    features: '5 Features',
    priceAnnual: '$ 0',
    priceMonthly: '$ 0',
    billingAnnual: 'Free',
    billingMonthly: 'Free',
    featureCount: 5,
  },
  {
    name: 'Standard',
    features: '8 Features',
    priceAnnual: '$ 200',
    priceMonthly: '$ 20',
    billingAnnual: 'Billed Annually',
    billingMonthly: 'Billed Monthly',
    featureCount: 8,
    isPopular: true,
  },
  {
    name: 'Premium',
    features: '12 Features',
    priceAnnual: '$ 400',
    priceMonthly: '$ 40',
    billingAnnual: 'Billed Annually',
    billingMonthly: 'Billed Monthly',
    featureCount: 12,
  },
]; 