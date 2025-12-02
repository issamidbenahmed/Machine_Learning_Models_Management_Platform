/**
 * Client API pour communiquer avec le backend Flask
 */
import axios, { AxiosInstance } from 'axios';
import type {
  Dataset,
  MLModel,
  AlgorithmResult,
  Stats,
  CreateModelData,
  SelectFeaturesData,
  TrainingResult,
  DatasetUploadResponse,
  ExportedAPI,
  ExportAPIResponse,
  APIStats,
  APIRequest,
  APIMetrics,
} from './types';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const errorData = error.response.data?.error;
          throw new Error(errorData?.message || 'Une erreur est survenue');
        }
        throw error;
      }
    );
  }

  // Datasets
  async uploadDataset(file: File): Promise<DatasetUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDataset(id: number): Promise<Dataset> {
    const response = await this.client.get(`/datasets/${id}`);
    return response.data;
  }

  // Models
  async createModel(data: CreateModelData): Promise<MLModel> {
    const response = await this.client.post('/models/create', data);
    return response.data;
  }

  async selectFeatures(
    modelId: number,
    data: SelectFeaturesData
  ): Promise<MLModel> {
    const response = await this.client.post(`/models/${modelId}/select-io`, data);
    return response.data;
  }

  async testAlgorithms(modelId: number): Promise<AlgorithmResult[]> {
    const response = await this.client.post(`/models/${modelId}/test-algorithms`);
    return response.data;
  }

  async trainModel(modelId: number, algorithm: string): Promise<TrainingResult> {
    const response = await this.client.post(`/models/${modelId}/train`, {
      algorithm,
    });
    return response.data;
  }

  async getModels(): Promise<MLModel[]> {
    const response = await this.client.get('/models');
    return response.data;
  }

  async getModel(id: number): Promise<MLModel> {
    const response = await this.client.get(`/models/${id}`);
    return response.data;
  }

  async getStats(): Promise<Stats> {
    const response = await this.client.get('/models/stats');
    return response.data;
  }

  async deleteModel(id: number): Promise<void> {
    await this.client.delete(`/models/${id}`);
  }

  // API Export
  async exportModel(modelId: number): Promise<ExportedAPI> {
    const response = await this.client.post(`/api/export/${modelId}`);
    return response.data;
  }

  async getExportedAPIs(): Promise<{apis: ExportedAPI[], summary: any}> {
    const response = await this.client.get('/api/monitoring/apis');
    return response.data;
  }

  async getAPIDetails(apiId: number): Promise<ExportedAPI> {
    const response = await this.client.get(`/api/export/s/${apiId}`);
    return response.data;
  }

  async updateAPIStatus(apiId: number, status: 'active' | 'inactive'): Promise<ExportedAPI> {
    const response = await this.client.put(`/api/export/s/${apiId}/status`, { status });
    return response.data;
  }

  async regenerateAPIKey(apiId: number): Promise<{ api_key: string }> {
    const response = await this.client.post(`/api/export/s/${apiId}/regenerate-key`);
    return response.data;
  }

  async deleteAPI(apiId: number): Promise<void> {
    await this.client.delete(`/api/export/s/${apiId}`);
  }

  // Monitoring
  async getAPIStats(apiId: number, timeRange: string = '24h'): Promise<APIStats> {
    const response = await this.client.get(`/api/monitoring/apis/${apiId}/stats?range=${timeRange}`);
    return response.data;
  }

  async getAPIRequests(apiId: number, limit: number = 100): Promise<APIRequest[]> {
    const response = await this.client.get(`/api/monitoring/apis/${apiId}/requests?limit=${limit}`);
    return response.data;
  }

  async getAPIMetrics(apiId: number, timeRange: string = '24h'): Promise<APIMetrics[]> {
    const response = await this.client.get(`/api/monitoring/apis/${apiId}/metrics?range=${timeRange}`);
    return response.data;
  }
}

export const apiClient = new APIClient();
