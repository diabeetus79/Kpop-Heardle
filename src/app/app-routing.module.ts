import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { EndScreenComponent } from './end-screen/end-screen.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: 'main', component: MainComponent, children: [
    { path: 'success', component: EndScreenComponent },
    { path: 'home', component: HomeComponent },
    { path: '**', redirectTo: 'home' },
    
  ] },
  { path: '**', redirectTo: 'main/home' },

  // {path: 'callback', component: CallbackComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
