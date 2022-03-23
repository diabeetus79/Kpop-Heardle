import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, interval, lastValueFrom, Observable, Subject, takeUntil, tap } from 'rxjs';
import { StateChange, StateChangeType, YtPlayerService } from 'yt-player-angular';
import { SongSearchInfo } from '../search-component/search-component.component';
import { AppService } from '../services/app.service';

import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { ANSWERSAVE, EXPIRY_TIME, IS_COMPLETE, PASSED_ROUND, ROUND_COUNTER, SONG_DETAILS, TALLY_SAVE } from '../constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  //the level the user is on --> between 0 - 5 for 6 rounds total
  roundNum = 0;
  timePeriod = [1, 2, 4, 7, 11, 16];
  answers = ['', '', '', '', '', ''];
  playerState = new Subject<string>();
  destroyed$ = new Subject<void>();
  loadingValue = 0;
  timeIncrement = 0;
  dailySongId = '';
  currentAnswer: SongSearchInfo | null = null;


  isPlaying = false;
  constructor(private ytPlayerService: YtPlayerService,
    private appService: AppService,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private router: Router) {
    this.playerState.pipe(
      tap(state => {
        console.log(state);
        if (state === "Started") {
          this.isPlaying = true;
          setTimeout(() => {
            this.ytPlayerService.stop();
            this.isPlaying = false;

          }, this.timePeriod[this.roundNum] * 1000);
        }
        // if(progressTime > this.timePeriod[this.roundNum]){
        //   this.ytPlayerService.stop();
        // }
      }
      ),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  async ngOnInit(): Promise<void> {
    const dailySong = await lastValueFrom(this.appService.getDailySongId());
    this.dailySongId = dailySong.videoId;
    this.checkStatus();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  onButtonClick() {
    if (this.dailySongId.length > 0) {
      this.ytPlayerService.play();
    }
    this.timeIncrement = (1 / this.timePeriod[this.roundNum]) * 100;

  }
  onStateChange(stateChange: StateChange): void {
    // console.log(`Type: ${StateChangeType[stateChange.type]} || Payload: ${stateChange.payload}`);
    this.playerState.next(StateChangeType[stateChange.type]);
  }

  updatedSelectedAnswer(song: SongSearchInfo) {
    console.log(song);
    this.currentAnswer = song;
  }

  currentIncrement(): string {
    if (this.roundNum < 5) {
      return `( +${this.timePeriod[this.roundNum + 1] - this.timePeriod[this.roundNum]})`;
    } else {
      return ''
    }
  }
  onSkip() {
    if (this.roundNum === 5) {
      this.router.navigateByUrl('main/success');
      this.storage.set(IS_COMPLETE, true);
      this.storage.set(PASSED_ROUND, this.roundNum + 1)
    } else {
      this.answers[this.roundNum] = 'SKIPPED';
      this.roundNum += 1;
      
    }
    this.storage.set(ANSWERSAVE, this.answers);
    this.storage.set(ROUND_COUNTER, this.roundNum);
  }
  async onSubmit() {
    const answerDTO = await lastValueFrom(this.appService.checkAnswer(this.currentAnswer?.youtubeId as string));
    if (answerDTO.isAnswer) {
      // navigate to end screen
      this.storage.set(SONG_DETAILS, answerDTO.answerInfo);
      this.storage.set(IS_COMPLETE, true);
      this.updateTally(true);
      this.router.navigateByUrl('main/success');

    } else if (!answerDTO.isAnswer && this.roundNum < 5) {
      // show answer on list
      this.answers[this.roundNum] = `${this.currentAnswer?.title} - ${this.currentAnswer?.artists[0].name}`;
      // increase round increment
      this.roundNum += 1;
      this.storage.set(ANSWERSAVE, this.answers);
      this.storage.set(ROUND_COUNTER, this.roundNum);
      this.currentAnswer = null;
    } else if (!answerDTO.isAnswer && this.roundNum === 5) {
      this.storage.set(IS_COMPLETE, true);
      this.updateTally(false);
      this.router.navigateByUrl('main/success');
      // navigate to end screen (YOU LOSE)

    }
  }

  async resetState() {

    //reset values to base 
    this.storage.set(IS_COMPLETE, false);
    const expiryDate = await lastValueFrom(this.appService.getExpiry());
    //reset expiry time
    this.storage.set(EXPIRY_TIME, expiryDate.expiryTime);

    //reset answers
    this.storage.set(ANSWERSAVE, ['', '', '', '', '', '']);
    //reset how far along user currently is
    this.storage.set(ROUND_COUNTER, 0);

  }

  checkStatus() {
    const currentExpiry = this.storage.get(EXPIRY_TIME);
    //if expired OR no expiry set (first time)
    if (currentExpiry) {
      // FIX THIS STATEMENT BELOW
      const isExpired = this.parseISOString(currentExpiry) < new Date();

      if (isExpired) {
        this.resetState();
        // if checking back when not expired from current song
      } else if (!isExpired) {
        // if is NOT expired
        if (this.storage.get(IS_COMPLETE)) {
          // if user has completed today's k-heardle --> navigate to end screen
          this.router.navigateByUrl('main/success');
        } else {
          this.roundNum = this.storage.get(ROUND_COUNTER);
          this.answers = this.storage.get(ANSWERSAVE);
        }
      }
    } else {
      this.resetState();

    }

  }

  updateTally(passed: boolean){

    let tempTally = this.storage.get(TALLY_SAVE);
      if(!tempTally){
        tempTally = new Array(7).fill(0);
      }
      if(passed){
        tempTally[this.roundNum] += 1;
        this.storage.set(PASSED_ROUND, this.roundNum);
      } else {
        tempTally[6] += 1;
        this.storage.set(PASSED_ROUND, 6);
        
      }
      this.storage.set(TALLY_SAVE, tempTally);
  }
  parseISOString(s: string) {
    var b = s.split(/\D+/);
    const c = b.map( x => Number(x));
    return new Date(Date.UTC(c[0], --c[1], c[2], c[3], c[4], c[5], c[6]));
  }

}
