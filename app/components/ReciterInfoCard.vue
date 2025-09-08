<template>
  <div class="reciter-info-card">
    <div class="modern-card reciter-card">
      <div class="reciter-info-compact">
        <!-- Arabic Reciter -->
        <div class="info-row">
          <div class="info-icon reciter-icon-bg">
            <UIcon name="i-heroicons-user" class="icon-small" />
          </div>
          <div class="info-content">
            <p class="text-caption status-label">กอรีย์</p>
            <p class="reciter-name">{{ reciterName }}</p>
          </div>
        </div>

        <!-- Thai Translator -->
        <div class="info-row">
          <div class="info-icon translator-icon-bg">
            <UIcon name="i-heroicons-language" class="icon-small" />
          </div>
          <div class="info-content">
            <p class="text-caption status-label">ภาษาไทยโดย</p>
            <p class="reciter-name">{{ translatorName }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  reciterName?: string;
  translatorName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  reciterName: "Saad al-Ghamdi",
  translatorName: "อ.บรรจง โซ๊ะมณี",
});
</script>

<style scoped>
.reciter-info-card {
  width: 100%;
}

.reciter-card {
  padding: 1rem;
}

.reciter-info-compact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-small {
  width: 1rem;
  height: 1rem;
}

.reciter-icon-bg {
  background: var(--accent-primary);
  color: white;
}

.translator-icon-bg {
  background: #f59e0b;
  color: white;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.status-label {
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 0.125rem 0;
  font-size: 0.75rem;
}

.reciter-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.2;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .reciter-card {
    padding: 0.875rem;
  }

  .reciter-name {
    font-size: 0.875rem;
  }

  .info-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .icon-small {
    width: 0.875rem;
    height: 0.875rem;
  }
}

@media (min-width: 768px) {
  .reciter-card {
    padding: 1.25rem;
  }

  .reciter-name {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .reciter-card {
    padding: 1.5rem;
  }
}
</style>
