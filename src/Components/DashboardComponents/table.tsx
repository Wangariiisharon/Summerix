import React from "react";
type TableRowData = {
  col1: string;
  col2: string;
  // ... define other column types
};

// Define a type for the component props
type TableProps = {
  data: TableRowData[];
};
const Table: React.FC<TableProps> = ({ data = [] }) => (
  <table>
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        {/* ... Other columns */}
      </tr>
    </thead>
    <tbody>
      {data.map((row: any, index: any) => (
        <tr key={index}>
          <td>{row.col1}</td>
          <td>{row.col2}</td>
          {/* ... Other columns */}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
