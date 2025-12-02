<script setup>
// Artık burada HelloWorld'a ihtiyacımız yok, çünkü rotalarla yönetilecek.
</script>

<template>
  <div id="app-layout">
    <header>
      <h1>Teknoloji Anketi Uygulaması</h1>
      </header>

    <main>
      <router-view></router-view>
    </main>
    
  </div>
</template>

<style scoped>
/* Genel uygulama düzeni stillerini burada tutabilirsiniz */
#app-layout {
  font-family: 'Poppins', sans-serif, Avenir, Helvetica, Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #3A3A4F;
  margin-top: 40px; /* Üst boşluk geri eklendi */
}

/* 🧱 KART ÜZERİNDE ORTALANMIŞ BAŞLIK STİLİ */
header {
  margin: 0 auto 15px auto; /* Kartın üstüne yakın, alt boşluk azaldı */
  padding: 15px 25px; /* Başlık metni için içeriden boşluk */
  
  /* Kart Görünümü için */
  max-width: 660px; /* Anket kartı ile aynı genişlik */
  width: 90%; /* Küçük ekranlarda uyum için */
  border-radius: 15px;
  
  /* Gradien Arka Plan - Tam ekran yerine sadece bu kart için */
  background: linear-gradient(90deg, #A080D0, #7B68EE); 
  box-shadow: 0 5px 20px rgba(123, 104, 238, 0.3);
  
  /* Konumlandırma */
  text-align: left; /* Metni sola yasla (Fotoğrafa daha yakın) */
}

h1 {
  /* Başlık stilini gradyan arka plan üzerinde görünmesi için beyaz yaptık */
  color: white; 
  font-size: 1.1rem; /* Başlığı daha küçük yaptık */
  font-weight: 600;
  margin: 0;
  padding: 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

main {
    padding-top: 0;
    max-width: 700px; 
    margin: 0 auto;
}
</style>