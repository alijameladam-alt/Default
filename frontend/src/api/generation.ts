import client from './client';
import type { GenerateRequest, GenerateResponse } from '../types';

export async function generatePosts(req: GenerateRequest): Promise<GenerateResponse> {
  const { data } = await client.post<GenerateResponse>('/generate', req);
  return data;
}
