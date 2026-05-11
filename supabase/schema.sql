create table drones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model text not null,
  type text not null default 'military',
  status text not null default 'active',
  serial_number text,
  notes text,
  last_inspection_date date,
  created_at timestamptz not null default now()
);

create table batteries (
  id uuid primary key default gen_random_uuid(),
  drone_model text not null,
  label text not null,
  status text not null default 'charged',
  last_charged_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table pilots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  certifications text[] not null default '{}',
  exam_passed boolean not null default false,
  last_flight_date date,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table procedures (
  id uuid primary key default gen_random_uuid(),
  drone_model text not null,
  procedure_type text not null,
  title text not null,
  steps jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table flights (
  id uuid primary key default gen_random_uuid(),
  drone_id uuid references drones(id),
  pilot_id uuid references pilots(id),
  observer_id uuid references pilots(id),
  flight_date date not null default current_date,
  start_time time,
  end_time time,
  duration_minutes integer,
  area text,
  mission_type text,
  flight_mode text not null default 'normal',
  checklist_completed jsonb not null default '[]',
  notes text,
  issues text,
  created_at timestamptz not null default now()
);
