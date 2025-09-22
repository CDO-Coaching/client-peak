import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabasekong.cdocoaching.com';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1ODUzMDc2MCwiZXhwIjo0OTE0MjA0MzYwLCJyb2xlIjoiYW5vbiJ9.pJHSOerGt6DBqFOaS_fP9esFcxHKGC5U6dik4h06FBQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;