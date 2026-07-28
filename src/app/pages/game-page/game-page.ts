import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
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
import { NumberStatistic } from '../../models/number-statistic';
import { Move } from '../../models/move';
import { GridResolver } from './grid-resolver';
import { BoardValidator } from './board-validator';
import { SHOW_SOLUTION_DIALOG, RESET_BOARD_DIALOG, NEW_GAME_DIALOG, UNDO_UNAVAILABLE_DIALOG, GAME_WON_DIALOG, ABOUT } from './dialog-configs';

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
  conflictPositions: Position[] = []; // One based!
  numberStatistics: NumberStatistic[] = [];
  selectedCell: { row: number; col: number } | null = null;
  isGameFinished: boolean = false;
  isLoading: boolean = false;
  moves: Move[] = [];
  candidates: number[][][] = [];
  isPencilMode = false;

  dialogConfig: DialogConfig | null = null;

  selectedSize: number = 4;
  selectedDifficulty: Difficulty = Difficulty.EASY;
  selectedStrategy: ProviderStrategy = ProviderStrategy.GENERATOR;

  readonly boardSizes = [4, 5, 6, 7, 8, 9];
  readonly difficultyLevels = Object.values(Difficulty);
  readonly providerStrategies = Object.values(ProviderStrategy);
  readonly allNumbers = [1,2,3,4,5,6,7,8,9];

  readonly BoardElementType = BoardElementType;

  handleStartNewGame(): void {
    if (this.activeGame && !this.isGameFinished) {
      this.openNewGameDialog();
    } else {
      this.newGame();
    }
  }

  newGame(): void {
    this.closeDialog();
    this.isLoading = true;

    this.gameService
      .newGame(this.selectedSize, this.selectedDifficulty, this.selectedStrategy)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: response => {
          this.activeGame = response;
          this.currentGrid = response.board.grid.map(row => [...row]);
          this.numberStatistics = this.calculateNumberStatistics();
          this.clearGameStateActions();
          this.isGameFinished = false;
        },
        error: error => {
          console.error('Could not load game', error);
        }
      });
  }

  private createEmptyCandidates(): number[][][] {
    if (!this.activeGame) {
      return [];
    }
    const size = this.activeGame.board.size;
    return Array.from(
      { length: size },
      () => Array.from({ length: size }, () => [])
    );
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
        this.numberStatistics = this.calculateNumberStatistics();
        this.clearGameStateActions();
        this.isGameFinished = true;
      });
  }

  resetBoard(): void {
    this.closeDialog();

    this.currentGrid = this.activeGame!.board.grid.map(row => [...row]);
    this.clearGameStateActions();
    this.numberStatistics = this.calculateNumberStatistics();
  }

  switchPencilMode(): void {
    this.isPencilMode = !this.isPencilMode;
    console.log(this.isPencilMode);
  }

  private clearGameStateActions(): void {
    this.selectedCell = null;
    this.candidates = this.createEmptyCandidates();
    this.conflictPositions = [];
    this.moves = [];
    this.isPencilMode = false;
  }

  calculateNumberStatistics(): NumberStatistic[] {
    const numStatMap = new Map<number, number>();

    for (let row = 0; row < this.currentGrid.length; row++) {
      for (let col = 0; col < this.currentGrid[row].length; col++) {
        const cellValue = this.currentGrid[row][col];
        if (cellValue !== 0) {
          numStatMap.set(cellValue, (numStatMap.get(cellValue) ?? 0) + 1);
        }
      }
    }

    const numStatList: NumberStatistic[] = [];
    for (let value = 1; value <= this.currentGrid.length; value++) {
      numStatList.push({ value, count: numStatMap.get(value) ?? 0 });
    }
    return numStatList;
  }

  drawGrid(): BoardElement[][] {
    if (!this.activeGame) {
      return [];
    }

    return GridResolver.resolve(this.activeGame, this.currentGrid, this.candidates);
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

  handleCellClick(rowIndex: number, colIndex: number): void {
    if (this.isGameFinished || !this.isEditableCell(rowIndex, colIndex)) {
      return;
    }

    const row = rowIndex / 2;
    const col = colIndex / 2;

    if (
      this.selectedCell?.row === row &&
      this.selectedCell?.col === col
    ) {
      this.selectedCell = null;
      return;
    }

    this.selectedCell = { row, col };
  }

  setCellValue(value: number): void {
    if (!this.selectedCell) {
        return;
    }

    if (this.isPencilMode) {
      this.toggleCandidate(this.selectedCell.row, this.selectedCell.col, value);
    } else {
      this.fillCellWithValue(this.selectedCell.row, this.selectedCell.col, value);
    }

    this.selectedCell = null;
  }

  private fillCellWithValue(row: number, col: number, value: number): void {
    const beforeValue = this.currentGrid[row][col];
    this.candidates[row][col] = [];
    this.currentGrid[row][col] = value;
    this.conflictPositions = BoardValidator.validate(this.activeGame!, this.currentGrid);
    this.numberStatistics = this.calculateNumberStatistics();
    this.moves.push({ beforeValue: beforeValue, afterValue: value, position: {row: row + 1, col: col + 1}});

    if (this.isBoardReadyToCheck()) {
      this.checkSolution();
    }
  }

  private toggleCandidate(row: number, col: number, value: number): void {
    if (!this.isEmptyCell(row, col)) {
      return;
    }
    const cellCandidates = this.candidates[row][col];
    if (value === 0) {
      cellCandidates.length = 0;
    } else {
      if (cellCandidates.includes(value)) {
        const index = cellCandidates.indexOf(value);
        cellCandidates.splice(index, 1);
      } else {
        cellCandidates.push(value);
      }
    }
  }

  handleUndoMove() {
    if (this.isPencilMode) {
      this.openUndoUnavailableDialog();
    } else {
      this.undoMove();
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
    this.numberStatistics = this.calculateNumberStatistics();
  }

  private isBoardReadyToCheck(): boolean {
    const isBoardFilled = this.currentGrid.every(row =>
      row.every(value => value !== 0)
    );

    return isBoardFilled && this.conflictPositions.length === 0;
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.selectedCell?.row === rowIndex / 2
      && this.selectedCell?.col === colIndex / 2;
  }

  isEmptyCell(row: number, col: number): boolean {
    return this.currentGrid[row][col] === 0;
  }

  isEditableCell(rowIndex: number, colIndex: number): boolean {
    return this.activeGame?.board.grid[rowIndex/2][colIndex/2] === 0;
  }

  isInvalidCell(rowIndex: number, colIndex: number): boolean {
    return  this.isEditableCell(rowIndex, colIndex) &&
            this.conflictPositions.some(p => p.row === rowIndex/2 + 1 && p.col === colIndex/2 + 1);
  }

  isNumberAvailable(value: number): boolean {
    return value <= this.activeGame!.board.size;
  }

  openShowSolutionDialog(): void {
    this.dialogConfig = SHOW_SOLUTION_DIALOG;
  }

  openResetBoardDialog(): void {
    this.dialogConfig = RESET_BOARD_DIALOG;
  }

  openUndoUnavailableDialog(): void {
    this.dialogConfig = UNDO_UNAVAILABLE_DIALOG;
  }

  openNewGameDialog(): void {
    this.dialogConfig = NEW_GAME_DIALOG;
  }

  openGameWonDialog(): void {
    this.dialogConfig = GAME_WON_DIALOG;
  }

  openAboutDialog(): void {
    this.dialogConfig = ABOUT;
  }

  handleDialogConfirmation(): void {
    switch (this.dialogConfig?.type) {
      case DialogType.SHOW_SOLUTION:
        this.confirmShowSolution();
        break;
      case DialogType.RESET_BOARD:
        this.resetBoard();
        break;
      case DialogType.NEW_GAME:
        this.newGame();
        break;
      case DialogType.GAME_WON:
      case DialogType.ABOUT:
      case DialogType.UNDO_UNAVAILABLE:
        this.closeDialog();
        break;
    }
  }

  closeDialog(): void {
    this.dialogConfig = null;
  }

}
