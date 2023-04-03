-- DROP TABLE IF EXISTS notification_audit;
-- DROP TABLE IF EXISTS appointment;
-- DROP TABLE IF EXISTS "user";


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointment (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES "user"(email),
  invitee_email TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  end_time TIMESTAMP WITH TIME ZONE, -- calculate end time in application layer, trade off taken to avoid trigger
  appointment_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  notification_event_id UUID,
  isCancelled BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (appointment_id)
);

CREATE TABLE notification_audit (
  id SERIAL PRIMARY KEY,
  appointment_id UUID REFERENCES appointment(appointment_id),
  notification_type VARCHAR(20) DEFAULT 'email' CHECK (notification_type IN ('email', 'sms', 'whatsapp','in-app')),
  notification_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_appointment_user_email ON appointment(user_email);
CREATE INDEX idx_appointment_start_datetime ON appointment(start_datetime);
CREATE INDEX idx_notification_audit_appointment_id ON notification_audit(appointment_id);
