import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () => import('./features/overview/overview.component').then((m) => m.OverviewComponent),
        title: 'Overview · Geospatial Analysis',
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs-list/jobs-list.component').then((m) => m.JobsListComponent),
        title: 'Jobs · Geospatial Analysis',
      },
      {
        path: 'jobs/new',
        loadComponent: () => import('./features/job-builder/job-builder.component').then((m) => m.JobBuilderComponent),
        title: 'New Job · Geospatial Analysis',
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () => import('./features/job-builder/job-builder.component').then((m) => m.JobBuilderComponent),
        title: 'Edit Job · Geospatial Analysis',
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./features/job-detail/job-detail.component').then((m) => m.JobDetailComponent),
        title: 'Job Detail · Geospatial Analysis',
      },
      {
        path: 'queries',
        loadComponent: () => import('./features/query-list/query-list.component').then((m) => m.QueryListComponent),
        title: 'Queries · Geospatial Analysis',
      },
      {
        path: 'catalog',
        loadComponent: () => import('./features/catalog/catalog.component').then((m) => m.CatalogComponent),
        title: 'Dataset Catalog · Geospatial Analysis',
      },
    ],
  },
  { path: '**', redirectTo: 'overview' },
];
