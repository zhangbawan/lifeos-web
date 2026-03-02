// LifeOS 类型定义 - 增强版
export interface Entry {
  id: string
  user_id: string
  content: string
  device?: string
  location?: {
    latitude?: number
    longitude?: number
    name?: string
  }
  images?: { url: string; description?: string }[]
  metadata?: {
    source?: string
    tags?: string[]
  }
  recorded_at: string
  created_at: string
  updated_at: string
  
  // AI 生成字段（新增）
  tags?: string[] | { id: string; name: string; color: string }[]
  summary?: string
  comment?: string
  suggestions?: string[]
  warnings?: string[]
  mood?: number
  
  // 关联
  analyses?: Analysis[]
  analysis?: Analysis
}

export interface Analysis {
  id: string
  entry_id: string
  user_id: string
  activity_type?: string
  activity_subtype?: string
  impact_score?: number
  effectiveness?: number
  productivity?: number
  productivity_score?: number
  energy_level?: number
  flow_state?: boolean
  mood?: string
  mood_score?: number
  importance?: number
  keywords?: string[]
  insights?: string
  summary?: string
  created_at: string
}

export interface DailyStat {
  id: string
  user_id: string
  date: string
  entries_count: number  // 修复：添加缺失字段
  avg_mood?: number      // 修复：添加缺失字段
  total_entries?: number
  avg_impact_score?: number
  avg_energy_level?: number
  top_activities?: string[]
  mood_distribution?: Record<string, number>
  productivity_hours?: number[]
  activity_breakdown?: Record<string, number>
}

export interface TimelineItem {
  date: string
  entries: Entry[]
  stats?: DailyStat
  entries_count?: number
  avg_mood?: number
  activities?: Record<string, number>
  tags_frequency?: Record<string, number>
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  code?: number
  data: T
  message?: string
  pagination?: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// 创建条目请求
export interface CreateEntryRequest {
  content: string
  device?: string
  location?: {
    latitude?: number
    longitude?: number
    name?: string
  }
  images?: { url: string; description?: string }[]
  metadata?: {
    source?: string
    tags?: string[]
  }
  recorded_at?: string
  tags?: string[]
  activity?: string
}

// 统计数据类型
export interface Statistics {
  moodTrend: Array<{ date: string; mood: number }>
  activityDistribution: Array<{ name: string; value: number }>
  timeDistribution: Record<string, number>
  energyTrend: Array<{ date: string; energy: number }>
  weeklyHeatmap: Array<{ date: string; count: number }>
  totalEntries: number
  avgMood: number
}
