import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent, }      from './home/home.component';
import { DomainSelectorComponent, }      from './domain-selector/domain-selector.component';
import { ExportComponent, }      from './export/export.component';
import { ConceptsComponent } from './concepts/concepts.component';
import { HighlightsComponent } from './highlights/highlights.component';


const routes: Routes = [
  { path: '', component: HomeComponent, },
  { path: 'domain-selector', component: DomainSelectorComponent, },
  { path: 'export', component: ExportComponent, },
  { path: 'concepts', component: ConceptsComponent, },
  { path: 'highlights', component: HighlightsComponent, },
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
