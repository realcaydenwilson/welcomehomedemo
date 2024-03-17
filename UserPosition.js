// ./UserPosition.js

/**
 * Represents a user's position in a 2D matrix.
 */
class UserPosition {
  constructor() {
    this.row = 0;
    this.column = 0;
  }

  /**
   * Jump to a new position in the matrix.
   * 
   * @param {number} newX - The new row position.
   * @param {number} newY - The new column position.
   * @param {Array} matrix - The matrix to test the new position against.
   * @returns {undefined} - Updates the user's position if the new position is within the matrix bounds.
   */
  jumpTo(newX, newY, matrix) {
    if (HelperFunctions.withinBounds(newX, newY, matrix)) {
      this.row = newX;
      this.column = newY;
    } else {
      console.error(
        `Cannot jump to out of bounds` +
        `position: ${newX}, ${newY}.`
      );
    }
  }


  moveNorth(matrix) {
    if (this.row > 0) {
      this.row -= 1;
    } else {
      console.error('Cannot move north. Already at the north border.');
    }
  }

  moveSouth(matrix) {
    if (this.row < matrix.length - 1) {
      this.row += 1;
    } else {
      console.error('Cannot move south. Already at the south border.');
    }
  }

  moveWest(matrix) {
    if (this.column > 0) {
      this.column -= 1;
    } else {
      console.error('Cannot move west. Already at the west border.');
    }
  }

  moveEast(matrix) {
    if (this.column < matrix[0].length - 1) {
      this.column += 1;
    } else {
      console.error('Cannot move east. Already at the east border.');
    }
  }
}
