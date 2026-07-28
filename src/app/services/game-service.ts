import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ActiveGame } from '../models/active-game';
import { Difficulty } from '../models/difficulty';
import { ProviderStrategy } from '../models/provider-strategy';
import { Solution } from '../models/solution';
import { SolutionValidation } from '../models/solution-validation';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly apiUrl = 'http://localhost:8080/futoshiki';

  constructor(private readonly http: HttpClient) {}

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

  checkSolution(id: string, solution: Solution): Observable<SolutionValidation> {
    return this.http.post<SolutionValidation>(
      `${this.apiUrl}/${id}/check-solution`,
      solution
    );
  }

  showSolution(id: string): Observable<Solution> {
    return this.http.get<Solution>(
      `${this.apiUrl}/${id}/show-solution`,
      {}
    );
  }

}
