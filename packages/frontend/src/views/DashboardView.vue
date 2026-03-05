<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1>Dashboard ✨</h1>
    </div>

    <!-- Loading -->
    <div v-if="dashboardStore.loading" class="state-message">
      Loading dashboard...
    </div>

    <template v-else-if="dashboardStore.stats">
      <!-- Stat cards -->
      <div class="stat-grid">
        <StatCard
          icon="📋"
          :value="dashboardStore.stats.openIssues"
          label="Open Issues"
        />
        <StatCard
          icon="✅"
          :value="dashboardStore.stats.doneThisWeek"
          label="Done This Week"
          trend="up"
          :trend-label="`of ${dashboardStore.stats.createdThisWeek} created`"
        />
        <StatCard
          icon="🌸"
          :value="dashboardStore.stats.totalProjects"
          label="Active Projects"
        />
        <StatCard
          icon="‼"
          :value="dashboardStore.stats.criticalIssues"
          label="Critical Bugs"
          :trend="dashboardStore.stats.criticalIssues > 0 ? 'down' : null"
          :trend-label="dashboardStore.stats.criticalIssues > 0 ? 'needs attention' : ''"
        />
      </div>

      <div class="dashboard__body">
        <!-- Left: Activity feed -->
        <div class="dashboard__main">
          <div class="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div class="activity-card">
            <ActivityFeed
              :feed="dashboardStore.activity"
              :show-project="true"
            />
          </div>
        </div>

        <!-- Right: Project health -->
        <div class="dashboard__sidebar">
          <div class="section-header">
            <h2>Project Health</h2>
          </div>
          <div class="health-card">
            <div
              v-if="dashboardStore.stats.projectHealth?.length === 0"
              class="health-empty"
            >
              <span>🌱</span>
              <p>No projects yet — create one to get started!</p>
            </div>
            <div v-else class="health-list">
              <ProjectHealthBar
                v-for="project in dashboardStore.stats.projectHealth"
                :key="project.id"
                :project="project"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard.js'
import { useUIStore } from '../stores/ui.js'
import { useIssuesStore } from '../stores/issues.js'
import StatCard from '../components/StatCard.vue'
import ActivityFeed from '../components/ActivityFeed.vue'
import ProjectHealthBar from '../components/ProjectHealthBar.vue'

const dashboardStore = useDashboardStore()
const uiStore        = useUIStore()
const issuesStore    = useIssuesStore()

watch(
  () => issuesStore.issues.length,
  () => {
    dashboardStore.fetchAll()
  }
)

onMounted(() => {
  dashboardStore.fetchAll()
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.dashboard {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-6;

    h1 {
      font-family: $font-display;
      font-size: 2rem;
      color: $gray-800;
    }
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: $space-6;
    margin-top: $space-6;
    align-items: flex-start;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
  margin-bottom: $space-2;
}

.section-header {
  margin-bottom: $space-4;

  h2 {
    font-family: $font-display;
    font-size: 1.2rem;
    color: $gray-800;
  }
}

.activity-card,
.health-card {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  padding: $space-5;
}

.health-list {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.health-empty {
  text-align: center;
  padding: $space-6;
  color: $gray-400;
  font-size: 0.85rem;

  span { font-size: 2rem; display: block; margin-bottom: $space-3; }
}

.state-message {
  text-align: center;
  padding: $space-12;
  color: $gray-400;
}

.btn {
  padding: 9px $space-5;
  border-radius: $radius-pill;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: $font-body;

  &--primary {
    background: $pink-500;
    color: $white;
    &:hover { background: $pink-400; }
  }
}
</style>