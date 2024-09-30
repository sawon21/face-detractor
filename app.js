// Static data for students with roll numbers and departments
const studentsData = {
  "12345": { name: "John Doe", roll: "101", department: "Science", attendance: false },
  "67890": { name: "Jane Smith", roll: "102", department: "Arts", attendance: false },
  // Add other students here...
};

// Initialize scanner
let scanner = new Instascan.Scanner({ video: document.getElementById('video') });
let serialNumber = 1;

scanner.addListener('scan', function (content) {
  let student = studentsData[content];
  let attendanceTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];

  // Clear previous result (hide full-screen result)
  let resultScreen = document.getElementById('result-screen');
  let resultIcon = document.getElementById('result-icon');
  let resultMessage = document.getElementById('result-message');

  // Show full-screen result
  resultScreen.style.display = 'flex';

  if (student) {
    if (!student.attendance) {
      student.attendance = true;
      let timestamp = new Date().toLocaleString();

      // Insert row into the table
      let newRow = attendanceTable.insertRow();
      newRow.innerHTML = `
        <td>${serialNumber}</td>
        <td>${student.name}</td>
        <td>${student.roll}</td>
        <td>${student.department}</td>
        <td>${timestamp}</td>
      `;

      serialNumber++;

      // Display verified icon and message
      resultIcon.innerHTML = '<i class="big-verified fas fa-check-circle"></i>';  // Large check mark
      resultMessage.innerHTML = `
        <strong>${student.name}</strong><br>
        Roll: ${student.roll}<br>
        Department: ${student.department}<br>
        Attendance marked at ${timestamp}
      `;

    } else {
      // If already marked, display a message but still show verified
      resultIcon.innerHTML = '<i class="big-verified fas fa-check-circle"></i>';  // Large check mark
      resultMessage.innerHTML = `Attendance already marked for <strong>${student.name}</strong>`;
    }
  } else {
    // Display not verified icon and message
    resultIcon.innerHTML = '<i class="big-not-verified fas fa-times-circle"></i>';  // Large cross mark
    resultMessage.innerHTML = "Not Verified: QR Code does not match any student!";
  }

  // Auto-hide result after 2 seconds
  setTimeout(() => {
    resultScreen.style.display = 'none';
  }, 2000);  // 2 seconds
});

// Start camera for QR scanning
Instascan.Camera.getCameras().then(function (cameras) {
  if (cameras.length > 0) {
    scanner.start(cameras[0]);  // Use the first camera
  } else {
    console.error('No cameras found.');
    alert('No cameras found. Please ensure your device has a camera and grant permission.');
  }
}).catch(function (e) {
  console.error(e);
  alert('Camera access denied or not available. Please grant camera access.');
});

// Download attendance as PDF
document.getElementById('downloadBtn').addEventListener('click', function() {
  let { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let attendanceTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
  let rows = attendanceTable.getElementsByTagName('tr');
  
  let pageLimit = 25; // Limit rows per page in PDF
  let currentY = 20;
  let pageNumber = 1;

  // Add the title and header to the PDF
  doc.setFontSize(16);
  doc.text("Attendance List", 14, 10);

  // Add table headers
  doc.setdoc.setFontSize(12);
  doc.text('Serial', 14, 20);
  doc.text('Name', 30, 20);
  doc.text('Roll', 90, 20);
  doc.text('Department', 130, 20);
  doc.text('Time', 180, 20);

  // Iterate through the rows in the table and add them to the PDF
  for (let i = 0; i < rows.length; i++) {
    let cells = rows[i].getElementsByTagName('td');

    if (currentY > 280) { // Create a new page if content exceeds page height
      doc.addPage();
      currentY = 20;
      pageNumber++;

      // Add header on new page
      doc.text('Serial', 14, currentY);
      doc.text('Name', 30, currentY);
      doc.text('Roll', 90, currentY);
      doc.text('Department', 130, currentY);
      doc.text('Time', 180, currentY);
      currentY += 10;
    }

    doc.text(cells[0].textContent, 14, currentY);     // Serial number
    doc.text(cells[1].textContent, 30, currentY);     // Name
    doc.text(cells[2].textContent, 90, currentY);     // Roll
    doc.text(cells[3].textContent, 130, currentY);    // Department
    doc.text(cells[4].textContent, 180, currentY);    // Time

    currentY += 10;
  }

  // Save the PDF
  doc.save("Attendance.pdf");
});