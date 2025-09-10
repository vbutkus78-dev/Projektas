// Simple database utility for Render deployment
import fs from 'fs';
import path from 'path';

// Simple SQLite-like database using JSON files for Render compatibility
class SimpleDB {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data';
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  // Initialize database with default data
  async init() {
    const tables = ['users', 'requests', 'request_items', 'invoices', 'attachments'];
    
    for (const table of tables) {
      const filePath = path.join(this.dbPath, `${table}.json`);
      if (!fs.existsSync(filePath)) {
        await this.initTable(table);
      }
    }
  }

  async initTable(tableName) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    let initialData = [];

    if (tableName === 'users') {
      initialData = [
        {
          id: 1,
          email: 'admin@company.com',
          name: 'Sistemos administratorius',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
          role: 'admin',
          department: 'IT',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          email: 'manager@company.com',
          name: 'Vadybininkas',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // manager123
          role: 'manager',
          department: 'Pirkimai',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          email: 'employee@company.com',
          name: 'Darbuotojas',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
          role: 'employee',
          department: 'Gamyba',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];
    }

    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    console.log(`✅ Initialized ${tableName} table with ${initialData.length} records`);
  }

  async query(tableName) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }

  async insert(tableName, record) {
    const data = await this.query(tableName);
    const maxId = data.length > 0 ? Math.max(...data.map(r => r.id || 0)) : 0;
    record.id = maxId + 1;
    record.created_at = record.created_at || new Date().toISOString();
    data.push(record);
    
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return record;
  }

  async update(tableName, id, updates) {
    const data = await this.query(tableName);
    const index = data.findIndex(r => r.id === parseInt(id));
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data[index];
  }

  async delete(tableName, id) {
    const data = await this.query(tableName);
    const filteredData = data.filter(r => r.id !== parseInt(id));
    
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2));
    return true;
  }

  async findOne(tableName, criteria) {
    const data = await this.query(tableName);
    return data.find(record => {
      return Object.keys(criteria).every(key => record[key] === criteria[key]);
    });
  }

  async findMany(tableName, criteria = {}) {
    const data = await this.query(tableName);
    if (Object.keys(criteria).length === 0) return data;
    
    return data.filter(record => {
      return Object.keys(criteria).every(key => record[key] === criteria[key]);
    });
  }
}

// Export singleton instance
const db = new SimpleDB();
await db.init();

export default db;