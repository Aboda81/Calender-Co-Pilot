import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const Container = styled(Box)(({ theme }) => ({
  maxWidth: '1300px',
  margin: '20px auto',
  padding: '20px',
  backgroundColor: '#f4f4f9',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: '15px',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: '16px',
  padding: '12px 24px',
  margin: '10px',
  borderRadius: '8px',
  '&:hover': {
    transform: 'scale(1.05)',
    transition: '0.3s',
  },
}));

const AvailableSlotCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: '5px',
  textAlign: 'center',
  border: '1px solid #ddd',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  textAlign: 'center',
  border: '1px solid #ddd',
}));

const Home = () => {
  const location = useLocation();
  const data = location.state?.data || {};
  const schedule = data.schedule;

  const [prompt, setPrompt] = useState('');
  const [newSchedule, setNewSchedule] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState(schedule);
  const [message, setMessage] = useState('');

  const cookies = document.cookie.split('; ');
  const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt='));
  const jwtToken = jwtCookie ? jwtCookie.split('=')[1] : null;

  const hoursOfDay = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const daysOfWeek = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

  const handleTest = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/test', { prompt });
      setNewSchedule(res.data);
      setMessage('Generated schedule successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error generating schedule');
    }
  };

  const handleConfirm = async () => {
    try {
      await axios.post('http://localhost:5000/api/confirm', { schedule: newSchedule }, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        },
        withCredentials: true,
      });
      setCurrentSchedule(newSchedule);
      setNewSchedule(null);
      setMessage('Schedule confirmed successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error confirming schedule');
    }
  };

  const isSlotAvailable = (schedule, day, hour) => {
    if (!schedule || !schedule[day]) return false;
    return schedule[day].some(slot => hour >= slot.from && hour < slot.to);
  };

  const renderScheduleTable = (schedule, title) => (
    <>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Day</StyledTableCell>
              {hoursOfDay.map((hour) => (
                <StyledTableCell key={hour}>{hour}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {daysOfWeek.map((day) => (
              <TableRow key={day}>
                <StyledTableCell>{day.toUpperCase()}</StyledTableCell>
                {hoursOfDay.map((hour) => (
                  isSlotAvailable(schedule, day, hour) ? (
                    <AvailableSlotCell key={hour} />
                  ) : (
                    <StyledTableCell key={hour} />
                  )
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <Container>
      <Typography padding={"10px"} variant="h4">Welcome {data.name}</Typography>
      <Typography variant="h5" gutterBottom>
        <ScheduleIcon /> Schedule Your Availability
      </Typography>

      {currentSchedule ? (
        renderScheduleTable(currentSchedule, 'Current Schedule:')
      ) : (
        <Typography variant="h6">No current schedule available.</Typography>
      )}

      {newSchedule && (
        renderScheduleTable(newSchedule, 'Generated Schedule:')
      )}

      <TextField
        label="Enter your availability"
        variant="outlined"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        fullWidth
        margin="normal"
      />

      <StyledButton
        variant="contained"
        color="primary"
        onClick={handleTest}
        startIcon={<ScheduleIcon />}
      >
        Generate Schedule
      </StyledButton>

      <StyledButton
        variant="contained"
        color="secondary"
        onClick={handleConfirm}
        startIcon={newSchedule ? <CheckCircleIcon /> : <ErrorIcon />}
        disabled={!newSchedule}
      >
        Confirm Schedule
      </StyledButton>

      {message && (
        <Typography color={message.includes('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Container>
  );
};

export default Home;
