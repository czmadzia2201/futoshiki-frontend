import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game-service';
import { DialogComponent } from '../../dialog/dialog';
import { ActiveGame } from '../../models/active-game';
import { DialogConfig, DialogType } from '../../models/dialog-config';
import { Difficulty } from '../../models/difficulty';
import { ProviderStrategy } from '../../models/provider-strategy';
import { FutoshikiBoard } from '../../models/futoshiki-board';
import { BoardElement, BoardElementType } from '../../models/board-element';
import { ConstraintOperator } from '../../models/constraint-operator';
import { Position } from '../../models/position';
import { Solution } from '../../models/solution';
import { SolutionValidation } from '../../models/solution-validation';
import { Move } from '../../models/move';
import { GridResolver } from './grid-resolver';
import { BoardValidator } from './board-validator';
import { SHOW_SOLUTION_DIALOG, GAME_WON_DIALOG, ABOUT } from './dialog-configs';

@Component({
  selector: 'app-game-page',
  imports: [FormsModule, DialogComponent],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {

  private gameService = inject(GameService);

  activeGame: ActiveGame | null = null;
  currentGrid: number[][] = []; // Zero based!
  selectedNumber: number | null = null;
  conflictPositions: Position[] = []; // One based!
  isGameFinished: boolean = false;
  moves: Move[] = [];

  dialogConfig: DialogConfig | null = null;

  selectedSize: number = 4;
  selectedDifficulty: Difficulty = Difficulty.EASY;
  selectedStrategy: ProviderStrategy = ProviderStrategy.GENERATOR;

  readonly boardSizes = [4, 5, 6, 7, 8, 9];
  readonly difficultyLevels = Object.values(Difficulty);
  readonly providerStrategies = Object.values(ProviderStrategy);

  readonly BoardElementType = BoardElementType;

  newGame(): void {
    this.gameService.newGame(this.selectedSize, this.selectedDifficulty, this.selectedStrategy).subscribe(response => {
      this.activeGame = response;
      this.currentGrid = response.board.grid.map(row => [...row]);
      this.clearGameStateActions();
      this.isGameFinished = false;
    });
  }

  private checkSolution(): void {
    const request: Solution = {
      solution: this.currentGrid
    };
    this.gameService.checkSolution(this.activeGame!.gameId, request).subscribe(response => {
      if (response.isCorrect) {
          this.isGameFinished = true;
          this.clearGameStateActions();
          this.openGameWonDialog();
      }
    });
  }

  confirmShowSolution(): void {
    this.closeDialog();

    this.gameService
      .showSolution(this.activeGame!.gameId).subscribe(response => {
        this.currentGrid = response.solution;
        this.clearGameStateActions();
        this.isGameFinished = true;
      });
  }

  openShowSolutionDialog(): void {
    this.dialogConfig = SHOW_SOLUTION_DIALOG;
  }

  openGameWonDialog(): void {
    this.dialogConfig = GAME_WON_DIALOG;
  }

  openAboutDialog(): void {
    this.dialogConfig = ABOUT;
  }

  resetBoard(): void {
    this.currentGrid = this.activeGame!.board.grid.map(row => [...row]);
    this.clearGameStateActions();
  }

  private clearGameStateActions(): void {
    this.conflictPositions = [];
    this.selectedNumber = null;
    this.moves = [];
  }

  drawGrid(): BoardElement[][] {
    if (!this.activeGame) {
      return [];
    }

    return GridResolver.resolve(this.activeGame, this.currentGrid);
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

  selectNumber(number: number): void {
    this.selectedNumber =
      this.selectedNumber === number ? null : number;
  }

  isSelectedNumber(number: number): boolean {
    return this.selectedNumber === number;
  }

  fillCell(rowIndex: number, colIndex: number): void {
    if (this.selectedNumber === null) {
      return;
    }

    if (!this.isEditableCell(rowIndex, colIndex)) {
      return;
    }

    const row = rowIndex / 2;
    const col = colIndex / 2;

    const beforeValue = this.currentGrid[row][col];
    this.currentGrid[row][col] = this.selectedNumber;
    this.conflictPositions = BoardValidator.validate(this.activeGame!, this.currentGrid);
    this.moves.push({ beforeValue: beforeValue, afterValue: this.selectedNumber, position: {row: row + 1, col: col + 1}});

    if (this.isBoardReadyToCheck()) {
      this.checkSolution();
    }
  }

  undoMove(): void {
    const lastMove = this.moves.pop();
    if (!lastMove) {
      return;
    }
    const row = lastMove.position.row - 1;
    const col = lastMove.position.col - 1;
    if (this.currentGrid[row][col] !== lastMove.afterValue) {
      return;
    } else {
      this.currentGrid[row][col] = lastMove.beforeValue;
    }
    this.conflictPositions = BoardValidator.validate(this.activeGame!, this.currentGrid);
  }

  private isBoardReadyToCheck(): boolean {
    const isBoardFilled = this.currentGrid.every(row =>
      row.every(value => value !== 0)
    );

    return isBoardFilled && this.conflictPositions.length === 0;
  }

  isEditableCell(rowIndex: number, colIndex: number): boolean {
    return this.activeGame?.board.grid[rowIndex/2][colIndex/2] === 0;
  }

  isInvalidCell(rowIndex: number, colIndex: number): boolean {
    return  this.isEditableCell(rowIndex, colIndex) &&
            this.conflictPositions.some(p => p.row === rowIndex/2 + 1 && p.col === colIndex/2 + 1);
  }

  availableNumbers(): number[] {
    const size = this.activeGame ? this.activeGame.board.size + 1 : 0;

    return Array.from(
      { length: size },
      (_, index) => index
    );
  }

  handleDialogConfirmation(): void {
    switch (this.dialogConfig?.type) {
      case DialogType.SHOW_SOLUTION:
        this.confirmShowSolution();
        break;

      case DialogType.GAME_WON:
      case DialogType.ABOUT:
        this.closeDialog();
        break;
    }
  }

  closeDialog(): void {
    this.dialogConfig = null;
  }



}
