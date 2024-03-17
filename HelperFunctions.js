// ./HelperFunctions.js

/**
 * A collection of static helper functions.
 * 
 * Serves MyHome class in MyHome.js,
 *   and UserPosition class in UserPosition.js.
 */
class HelperFunctions {
  
  /**
   * Validates a 2D array as a matrix
   *
   * @param {Array} matrix - A 2D array of any type
   * @returns {boolean} - True if the matrix is valid, 
   *   otherwise throws an error
   * @throws {Error} - If the matrix is undefined, empty, 
   *   not rectangular, or has undefined elements
   */
  static validateMatrix(testMatrix) {
    // Potential error 1: matrix is undefined
    if (!testMatrix) {
      throw new Error('Err: Matrix is undefined.');
    }

    // Potential error 2: matrix is empty
    if (testMatrix.length === 0 || testMatrix[0].length === 0) {
      throw new Error('Err: Matrix is empty.');
    }

    const maxRowLen = Math.max(...testMatrix.map(row => row.length));
    for (let i = 0; i < testMatrix.length; i++) {

      // Potential error 3: matrix is not rectangular
      if (testMatrix[i].length !== maxRowLen) {
        throw new Error('Err: Matrix is not rectangular.');
      }

      // Potential error 4: matrix has undefined elements
      for (let j = 0; j < testMatrix[i].length; j++) {
        if (testMatrix[i][j] === undefined) {
          throw new Error(
            `Err: Matrix has undefined elements ` +
            `at row: ${i} and column: ${j}.`);
        }
      }
    }

    // Otherwise, matrix is valid.
    return true;
  }

  /**
   * Test if a new position (x,y) is within the bounds of a matrix.
   *
   * @param {number} testNewX - The new x position to test.
   * @param {number} testNewY - The new y position to test.
   * @param {Array} testMatrix - The matrix to test the new position against.
   * @returns {boolean} - True if the new position is within the matrix bounds,
   *  otherwise false.
   */
  static withinBounds(testNewX, testNewY, testMatrix) {
    return (
      testNewX >= 0 &&
      testNewX < testMatrix.length &&
      testNewY >= 0 &&
      testNewY < testMatrix[0].length
    );
  }

  /**
   * Determine user facing direction via the sphere's rotation.
   * 
   * @param {Object} sphereObj - The sphere object to determine the direction of.
   * @returns {string} - The direction the user is facing.
   * @throws {Error} - If the direction cannot be determined.
   */
  static currentDirection (sphereObj) {
    // The sphere's rotation is in radians,
    //   with some offset and normalization needed.
    const offsetRadians = Math.PI;
    const correctedRadians = sphereObj.rotation.y + offsetRadians;
    const normalizedRadians = (
      (correctedRadians + Math.PI) % (2 * Math.PI) - Math.PI
    );
    const normalizedFraction = (
      (normalizedRadians + Math.PI) / (2 * Math.PI)
    );

    if (normalizedFraction >= 0.875 || normalizedFraction < 0.125) {
      return 'north';

    } else if (normalizedFraction >= 0.125 && normalizedFraction < 0.375) {
      return 'east';

    } else if (normalizedFraction >= 0.375 && normalizedFraction < 0.625) {
      return 'south';

    } else if (normalizedFraction >= 0.625 && normalizedFraction < 0.875) {
      return 'west';

    } else {
      throw new Error('Err: Could not determine the current direction.');
    }
  }

  /**
   * Enable movement for desktop users.
   * 
   * @param {Object} target - The target object to add the event listener to.
   * @param {Object} myHome - The MyHome object to move.
   * @returns {undefined} - Adds an event listener to the target object.
   * @throws {Error} - If the target object is undefined.
   */
  static enableMovementDesktop(target, myHome) {
    // For mouse (desktop) users, add double-click as movement.
    target.addEventListener('dblclick', (ev) => {
      ev.preventDefault();
      console.log('Double-click detected.');

      // Handle direction movement.
      const dirString = HelperFunctions.currentDirection(myHome.sphere);
      console.log(`Current direction: ${dirString}`);

      myHome.moveTo(dirString);
    });
  }

  /**
   * Enable movement for mobile users.
   * 
   * @param {Object} target - The target object to add the event listener to.
   * @param {Object} myHome - The MyHome object to move.
   * @returns {undefined} - Adds an event listener to the target object.
   * @throws {Error} - If the target object is undefined.
   */
  static enableMovementMobile(target, myHome) {
    // For touch (mobile) users, add double-tap as movement.
    let lastTapTime = 0;
    target.addEventListener('touchend', (ev) => {
      
      // Handle double-tap detection.
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTapTime;
      lastTapTime = currentTime;

      if (0 < deltaTime && deltaTime < 300) {
        ev.preventDefault();
        console.log('Double-tap detected.');

        // Handle direction movement.
        const dirString = HelperFunctions.currentDirection(myHome.sphere);
        console.log(`Current direction: ${dirString}`);

        myHome.moveTo(dirString);
      }
    });
  }
}
