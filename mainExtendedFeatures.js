const roomMatrix = [
  // First row: 0,0 - 0,1 - 0,2
  [
    './rooms/room0,0.jpg',
    './rooms/room0,1.jpg',
    './rooms/room0,2.jpg'
  ],
  // Second row: 1,0 - 1,1 - 1,2
  [
    './rooms/room1,0.jpg',
    './rooms/room1,1.jpg',
    './rooms/room1,2.jpg'
  ],
  // Third row: 2,0 - 2,1 - 2,2
  [
    './rooms/room2,0.jpg',
    './rooms/room2,1.jpg',
    './rooms/room2,2.jpg'
  ]
];

try{
  HelperFunctions.validateMatrix(roomMatrix);
  const myHome = new MyHome(sphere, roomMatrix);

  // Load the rooms and displays room 0,0 by default.
  myHome.loadRooms().then(() => {
    myHome.updateRoom();
    HelperFunctions.enableMovementDesktop(document,myHome);
    HelperFunctions.enableMovementMobile(document,myHome);
  });
} catch (err) { 
  console.error(err.message) 
}
