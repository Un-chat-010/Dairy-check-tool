import { createClient } from '@supabase/supabase-js'

// Vite 专属的读取环境变量的方式

// 加上 as string，按住 TypeScript 的报警器
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// 创建并导出一个供全局使用的 supabase 实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

