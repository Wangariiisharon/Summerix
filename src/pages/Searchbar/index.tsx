import { useState } from 'react';

const SearchBar = ({ onSearch }:any) => {
  const [query, setQuery] = useState('');

  const handleChange = (e:any) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
