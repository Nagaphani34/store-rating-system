// Mock database for testing
const bcrypt = require('bcryptjs');

const mockUsers = [
  {
    id: 1,
    name: 'Naga Phani',
    email: 'nagaphani@gmail.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqDu0.i9ZwPTi', // hashed 'Code@123'
    address: '123 Test Street',
    role: 'user',
    created_at: new Date()
  }
];

const mockStores = [];
const mockRatings = [];

const mockDb = {
  query: async (text, params) => {
    console.log('Mock DB Query:', text, params);
    
    // Handle user queries
    if (text.includes('SELECT * FROM users WHERE email = $1')) {
      const email = params[0];
      const user = mockUsers.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }
    
    // Handle login
    if (text.includes('SELECT * FROM users WHERE email = $1')) {
      const email = params[0];
      const user = mockUsers.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }
    
    // Handle user creation
    if (text.includes('INSERT INTO users')) {
      const newUser = {
        id: mockUsers.length + 1,
        name: params[0],
        email: params[1],
        password: params[2],
        address: params[3],
        role: params[4] || 'user',
        created_at: new Date()
      };
      mockUsers.push(newUser);
      return { rows: [newUser] };
    }
    
    // Default response
    return { rows: [] };
  },
  pool: {}
};

module.exports = mockDb; 