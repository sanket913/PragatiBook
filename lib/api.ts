const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('ap1700_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error');
  }
}

export const authApi = {
  async login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
};

export const billsApi = {
  async getAll() {
    return apiRequest('/bills');
  },

  async getById(id: string) {
    return apiRequest(`/bills/${id}`);
  },

  async create(billData: any) {
    return apiRequest('/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  },

  async update(id: string, billData: any) {
    return apiRequest(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billData),
    });
  },

  async delete(id: string) {
    return apiRequest(`/bills/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };