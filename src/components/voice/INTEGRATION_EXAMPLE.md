# How to Integrate Voice Form Filling

## In VendorFlow.tsx (Business Profile Step):

```tsx
import { AgenticBarWithFill } from '@/components/voice';

function BusinessProfileStep({ formData, setFormData }) {
    const handleFill = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <h2>Business Profile</h2>
            
            {/* Add IDs to your inputs */}
            <input 
                id="company-name-input"
                value={formData.companyName}
                onChange={e => setFormData(prev => ({...prev, companyName: e.target.value}))}
                placeholder="Company Name"
            />
            
            <textarea
                id="company-description"
                value={formData.description}
                onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="What do you sell?"
            />
            
            {/* AgenticBar that fills the fields */}
            <AgenticBarWithFill
                fields={{
                    companyName: '#company-name-input',
                    description: '#company-description'
                }}
                context="business_profile"
                onFill={handleFill}
            />
        </div>
    );
}
```

## In VendorFlow.tsx (Catalog Upload Step):

```tsx
import { PdfUploader } from '@/components/voice';

function CatalogUploadStep({ onProductsExtracted }) {
    return (
        <div>
            <h2>Upload Your Catalog</h2>
            
            <PdfUploader
                onSuccess={(data) => {
                    console.log('Extracted:', data.products);
                    onProductsExtracted(data.products);
                }}
                onError={(err) => {
                    console.error('Upload failed:', err);
                }}
            />
        </div>
    );
}
```

## In WhoAreYouModal.tsx:

```tsx
import { AgenticBarWithFill } from '@/components/voice';

function WhoAreYouModal() {
    return (
        <div className="modal">
            <h2>Who Are You?</h2>
            
            {/* Role selection buttons */}
            <div className="roles">...</div>
            
            {/* Add AgenticBar */}
            <AgenticBarWithFill 
                context="role_selection"
                position="inline"
                showHints={true}
            />
        </div>
    );
}
```
