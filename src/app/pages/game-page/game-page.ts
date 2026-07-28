import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { GameService } from '../../services/game-service';
import { Dialog } from '../../components/dialog/dialog';
import { NumberPopup } from '../../components/number-popup/number-popup';
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
import { ABOUT_DIALOG, NEW_GAME_DIALOG, UNDO_UNAVAILABLE_DIALOG, RESET_BOARD_DIALOG, SHOW_SOLUTION_DIALOG, GAME_WON_DIALOG } from './dialog-configs';

@Component({
  selector: 'app-game-page',
  imports: [FormsModule, Dialog, NumberPopup],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {

  private readonly gameService = inject(GameService);

  readonly boardSizes = [4, 5, 6, 7, 8, 9];
  readonly difficultyLevels = Object.values(Difficulty);
  readonly providerStrategies = Object.values(ProviderStrategy);
  readonly allNumbers = [1,2,3,4,5,6,7,8,9];

  readonly BoardElementType = BoardElementType;

  selectedSize = 4;
  selectedDifficulty = Difficulty.EASY;
  selectedStrategy = ProviderStrategy.GENERATOR;

  activeGame: ActiveGame | null = null;
  currentGrid: number[][] = []; // Zero based
  candidates: number[][][] = [];
  moves: Move[] = [];
  conflictPositions: Position[] = []; // One based
  numberStatistics: NumberStatistic[] = [];

  selectedCell: { row: number; col: number } | null = null;
  dialogConfig: DialogConfig | null = null;

  isGameFinished = false;
  isLoading = false;
  isPencilMode = false;

  // Start and finish game actions
  handleStartNewGame(): void {
    if (this.activeGame && !this.isGameFinished) {
      this.openNewGameDialog();
    } else {
      this.newGame();
    }
  }

  private newGame(): void {
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

  // Fill game board actions
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

  // Bottom panel actions
  switchPencilMode(): void {
    this.isPencilMode = !this.isPencilMode;
  }

  handleUndoMove(): void {
    if (this.isPencilMode) {
      this.openUndoUnavailableDialog();
    } else {
      this.undoMove();
    }
  }

  private undoMove(): void {
    const lastMove = this.moves.pop();
    if (!lastMove) {
      return;
    }
    const row = lastMove.position.row - 1;
    const col = lastMove.position.col - 1;
    if (this.currentGrid[row][col] !== lastMove.afterValue) {
      return;
    }
    this.currentGrid[row][col] = lastMove.beforeValue;

    this.conflictPositions = BoardValidator.validate(this.activeGame!, this.currentGrid);
    this.numberStatistics = this.calculateNumberStatistics();
  }

  private resetBoard(): void {
    this.closeDialog();

    this.currentGrid = this.activeGame!.board.grid.map(row => [...row]);
    this.clearGameStateActions();
    this.numberStatistics = this.calculateNumberStatistics();
  }

  private showSolution(): void {
    this.closeDialog();

    this.gameService
      .showSolution(this.activeGame!.gameId).subscribe(response => {
        this.currentGrid = response.solution;
        this.numberStatistics = this.calculateNumberStatistics();
        this.clearGameStateActions();
        this.isGameFinished = true;
      });
  }

  // View model
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

  private calculateNumberStatistics(): NumberStatistic[] {
    const counts = new Map<number, number>();

    for (let row = 0; row < this.currentGrid.length; row++) {
      for (let col = 0; col < this.currentGrid[row].length; col++) {
        const cellValue = this.currentGrid[row][col];
        if (cellValue !== 0) {
          counts.set(cellValue, (counts.get(cellValue) ?? 0) + 1);
        }
      }
    }

    const statistics: NumberStatistic[] = [];
    for (let value = 1; value <= this.currentGrid.length; value++) {
      statistics.push({ value, count: counts.get(value) ?? 0 });
    }
    return statistics;
  }

  resolveGrid(): BoardElement[][] {
    if (!this.activeGame) {
      return [];
    }

    return GridResolver.resolve(this.activeGame, this.currentGrid, this.candidates);
  }

  renderedBoardSize(): number {
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

  // Helpers and checkers
  private clearGameStateActions(): void {
    this.selectedCell = null;
    this.candidates = this.createEmptyCandidates();
    this.conflictPositions = [];
    this.moves = [];
    this.isPencilMode = false;
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

  // Dialogs
  openAboutDialog(): void {
    this.dialogConfig = ABOUT_DIALOG;
  }

  openNewGameDialog(): void {
    this.dialogConfig = NEW_GAME_DIALOG;
  }

  openUndoUnavailableDialog(): void {
    this.dialogConfig = UNDO_UNAVAILABLE_DIALOG;
  }

  openResetBoardDialog(): void {
    this.dialogConfig = RESET_BOARD_DIALOG;
  }

  openShowSolutionDialog(): void {
    this.dialogConfig = SHOW_SOLUTION_DIALOG;
  }

  openGameWonDialog(): void {
    this.dialogConfig = GAME_WON_DIALOG;
  }

  handleDialogConfirmation(): void {
    switch (this.dialogConfig?.type) {
      case DialogType.NEW_GAME:
        this.newGame();
        break;
      case DialogType.RESET_BOARD:
        this.resetBoard();
        break;
      case DialogType.SHOW_SOLUTION:
        this.showSolution();
        break;
      case DialogType.ABOUT:
      case DialogType.UNDO_UNAVAILABLE:
      case DialogType.GAME_WON:
        this.closeDialog();
        break;
    }
  }

  closeDialog(): void {
    this.dialogConfig = null;
  }

}
