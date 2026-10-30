import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://egakeiiakrbszulxlmyx.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYWtlaWlha3Jic3p1bHhsbXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MDQ4NzIsImV4cCI6MjEwNjM4MDg3Mn0.G6Ow_qasr7EB_WfAD8216qWIYMV3zxYtYNN-F38zgJA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
