/**
 * LifeOS Server Enhanced - P0 + P1 Features + Personality Analysis System
 * Features:
 * - P0: Search & Filter, Edit Entry, Data Export (PDF)
 * - P1: Advanced Stats, Smart Insights, Batch Operations
 * - Personality: User behavior analysis with AI feedback loop
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const PORT = process.env.PORT || 3000;

// ==================== Helper Functions ====================

function generateToken(user) {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'lifeos-secret-key-change-in-production';
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'lifeos-secret-key-change-in-production';
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ==================== Personality System ====================

/**
 * 获取或创建用户性格档案
 */
async function getOrCreatePersonality(userId) {
  let personality = await prisma.personality.findUnique({
    where: { user_id: userId },
  });

  if (!personality) {
    personality = await prisma.personality.create({
      data: {
        user_id: userId,
        confidence_score: 0.5,
        analysis_count: 0,
      },
    });
  }

  return personality;
}

/**
 * 分析用户办事风格（基于一个月的记录）
 */
async function analyzePersonalityStyle(userId) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const entries = await prisma.entry.findMany({
    where: {
      user_id: userId,
      recorded_at: { gte: oneMonthAgo },
    },
    orderBy: { recorded_at: 'desc' },
    include: { analysis: true },
  });

  if (entries.length < 5) {
    return null; // 记录太少，无法分析
  }

  // 提取关键数据用于 AI 分析
  const entriesSummary = entries.map(e => ({
    content: e.content.substring(0, 200),
    activity: e.activity,
    mood: e.mood,
    summary: e.summary,
    comment: e.comment,
    recorded_at: e.recorded_at,
    analysis: e.analysis ? {
      activity_type: e.analysis.activity_type,
      mood_score: e.analysis.mood_score,
      energy_level: e.analysis.energy_level,
      productivity: e.analysis.productivity,
    } : null,
  }));

  // 统计活动分布
  const activityCount = {};
  entries.forEach(e => {
    if (e.activity) {
      activityCount[e.activity] = (activityCount[e.activity] || 0) + 1;
    }
  });

  const topActivities = Object.entries(activityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // 心情趋势
  const moodData = entries
    .filter(e => e.mood !== null && e.mood !== undefined)
    .map(e => ({ date: e.recorded_at, mood: e.mood }));

  const avgMood = moodData.length > 0
    ? moodData.reduce((sum, m) => sum + m.mood, 0) / moodData.length
    : null;

  // 时间分布分析（找出效率高峰时段）
  const timeSlots = {
    '凌晨': [0, 5],
    '早晨': [5, 9],
    '上午': [9, 12],
    '下午': [12, 17],
    '傍晚': [17, 20],
    '夜间': [20, 24],
  };

  const timeProductivity = {};
  entries.forEach(e => {
    const hour = new Date(e.recorded_at).getHours();
    for (const [slot, [start, end]] of Object.entries(timeSlots)) {
      if (hour >= start && hour < end) {
        const prod = e.analysis?.productivity || 5;
        timeProductivity[slot] = (timeProductivity[slot] || 0) + prod;
        break;
      }
    }
  });

  const productivityPeak = Object.entries(timeProductivity)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    entries_count: entries.length,
    entries_summary: entriesSummary,
    top_activities: topActivities,
    avg_mood: avgMood,
    mood_trend: moodData,
    productivity_peak: productivityPeak,
  };
}

/**
 * 使用大模型分析用户性格
 */
async function analyzePersonalityWithAI(data, currentPersonality) {
  const { analyzeEntryWithAI } = require('./analyze');
  const fetch = require('node-fetch');

  // 构建分析提示词
  const systemPrompt = `你是一个专业的性格分析师。请基于用户一个月的生活记录，分析用户的办事风格和性格特征。

当前已知性格信息：
- 决策风格: ${currentPersonality.decision_style || '未知'}
- 工作模式: ${currentPersonality.work_pattern || '未知'}
- 能量节奏: ${currentPersonality.energy_rhythm || '未知'}
- 压力反应: ${currentPersonality.stress_response || '未知'}
- 社交风格: ${currentPersonality.social_style || '未知'}
- 任务完成风格: ${currentPersonality.task_completion || '未知'}
- 规划风格: ${currentPersonality.planning_style || '未知'}
- 沟通风格: ${currentPersonality.communication || '未知'}

请分析用户记录，输出 JSON 格式的性格分析结果：
{
  "decision_style": "理性/感性/混合",
  "work_pattern": "专注型/多任务型",
  "energy_rhythm": "晨型/夜型/稳定型",
  "stress_response": "积极应对/需要休息",
  "social_style": "外向/内向/平衡",
  "task_completion": "持续推进/阶段性爆发/需要外部驱动",
  "planning_style": "详细规划/大体框架/灵活调整/即时行动",
  "communication": "直接高效/委婉细致/幽默风趣",
  "ai_summary": "简要总结用户的人格特点（3-5句话）",
  "strengths": ["优势1", "优势2", "优势3"],
  "growth_areas": ["成长空间1", "成长空间2"],
  "confidence": 0.0-1.0,
  "changes": [{
    "field": "字段名",
    "old": "旧值",
    "new": "新值",
    "reason": "变化原因"
  }]
}

注意事项：
1. 如果当前性格信息与分析结果一致，不添加到 changes
2. 如果有显著变化（例如：从"理性"变为"感性"），记录到 changes
3. 分析时要综合考虑活动类型、心情、能量等级、时间分布等多个维度
4. confidence 表示分析置信度，基于记录数量和质量`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`,
      },
      body: JSON.stringify({
        model: 'stepfun/step-3.5-flash:free',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `用户一个月的记录数据：
- 总记录数: ${data.entries_count}
- 常见活动: ${JSON.stringify(data.top_activities)}
- 平均心情: ${data.avg_mood}
- 效率高峰时段: ${data.productivity_peak}
- 最近 10 条记录摘要: ${JSON.stringify(data.entries_summary.slice(0, 10))}

请分析用户的性格特征。`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const result = await response.json();
    const content = result.choices[0].message.content;

    // 提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('AI Personality Analysis Error:', error);
    return null;
  }
}

/**
 * 更新性格档案
 */
async function updatePersonality(userId) {
  try {
    console.log(`[Personality] Starting analysis for user ${userId}...`);

    const currentPersonality = await getOrCreatePersonality(userId);
    const analysisData = await analyzePersonalityStyle(userId);

    if (!analysisData) {
      console.log(`[Personality] Not enough data for user ${userId}`);
      return currentPersonality;
    }

    // AI 分析
    const aiAnalysis = await analyzePersonalityWithAI(analysisData, currentPersonality);
    if (!aiAnalysis) {
      console.log(`[Personality] AI analysis failed for user ${userId}`);
      return currentPersonality;
    }

    console.log(`[Personality] AI analysis completed:`, JSON.stringify(aiAnalysis, null, 2));

    // 准备更新数据
    const updateData = {
      decision_style: aiAnalysis.decision_style,
      work_pattern: aiAnalysis.work_pattern,
      energy_rhythm: aiAnalysis.energy_rhythm,
      stress_response: aiAnalysis.stress_response,
      social_style: aiAnalysis.social_style,
      task_completion: aiAnalysis.task_completion,
      planning_style: aiAnalysis.planning_style,
      communication: aiAnalysis.communication,
      ai_summary: aiAnalysis.ai_summary,
      strengths: aiAnalysis.strengths,
      growth_areas: aiAnalysis.growth_areas,
      top_activities: analysisData.top_activities,
      avg_mood_trend: analysisData.mood_trend,
      productivity_peak: analysisData.productivity_peak,
      confidence_score: Math.min(0.95, currentPersonality.confidence_score + 0.1),
      analysis_count: currentPersonality.analysis_count + 1,
      last_analyzed: new Date(),
      last_updated: new Date(),
    };

    // 处理变化历史
    let changeHistory = currentPersonality.change_history ? JSON.parse(JSON.stringify(currentPersonality.change_history)) : [];

    if (aiAnalysis.changes && aiAnalysis.changes.length > 0) {
      const newChanges = aiAnalysis.changes.map(c => ({
        date: new Date().toISOString(),
        field: c.field,
        oldValue: c.old,
        newValue: c.new,
        reason: c.reason,
      }));
      changeHistory = [...newChanges, ...changeHistory].slice(0, 50); // 保留最近 50 条变化

      console.log(`[Personality] Detected ${newChanges.length} personality changes`);
    }

    updateData.change_history = changeHistory;

    // 更新数据库
    const updated = await prisma.personality.update({
      where: { user_id: userId },
      data: updateData,
    });

    console.log(`[Personality] Updated personality for user ${userId}`);
    return updated;
  } catch (error) {
    console.error('[Personality] Update error:', error);
    throw error;
  }
}

// ==================== Personality API Routes ====================

/**
 * GET /api/personality
 * 获取当前性格档案
 */
app.get('/api/personality', authenticateToken, async (req, res) => {
  try {
    const personality = await getOrCreatePersonality(req.user.userId);
    res.json({ personality });
  } catch (error) {
    console.error('Get personality error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/personality/analyze
 * 触发性格分析
 */
app.post('/api/personality/analyze', authenticateToken, async (req, res) => {
  try {
    const personality = await updatePersonality(req.user.userId);
    res.json({
      success: true,
      personality,
      message: 'Personality analysis completed',
    });
  } catch (error) {
    console.error('Analyze personality error:', error);
    res.status(500).json({ error: 'Failed to analyze personality' });
  }
});

/**
 * GET /api/personality/history
 * 获取性格变化历史
 */
app.get('/api/personality/history', authenticateToken, async (req, res) => {
  try {
    const personality = await getOrCreatePersonality(req.user.userId);
    const history = personality.change_history || [];
    res.json({ history });
  } catch (error) {
    console.error('Get personality history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== P0 Features: Search & Filter ====================

/**
 * GET /api/entries
 * Enhanced with filtering and search
 * Query: ?page=1&per_page=10&start_date=&end_date=&activity=&mood_min=&mood_max=&search=
 */
app.get('/api/entries', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || 10;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const activity = req.query.activity;
    const mood_min = req.query.mood_min;
    const mood_max = req.query.mood_max;
    const search = req.query.search;

    const where = {
      user_id: req.user.userId,
      ...(start_date && end_date && {
        recorded_at: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      }),
      ...(activity && { activity }),
      ...(mood_min && { mood: { gte: parseInt(mood_min) } }),
      ...(mood_max && { mood: { lte: parseInt(mood_max) } }),
      ...(search && {
        content: { contains: search },
      }),
    };

    const entries = await prisma.entry.findMany({
      where,
      orderBy: { recorded_at: 'desc' },
      skip: (page - 1) * per_page,
      take: per_page,
      include: { analysis: true },
    });

    const total = await prisma.entry.count({ where });

    res.json({
      entries,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error('List entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== P0 Features: Edit Entry ====================

/**
 * PUT /api/entries/:id
 * Edit existing entry
 */
app.put('/api/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mood, tags, activity, metadata } = req.body;

    // 验证 entry 是否属于当前用户
    const existing = await prisma.entry.findFirst({
      where: { id, user_id: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // 更新 entry
    const entry = await prisma.entry.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(mood !== undefined && { mood }),
        ...(tags !== undefined && { tags }),
        ...(activity !== undefined && { activity }),
        ...(metadata !== undefined && { metadata }),
        updated_at: new Date(),
      },
    });

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== P0 Features: Data Export (PDF) ====================

/**
 * POST /api/export/pdf
 * Export entries to PDF
 * Body: { start_date, end_date, activity, include_ai }
 */
app.post('/api/export/pdf', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, activity, include_ai = true } = req.body;

    const where = {
      user_id: req.user.userId,
      ...(start_date && end_date && {
        recorded_at: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      }),
      ...(activity && { activity }),
    };

    const entries = await prisma.entry.findMany({
      where,
      orderBy: { recorded_at: 'desc' },
      include: { analysis: true },
    });

    if (entries.length === 0) {
      return res.status(404).json({ error: 'No entries found' });
    }

    // 生成 PDF 内容（简化版，实际应使用 pdfkit 或 puppeteer）
    const pdfContent = {
      title: 'LifeOS Export',
      date: new Date().toISOString(),
      entries_count: entries.length,
      entries: entries.map(e => ({
        date: e.recorded_at,
        content: e.content,
        mood: e.mood,
        activity: e.activity,
        ...(include_ai && {
          summary: e.summary,
          comment: e.comment,
          analysis: e.analysis,
        }),
      })),
    };

    // 这里应该是实际的 PDF 生成代码
    // 暂时返回 JSON 格式
    res.json({
      success: true,
      data: pdfContent,
      message: 'PDF export completed (JSON format for demo)',
      note: 'Implement PDF generation with puppeteer or pdfkit',
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// ==================== P1 Features: Advanced Statistics ====================

/**
 * GET /api/statistics/advanced
 * Advanced statistics with time range
 * Query: ?range=week|month|year
 */
app.get('/api/statistics/advanced', authenticateToken, async (req, res) => {
  try {
    const range = req.query.range || 'month';
    let startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const entries = await prisma.entry.findMany({
      where: {
        user_id: req.user.userId,
        recorded_at: { gte: startDate },
      },
      include: { analysis: true },
      orderBy: { recorded_at: 'asc' },
    });

    // 计算统计数据
    const totalEntries = entries.length;
    const moodData = entries.filter(e => e.mood !== null);
    const avgMood = moodData.length > 0
      ? moodData.reduce((sum, e) => sum + e.mood, 0) / moodData.length
      : 0;

    const activityData = {};
    entries.forEach(e => {
      if (e.activity) {
        activityData[e.activity] = (activityData[e.activity] || 0) + 1;
      }
    });

    const activityDistribution = Object.entries(activityData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 时间分布
    const timeDistribution = {};
    entries.forEach(e => {
      const hour = new Date(e.recorded_at).getHours();
      const timeSlot = `${hour}:00`;
      timeDistribution[timeSlot] = (timeDistribution[timeSlot] || 0) + 1;
    });

    const timeData = Object.entries(timeDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // 心情趋势
    const moodTrend = entries
      .filter(e => e.mood !== null)
      .map(e => ({
        date: e.recorded_at.toISOString().split('T')[0],
        mood: e.mood,
      }));

    // 能量趋势
    const energyTrend = entries
      .filter(e => e.analysis?.energy_level !== null)
      .map(e => ({
        date: e.recorded_at.toISOString().split('T')[0],
        energy: e.analysis.energy_level,
      }));

    res.json({
      statistics: {
        totalEntries,
        avgMood: parseFloat(avgMood.toFixed(2)),
        activityDistribution,
        timeDistribution: timeData,
        moodTrend,
        energyTrend,
        range,
        period_start: startDate.toISOString(),
        period_end: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Advanced statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== P1 Features: Smart Insights ====================

/**
 * GET /api/insights/weekly
 * Generate weekly insights report
 */
app.get('/api/insights/weekly', authenticateToken, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const entries = await prisma.entry.findMany({
      where: {
        user_id: req.user.userId,
        recorded_at: { gte: startDate },
      },
      include: { analysis: true },
      orderBy: { recorded_at: 'asc' },
    });

    if (entries.length === 0) {
      return res.json({
        insights: {
          summary: '本周还没有记录，开始记录你的生活吧！',
          highlights: [],
          patterns: [],
          suggestions: [],
        },
      });
    }

    // 生成洞察（简化版，实际应使用 AI）
    const avgMood = entries
      .filter(e => e.mood !== null)
      .reduce((sum, e) => sum + e.mood, 0) / entries.filter(e => e.mood !== null).length || 0;

    const topActivities = entries
      .reduce((acc, e) => {
        if (e.activity) acc[e.activity] = (acc[e.activity] || 0) + 1;
        return acc;
      }, {});

    const mostFrequentActivity = Object.entries(topActivities)
      .sort((a, b) => b[1] - a[1])[0];

    const insights = {
      period: 'recent Week',
      record_count: entries.length,
      summary: `本周你记录了 ${entries.length} 条生活片段。总体平均心情为 ${avgMood.toFixed(1)}。`,
      highlights: [
        mostFrequentActivity
          ? `最常进行的活动是：${mostFrequentActivity[0]}（${mostFrequentActivity[1]} 次）`
          : '还没有明确的活动分类',
        `记录频率: 平均每天 ${(entries.length / 7).toFixed(1)} 条`,
      ],
      patterns: [],
      suggestions: [
        '继续保持记录习惯，让 AI 更好地了解你',
        '尝试分析你的心情变化，寻找提升幸福感的方法',
      ],
      generated_at: new Date().toISOString(),
    };

    res.json({ insights });
  } catch (error) {
    console.error('Weekly insights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/insights/monthly
 * Generate monthly insights report
 */
app.get('/api/insights/monthly', authenticateToken, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const entries = await prisma.entry.findMany({
      where: {
        user_id: req.user.userId,
        recorded_at: { gte: startDate },
      },
      include: { analysis: true },
      orderBy: { recorded_at: 'asc' },
    });

    // 生成月度洞察（简化版）
    const insights = {
      period: 'recent Month',
      record_count: entries.length,
      generated_at: new Date().toISOString(),
      message: 'Monthly insights feature - add AI-powered analysis here',
    };

    res.json({ insights });
  } catch (error) {
    console.error('Monthly insights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== P1 Features: Batch Operations ====================

/**
 * POST /api/entries/batch/delete
 * Batch delete entries
 * Body: { entryIds: string[] }
 */
app.post('/api/entries/batch/delete', authenticateToken, async (req, res) => {
  try {
    const { entryIds } = req.body;

    if (!entryIds || entryIds.length === 0) {
      return res.status(400).json({ error: 'No entry IDs provided' });
    }

    // 验证所有 entry 都属于当前用户
    const entries = await prisma.entry.findMany({
      where: {
        id: { in: entryIds },
        user_id: req.user.userId,
      },
    });

    if (entries.length !== entryIds.length) {
      return res.status(403).json({ error: 'Some entries do not belong to you' });
    }

    // 删除
    await prisma.analysis.deleteMany({
      where: { entry_id: { in: entryIds } },
    });

    await prisma.entry.deleteMany({
      where: { id: { in: entryIds } },
    });

    res.json({
      success: true,
      deleted_count: entryIds.length,
      message: `Successfully deleted ${entryIds.length} entries`,
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/entries/batch/analyze
 * Batch AI analyze entries
 * Body: { entryIds: string[] }
 */
app.post('/api/entries/batch/analyze', authenticateToken, async (req, res) => {
  try {
    const { entryIds } = req.body;

    if (!entryIds || entryIds.length === 0) {
      return res.status(400).json({ error: 'No entry IDs provided' });
    }

    // 获取用户性格信息
    const personality = await getOrCreatePersonality(req.user.userId);

    // 异步分析所有 entry
    const results = [];
    for (const entryId of entryIds) {
      try {
        const entry = await prisma.entry.findUnique({
          where: { id: entryId },
          include: { analysis: true },
        });

        if (!entry || entry.user_id !== req.user.userId) {
          continue;
        }

        if (entry.analysis) {
          results.push({ entryId, status: 'completed', cached: true });
          continue;
        }

        // 后台异步分析
        (async () => {
          const { analyzeEntry } = require('./analyze');
          const result = await analyzeEntry(entry, {
            personality_context: personality,
          });

          await prisma.analysis.create({
            data: {
              entry_id: entryId,
              user_id: req.user.userId,
              activity_type: result.activity_type,
              mood_score: result.mood_score,
              energy_level: result.energy_level,
              importance: result.importance,
              productivity: result.productivity,
              keywords: result.keywords,
              summary: result.summary,
              insights: result.comment,
              personality_context: personality,
              model: 'glm5',
            },
          });

          console.log(`[Batch] Analyzed entry ${entryId}`);
        })();

        results.push({ entryId, status: 'processing', cached: false });
      } catch (error) {
        console.error(`[Batch] Error analyzing entry ${entryId}:`, error);
        results.push({ entryId, status: 'error', error: error.message });
      }
    }

    res.json({
      success: true,
      results,
      message: `Started batch analysis for ${entryIds.length} entries`,
    });
  } catch (error) {
    console.error('Batch analyze error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== Existing Routes (Keep) ====================

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    const { password_hash, ...userSafe } = user;

    res.json({ success: true, token, user: userSafe });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create entry
app.post('/api/entries', authenticateToken, async (req, res) => {
  try {
    const { content, mood, tags, activity, metadata } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const entry = await prisma.entry.create({
      data: {
        user_id: req.user.userId,
        content,
        mood,
        tags: tags || [],
        activity,
        device: 'web',
        metadata: metadata || {},
        recorded_at: new Date(),
      },
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete entry
app.delete('/api/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entry.delete({
      where: { id, user_id: req.user.userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get entry detail
app.get('/api/entries/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await prisma.entry.findFirst({
      where: { id: req.params.id, user_id: req.user.userId },
      include: { analysis: true },
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Stats
const { generateStatistics } = require('./analyze');
app.get('/api/analysis/stats', authenticateToken, async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      where: { user_id: req.user.userId },
      include: { analysis: true },
      orderBy: { recorded_at: 'desc' },
      take: 100,
    });
    const stats = generateStatistics(entries);
    res.json({ statistics: stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== Start Server ====================

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL');
    console.log('🚀 LifeOS Enhanced Server is running on port', PORT);
    console.log('📝 Health: http://localhost:' + PORT + '/health');
    console.log('📊 Personality API available');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
