// ./MyHome.js

/**
 * Represents a home with traversible rooms and a user.
 * 
 * @property {THREE.Mesh} sphere - The sphere object.
 * @property {Array} rMatrix - The room matrix.
 * @property {Array} mMatrix - The material matrix.
 * @property {UserPosition} userPos - The user's position.
 * @property {THREE.TextureLoader} loader - The image loader.
 * 
 * @method prepMaterial - Prepare the material for the room.
 * @method loadRooms - Load the rooms into the matrix (one-time).
 * @method updateRoom - Update the room render based on the user's position.
 * @method moveTo - Move the user's position in the matrix.
 * 
 * @throws {Error} - If the image path is not valid.
 * @throws {Error} - If the matrix is not valid.
 */
class MyHome {
  constructor(sphereObj, roomMatrix) {
    this.sphere = sphereObj;
    this.rMatrix = roomMatrix;
    this.mMatrix = [];
    this.userPos = new UserPosition();
    this.loader = new THREE.TextureLoader();
  }

  /**
   * Prepare the material for the room.
   * 
   * @param {string} imgPath - The path to the image.
   * @param {THREE.TextureLoader} imgLoader - The image loader.
   * @returns {Promise} - The material for the room.
   * @throws {Error} - If the image path is not valid.
   */
  static async prepMaterial(imgPath, imgLoader) {
    try {
      const tmpTexture = await new Promise(
        (resolve, reject) => {
          imgLoader.load(
            imgPath,
            resolve,
            undefined,
            reject);
        });
      return new THREE.MeshBasicMaterial({
        map: tmpTexture
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  /**
   * Load the rooms into the matrix (one-time).
   * 
   * @returns {undefined} - Updates the room matrix.
   * @throws {Error} - If the matrix is not valid.
   * @throws {Error} - If the image paths are not valid.
   */
  async loadRooms() {
    try {
      this.mMatrix = await Promise.all(
        this.rMatrix.map(
          row => Promise.all(
            row.map(
              imgPath => MyHome.prepMaterial(
                imgPath,
                this.loader
              )
            )
          )
        )
      );
      HelperFunctions.validateMatrix(this.mMatrix);
    } catch (err) {
      console.log(err.message);
    }
  }

  /**
   * Update the room render based on the user's position.
   * 
   * @returns {undefined} - Updates the room render.
   */
  updateRoom() {
    if (
      HelperFunctions.withinBounds(
        this.userPos.row,
        this.userPos.column,
        this.mMatrix
      )
    ) {
      try {
        this.sphere.material =
          this.mMatrix
          [this.userPos.row]
          [this.userPos.column];
      } catch (err) {
        console.log(err.message);
      }
    } else {
      console.error(
        `User position of userPos.row: ${this.userPos.row} ` +
        `and userPos.column: ${this.userPos.column} is out of bounds.`
      );
    }
  }

  /**
   * Move the user's position in the matrix.
   * 
   * @param {string} directionStr - The direction to move in.
   * @returns {undefined} - Updates the user's position and the room render.
   */
  moveTo(directionStr) {
    switch (directionStr.toLowerCase()) {
      case 'north':
        this.userPos.moveNorth(this.mMatrix);
        break;
      case 'south':
        this.userPos.moveSouth(this.mMatrix);
        break;
      case 'west':
        this.userPos.moveWest(this.mMatrix);
        break;
      case 'east':
        this.userPos.moveEast(this.mMatrix);
        break;
      default:
        console.error(
          `Invalid direction: ${directionStr}. \n` +
          `Valid directions are: north, south, west, east.`
        );
    }
    this.updateRoom();
  }
}
