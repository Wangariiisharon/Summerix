import React, { useState, ChangeEvent } from 'react';

const ImageInput = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    setSelectedImage(imageFile || null);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      {selectedImage && (
        <img
          src={URL.createObjectURL(selectedImage)}
          alt="Selected Image"
          style={{ maxWidth: '100%', marginTop: '10px' }}
        />
      )}
    </div>
  );
};

export default ImageInput;
