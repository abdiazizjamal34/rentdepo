const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




// Room rental data
const building = {
  floors: [],
};

// Define Room class
class Room {
  constructor(floorNumber, roomNumber) {
    this.floorNumber = floorNumber;
    this.roomNumber = roomNumber;
    this.rentCount = 0;
    this.rentalInfo = [];
  }

  rentRoom(rentalInfo) {
    this.rentCount++;
    this.rentalInfo.push(rentalInfo);
    // Send email notification
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL, // replace with actual email
          pass: process.env.PASSWORD, // replace with actual password
        }
      });

  const mailOptions = {
    from: "abdiaziz.jamal3414@gmail.com",
    to: rentalInfo.tenantEmail, // corrected here // replace with actual recipient email
    subject: 'Room Rental Confirmation',
    // text: `This email confirms your rental of room ${this.floorNumber}-${this.roomNumber} from ${rentalInfo.startDate} to ${rentalInfo.endDate}.`,
    // html, 
    // `<p>Dear ${rentalInfo.tenantName},</p>
    // <p>This email confirms your rental of room ${this.floorNumber}-${this.roomNumber} from ${rentalInfo.startDate} to ${rentalInfo.endDate}.</p>
    // <p>Thank you for choosing our rental service.</p>`,
    html: `<h2>Dear ${rentalInfo.tenantName},</h2>
    <p>This email confirms your rental of room in  <h5> Floor  ${this.floorNumber}  Room  ${this.roomNumber} </h5>.</p>
    <h4> start from  ${rentalInfo.startDate} and end  ${rentalInfo.endDate} </h4/>
    <p>Thank you for choosing our rental service.</p>
    <a> send an eamil</a>
    
    `,

  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
  }

  releaseRoom() {
    this.rentCount--;
  }
}

// Create rooms for each floor
function createRooms() {
  for (let floor = 1; floor <= 10; floor++) {
    const rooms = [];
    for (let room = 1; room <= 10; room++) {
      const newRoom = new Room(floor, room);
      rooms.push(newRoom);
    }
    building.floors.push(rooms);
  }
}

// Initialize the rental management system
createRooms();

// API endpoints

// Get all rooms and their rental status
app.get('/api/rooms', (req, res) => {
  res.json(building);
});

// Rent a room
// Rent a room
app.post('/api/rooms/rent', (req, res) => {
  const { floor, room, tenantName, startDate, endDate, price, tenantEmail } = req.body; // corrected here

  const selectedRoom = building.floors[floor - 1][room - 1];

  if (selectedRoom.rentCount > 0) {
    res.status(400).json({ error: 'Room is already rented.' });
  } else {
    const rentalInfo = {
      tenantName,
      tenantEmail, // corrected here
      startDate,
      endDate,
      price,
    };

    selectedRoom.rentRoom(rentalInfo);
    res.json({ message: 'Room rented successfully. An email confirmation has been sent.'  });
  }
});   

// Release a room
app.post('/api/rooms/release', (req, res) => {
  const { floor, room } = req.body;

  const selectedRoom = building.floors[floor - 1][room - 1];

  if (selectedRoom.rentCount > 0) {
    selectedRoom.releaseRoom();
    res.json({ message: 'Room released successfully.' });
  } else {
    res.status(400).json({ error: 'Room is not rented.' });
  }
});

// Generate monthly rental report
// Generate monthly rental report
app.post('/api/reports/monthly', (req, res) => {
    const { month } = req.body;
  
    if (!month || isNaN(month)) {
      res.status(400).json({ error: 'Invalid month parameter.' });
      return;
    }
  
    const selectedMonth = parseInt(month, 10);
  
    if (selectedMonth < 1 || selectedMonth > 12) {
      res.status(400).json({ error: 'Invalid month value. Month should be between 1 and 12.' });
      return;
    }
  
    const monthlyReport = {
      month: selectedMonth,
      rentedRooms: 0,
      totalRevenue: 0,
      rooms: [],
    };
  
    // Iterate through each room and collect rental information for the selected month
    for (const floor of building.floors) {
      for (const room of floor) {
        const roomInfo = {
          floor: room.floorNumber,
          room: room.roomNumber,
          rentalCount: 0,
          rentalInfo: [],
        };
  
        for (const rental of room.rentalInfo) {
          const rentalMonth = new Date(rental.startDate).getMonth() + 1;
  
          if (rentalMonth === selectedMonth) {
            roomInfo.rentalCount++;
            roomInfo.rentalInfo.push(rental);
            monthlyReport.rentedRooms++;
            monthlyReport.totalRevenue += rental.price;
          }
        }
  
        monthlyReport.rooms.push(roomInfo);
      }
    }
  
    res.json(monthlyReport);
  });



  const port = process.env.PORT || 3002;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
// Start the server
// app.listen(3002, () => {
//   console.log('Rental management system server started on port 3001');
// });