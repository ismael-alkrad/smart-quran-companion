<script setup lang="ts">
import { HomeDayOverview } from '@/modules/home'
</script>

<template>
  <HomeDayOverview
    subtitle="هذه خطتك القرآنية لليوم"
    wird-state="active"
    hifz-state="pending"
    murajaah-state="pending"
    progress-section-title="التقدم"
    progress-title="تقدمك القرآني"
    progress-meta="تابع خطتك اليومية بثبات"
    attention-section-title="يحتاج انتباهًا"
    weak-spot-title="انتقال يحتاج تثبيت"
    weak-spot-metric="أولوية مراجعة"
    weak-spot-location="من آخر جلسة مراجعة"
  />
</template>
