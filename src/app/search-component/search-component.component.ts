import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { Subject, Observable, Subscription, delay, partition, takeUntil, tap, lastValueFrom, firstValueFrom } from 'rxjs';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-search-component',
  templateUrl: './search-component.component.html',
  styleUrls: ['./search-component.component.scss']
})
export class SearchComponentComponent implements OnInit {

  @Output() selectAnswerEvent = new EventEmitter<SongSearchInfo>();

  searchControl = new FormControl();
  destroyed$ = new Subject<void>();
  pressEnter$ = new Subject<void>();

  searchResultsVisible = false;
  treeData: SongSearchInfo[] = [];
  selectedAnswer!: string;
  searchBlur$ = new Subject<void>();
  searchBlurObservable$: Observable<void>;
  searchBlurSubscription: Subscription;

  allResults: SongSearchInfo[] = [];
  isLoadingList = false;
  constructor(
    private appService: AppService,
  ) {
    const [typeNothing$, typeSomething$] = partition(
      this.searchControl.valueChanges as Observable<string>,
      _ => (this.searchControl.value.title as string)?.trim() === '' || this.searchControl.value.title === null,
    );

    typeNothing$.pipe(takeUntil(this.destroyed$)).subscribe(async _ => {
      // reset list to full list
      // await this.generateSearchResults('');
      console.log('typed nothing');
      this.isLoadingList = true;
      this.treeData = [];
      this.isLoadingList = false;

    });

    typeSomething$.pipe(takeUntil(this.destroyed$)).subscribe(async value => {
      console.log('typed something');
      if (value === '') {
        this.isLoadingList = true;
        this.treeData = [];
        this.isLoadingList = false;
      }
      await this.generateSearchResults(value);
      console.log(this.treeData);

    });

    this.searchBlurObservable$ = this.searchBlur$.pipe(
      delay(100),
      tap(() => {
        const isPanelOnFocus =
          document?.activeElement?.className.includes('keep-focus') || document?.activeElement?.className.includes('k-treeview-item');
        if (!isPanelOnFocus) {
          this.searchResultsVisible = false;
        }
      }),
      takeUntil(this.destroyed$),
    );
    this.searchBlurSubscription = this.searchBlurObservable$.subscribe();
  }

  ngOnInit(): void {
  }

  async generateSearchResults(searchString: string) {
    this.isLoadingList = true;
    const temporaryTreeData: SongSearchInfo[] = [];

    const songList = await firstValueFrom(this.appService.getSearchResults(searchString));

    this.treeData = songList;
    this.isLoadingList = false;
  }


  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onBlur(): void {
    this.searchBlur$.next();
  }

  onInputFocus(): void {
    this.searchResultsVisible = true;
  }
  sendAnswer(a: any) {
    const song = this.getSongFromName(a);
    this.selectAnswerEvent.emit(song);
    console.log(song);
  }


  getSongFromName(name: string): SongSearchInfo {
    return this.treeData.find(x => x.title === name) as SongSearchInfo;
  }
  displayName(song: SongSearchInfo): string {
    let artistString = '';
    if (song && song.artists.length > 1) {
      song.artists.forEach(artist => {
        if (artistString === '') {
          artistString += `,${artist.name}`
        } else {
          artistString += `,${artist.name}`
        }
      });
      return song ? `${song.title} - ${artistString}` : '';
    } else {
      return song ? `${song.title} - ${song.artists[0].name}` : '';

    }

  }

  createArtistsNames(artists: Artist[]) {
    let output = '';
    artists.forEach(artist => {
      if (output.length > 1) {
        output += `,${artist.name}`
      } else {
        output += `,${artist.name}`
      }
    });
    return output;
  }
}


export interface SongSearchInfo {
  youtubeId: string;
  rank: number;
  title: string;
  artists: Artist[];
  album: string;
  thumbnailUrl: string;
  duration: {
    label: string;
    totalSeconds: number
  };
  isExplicit: string;
}

export interface Artist {
  name: string;
  id: string;
}