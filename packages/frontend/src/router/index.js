import { createRouter, createWebHashHistory } from 'vue-router'

// empty placeholder components for now
import DashboardView     from '../views/DashboardView.vue'
import ProjectsView      from '../views/ProjectsView.vue'
import ProjectBoardView  from '../views/ProjectBoardView.vue'
import ProjectIssuesView from '../views/ProjectIssuesView.vue'
import IssueDetailView   from '../views/IssueDetailView.vue'
import AllIssuesView     from '../views/AllIssuesView.vue'
import NotFoundView      from '../views/NotFoundView.vue'
import ProjectSettingsView from '../views/ProjectSettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
  },
  {
    path: '/projects/:projectId/board',
    name: 'project-board',
    component: ProjectBoardView,
  },
  {
    path: '/projects/:projectId/issues',
    name: 'project-issues',
    component: ProjectIssuesView,
  },
  {
    path: '/issues',
    name: 'all-issues',
    component: AllIssuesView,
  },
  {
    // Matches by full key, e.g. /issues/SPARK-42
    path: '/issues/:key',
    name: 'issue-detail',
    component: IssueDetailView,
  },
  {
    path: '/projects/:projectId/settings',
    name: 'project-settings',
    component: ProjectSettingsView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router