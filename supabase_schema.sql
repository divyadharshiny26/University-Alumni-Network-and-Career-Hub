-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'alumni', 'employer', 'admin');
CREATE TYPE event_type AS ENUM ('webinar', 'career_fair', 'networking', 'workshop', 'alumni_meet');
CREATE TYPE rsvp_status AS ENUM ('yes', 'no', 'maybe');
CREATE TYPE job_status AS ENUM ('applied', 'shortlisted', 'rejected', 'hired');
CREATE TYPE employment_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'active', 'completed', 'cancelled');
CREATE TYPE matched_by_type AS ENUM ('ai', 'manual');

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  university VARCHAR NOT NULL,
  graduation_year INTEGER NOT NULL,
  role user_role DEFAULT 'student',
  skills TEXT[],
  avatar TEXT,
  bio TEXT,
  password_hash VARCHAR NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  reset_password_token VARCHAR,
  reset_password_expire TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Endorsements Table
CREATE TABLE endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR NOT NULL,
  endorser_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hash VARCHAR
);

-- Connections
CREATE TABLE connections (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, connected_user_id)
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR,
  type event_type NOT NULL,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  max_attendees INTEGER,
  cert_template TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link VARCHAR,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Attendees
CREATE TABLE event_attendees (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rsvp_status rsvp_status DEFAULT 'yes',
  attended BOOLEAN DEFAULT false,
  cert_generated BOOLEAN DEFAULT false,
  PRIMARY KEY (event_id, user_id)
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  company VARCHAR NOT NULL,
  company_logo TEXT,
  description TEXT NOT NULL,
  requirements TEXT[],
  skills_required TEXT[],
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency VARCHAR DEFAULT 'USD',
  location VARCHAR DEFAULT 'Remote',
  employment_type employment_type DEFAULT 'Full-time',
  posted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applicants
CREATE TABLE job_applicants (
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status job_status DEFAULT 'applied',
  PRIMARY KEY (job_id, user_id)
);

-- Mentorships
CREATE TABLE mentorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status mentorship_status DEFAULT 'pending',
  goals TEXT[],
  skill_focus TEXT[],
  matched_by matched_by_type DEFAULT 'ai',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship Sessions
CREATE TABLE mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentorship_id UUID REFERENCES mentorships(id) ON DELETE CASCADE,
  title VARCHAR,
  date TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  notes TEXT,
  recording_url TEXT,
  room_id TEXT
);
