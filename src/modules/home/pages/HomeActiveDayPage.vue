<script setup lang="ts">
import { HomeDayOverview } from '@/modules/home'
</script>

<template>
  <HomeDayOverview
    subtitle="أكمل ما بدأت اليوم بهدوء"
    wird-state="done"
    hifz-state="active"
    murajaah-state="pending"
    progress-section-title="التقدم الحالي"
    progress-title="تقدم اليوم"
    progress-meta="أنجزت جزءًا من خطتك، أكمل على نفس الوتيرة"
    attention-section-title="مراجعة ذكية"
    weak-spot-title="انتقال يحتاج مراجعة"
    weak-spot-metric="أولوية متوسطة"
    weak-spot-location="من آخر جلسة تسميع"
  />
</template>
