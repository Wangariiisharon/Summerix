import React, { useState, ChangeEvent } from 'react';

interface ImageInputProps {
  selectedImage: File | null;
  onSelectImage: (file: File | null) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ selectedImage, onSelectImage }) => {
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    onSelectImage(imageFile || null);
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
