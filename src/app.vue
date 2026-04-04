<template>
  <div class="page">
    <!-- 头部 -->
    <header class="site-header">
      <div class="logo-wrap">
        <div class="site-year">2026</div>
        <div class="site-tagline">我的日记 · 记录此刻</div>
      </div>
    </header>

    <!-- 第一层：显化照片墙 (麻绳悬挂特效) -->
    <section class="intention-board">
      <div class="sec-label">意图板 · 我在显化</div>
      <div class="rope-container">
        <!-- 照片遍历 -->
        <div v-for="(photo, index) in photos" :key="photo.id" class="photo-card" :class="index % 2 === 0 ? 'tilt-left' : 'tilt-right'">
          <div class="clip"></div>
          <img :src="photo.src" alt="">
          <button class="photo-del" @click="deletePhoto(photo.id)">✕</button>
          <input 
            class="photo-caption" 
            type="text" 
            placeholder="写一行意图…"
            v-model="photo.caption"
            @change="savePhotos"
            maxlength="14"
          >
        </div>
        <!-- 上传按钮 -->
        <label class="upload-zone photo-card" @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false" @drop.prevent="handleDrop">
          <div class="clip"></div>
          <span class="upload-text">+<br>挂上新照片</span>
          <input type="file" accept="image/*" multiple @change="handleFileInput">
        </label>
      </div>
    </section>

    <!-- 第二层：核心控制台 (左圆右方) -->
    <section class="dashboard-section">
      <div class="dash-grid">
        <!-- 左侧：生命之轮 -->
        <div class="dash-left" @click="showWheelModal = true">
          <div class="sec-label">生命之轮 (点击打分)</div>
          <div class="wheel-preview">
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <!-- 简易雷达图底底座 -->
              <circle cx="100" cy="100" r="80" fill="none" stroke="#d6e6f2" stroke-width="1"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#d6e6f2" stroke-width="1"/>
              <line x1="100" y1="20" x2="100" y2="180" stroke="#d6e6f2"/>
              <line x1="20" y1="100" x2="180" y2="100" stroke="#d6e6f2"/>
              <!-- 动态多边形 -->
              <polygon :points="radarPoints" fill="rgba(122,174,204,0.2)" stroke="#7aaecc" stroke-width="1.5"/>
            </svg>
          </div>
        </div>
        
        <!-- 右侧：12个月庆祝 -->
        <div class="dash-right">
          <div class="sec-label">12 个月庆祝目标</div>
          <textarea 
            class="goal-textarea" 
            placeholder="假如一年后回顾今年，你最希望庆祝什么成果？写下那个具体的画面..."
            v-model="yearGoal"
            @input="saveGoal"
          ></textarea>
        </div>
      </div>
    </section>

    <!-- 第三层：今日日记 -->
    <section class="today-section">
      <div class="sec-label">今日小步子</div>
      <div class="date-display">
        <span>{{ todayStr }}</span>
        <span class="weekday">{{ todayWeekday }}</span>
      </div>
      <textarea
        class="diary-textarea"
        placeholder="今天为了上面的目标，我做了一件什么微小的事？有什么情绪？"
        spellcheck="false"
        v-model="diaryContent"
        @input="handleDiaryInput"
      ></textarea>
      <div class="save-bar">
        <div class="save-indicator" :class="{ show: showSaveInd }">已保存 ✓</div>
        <div class="word-count">{{ wordCount }} 字</div>
      </div>
    </section>

    <!-- 打分弹窗 (隐藏状态，点击轮子显示) -->
    <div v-if="showWheelModal" class="modal-overlay" @click.self="showWheelModal = false">
      <div class="modal-content">
        <h3>给当下的状态打个分</h3>
        <div class="score-row" v-for="dim in wheelDims" :key="dim.k">
          <label>{{ dim.l }}</label>
          <input type="range" min="0" max="10" v-model.number="wheelData[dim.k]" @input="saveWheel">
          <span>{{ wheelData[dim.k] }}</span>
        </div>
        <button class="close-btn" @click="showWheelModal = false">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from './supabase' // 引入我们刚才建好的桥梁

interface Photo { id: string; src: string; caption: string; ts: string }

const WD = ['日', '一', '二', '三', '四', '五', '六']
const d = new Date()
// Supabase 需要的格式：比如 '2026-04-04'
const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const currentYear = String(d.getFullYear())

const todayStr = `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日`
const todayWeekday = `星期${WD[d.getDay()]}`

const photos = ref<Photo[]>([])
const isDragOver = ref(false)
const diaryContent = ref('')
const showSaveInd = ref(false)

const yearGoal = ref('')
const showWheelModal = ref(false)
const wheelDims = [
  {k:'health',l:'健康'},{k:'career',l:'事业'},{k:'finance',l:'财务'},{k:'social',l:'人际'},
  {k:'love',l:'爱情'},{k:'growth',l:'成长'},{k:'leisure',l:'休闲'},{k:'spirit',l:'精神'}
]
const wheelData = ref<Record<string, number>>({
  health: 5, career: 5, finance: 5, social: 5, love: 5, growth: 5, leisure: 5, spirit: 5
})

let saveTimer: ReturnType<typeof setTimeout> | null = null

const radarPoints = computed(() => {
  const cx = 100, cy = 100, r = 80;
  return wheelDims.map((dim, i) => {
    const val = (wheelData.value[dim.k] || 0) / 10;
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / wheelDims.length;
    return `${cx + val * r * Math.cos(angle)},${cy + val * r * Math.sin(angle)}`;
  }).join(' ');
})

const wordCount = computed(() => diaryContent.value.replace(/\s/g, '').length)

// 页面加载时：从 Supabase 云端拉取数据
onMounted(async () => {
  try {
    // 1. 获取今日日记
    const { data: diary } = await supabase
      .from('diary_entries')
      .select('content')
      .eq('date_key', todayKey)
      .single()
    if (diary) diaryContent.value = diary.content

    // 2. 获取年度目标和生命之轮
    const { data: dash } = await supabase
      .from('user_dashboard')
      .select('yearly_goal, wheel_data')
      .eq('year', currentYear)
      .single()
      
    if (dash) {
      if (dash.yearly_goal) yearGoal.value = dash.yearly_goal
      if (dash.wheel_data) wheelData.value = dash.wheel_data
    }
  } catch (error) {
    console.error('拉取云端数据失败:', error)
  }
})

// 保存年度目标到云端
const saveGoal = async () => {
  await supabase
    .from('user_dashboard')
    .upsert({ 
      year: currentYear, 
      yearly_goal: yearGoal.value 
    }, { onConflict: 'year' })
}

// 保存生命之轮到云端
const saveWheel = async () => {
  await supabase
    .from('user_dashboard')
    .upsert({ 
      year: currentYear, 
      wheel_data: wheelData.value 
    }, { onConflict: 'year' })
}

// 日记自动保存逻辑 (防抖处理)
const handleDiaryInput = () => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    const val = diaryContent.value.trim()
    
    if (val) {
      // 写入或更新云端
      await supabase
        .from('diary_entries')
        .upsert({ date_key: todayKey, content: val }, { onConflict: 'date_key' })
    } else {
      // 如果清空了输入框，则删除当天的云端记录
      await supabase
        .from('diary_entries')
        .delete()
        .eq('date_key', todayKey)
    }
    
    showSaveInd.value = true
    setTimeout(() => showSaveInd.value = false, 1800)
  }, 800)
}

// （照片相关逻辑暂时保留原本框架，下一步处理）
const deletePhoto = (id: string) => { photos.value = photos.value.filter(p => p.id !== id); }
const savePhotos = () => { /* 待替换为云端逻辑 */ }
const handleFileInput = (e: Event) => { /* 待替换为云端逻辑 */ }
const handleDrop = (e: DragEvent) => { /* 待替换为云端逻辑 */ }
</script>

<style scoped>
/* 继承你之前的色彩变量 */
.page { max-width: 660px; margin: 0 auto; padding: 2rem; }
.site-header { text-align: center; margin-bottom: 2rem; }
.site-year { font-size: 2.5rem; font-family: serif; letter-spacing: 4px; }
.sec-label { font-size: 0.7rem; color: #7aaecc; letter-spacing: 2px; margin-bottom: 1rem; border-bottom: 1px solid #eef4f9; padding-bottom: 0.5rem; }

/* 绳索照片墙特效 */
.rope-container { 
  display: flex; gap: 1.5rem; overflow-x: auto; padding: 1.5rem 0.5rem 2rem; 
  position: relative; align-items: flex-start;
}
.rope-container::before {
  content: ''; position: absolute; top: 2.2rem; left: 0; right: 0;
  height: 2px; border-top: 2px dashed #b4d0e4; z-index: 0;
}
.photo-card {
  flex-shrink: 0; width: 120px; background: white; padding: 0.5rem 0.5rem 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06); position: relative; z-index: 1;
  transition: transform 0.3s ease, z-index 0s;
}
.photo-card:hover { transform: scale(1.08) translateY(-5px) !important; z-index: 10; }
.tilt-left { transform: rotate(-3deg); }
.tilt-right { transform: rotate(4deg) translateY(4px); }

/* 顶部小木夹 */
.clip {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  width: 12px; height: 22px; background: #eef4f9; border: 1px solid #b4d0e4;
  border-radius: 2px; box-shadow: 1px 1px 3px rgba(0,0,0,0.1); z-index: 2;
}
.photo-card img { width: 100%; height: 100px; object-fit: cover; }
.photo-caption { 
  width: 100%; border: none; text-align: center; font-size: 0.6rem; 
  margin-top: 5px; outline: none; color: #5a6a7a; 
}
.photo-del {
  position: absolute; top: 0.2rem; right: 0.2rem; background: rgba(255,255,255,0.8);
  border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.6rem;
  cursor: pointer; opacity: 0; transition: 0.2s;
}
.photo-card:hover .photo-del { opacity: 1; }

.upload-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 140px; background: #f9f7f3; border: 1.5px dashed #b4d0e4; cursor: pointer;
}
.upload-text { font-size: 0.7rem; color: #9aabb8; text-align: center; margin-top: 10px; }
.upload-zone input { display: none; }

/* 核心控制台：左圆右方 */
.dashboard-section { margin-top: 3rem; margin-bottom: 3rem; }
.dash-grid { display: flex; gap: 2rem; align-items: stretch; }
.dash-left { 
  flex: 0 0 160px; display: flex; flex-direction: column; cursor: pointer;
  transition: transform 0.2s;
}
.dash-left:hover { transform: scale(1.02); }
.wheel-preview { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); flex: 1; }
.dash-right { flex: 1; display: flex; flex-direction: column; }
.goal-textarea {
  flex: 1; width: 100%; resize: none; border: none; background: white; 
  padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  font-family: inherit; font-size: 0.9rem; line-height: 1.8; color: #5a6a7a; outline: none;
}
.goal-textarea:focus { box-shadow: 0 0 0 2px #eef4f9; }

/* 日记区 */
.date-display { font-size: 1.2rem; margin-bottom: 1rem; }
.diary-textarea {
  width: 100%; min-height: 200px; border: none; border-left: 2px solid #d6e6f2;
  background: transparent; font-size: 1rem; line-height: 2; padding-left: 1rem; outline: none;
}
.diary-textarea:focus { border-color: #7aaecc; }
.save-bar { display: flex; justify-content: space-between; font-size: 0.7rem; color: #9aabb8; margin-top: 10px; }
.save-indicator { opacity: 0; color: #7aaecc; transition: 0.3s; }
.save-indicator.show { opacity: 1; }

/* 弹窗 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 300px; }
.modal-content h3 { margin-bottom: 1.5rem; font-size: 1rem; color: #2c2a26; text-align: center; }
.score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 0.8rem; }
.score-row input { flex: 1; }
.close-btn { width: 100%; margin-top: 1.5rem; padding: 0.5rem; background: #7aaecc; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>