// Simple client-side database using localStorage
// This replaces the Dexie-based implementation to avoid browser compatibility issues

// Define interfaces for data types
export interface UserEntry {
  id?: number;
  date: string; // ISO string for indexing
  description: string;
  amount: number;
  timestamp: number;
  synced_at?: string; // Timestamp when last synced
  sync_status?: 'pending' | 'synced' | 'failed'; // Sync status
}

export interface WorkerEntry {
  id?: number;
  date: string;
  name: string;
  type: 'salary' | 'advance' | 'deduction';
  amount: number;
  timestamp: number;
  synced_at?: string; // Timestamp when last synced
  sync_status?: 'pending' | 'synced' | 'failed'; // Sync status
}

export interface ExpenseEntry {
  id?: number;
  date: string;
  category: 'Rent' | 'Bills' | 'Maintenance' | 'Others';
  description: string;
  amount: number;
  timestamp: number;
  synced_at?: string; // Timestamp when last synced
  sync_status?: 'pending' | 'synced' | 'failed'; // Sync status
}

// Define types for user data
export interface UserData {
  serial_no: number;
  cabin_no: string;
  name: string;
  time_in: string;
  time_out: string;
  amount: number;
  date: string;
  is_locked: boolean;
}

// New interface for dashboard data
export interface DashboardData {
  id?: number;
  date: string; // ISO string for indexing
  data: any; // Serialized dashboard data
  user_data?: UserData[]; // Extracted user data for easier querying
  synced_at?: string; // Timestamp when last synced
  created_at?: string; // Timestamp when created
  updated_at?: string; // Timestamp when last updated
  sync_status?: 'pending' | 'synced' | 'failed' | null; // Sync status (allowing null for force reset)
}

// Storage keys for different data types
const USER_DATA_KEY = 'CLICK_CAFE_USERS';
const WORKER_DATA_KEY = 'CLICK_CAFE_WORKERS';
const EXPENSE_DATA_KEY = 'CLICK_CAFE_EXPENSES';
const DASHBOARD_DATA_KEY = 'CLICK_CAFE_DASHBOARD';

// Initialize data in localStorage if not present
function initializeLocalStorageData() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(USER_DATA_KEY)) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(WORKER_DATA_KEY)) {
      localStorage.setItem(WORKER_DATA_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(EXPENSE_DATA_KEY)) {
      localStorage.setItem(EXPENSE_DATA_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(DASHBOARD_DATA_KEY)) {
      localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify([]));
    }
  }
}

// Call initialization
initializeLocalStorageData();

// Simple wrapper around localStorage operations
export class ClickDatabase {
  // Read data from localStorage
  private readDataFromStorage(key: string): any[] {
    if (typeof window === 'undefined') {
      // Server-side - return empty array
      return [];
    }

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  // Write data to localStorage
  private writeDataToStorage(key: string, data: any[]): void {
    if (typeof window === 'undefined') {
      // Server-side - skip storage operations
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      // Error writing data to localStorage
    }
  }

  // User entries
  async getAllUserEntries(): Promise<UserEntry[]> {
    return this.readDataFromStorage(USER_DATA_KEY);
  }

  async addUserEntry(entry: Omit<UserEntry, 'id'>): Promise<number> {
    const entries = await this.getAllUserEntries();
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id || 0)) + 1 : 1;
    const newEntry = { ...entry, id: newId };
    entries.push(newEntry);
    this.writeDataToStorage(USER_DATA_KEY, entries);
    return newId;
  }

  // Worker entries
  async getAllWorkerEntries(): Promise<WorkerEntry[]> {
    return this.readDataFromStorage(WORKER_DATA_KEY);
  }

  async addWorkerEntry(entry: Omit<WorkerEntry, 'id'>): Promise<number> {
    const entries = await this.getAllWorkerEntries();
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id || 0)) + 1 : 1;
    const newEntry = { ...entry, id: newId };
    entries.push(newEntry);
    this.writeDataToStorage(WORKER_DATA_KEY, entries);
    return newId;
  }

  // Expense entries
  async getAllExpenseEntries(): Promise<ExpenseEntry[]> {
    return this.readDataFromStorage(EXPENSE_DATA_KEY);
  }

  async addExpenseEntry(entry: Omit<ExpenseEntry, 'id'>): Promise<number> {
    const entries = await this.getAllExpenseEntries();
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id || 0)) + 1 : 1;
    const newEntry = { ...entry, id: newId };
    entries.push(newEntry);
    this.writeDataToStorage(EXPENSE_DATA_KEY, entries);
    return newId;
  }

  // Dashboard data
  async getAllDashboardData(): Promise<DashboardData[]> {
    return this.readDataFromStorage(DASHBOARD_DATA_KEY);
  }

  async addDashboardData(data: Omit<DashboardData, 'id'>): Promise<number> {
    const entries = await this.getAllDashboardData();
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id || 0)) + 1 : 1;
    const newData = { ...data, id: newId };
    entries.push(newData);
    this.writeDataToStorage(DASHBOARD_DATA_KEY, entries);
    return newId;
  }

  // Get data for a specific date
  async getDataByDate(date: string): Promise<{ users: UserEntry[], workers: WorkerEntry[], expenses: ExpenseEntry[], dashboard: DashboardData[] }> {
    const users = (await this.getAllUserEntries()).filter(entry => entry.date.startsWith(date));
    const workers = (await this.getAllWorkerEntries()).filter(entry => entry.date.startsWith(date));
    const expenses = (await this.getAllExpenseEntries()).filter(entry => entry.date.startsWith(date));
    const dashboard = (await this.getAllDashboardData()).filter(entry => entry.date.startsWith(date));

    return { users, workers, expenses, dashboard };
  }

  // Update an existing entry
  async updateEntry<T>(key: string, id: number, updates: Partial<T>): Promise<boolean> {
    if (typeof window === 'undefined') {
      // Server-side - skip storage operations
      return false;
    }

    try {
      const data = this.readDataFromStorage(key);
      const index = data.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        this.writeDataToStorage(key, data);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Get entries by field value
  async getEntriesByField<T>(key: string, field: string, value: any): Promise<T[]> {
    if (typeof window === 'undefined') {
      // Server-side - return empty array
      return [];
    }

    try {
      const data = this.readDataFromStorage(key);
      return data.filter((item: any) => item[field] === value) as T[];
    } catch (error) {
      return [];
    }
  }

  // Simplified table-like interface for compatibility with existing code
  table(tableName: string) {
    switch(tableName) {
      case 'user':
        return {
          toArray: async () => await this.getAllUserEntries(),
          orderBy: (field: string) => ({
            reverse: () => ({
              toArray: async () => {
                const data = await this.getAllUserEntries();
                return data.sort((a, b) => (b as any)[field] - (a as any)[field]);
              }
            })
          }),
          add: async (item: Omit<UserEntry, 'id'>) => await this.addUserEntry(item),
          where: (field: string) => ({
            equals: async (value: any) => {
              const allData = await this.getAllUserEntries();
              return allData.filter(item => (item as any)[field] === value);
            },
            reverse: () => ({
              toArray: async () => {
                const allData = await this.getAllUserEntries();
                return allData.sort((a, b) => (b as any)[field] - (a as any)[field]);
              }
            })
          })
        };
      case 'worker':
        return {
          toArray: async () => await this.getAllWorkerEntries(),
          orderBy: (field: string) => ({
            reverse: () => ({
              toArray: async () => {
                const data = await this.getAllWorkerEntries();
                return data.sort((a, b) => (b as any)[field] - (a as any)[field]);
              }
            })
          }),
          add: async (item: Omit<WorkerEntry, 'id'>) => await this.addWorkerEntry(item),
          where: (field: string) => ({
            equals: async (value: any) => {
              const allData = await this.getAllWorkerEntries();
              return allData.filter(item => (item as any)[field] === value);
            },
            reverse: () => ({
              toArray: async () => {
                const allData = await this.getAllWorkerEntries();
                return allData.sort((a, b) => (b as any)[field] - (a as any)[field]);
              }
            })
          })
        };
      case 'expense':
        return {
          toArray: async () => await this.getAllExpenseEntries(),
          orderBy: (field: string) => ({
            reverse: () => ({
              toArray: async () => {
                const allData = await this.getAllExpenseEntries();
                return allData.sort((a, b) => (b as any)[field] - (a as any)[field]);
              }
            })
          }),
          add: async (item: Omit<ExpenseEntry, 'id'>) => await this.addExpenseEntry(item),
          where: (field: string) => ({
            equals: async (value: any) => {
              const allData = await this.getAllExpenseEntries();
              return allData.filter(item => (item as any)[field] === value);
            },
            reverse: () => ({
              toArray: async () => {
                const allData = await this.getAllExpenseEntries();
                return allData.sort((a, b) => (b as any)[field] - (a as any)[field]);
              }
            })
          })
        };
      default:
        return {
          toArray: async () => [],
          orderBy: () => ({
            reverse: () => ({
              toArray: async () => []
            })
          }),
          add: async () => 0,
          where: () => ({
            equals: async () => [],
            reverse: () => ({
              toArray: async () => []
            })
          })
        };
    }
  }

  // Mock open method for compatibility
  async open() {
    // No-op since we don't need to open a connection
  }
}

export const db = new ClickDatabase();
