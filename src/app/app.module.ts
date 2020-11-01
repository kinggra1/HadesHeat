import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PactListComponent } from './pact-list/pact-list.component';


@NgModule({
  declarations: [
    AppComponent,
    PactListComponent,
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    AppRoutingModule,
    RouterModule.forRoot([
      { path: 'pact', component: PactListComponent },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
