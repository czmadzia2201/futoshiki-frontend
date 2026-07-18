import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ActiveGame } from '../models/active-game';
import { Difficulty } from '../models/difficulty';
import { ProviderStrategy } from '../models/provider-strategy';
import { CheckSolutionRequest } from '../models/check-solution-request';
import { CheckSolutionResponse } from '../models/check-solution-response';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private apiUrl = 'http://localhost:8080/futoshiki';

  constructor(private http: HttpClient) {}

  newGame(size: number, difficulty: Difficulty, strategy?: ProviderStrategy): Observable<ActiveGame> {
    let params = new HttpParams();

    if (strategy) {
      params = params.set('strategy', strategy);
    }

    return this.http.post<ActiveGame>(
      `${this.apiUrl}/new-game/${size}/${difficulty}`,
      {},
      { params }
    );
  }

  checkSolution(id: string, solution: CheckSolutionRequest): Observable<CheckSolutionResponse> {
    return this.http.post<CheckSolutionResponse>(
      `${this.apiUrl}/check-solution/${id}`,
      solution
    );
  }

}
