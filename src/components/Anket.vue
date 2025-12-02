<template>
  <div class="survey-container">
    
    <div class="stepper">
      <div 
        v-for="(section, index) in sections" 
        :key="index" 
        :class="['step-indicator', { 'active': currentStep === index, 'completed': currentStep > index }]"
      >
        Bölüm {{ index + 1 }}
      </div>
    </div>

    <div v-if="!surveyCompleted" class="survey-card">
      <h2 class="section-title">
        {{ sections[currentStep].title }}
      </h2>
      
      <div class="questions-wrapper">
        <div 
          v-for="question in sections[currentStep].questions" 
          :key="question.id" 
          class="question-block"
        >
          <p class="question-text">{{ question.question }}</p>
          
          <template v-if="question.type === 'text'">
            <input 
              type="text" 
              v-model="answers[question.id]" 
              :placeholder="question.placeholder"
              class="text-input"
            />
          </template>

          <template v-else-if="question.type === 'radio'">
            <div class="options-group">
              <label 
                v-for="(option, index) in question.options" 
                :key="index" 
                :class="['option-label', { 'selected': answers[question.id] === option.value }]"
              >
                <input 
                  type="radio" 
                  :name="question.id" 
                  :value="option.value" 
                  v-model="answers[question.id]" 
                  class="option-radio"
                >
                {{ option.text }}
              </label>
            </div>
          </template>

          <template v-else-if="question.type === 'checkbox'">
            <div class="options-group checkbox-group">
              <label 
                v-for="(option, index) in question.options" 
                :key="index" 
                :class="['option-label', 'checkbox-label', { 'selected': answers[question.id].includes(option.value) }]"
              >
                <input 
                  type="checkbox" 
                  :value="option.value" 
                  v-model="answers[question.id]" 
                  class="option-checkbox"
                >
                {{ option.text }}
              </label>

              <div v-if="question.hasOther" class="other-input-container">
                <span class="other-label">Diğer:</span>
                <input 
                  type="text" 
                  v-model="question.otherValue" 
                  placeholder="Lütfen belirtiniz..." 
                  class="text-input other-input"
                  @input="question.otherValue.trim() !== '' ? answers[question.id].push('OTHER_SPECIFIED') : answers[question.id] = answers[question.id].filter(v => v !== 'OTHER_SPECIFIED')"
                />
              </div>
            </div>
          </template>

        </div>
      </div>
      
      <div class="navigation-buttons">
        <button 
          @click="prevStep" 
          :disabled="currentStep === 0" 
          class="nav-button prev"
        >
          <i class="fas fa-arrow-left"></i> Geri
        </button>
        
        <button 
          v-if="currentStep < sections.length - 1" 
          @click="nextStep" 
          class="nav-button next"
        >
          İleri <i class="fas fa-arrow-right"></i>
        </button>
        
        <button 
          v-else 
          @click="submitSurvey" 
          class="nav-button submit"
        >
          Anketi Bitir
        </button>
      </div>
    </div>
    
    <div v-else class="completion-message">
      🎉 Anketiniz için teşekkürler! Sonuçlar sayfasına yönlendiriliyorsunuz...
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

// BU SATIRLARI EKLE (Firebase importları)
import { resultsCollection } from '../firebase';  // veya '../firebase' (dosya konumuna göre)
import { addDoc, serverTimestamp } from 'firebase/firestore';

const router = useRouter(); // Router örneği oluşturuldu

// ------------------------------------
// 1. Veri Tanımlamaları
// ------------------------------------

const currentStep = ref(0);
const answers = reactive({
    age: null,
    gender: null,
    hours: null,
    genres: [],
    focus: null,
    dailyProblem: null,
    puzzleFrequency: null,
    gamesHelp: null
});

const surveyCompleted = ref(false);

// Anket bölümleri, her bölüm bir aşamadır.
const sections = [
    { 
        title: "Bölüm 1: Demografik Bilgiler",
        questions: [
            { id: 'age', type: 'text', question: "Yaşınız:", placeholder: "Yaşınızı giriniz...", },
            { id: 'gender', type: 'radio', question: "Cinsiyet:", options: [ { text: "Kadın", value: "female" }, { text: "Erkek", value: "male" }, { text: "Diğer / Belirtmek istemiyorum", value: "other" }, ] }
        ]
    },
    { 
        title: "Bölüm 2: Video Oyun Alışkanlıkları",
        questions: [
            { id: 'hours', type: 'radio', question: "Haftada ortalama kaç saat video oyunu oynarsınız?", options: [ { text: "0 saat", value: "0" }, { text: "1–3 saat", value: "1-3" }, { text: "4–6 saat", value: "4-6" }, { text: "7–10 saat", value: "7-10" }, { text: "10+ saat", value: "10+" }, ] },
            { id: 'genres', type: 'checkbox', question: "Genellikle hangi tür oyunları oynarsınız? (Birden fazla seçenek işaretleyebilirsiniz)", options: [ { text: "Strateji / Taktik oyunları", value: "strategy" }, { text: "Bulmaca / Zeka oyunları", value: "puzzle" }, { text: "Aksiyon / Macera", value: "action" }, { text: "Spor / Yarış", value: "sport" }, ], hasOther: true, otherValue: '', },
            { id: 'focus', type: 'radio', question: "Video oyun oynarken kendinizi ne kadar odaklanmış hissediyorsunuz?", options: [ { text: "Hiç odaklanmam", value: "v_low" }, { text: "Az odaklanırım", value: "low" }, { text: "Orta seviyede odaklanırım", value: "medium" }, { text: "Çok odaklanırım", value: "high" }, { text: "Tamamen odaklanırım", value: "v_high" }, ] }
        ]
    },
    { 
        title: "Bölüm 3: Problem Çözme Yeteneği",
        questions: [
            { id: 'dailyProblem', type: 'radio', question: "Günlük hayatta karşılaştığınız problemleri çözme konusunda kendinizi nasıl değerlendirirsiniz?", options: [ { text: "Çok zayıf", value: "v_poor" }, { text: "Zayıf", value: "poor" }, { text: "Orta", value: "medium" }, { text: "İyi", value: "good" }, { text: "Çok iyi", value: "v_good" }, ] },
            { id: 'puzzleFrequency', type: 'radio', question: "Mantık ve problem çözme becerisi gerektiren oyunlar veya bulmacalar çözme sıklığınız:", options: [ { text: "Hiç çözmem", value: "never" }, { text: "Nadiren", value: "rarely" }, { text: "Bazen", value: "sometimes" }, { text: "Sık sık", value: "often" }, { text: "Her zaman", value: "always" }, ] },
            { id: 'gamesHelp', type: 'radio', question: "Problem çözme yeteneğinizi geliştirmek için video oyunlarının yardımcı olduğunu düşünüyor musunuz?", options: [ { text: "Kesinlikle hayır", value: "v_no" }, { text: "Hayır", value: "no" }, { text: "Kararsızım", value: "undecided" }, { text: "Evet", value: "yes" }, { text: "Kesinlikle evet", value: "v_yes" }, ] }
        ]
    }
];

// ------------------------------------
// 2. Metotlar
// ------------------------------------

const isStepValid = () => {
    const currentSection = sections[currentStep.value];
    return currentSection.questions.every(q => {
        const answer = answers[q.id];
        if (q.type === 'text') {
            return answer && String(answer).trim() !== '';
        }
        if (q.type === 'radio') {
            return answer !== null;
        }
        if (q.type === 'checkbox') {
            const genresQuestion = currentSection.questions.find(item => item.id === 'genres');
            const hasSelection = Array.isArray(answer) && answer.filter(v => v !== 'OTHER_SPECIFIED').length > 0;
            const hasOtherText = genresQuestion && genresQuestion.otherValue.trim() !== '';

            if (q.id === 'genres') {
                return hasSelection || hasOtherText;
            }
            return true;
        }
        return true;
    });
};

const nextStep = () => {
    if (currentStep.value < sections.length - 1 && isStepValid()) {
        currentStep.value++;
    } else if (!isStepValid()) {
        alert("Lütfen bu bölümdeki tüm zorunlu soruları yanıtlayın!");
    }
};

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};

const submitSurvey = async () => {
  if (!isStepValid()) {
    alert("Lütfen tüm soruları doldurun!");
    return;
  }

  // Diğer alanı temizle ve ekle
  const genresQuestion = sections[1].questions.find(q => q.id === 'genres');
  answers.genres = answers.genres.filter(v => v !== 'OTHER_SPECIFIED');
  if (genresQuestion.otherValue?.trim()) {
    answers.genres.push(`Diğer: ${genresQuestion.otherValue.trim()}`);
  }

  const submission = {
    ...answers,
    submittedAt: serverTimestamp()
  };

  try {
    await addDoc(resultsCollection, submission);
    console.log("Anket Firebase'e kaydedildi!");

    // localStorage da tut (opsiyonel, geriye uyumluluk için)
    localStorage.setItem('surveyAnswers', JSON.stringify(answers));

    router.push('/sonuclar');
  } catch (error) {
    console.error("Kaydetme hatası:", error);
    alert("Bir hata oluştu, lütfen tekrar deneyin.");
  }
};
</script>

<style scoped>
/* Genel Yapı ve Arka Plan */
.survey-container {
  max-width: 700px; /* Daha dar bir kart görünümü için */
  margin: 40px auto;
  padding: 0; /* Ana konteynere padding kaldırdık */
  font-family: 'Poppins', sans-serif;
  background-color: #ffffffff; /* Çok açık gri arka plan */
}
.survey-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 25px; /* Daha yumuşak köşeler */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); /* Yumuşak ve hafif gölge */
  transition: all 0.5s ease;
  border: 1px solid #f0f0f5; /* Hafif sınır */
}

/* Stepper'ı minimalize edip gizli tuttuk, sadece bölüm başlığı görünecek */
.stepper {
  display: none; /* Fotoğraftaki minimalist görünüme uygun olarak stepper'ı gizledik */
}

.section-title {
  color: #5d5d81; /* Koyu, hafif morumsu metin */
  margin-bottom: 30px;
  font-size: 1.5rem; /* Fotoğraftaki gibi daha küçük ve net bir başlık */
  font-weight: 600;
  padding-bottom: 0;
  border-bottom: none;
  text-align: left;
}

.questions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Question Block Vurgu Çizgisini Kaldır */
.question-block {
  padding: 0;
  border-left: none; /* Vurgu çizgisini kaldırdık */
  padding-left: 0;
  transition: none;
}
.question-block:hover {
    background-color: transparent; 
    transform: none; 
    border-left-width: 0;
}

.question-text {
  color: #323238ff;
  font-size: 1.35rem; /* Daha büyük soru metni */
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.4;
}

/* INPUT TİPLERİ VE SEÇENEKLER - FOTOĞRAFIN ANA ODAĞI */

/* Tek Satırlık Metin Girişi */
.text-input {
  width: 100%;
  padding: 18px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 15px; /* Yumuşak köşe */
  font-size: 1.1rem;
  box-sizing: border-box;
  background-color: #fcfcfc;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.text-input:focus {
  border-color: #9370DB; /* Orta Mor */
  box-shadow: 0 0 0 4px rgba(147, 112, 219, 0.15);
  outline: none;
  background: #ffffff;
}

/* Radyo/Checkbox Grupları - Fotoğraftaki Kart Görünümü */
.options-group {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Seçenekler arası daha fazla boşluk */
}

.option-label {
  display: flex;
  align-items: center;
  padding: 20px 25px;
  border: none; /* Çerçeveyi kaldırdık */
  border-radius: 20px; /* Fotoğraftaki gibi oval/hap görünümü */
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f7f7f9; /* Hafif gri arka plan */
  font-weight: 500;
  font-size: 1.1rem;
  position: relative;
  color: #33334f;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03); /* Çok hafif gölge */
}

.option-label:hover {
  background-color: #eeeeff; /* Çok açık mor */
}

/* SEÇİLİ ÖĞE: Fotoğraftaki mor arka planı taklit et */
.option-label.selected {
  background-color: #9370DB; /* Orta Mor */
  color: white; /* Beyaz metin */
  box-shadow: 0 8px 20px rgba(147, 112, 219, 0.3); 
  border-color: #9370DB;
  font-weight: 600;
}

/* Radyo/Checkbox Görünümü (Görünür kutucukları kaldırdık) */
.option-radio, .option-checkbox {
  margin-right: 15px;
  appearance: none; 
  width: 20px;
  height: 20px;
  border: none; /* Kendi radyo/checkbox stilini gizledik */
  background: none;
  display: none; /* Tamamen gizle */
}

/* Diğer Input Stilleri */
.other-input-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding: 15px;
  border: 1px dashed #d4b4e5; /* Morumsu çizgili sınır */
  border-radius: 15px;
  background-color: #fcfcff;
}
.other-label {
    font-weight: 600;
    color: #9370DB; 
    min-width: 60px;
}
.other-input {
    flex-grow: 1;
    border-radius: 10px;
    padding: 12px;
}

/* NAVİGASYON BUTONLARI */
.navigation-buttons {
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
  border-top: none; /* Çizgiyi kaldırdık */
  padding-top: 0;
}

.nav-button {
  padding: 18px 40px;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem; 
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  text-transform: none; /* Baş harfi büyük bırak */
  letter-spacing: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); 
  min-width: 150px;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.nav-button.prev {
  background-color: #e0e0e9; /* Açık gri morumsu */
  color: #5d5d81;
}
.nav-button.prev:not(:disabled):hover {
    background-color: #d0d0d9;
    transform: translateY(-2px); 
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); 
}

/* Fotoğraftaki ana eylem rengi için mor gradient */
.nav-button.next, .nav-button.submit {
  background: linear-gradient(90deg, #9370DB, #7B68EE); /* Mor Gradient */
  color: white;
}
.nav-button.next:not(:disabled):hover, .nav-button.submit:not(:disabled):hover {
    background: linear-gradient(90deg, #7B68EE, #6A5ACD);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(147, 112, 219, 0.4); 
}

/* TAMAMLANMA MESAJI */
.completion-message {
  margin-top: 20px;
  padding: 50px; 
  background: linear-gradient(135deg, #e7e0ff, #d4c8ff); /* Çok açık mor gradient */
  color: #5d5d81;
  border: 1px solid #c8b9ff;
  border-radius: 20px;
  text-align: center;
  font-size: 1.3rem; 
  font-weight: 600;
  box-shadow: 0 8px 15px rgba(147, 112, 219, 0.2);
}
.completion-message pre {
    text-align: left;
    background-color: #e3e0f0;
    padding: 20px;
    border-radius: 10px;
    margin-top: 25px;
    white-space: pre-wrap;
    word-break: break-all;
    border: 1px dashed #d1cbe5;
    font-size: 0.9rem;
}
</style>