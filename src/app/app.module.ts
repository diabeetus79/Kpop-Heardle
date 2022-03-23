import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CallbackComponent } from './callback/callback.component';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import { HomeComponent } from './home/home.component';
import { YtPlayerAngularModule } from 'yt-player-angular';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { AppService } from './services/app.service';
import { SearchComponentComponent } from './search-component/search-component.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EndScreenComponent } from './end-screen/end-screen.component';
import { AnimatedEqualiserIconComponent } from './animated-equaliser-icon/animated-equaliser-icon.component';
import { MainComponent } from './main/main.component';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    HomeComponent,
    SearchComponentComponent,
    EndScreenComponent,
    AnimatedEqualiserIconComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressBarModule,
    YtPlayerAngularModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
  ],
  providers: [ AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
