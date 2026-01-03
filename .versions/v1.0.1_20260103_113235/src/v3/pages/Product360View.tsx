import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nV3 from '../i18n';
import V3Header from '../components/V3Header';
import V3Footer from '../components/V3Footer';
import type { ApiModel } from '../types/catalog';
import Viewer from '../../pages/map/3DRooms';

const Product360ViewContent = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [model, setModel] = useState<ApiModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL as string | undefined;

  useEffect(() => {
    const fetchModel = async () => {
      try {
        if (!baseUrl) {
          throw new Error('Products API base URL is not configured');
        }
        if (!productId) {
          throw new Error('Product ID is required');
        }
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/models`, {
          headers: { accept: 'application/json' },
        });
        if (!res.ok) {
          throw new Error('Failed to load product details');
        }
        const json = await res.json();
        const found = (json.models as ApiModel[]).find((m) => m.model_id === productId);
        if (!found) {
          throw new Error('Product not found');
        }
        if (!found.glb_file_url) {
          throw new Error('No GLB file available for this model');
        }
        setModel(found);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    void fetchModel();
  }, [baseUrl, productId]);

  const handleBackClick = () => {
    navigate(`/v3/product-detail/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">{t('common.loading', 'Loading 360° view...')}</p>
      </div>
    );
  }

  if (error || !model || !baseUrl || !model.glb_file_url) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load 360° view</h1>
          <p className="text-gray-600 mb-6">{error || 'Model data not available.'}</p>
          <button
            onClick={() => navigate('/v3/product-catalog')}
            className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const glbUrl = `${baseUrl}${model.glb_file_url}`;

  return (
    <div className="min-h-screen bg-transparent">
      <V3Header />
      
      {/* Header with Product Name */}
      <div className="absolute top-20 left-4 z-10">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4">
          <h1 className="text-lg font-semibold text-white mb-1">{model.model_name}</h1>
          <p className="text-gray-300 text-sm">360° View</p>
        </div>
      </div>

      {/* Close Button */}
      <div className="absolute top-20 right-4 z-10">
        <button
          onClick={handleBackClick}
          className="bg-black bg-opacity-50 backdrop-blur-sm hover:bg-opacity-70 text-white px-4 py-2 rounded-lg transition-all"
        >
          ✕ Close
        </button>
      </div>

      {/* Full Screen 3D Viewer without markers/labels */}
      <div className="relative w-full h-screen">
        <Viewer modelPath={glbUrl} showMarkers={false} />
      </div>
    </div>
  );
};

const Product360View = () => {
  return (
    <I18nextProvider i18n={i18nV3}>
      <Product360ViewContent />
    </I18nextProvider>
  );
};

export default Product360View;
