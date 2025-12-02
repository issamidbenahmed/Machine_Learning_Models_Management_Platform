/**
 * Types TypeScript pour l'application
 */

export interface Dataset {
  id: number;
  filename: string;
  path: string;
  columns: string[];
  row_count: number;
  preview?: any[][];
  created_at: string;
}

export interface MLModel {
  id: number;
  name: string;
  description?: string;
  dataset_id: number;
  inputs?: string[];
  outputs?: string[];
  algorithm?: string;
  score?: number;
  model_path?: string;
  status: 'created' | 'configured' | 'trained';
  created_at: string;
  trained_at?: string;
}

export interface AlgorithmResult {
  algorithm: string;
  name: string;
  description: string;
  score: number;
  metrics?: {
    accuracy?: number;
    r2?: number;
    mse?: number;
    rmse?: number;
    mae?: number;
  };
  training_time: number;
  error?: string;
}

export interface Stats {
  total_models: number;
  trained_models: number;
  total_datasets: number;
  avg_score: number;
  total_uses: number;
}

export interface CreateModelData {
  name: string;
  description?: string;
  dataset_id: number;
}

export interface SelectFeaturesData {
  inputs: string[];
  outputs: string[];
}

export interface TrainingResult {
  status: string;
  score: number;
  model_path: string;
  algorithm: string;
}

export interface DatasetUploadResponse {
  id: number;
  filename: string;
  columns: string[];
  preview: any[][];
  row_count: number;
}

export interface ExportedAPI {
  id: number;
  model_id: number;
  model_name: string;
  api_key: string;
  api_endpoint: string;
  api_url?: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  last_used_at?: string;
  total_requests: number;
  stats?: {
    requests_24h: number;
    avg_response_time: number;
    success_rate: number;
  };
}

export interface APIMetrics {
  id: number;
  api_id: number;
  hour_timestamp: string;
  request_count: number;
  avg_response_time: number;
  success_count: number;
  error_count: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
  created_at: string;
}

export interface APIRequest {
  id: number;
  api_id: number;
  request_data: string;
  response_data: string;
  response_time: number;
  status_code: number;
  error_message?: string;
  cpu_usage?: number;
  memory_usage?: number;
  timestamp: string;
}

export interface APIStats {
  total_requests: number;
  requests_24h: number;
  requests_7d: number;
  avg_response_time: number;
  success_rate: number;
  error_rate: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
  last_request_at?: string;
}

export interface ExportAPIResponse {
  id: number;
  model_id: number;
  model_name: string;
  api_key: string;
  api_endpoint: string;
  api_url: string;
  status: string;
  created_at: string;
}
