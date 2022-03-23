import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SongSearchInfo } from '../search-component/search-component.component';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient,
  ) {

  }

  getDailySongId() {
      return this.http.get<{videoId: string}>(`${environment.backEndUrl}/song`,{
        headers: {
          responseType: 'text',
        }
      });

  }
  getSearchResults(searchString: string): Observable<SongSearchInfo[]> {
    return this.http.get<SongSearchInfo[]>(`${environment.backEndUrl}/search/${searchString}`);

  }
  checkAnswer(answerId: string): Observable<isAnswerDTO> {
    return this.http.get<isAnswerDTO>(`${environment.backEndUrl}/answer/${answerId}`);

  }

  getExpiry(): Observable<{expiryTime: Date}> {
    return this.http.get<{expiryTime: Date}>(`${environment.backEndUrl}/expiry`);

  }

  getAnswer(): Observable<{answerInfo: SongSearchInfo}> {
    return this.http.get<{answerInfo: SongSearchInfo}>(`${environment.backEndUrl}/get-answer`);

  }
}

export interface isAnswerDTO {
  isAnswer: boolean;
   answerInfo?: SongSearchInfo;
}
