export interface ApiModel {
  model_id: string;
  model_base_number: number;
  details_category: string;
  model_name: string;
  variant: string;
  fbx_file_name: string;
  who_submitted: string;
  texture_count: number;
  thumbnail_url?: string;
  image_file_url?: string;
  glb_file_url?: string;
  glb_exists?: boolean;
  glb_missing?: boolean;
}

export interface ApiCategory {
  name: string;
  code: string;
}


