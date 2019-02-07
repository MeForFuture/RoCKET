import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DomainSelectorComponent } from './domain-selector/domain-selector.component';
import { ExportComponent } from './export/export.component';
import { ConceptsComponent } from './concepts/concepts.component';
import { HighlightsComponent } from './highlights/highlights.component';
import { HttpClientModule } from '@angular/common/http';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatNativeDateModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import 'hammerjs';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DomainSelectorComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    ExportComponent,
    ConceptsComponent,
    HighlightsComponent,
  ],
  imports: [
        FormsModule,
        HttpClientModule,
        NgbModule.forRoot(),
        BrowserModule,
        AppRoutingModule,
      BrowserModule,
      BrowserAnimationsModule,
      FormsModule,
      HttpClientModule,
      MatNativeDateModule,
      ReactiveFormsModule,
      MatSlideToggleModule,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
