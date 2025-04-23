<script setup lang="ts">
import { computed } from 'vue';
import { useLanguageStore, type Language } from '../stores/languageStore';

const languageStore = useLanguageStore();

const currentLanguage = computed(() => languageStore.currentLanguage);

const languages = [
  { code: 'cn', name: languageStore.t('language.cn') },
  { code: 'en', name: languageStore.t('language.en') }
];

const switchLanguage = (lang: Language) => {
  languageStore.setLanguage(lang);
};
</script>

<template>
  <div class="language-toggle">
    <h4>{{ languageStore.t('language.title') }}</h4>
    
    <div class="language-options">
      <button
        v-for="lang in languages"
        :key="lang.code"
        class="language-button"
        :class="{ active: currentLanguage === lang.code }"
        @click="switchLanguage(lang.code as Language)"
      >
        {{ lang.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.language-toggle {
  padding: 1rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

h4 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.language-options {
  display: flex;
  gap: 0.5rem;
}

.language-button {
  padding: 0.5rem 1rem;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.language-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.language-button:hover:not(.active) {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}
</style> 