<script setup lang="ts">
import { HomeDayOverview } from '@/modules/home'
</script>

<template>
  <HomeDayOverview
    subtitle="أنجزت خطتك القرآنية لهذا اليوم"
    wird-state="done"
    hifz-state="done"
    murajaah-state="done"
    progress-section-title="إغلاق اليوم"
    progress-title="خطة اليوم مكتملة"
    progress-meta="تم إنجاز الورد والحفظ والمراجعة"
    reading-section-title="آخر موضع"
    :show-attention="false"
  />
</template>
