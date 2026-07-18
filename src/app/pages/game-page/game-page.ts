import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game-service';
import { ActiveGame } from '../../models/active-game';
import { Difficulty } from '../../models/difficulty';
import { ProviderStrategy } from '../../models/provider-strategy';
import { FutoshikiBoard } from '../../models/futoshiki-board';
import { BoardElement, BoardElementType } from '../../models/board-element';
import { ConstraintOperator } from '../../models/constraint-operator';
import { GridResolver } from './grid-resolver';

@Component({
  selector: 'app-game-page',
  imports: [FormsModule],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {

  private gameService = inject(GameService);

  activeGame: ActiveGame | null = null;
  grid: number[][] | null = null;

  selectedSize: number = 4;
  selectedDifficulty: Difficulty = Difficulty.EASY;
  selectedStrategy: ProviderStrategy = ProviderStrategy.GENERATOR;

  readonly boardSizes = [4, 5, 6, 7, 8, 9];
  readonly difficultyLevels = Object.values(Difficulty);
  readonly providerStrategies = Object.values(ProviderStrategy);

  readonly BoardElementType = BoardElementType;

  newGame(): void {
    this.gameService.newGame(this.selectedSize, this.selectedDifficulty, this.selectedStrategy).subscribe(game => {
      this.activeGame = game;
      this.grid = game.board.grid;
    });
  }

  drawGrid(): BoardElement[][] {
    if (!this.activeGame) {
      return [];
    }

    return GridResolver.resolve(this.activeGame);
  }

  fullBoardSize(): number {
    return this.activeGame ? this.activeGame.board.size * 2 - 1 : 0;
  }

  constraintSymbol(operator: ConstraintOperator | null): string {
    if (operator === null) {
      return '';
    }

    switch (operator) {
      case ConstraintOperator.LESS_THAN:
        return '<';
      case ConstraintOperator.GREATER_THAN:
        return '>';
    }
  }

}
