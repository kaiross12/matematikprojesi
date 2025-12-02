<template>
  <footer class="results-footer">
    <div class="footer-content">
      <p class="project-info">
        Video Oyun Oynama Süresi ile Problem Çözme Yeteneği Analizi
      </p>
      
      <div class="producer-info">
        <p>Yapımcılar:</p>
        <ul>
          <li><strong>Yaser Durubi</strong> Yazılım ve Uygulama</li>
          <li><strong>Asrın Muaz Çeliktenyıldız</strong> Fikir ve değerlendirme</li>
          <li><strong>Ozan Bayram</strong> Araştırma ve Veri</li>
        </ul>
      </div>

      <p class="copyright">
        © {{ currentYear }} | Tüm Hakları Saklıdır.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
/*
 * Footer.vue Stil Dosyası
 * Genel Results.vue görünümüne uyumludur.
 */

.results-footer {
  /* Ana içerik alanının dışına, sayfa genişliğinde uzanması için */
  width: 100%;
  background-color: #ffffff; /* Temiz beyaz arka plan */
  border-top: 1px solid #e0e4f5; /* Üst kısımda hafif bir çizgi */
  padding: 40px 0;
  margin-top: 50px; /* Diğer kartlarla arasında boşluk */
  color: #3A3A4F; /* Koyu metin rengi */
}

.footer-content {
  /* Results.vue'daki .results-container ile aynı maksimum genişlik */
  max-width: 960px; /* Kartların genişliğine uyum sağlaması için (Results.vue'daki 1000px'den biraz daha dar seçildi) */
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.project-info {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7B68EE; /* Ana mor renk */
  margin-bottom: 20px;
}

.producer-info {
  margin-bottom: 25px;
  font-size: 0.95rem;
  color: #6c757d; /* Açık gri metin */
}

.producer-info p {
    font-weight: 500;
    margin-bottom: 8px;
    color: #3A3A4F;
}

.producer-info ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 20px; /* Yapımcılar arası boşluk */
  flex-wrap: wrap;
}

.producer-info li {
  margin: 5px 0;
  display: inline-block; /* Yan yana durması için */
}

.producer-info strong {
    font-weight: 600;
    color: #3A3A4F;
}

.copyright {
  font-size: 0.85rem;
  color: #a0a0a0;
  margin-top: 20px;
  border-top: 1px dashed #f0f0f5;
  padding-top: 20px;
}
</style>