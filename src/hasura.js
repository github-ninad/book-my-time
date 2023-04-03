const nodefetch = require("node-fetch")
const moment = require('moment');
const HASURASECRET = "i60TrY3974a4zCkVvXhgwAT1MTad2f5N0SSgERnDluFsFq3923PCeEML2IA7DRY6"

// execute the parent operation in Hasura
const execute = async (query, variables, req) => {
          const fetchResponse = await nodefetch(
            "https://touching-herring-78.hasura.app/v1/graphql",
            {
              method: 'POST',
              headers: {
                "x-hasura-admin-secret": HASURASECRET,
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Host": "touching-herring-78.hasura.app",
                "Accept-Encoding": "gzip, deflate, br",
              },
              body: JSON.stringify({
                query: query,
                variables
              })
            }
          );
          const data = await fetchResponse.json();
          console.log('DEBUG: ', data);
          return data;
        };
        
        const setReminder = async (start_datetime, appointment_id) => {
          const fetchResponse = await nodefetch(
            "https://touching-herring-78.hasura.app/v1/metadata",
            {
              method: 'POST',
              headers: {
                "x-hasura-admin-secret": HASURASECRET,
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Host": "touching-herring-78.hasura.app",
                "Accept-Encoding": "gzip, deflate, br",
                "X-Hasura-Role": "admin"
              },
              body: JSON.stringify({
                "type": "create_scheduled_event",
                "args": {
                  "webhook": "https://touching-herring-78.hasura.app/api/rest/log-notification-internal",
                  "schedule_at": moment(start_datetime).subtract(3, 'hours'),
                  "headers": [
                    {
                      "name": "Content-Type",
                      "value": "application/json"
                    },
                    {
                      "name": "x-hasura-admin-secret",
                      "value": HASURASECRET
                    }
                  ],
                  "payload": {
                    "appointment_id": appointment_id,
                    "notification_content": "You have an appointment scheduled in next 3hrs! Be ready and all the best!",
                    "notification_type": "email"
                  }
                }
              })
            }
          );
          const data = await fetchResponse.json();
          console.log('DEBUG: ', data);
          return data;
        };
        
        const cancelReminder = async (event_id) => {
          const fetchResponse = await nodefetch(
            "https://touching-herring-78.hasura.app/v1/metadata",
            {
              method: 'POST',
              headers: {
                "x-hasura-admin-secret": HASURASECRET,
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Host": "touching-herring-78.hasura.app",
                "Accept-Encoding": "gzip, deflate, br",
                "X-Hasura-Role": "admin"
              },
              body: JSON.stringify({
                "type": "delete_scheduled_event",
                "args": {
                  "type": "one_off",
                  "event_id": event_id,
                  "headers": [
                    {
                      "name": "Content-Type",
                      "value": "application/json"
                    },
                    {
                      "name": "x-hasura-admin-secret",
                      "value": HASURASECRET
                    }
                  ]
                }
              })
            }
          );
          const data = await fetchResponse.json();
          console.log('DEBUG: ', data);
          return data;
        };
        
        const updateEventID = async (event_id, appointment_id) => {
          const fetchResponse = await nodefetch(
            "https://touching-herring-78.hasura.app/api/rest/update-eventId",
            {
              method: 'POST',
              headers: {
                "x-hasura-admin-secret": HASURASECRET,
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Host": "touching-herring-78.hasura.app",
                "Accept-Encoding": "gzip, deflate, br",
                "X-Hasura-Role": "admin"
              },
              body: JSON.stringify({ "_eq": appointment_id, 
              "notification_event_id": event_id })
            }
          );
          const data = await fetchResponse.json();
          console.log('DEBUG: ', data);
          return data;
        };

module.exports = {
          execute, setReminder, cancelReminder, updateEventID
};