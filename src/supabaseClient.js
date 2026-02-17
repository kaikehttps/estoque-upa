import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qeakkgdepvtsuimwnxfk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYWtrZ2RlcHZ0c3VpbXdueGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDk0ODYsImV4cCI6MjA4NjQ4NTQ4Nn0.jH6quoFQE2pBpUzQDeW5q2NVGbQ2Ol42nYZRdt2z_Y8' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)