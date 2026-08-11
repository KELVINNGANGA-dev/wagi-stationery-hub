import React, { useState } from 'react';

type Props = {
  productId: number;
  apiBase?: string;
  onUploaded?: (img: any) => void;
};

export default function ProductImageUpload({ productId, apiBase = '', onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setError(null);
  };

  const upload = async () => {
    if (!file) return setError('Please select an image');
    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch(`${apiBase}/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: {
          // Authorization header should be set by the app (e.g., Bearer token)
        },
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Upload failed');
      }

      const data = await res.json();
      setFile(null);
      onUploaded && onUploaded(data);
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-image-upload">
      <label className="block">
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      {file && <div className="text-sm mt-2">Selected: {file.name}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <div className="mt-3">
        <button className="btn btn-primary" onClick={upload} disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
    </div>
  );
}
