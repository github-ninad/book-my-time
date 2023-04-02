const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const fetch = require("node-fetch")
const app = express();
const PORT = process.env.PORT || 8000;

//Middleware
app.use(bodyParser.json());
const morganlogger = morgan('combined');
app.use(morganlogger);


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

// execute the parent operation in Hasura
const Schedule_Appointment_Internal_execute = async (variables, req) => {
  const fetchResponse = await fetch(
    "https://touching-herring-78.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({
        query: Schedule_Appointment_Internal_HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};


// Request Handler
app.post('/Schedule_Appointment', async (req, res) => {

  // get request input
  const { scheduleInput } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await Schedule_Appointment_Internal_execute({ scheduleInput }, req);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_user_one
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

// execute the parent operation in Hasura
const CancelAppointmentInternal_execute = async (variables, req) => {
  const fetchResponse = await fetch(
    "https://touching-herring-78.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({
        query: CancelAppointmentInternal_HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};
  

// Request Handler
app.post('/Cancel_Appointment', async (req, res) => {

  // get request input
  const { appointmentId } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await CancelAppointmentInternal_execute({ appointmentId }, req);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.update_appointment
  })

});

app.listen(PORT);
