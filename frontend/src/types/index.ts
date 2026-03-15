export interface UploadResponse {
  job_id: string;
  status: string;
}

export interface TranscriptionStatusResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  transcript?: string;
  error?: string;
}

export interface GenerateRequest {
  transcript: string;
  tone?: 'professional' | 'casual' | 'inspiring';
}

export interface GeneratedPost {
  topic: string;
  linkedin_post: string;
  word_count: number;
  word_count_warning: boolean;
}

export interface GenerateResponse {
  summary: string;
  posts: GeneratedPost[];
}

export interface LinkedInProfile {
  linkedin_id: string;
  name: string;
  profile_picture?: string;
}

export interface SchedulePostRequest {
  linkedin_post: string;
  topic: string;
  linkedin_id: string;
  access_token: string;
  scheduled_at: string; // ISO 8601
}

export interface ScheduledPost {
  id: string;
  topic: string;
  linkedin_post: string;
  scheduled_at: string;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  post_url?: string;
  error?: string;
  created_at: string;
}

export interface LinkedInPublishResponse {
  post_id: string;
  post_url: string;
}
