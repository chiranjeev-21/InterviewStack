// src/services/api.ts
import axios from 'axios';
import type {
  CompanySummary, CompanyDetail, Experience, Page,
  PredictionResponse, CreateExperiencePayload
} from '@/types/api';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/+$/, '');

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Companies ───────────────────────────────────────────────────────────────

export const getCompanies = (search = '', page = 0, size = 20) =>
  client.get<Page<CompanySummary>>('/companies', { params: { search, page, size } })
        .then(r => r.data);

export const getTrendingCompanies = () =>
  client.get<CompanySummary[]>('/companies/trending').then(r => r.data);

export const getCompany = (slug: string) =>
  client.get<CompanyDetail>(`/companies/${slug}`).then(r => r.data);

// ─── Experiences ─────────────────────────────────────────────────────────────

export const getExperiences = (slug: string, role?: string, page = 0, size = 10) =>
  client.get<Page<Experience>>(`/companies/${slug}/experiences`,
    { params: { role, page, size } }).then(r => r.data);

export const getExperience = (id: number) =>
  client.get<Experience>(`/experiences/${id}`).then(r => r.data);

export const submitExperience = (payload: CreateExperiencePayload, token: string) =>
  client.post<Experience>('/experiences', payload, {
    headers: { 'X-Contributor-Token': token },
  }).then(r => r.data);

// ─── Predictions ─────────────────────────────────────────────────────────────

export const getPrediction = (slug: string, role: string) =>
  client.get<PredictionResponse>(`/companies/${slug}/predict`, { params: { role } })
        .then(r => r.data);
