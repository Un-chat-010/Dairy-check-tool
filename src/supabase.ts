import { createClient } from '@supabase/supabase-js'

// Vite 专属的读取环境变量的方式
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建并导出一个供全局使用的 supabase 实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)