<template>
  <div class="results-container">
    <header class="results-header">
      <p class="subtitle">
        Anket sonuçları, Video Oyun Oynama Süresi ile Problem Çözme Yeteneği arasındaki bağlantı açısından incelenmiştir. 
      </p>
    </header>

    <div class="counter-section card">
        <div class="counter-icon"><i class="fas fa-users"></i></div>
        <div class="counter-content">
            <div class="counter-label">Toplam Katılımcı Sayısı</div>
            <div class="counter-number">{{ Math.round(animatedTotal) }}</div>
        </div>
    </div>

    <div class="analysis-section single-column">
      
      <section class="card crosstab-card">
        <h2>Oynama Süresi vs. Problem Çözme (Satır Yüzdesi)</h2>
        <p class="section-description">Her oynama süresi kategorisindeki katılımcıların problem çözme değerlendirmelerine göre yüzdesel dağılımı.</p>
        
        <div class="crosstab-table-wrapper">
          <table class="crosstab-table">
            <thead>
              <tr>
                <th class="hours-col">Oynama Süresi</th>
                <th>Zayıf</th>
                <th>Orta</th>
                <th>İyi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, label) in crosstabData" :key="label">
                <td class="row-label">{{ label }}</td>
                <td v-for="(value, key) in row.percentages" :key="key" 
                    :style="{ backgroundColor: getColorForValue(value, key) }">
                  %{{ value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card pie-card full-width">
        <h2>Genel Problem Çözme Yeteneği Dağılımı (Tüm Katılımcılar)</h2>
        <p class="section-description">Tüm katılımcıların problem çözme yeteneği konusundaki öz-değerlendirmeleri.</p>
        
        <div class="pie-chart-wrapper">
          <div class="pie-chart" :style="{ background: pieChartStyle }"></div>
          <div class="legend">
            <div v-for="(value, label) in pieData" :key="label" class="legend-item">
              <span class="color-box" :style="{ backgroundColor: pieColors[label] }"></span>
              {{ label }}: <strong>%{{ value }}</strong>
            </div>
          </div>
        </div>
      </section>
      
      <section class="card hours-charts-section full-width">
        <h2>Kategori Bazında Dağılım Analizi</h2>
        <p class="section-description">Oynama süresi kategorilerinin her birindeki Problem Çözme dağılımı (Zayıf/Orta/İyi).</p>
        
        <div class="multiple-charts-grid">
            <div class="individual-chart-wrapper" v-for="(data, label) in hoursPieData" :key="label">
  <h3>{{ label }} ({{ data.count }})</h3>
  <div class="pie-chart-small" :style="{ background: data.pieStyle }"></div>
  
  <div class="legend-small">
    <div v-for="category in ['İyi', 'Orta', 'Zayıf']" :key="category" class="legend-item-small">
      <span class="color-box-small" :style="{ backgroundColor: pieColors[category] }"></span>
      {{ category }}: <strong>%{{ data[category] }}</strong>
    </div>
  </div>
</div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { resultsCollection } from '../firebase';
import { getDocs, query, orderBy } from 'firebase/firestore';

// Durumlar
const allResults = ref([]);
const loading = ref(true);
const error = ref(null);
const totalParticipants = computed(() => allResults.value.length);

// Animasyonlu sayaç
const animatedTotal = ref(0);

const hoursMap = {
  '0': '0 saat',
  '1-3': '1–3 saat',
  '4-6': '4–6 saat',
  '7-10': '7–10 saat',
  '10+': '10+ saat',
};

const mapProblemSolving = (val) => {
  if (!val) return 'Bilinmiyor';
  if (['v_poor', 'poor'].includes(val)) return 'Zayıf';
  if (val === 'medium') return 'Orta';
  if (['good', 'v_good'].includes(val)) return 'İyi';
  return 'Bilinmiyor';
};

const pieColors = {
  İyi: '#66BB6A',
  Orta: '#FFA726',
  Zayıf: '#EF5350'
};

// Firebase'ten veri çek
const loadResults = async () => {
  try {
    loading.value = true;
    const q = query(resultsCollection, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    allResults.value = snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error(err);
    error.value = 'Veriler yüklenemedi.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadResults);

// SAYAÇ ANIMASYONU
watch(totalParticipants, (newVal) => {
  const start = animatedTotal.value;
  const end = newVal;
  const duration = 1200;
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    animatedTotal.value = Math.round(start + progress * (end - start));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}, { immediate: true });

// YENİ: Daha sağlam pie style üretici
const generatePieStyle = (percentages) => {
  let current = 0;
  const segments = [];

  // Sıralama: İyi → Orta → Zayıf (görsel tutarlılık için sabit sıra)
  ['İyi', 'Orta', 'Zayıf'].forEach(label => {
    const pct = parseFloat(percentages[label]) || 0;
    if (pct > 0) {
      segments.push(`${pieColors[label]} ${current}deg ${current + pct * 3.6}deg`);
      current += pct * 3.6;
    }
  });

  // Kalan alanı gri yap (eğer toplam %100 değilse)
  if (current < 360) {
    segments.push(`#e0e0e0 ${current}deg 360deg`);
  }

  return `conic-gradient(${segments.join(', ')})`;
};

// Çapraz Tablo
const crosstabData = computed(() => {
  const table = {};
  Object.values(hoursMap).forEach(l => {
    table[l] = { Zayıf: 0, Orta: 0, İyi: 0, total: 0 };
  });

  allResults.value.forEach(res => {
    const label = hoursMap[res.hours] || 'Bilinmiyor';
    const problem = mapProblemSolving(res.dailyProblem);
    if (table[label]) {
      table[label][problem]++;
      table[label].total++;
    }
  });

  const result = {};
  for (const label in table) {
    const row = table[label];
    if (row.total === 0) continue;
    result[label] = {
      percentages: {
        Zayıf: Math.round((row.Zayıf / row.total) * 100),
        Orta: Math.round((row.Orta / row.total) * 100),
        İyi: Math.round((row.İyi / row.total) * 100),
      },
      count: row.total
    };
  }
  return result;
});

// Genel Pasta Grafik
const pieData = computed(() => {
  const counts = { Zayıf: 0, Orta: 0, İyi: 0 };
  allResults.value.forEach(res => {
    const label = mapProblemSolving(res.dailyProblem);
    if (counts.hasOwnProperty(label)) counts[label]++;
  });
  const total = totalParticipants.value || 1;
  return {
    İyi: ((counts.İyi / total) * 100).toFixed(1),
    Orta: ((counts.Orta / total) * 100).toFixed(1),
    Zayıf: ((counts.Zayıf / total) * 100).toFixed(1),
  };
});

const pieChartStyle = computed(() => generatePieStyle(pieData.value));

// HER SAAT KATEGORİSİ İÇİN KÜÇÜK PASTA GRAFİKLER (ÇALIŞIR HALE GETİRİLDİ)
const hoursPieData = computed(() => {
  const result = {};

  Object.values(hoursMap).forEach(label => {
    const filtered = allResults.value.filter(res => hoursMap[res.hours] === label);
    const total = filtered.length;

    if (total === 0) {
      result[label] = {
        İyi: 0, good: 0,
        Orta: 0, medium: 0,
        Zayıf: 0, poor: 0,
        count: 0,
        pieStyle: 'conic-gradient(#e0e0e0 0deg 360deg)'
      };
      return;
    }

    const counts = { İyi: 0, Orta: 0, Zayıf: 0 };
    filtered.forEach(res => {
      const cat = mapProblemSolving(res.dailyProblem);
      if (counts.hasOwnProperty(cat)) counts[cat]++;
    });

    const percentages = {
      İyi: ((counts.İyi / total) * 100).toFixed(1),
      Orta: ((counts.Orta / total) * 100).toFixed(1),
      Zayıf: ((counts.Zayıf / total) * 100).toFixed(1),
    };

    result[label] = {
      ...percentages,
      count: total,
      pieStyle: generatePieStyle(percentages)
    };
  });

  return result;
});

// Hücre renklendirme
const getColorForValue = (value, category) => {
  const num = parseInt(value) || 0;
  if (category === 'İyi' && num >= 50) return 'rgba(102, 187, 106, 0.4)';
  if (category === 'Zayıf' && num >= 35) return 'rgba(239, 83, 80, 0.4)';
  if (category === 'Orta' && num >= 50) return 'rgba(255, 167, 38, 0.3)';
  return 'rgba(0, 0, 0, 0.05)';
};
</script>

<style scoped>
/* ANKET.VUE STİLİNE UYUMLU GENEL YAPILANDIRMA */
.results-container {
  max-width: 1000px;
  margin: 50px auto;
  padding: 0 20px;
  font-family: 'Poppins', sans-serif; 
  background-color: #f7f9fc; 
}

/* KARTLAR VE GENEL STİL */
.card {
  background: white;
  padding: 30px;
  border-radius: 25px; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); 
  border: 1px solid #f0f0f5;
}

/* BAŞLIK VE NAVİGASYON (Minimalist) */
.results-header {
  text-align: left;
  margin-bottom: 25px; 
  max-width: 960px; 
  margin-left: auto;
  margin-right: auto;
  padding-left: 0;
}

.subtitle {
  color: #3A3A4F; 
  font-size: 1.1rem; 
  font-weight: 500;
  padding: 0 10px;
  text-align: center;
  display: block; 
}

/* ANİMASYONLU SAYAÇ KARTI STİLİ */
.counter-section {
    max-width: 960px;
    margin: 0 auto 35px auto;
    padding: 25px 30px;
    background: #f0f4ff; /* Çok açık soft mor arka plan */
    color: #3A3A4F; /* Koyu metin */
    box-shadow: none; /* Gölge kaldırıldı */
    border: 1px solid #e0e4f5;
    text-align: center;
}
.counter-icon { font-size: 2.5rem; color: #7B68EE; margin-right: 20px; }
.counter-label {
    font-size: 0.85rem;
    font-weight: 500;
    opacity: 1;
    color: #7B68EE;
    letter-spacing: 0.5px;
}
.counter-number {
    font-size: 3rem;
    font-weight: 700;
}

/* ANALİZ BÖLÜMLERİ */
.analysis-section {
  display: grid;
  grid-template-columns: 1fr; /* Tek sütuna düşürüldü */
  gap: 40px; /* Bölümler arası boşluk arttırıldı */
  max-width: 960px;
  margin: 0 auto;
}
.card h2 {
  color: #1f1f2a;
  font-size: 1.35rem; 
  font-weight: 700;
  padding-bottom: 0;
  margin-bottom: 15px;
}
.section-description {
    color: #6c757d;
    margin-bottom: 25px;
    font-style: normal;
    font-size: 0.9rem;
    padding-bottom: 10px;
    border-bottom: 1px dashed #7B68EE;
}

/* ÇAPRAZ TABLO STİLİ */
.crosstab-table-wrapper { overflow-x: auto; }
.crosstab-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border-radius: 10px;
  overflow: hidden; 
}

.crosstab-table thead th {
  background-color: #7B68EE; /* Düz soft mor */
  color: white;
  padding: 12px 10px;
  font-weight: 500;
}
.crosstab-table tbody td {
  padding: 10px;
  border: 1px solid #f0f0f5; 
  font-weight: 400;
}
.crosstab-table tbody td:first-child {
  background-color: #fcfcff !important;
  font-weight: 500;
  color: #3A3A4F;
}


/* GENEL PASTA GRAFİĞİ STİLİ */
.pie-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.pie-chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 20px 0;
}
.pie-chart {
  width: 220px; 
  height: 220px;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.15); 
}
.legend {
  width: 100%;
  display: flex;
  justify-content: space-around; /* Yan yana hizalandı */
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px 0;
}
.legend-item {
  display: flex;
  align-items: center;
  font-size: 1.05rem;
}
.color-box {
  width: 20px; 
  height: 20px;
  border-radius: 5px;
  margin-right: 10px;
}


/* ÇOKLU PASTA GRAFİKLERİ STİLİ */
.multiple-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 200px'den küçük olmamak şartıyla otomatik kolonlar */
    gap: 20px;
    margin-top: 20px;
}
.individual-chart-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    background-color: #fcfcff; /* Hafif bir kart içinde tut */
    border-radius: 15px;
    border: 1px solid #f0f4f7;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}
.individual-chart-wrapper h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #3A3A4F;
    margin-bottom: 15px;
    text-align: center;
}
.pie-chart-small {
    width: 120px; /* Daha küçük grafikler */
    height: 120px;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
}
.legend-small {
    font-size: 0.9rem;
    width: 100%;
}
.legend-item-small {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
}
.color-box-small {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    margin-right: 8px;
}

/* Küçük ekranlar için düzenleme */
@media (max-width: 900px) {
    .analysis-section {
        gap: 30px;
    }
}
</style>