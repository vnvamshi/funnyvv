import { getImageUrl, processProperties } from '../imageMapping';

describe('Image Mapping', () => {
  test('getImageUrl should return correct mapped URL', () => {
    const testPath = '/assets/images/v3.2/premium/1.png';
    const result = getImageUrl(testPath);
    
    // Should return the imported image URL (hashed by Vite)
    expect(result).toBeDefined();
    expect(result).not.toBe(testPath); // Should be different from original path
    expect(typeof result).toBe('string');
  });

  test('getImageUrl should return original path for unmapped images', () => {
    const testPath = '/assets/images/unknown/image.png';
    const result = getImageUrl(testPath);
    
    expect(result).toBe(testPath);
  });

  test('processProperties should process all properties', () => {
    const mockProperties = [
      { id: 1, title: 'Test Property', image: '/assets/images/v3.2/premium/1.png' },
      { id: 2, title: 'Test Property 2', image: '/assets/images/v3.2/premium/2.png' }
    ];
    
    const result = processProperties(mockProperties);
    
    expect(result).toHaveLength(2);
    expect(result[0].image).toBeDefined();
    expect(result[1].image).toBeDefined();
    expect(result[0].image).not.toBe('/assets/images/v3.2/premium/1.png');
    expect(result[1].image).not.toBe('/assets/images/v3.2/premium/2.png');
  });
});
