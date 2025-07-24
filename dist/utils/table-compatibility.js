"use strict";
// // Helper function to check type compatibility
// export function isTypeCompatible(sequelizeType: string, dbType: string) {
//   // This is a simplified version - expand based on your database and types
//   const typeMap = {
//     'STRING': ['character varying', 'varchar', 'text'],
//     'INTEGER': ['integer', 'int', 'int4'],
//     'BIGINT': ['bigint', 'int8'],
//     'FLOAT': ['real', 'float4'],
//     'DOUBLE': ['double precision', 'float8'],
//     'DECIMAL': ['numeric', 'decimal'],
//     'BOOLEAN': ['boolean', 'bool'],
//     'DATE': ['timestamp', 'timestamptz', 'date'],
//     'DATEONLY': ['date'],
//     'UUID': ['uuid'],
//     'JSON': ['json', 'jsonb'],
//     'JSONB': ['jsonb'],
//     'ARRAY': ['array']
//   };
//   // Convert types to lowercase for comparison
//   sequelizeType = sequelizeType.toUpperCase();
//   dbType = dbType.toLowerCase();
//   // Check if the database type is compatible with the Sequelize type
//   return typeMap[sequelizeType] && typeMap[sequelizeType].includes(dbType);
// }
