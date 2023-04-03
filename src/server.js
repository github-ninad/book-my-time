const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const nodefetch = require("node-fetch")
const https = require('https');
const moment = require('moment');
const hasura = require('./hasura')
const app = express();
const PORT = process.env.PORT || 8000;

//Middleware
app.use(bodyParser.json());
const morganlogger = morgan('combined');
app.use(morganlogger);
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

//Endpoints

app.get('/hello', async (req, res) => {
  return res.json({
    hello: "world"
  });
});

/**
 * Schedule Appointment
 */
const Schedule_Appointment_Internal_HASURA_OPERATION = `
mutation Schedule_Appointment_Internal($email: String!, $name: String!, $start_datetime: timestamptz!) {
  insert_user_one(object: {name: $name, email: $email}, on_conflict: {constraint: user_email_key, update_columns: [name, created_at]}) {
    id
    name
    email
  }
  insert_appointment_one(object: {user_email: $email, start_datetime: $start_datetime, duration_minutes: 30}) {
    appointment_id
  }
}
`;


// Request Handler
app.post('/Schedule_Appointment', async (req, res) => {

  // get request input
  const variables = req.body.input;

  // execute the Hasura operation
  const { data, errors } = await hasura.execute(Schedule_Appointment_Internal_HASURA_OPERATION, variables, req);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  } else {
    // Add async scheduled email reminder
    hasura.setReminder(req.start_datetime, data.insert_appointment_one.appointment_id).then(({ event_id, message }) => {
      console.info(message)
      // Update Event ID
      hasura.updateEventID(event_id, data.insert_appointment_one.appointment_id).then(e => console.log(`EventId Attached to appointment`, e), error => console.error(error));
    })
  }

  // success
  return res.json({
    ...data.insert_appointment_one
  })

});


/**
 * Cancel Appointment
 * 
 */
const CancelAppointmentInternal_HASURA_OPERATION = `
mutation CancelAppointmentInternal($appointmentId: uuid!) {
  update_appointment(_set: {iscancelled: true}, where: {appointment_id: {_eq: $appointmentId}}) {
    affected_rows
    returning {
      start_datetime
      user_email
      iscancelled
    }
  }
}
`;

// Request Handler
app.post('/Cancel_Appointment', async (req, res) => {

  // get request input
  const { appointmentId } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await hasura.execute(CancelAppointmentInternal_HASURA_OPERATION, { appointmentId }, req);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  } else {
    hasura.cancelReminder(data.update_appointment.returning.find(e => e).event_id)
  }

  // success
  return res.json({
    ...data.update_appointment
  })

});

app.listen(PORT);
