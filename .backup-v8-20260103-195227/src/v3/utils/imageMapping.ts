// Import all property images
import premium1 from '../../assets/images/v3.2/premium/1.png';
import premium2 from '../../assets/images/v3.2/premium/2.png';
import premium3 from '../../assets/images/v3.2/premium/3.png';
import premium4 from '../../assets/images/v3.2/premium/4.png';
import premium5 from '../../assets/images/v3.2/premium/5.png';
import premium6 from '../../assets/images/v3.2/premium/6.png';
import premium7 from '../../assets/images/v3.2/premium/7.png';
import premium8 from '../../assets/images/v3.2/premium/8.png';

import popularCities1 from '../../assets/images/v3.2/popular-cities/1.png';
import popularCities2 from '../../assets/images/v3.2/popular-cities/2.png';
import popularCities3 from '../../assets/images/v3.2/popular-cities/3.png';
import popularCities4 from '../../assets/images/v3.2/popular-cities/4.png';
import popularCities5 from '../../assets/images/v3.2/popular-cities/5.png';
import popularCities6 from '../../assets/images/v3.2/popular-cities/6.png';

// Create a mapping object
const imageMapping: { [key: string]: string } = {
  '/assets/images/v3.2/premium/1.png': premium1,
  '/assets/images/v3.2/premium/2.png': premium2,
  '/assets/images/v3.2/premium/3.png': premium3,
  '/assets/images/v3.2/premium/4.png': premium4,
  '/assets/images/v3.2/premium/5.png': premium5,
  '/assets/images/v3.2/premium/6.png': premium6,
  '/assets/images/v3.2/premium/7.png': premium7,
  '/assets/images/v3.2/premium/8.png': premium8,
  '/assets/images/v3.2/popular-cities/1.png': popularCities1,
  '/assets/images/v3.2/popular-cities/2.png': popularCities2,
  '/assets/images/v3.2/popular-cities/3.png': popularCities3,
  '/assets/images/v3.2/popular-cities/4.png': popularCities4,
  '/assets/images/v3.2/popular-cities/5.png': popularCities5,
  '/assets/images/v3.2/popular-cities/6.png': popularCities6,
};

// Function to get the correct image URL
export const getImageUrl = (imagePath: string): string => {
  return imageMapping[imagePath] || imagePath;
};

// Function to process properties and fix image URLs
export const processProperties = (properties: any[]) => {
  return properties.map(property => ({
    ...property,
    image: getImageUrl(property.image)
  }));
};
