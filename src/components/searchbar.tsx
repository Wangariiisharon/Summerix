import React from 'react';

const SearchBar = ({ placeholder, value, onChange }: any) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="searchbar bg-white"
    />
  );
};

export default SearchBar;
