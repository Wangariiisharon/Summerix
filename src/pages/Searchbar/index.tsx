// import { useState } from 'react';

// const SearchBar = ({ onSearch }:any) => {
//   const [query, setQuery] = useState('');

//   const handleChange = (e:any) => {
//     setQuery(e.target.value);
//   };

//   const handleSubmit = (e:any) => {
//     e.preventDefault();
//     onSearch(query);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         placeholder="Search..."
//         value={query}
//         onChange={handleChange}
//       />
//       <button type="submit">Search</button>
//     </form>
//   );
// };

// export default SearchBar;  
// import SearchBar from 'material-ui-search-bar';
// import { useState } from 'react';

// export default function searchBar(){ 
//   const [searched, setSearched] = useState(""); 
//   const requestSearch = (searchedVal) => {
//     const filteredRows = originalRows.filter((row) => {
//       return row.name.toLowerCase().includes(searchedVal.toLowerCase());
//     });
//     setRows(filteredRows);
//   };

//   const cancelSearch = () => {
//     setSearched("");
//     requestSearch(searched);
//   };
 
//   return(
//     <>
//     </>
//   )
// }
