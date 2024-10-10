const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3001; // Ensure this is set to 3001

app.use(cors()); // Use the cors middleware
app.use(express.json());

app.post('/send-invitation', async (req, res) => {
  const { athleteEmail, coachName, institution } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // MailHog does not use SSL
      auth: null
    });
    // const transporter = nodemailer.createTransport({
    //   host: 'localhost', // or use the hostname where MailHog is running
    //   port: 1025,
    //   secure: false, // MailHog does not use SSL
    //   auth: null // No authentication required for MailHog
    // });

    const mailOptions = {
      from: 'noreply@coachingdashboardtest.com',
      to: athleteEmail,
      subject: 'You have been invited!',
      text: `Hello,\n\nYou have been invited by Coach ${coachName} from ${institution} to link your smart clothing mobile application to our coaching dashboard. This will enable you to share your health and fitness data with your coach.\n\nPlease log in to accept the invitation and complete the setup.\n\nBest regards,\nThe Coaching Dashboard Team`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Invitation sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending invitation.');
  }
});

app.listen(port, () => {
  console.log(`Email service running at http://localhost:${port}`);
});
