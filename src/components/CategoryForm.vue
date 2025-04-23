<template>
  <div class="category-form">
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="name">{{ languageStore.t('categoryForm.name') }}</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          :placeholder="languageStore.t('categoryForm.namePlaceholder')"
          required
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="icon">{{ languageStore.t('categoryForm.icon') }}</label>
        <input
          type="text"
          id="icon"
          v-model="form.icon"
          :placeholder="languageStore.t('categoryForm.iconPlaceholder')"
          class="form-control"
        />
        <small class="form-text">{{ languageStore.t('categoryForm.iconHelp') }}</small>
      </div>
      
      <div class="form-group">
        <label for="color">{{ languageStore.t('categoryForm.color') }}</label>
        <input
          type="color"
          id="color"
          v-model="form.color"
          class="form-control color-picker"
        />
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          {{ languageStore.t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
          {{ isEdit ? languageStore.t('common.update') : languageStore.t('common.create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useLanguageStore } from '../stores/languageStore';

const languageStore = useLanguageStore();

const props = defineProps({
  category: {
    type: Object,
    default: () => ({
      id: '',
      name: '',
      icon: '📁',
      color: '#4a6cf7'
    })
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  name: '',
  icon: '📁',
  color: '#4a6cf7'
});

onMounted(() => {
  if (props.category) {
    form.name = props.category.name || '';
    form.icon = props.category.icon || '📁';
    form.color = props.category.color || '#4a6cf7';
  }
});

const onSubmit = () => {
  const categoryData = {
    ...props.category,
    name: form.name.trim(),
    icon: form.icon.trim() || '📁',
    color: form.color
  };
  
  emit('submit', categoryData);
};
</script>

<style scoped>
.category-form {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
}

.form-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.color-picker {
  height: 40px;
  padding: 0.25rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--secondary-bg);
  color: var(--text-color);
}

.btn-secondary:hover {
  background-color: var(--border-color);
}
</style> 