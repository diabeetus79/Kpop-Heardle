import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { lastValueFrom } from 'rxjs';
import { PlayerOptions } from 'yt-player-angular';
import { END_SCREEN_TEXT, EXPIRY_TIME, IS_COMPLETE, PASSED_ROUND, SONG_DETAILS, TALLY_SAVE } from '../constants';
import { SongSearchInfo } from '../search-component/search-component.component';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-end-screen',
  templateUrl: './end-screen.component.html',
  styleUrls: ['./end-screen.component.scss']
})
export class EndScreenComponent implements OnInit {

  constructor(private router: Router, private appService: AppService, @Inject(LOCAL_STORAGE) private storage: StorageService,) { }
  newPlayerOptions: PlayerOptions = {
    width: 80,
  }
  //REMOVE HARDCODED STUFF BELOW AFTER IMPLEMENTING STUFF
  resultString ='';
  resultText = '';
  songDetails?: SongSearchInfo ;
  async ngOnInit(): Promise<void> {
    this.checkStatus();
    //if status check is right
    // get song details off of storage
    this.songDetails = this.storage.get(SONG_DETAILS);
    if(this.storage.get(IS_COMPLETE) && !this.songDetails){
      const deets = await lastValueFrom(this.appService.getAnswer());
      this.songDetails = deets.answerInfo;
    }
     this.resultString = this.generateBoxStatusString();
     this.resultText = END_SCREEN_TEXT[this.storage.get(PASSED_ROUND)];
     
    //  this.tallySave = this.storage.get(TALLY_SAVE);

     //CONVERT EXPIRY TO COUNTDOWN AND ANSWERS TO RESULTS
     
  }

  checkStatus(){
    const existingExpiry: Date = this.storage.get(EXPIRY_TIME);
    // if expired OR no expiry set OR not complete
    // REDIRECT TO MAIN/HOME
    if((existingExpiry && existingExpiry > new Date()) || this.storage.get(IS_COMPLETE) === false || !existingExpiry){
      // set current song details back to null to be reset when answer is gotten
      this.storage.set(SONG_DETAILS, null);
      this.router.navigateByUrl('main/home');
    } 

  }
  generateBoxStatusString(){
    const roundNumPassed = this.storage.get(PASSED_ROUND);
    let output = '🔊';
    for (let i: number = 0; i < roundNumPassed; i++) {
      output += '⬛';
    }
    if(roundNumPassed < 6){
      output += '🟩';
    } else {
      output += '❌';
    }
    for (let i:number = output.length; i < 9; i++) {
      output += '⬛';
    }
    return output;
  }

}
