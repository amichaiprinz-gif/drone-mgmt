insert into drones (name, model, type, status) values
  ('avata 1', 'avata', 'military', 'active'),
  ('avata 2', 'avata', 'military', 'active'),
  ('ivo', 'ivo', 'military', 'active'),
  ('Mavic 3 Pro', 'mavic3pro', 'civilian', 'active'),
  ('Air 3', 'air3', 'civilian', 'active'),
  ('Mini 4 ian', 'mini4', 'civilian', 'active'),
  ('Mini 4 yuval', 'mini4', 'civilian', 'active');

insert into batteries (drone_model, label, status) values
  ('avata', 'AV-01', 'charged'),
  ('avata', 'AV-02', 'charged'),
  ('avata', 'AV-03', 'charged'),
  ('avata', 'AV-04', 'charged'),
  ('avata', 'AV-05', 'charged'),
  ('avata', 'AV-06', 'charged'),
  ('ivo', 'IV-01', 'charged'),
  ('ivo', 'IV-02', 'charged'),
  ('ivo', 'IV-03', 'charged'),
  ('ivo', 'IV-04', 'charged');

insert into pilots (name, role, certifications, exam_passed, is_active) values
  ('Amichai Prinz', 'drone commander', '{"avata"}', true, true),
  ('Ian Schwartz', 'pilot', '{"avata","ivo"}', true, true),
  ('Zeev Kanger', 'pilot', '{"ivo","matrice30"}', true, true),
  ('Ziv Meir', 'pilot', '{"matrice30"}', true, true),
  ('Chananel Trombka', 'pilot', '{"ivo"}', false, true),
  ('Oren Barel', 'pilot', '{"ivo"}', false, true);

insert into procedures (drone_model, procedure_type, title, steps) values
(
  'avata',
  'preflight_normal',
  'Avata - pre-flight normal',
  '[
    {"order":1,"category":"coordination","text":"Commander approval received"},
    {"order":2,"category":"coordination","text":"HQ updated - who flies, area, time"},
    {"order":3,"category":"weather","text":"Wind below 8 m/s"},
    {"order":4,"category":"drone","text":"4 propellers intact, no cracks"},
    {"order":5,"category":"drone","text":"Frame intact, bumpers complete"},
    {"order":6,"category":"drone","text":"Camera clean and in place"},
    {"order":7,"category":"drone","text":"Battery connected, above 80%"},
    {"order":8,"category":"controller","text":"Goggles charged, screen on"},
    {"order":9,"category":"controller","text":"Remote charged, buttons working"},
    {"order":10,"category":"startup","text":"Power on: remote first, then drone"},
    {"order":11,"category":"settings","text":"GPS Lock - at least 6 satellites"},
    {"order":12,"category":"settings","text":"Home Point confirmed"},
    {"order":13,"category":"settings","text":"RTH Altitude set (50m open / 80m urban)"},
    {"order":14,"category":"settings","text":"Flight mode: N (Normal)"},
    {"order":15,"category":"crew","text":"Pilot ready, observer ready, area announced"}
  ]'::jsonb
),
(
  'avata',
  'preflight_emergency',
  'Avata - emergency pre-flight (60 sec)',
  '[
    {"order":1,"category":"stop if no","text":"4 propellers intact"},
    {"order":2,"category":"stop if no","text":"Battery above 40%"},
    {"order":3,"category":"stop if no","text":"Goggles receiving video"},
    {"order":4,"category":"stop if no","text":"GPS Lock and RTH set"},
    {"order":5,"category":"stop if no","text":"Observer present"},
    {"order":6,"category":"coordination","text":"HQ notified - at least one sentence"}
  ]'::jsonb
),
(
  'ivo',
  'preflight_normal',
  'IVO - pre-flight normal',
  '[
    {"order":1,"category":"coordination","text":"Commander approval received"},
    {"order":2,"category":"coordination","text":"HQ updated - pilot, area, range"},
    {"order":3,"category":"planning","text":"Flight route planned and approved"},
    {"order":4,"category":"drone","text":"Arms assembled and locked - click on each"},
    {"order":5,"category":"drone","text":"Landing legs extended and stable"},
    {"order":6,"category":"drone","text":"4 propellers intact, correct rotation direction"},
    {"order":7,"category":"drone","text":"Gimbal and camera - free movement, clean lens"},
    {"order":8,"category":"drone","text":"Battery connected, above 80%"},
    {"order":9,"category":"controller","text":"Remote open, screen connected"},
    {"order":10,"category":"controller","text":"Antennas extended toward flight direction"},
    {"order":11,"category":"startup","text":"Power on: remote first, then drone"},
    {"order":12,"category":"settings","text":"GPS Lock - at least 8 satellites"},
    {"order":13,"category":"settings","text":"Calibrate Compass if moved more than 10km"},
    {"order":14,"category":"settings","text":"RTH Altitude set - minimum 80m"},
    {"order":15,"category":"settings","text":"Home Point confirmed"},
    {"order":16,"category":"crew","text":"Pilot ready, observer ready, HQ updated"}
  ]'::jsonb
),
(
  'ivo',
  'preflight_emergency',
  'IVO - emergency pre-flight (90 sec)',
  '[
    {"order":1,"category":"stop if no","text":"Arms locked, landing legs extended"},
    {"order":2,"category":"stop if no","text":"Propellers intact"},
    {"order":3,"category":"stop if no","text":"Battery above 40%"},
    {"order":4,"category":"stop if no","text":"GPS Lock - at least 6 satellites"},
    {"order":5,"category":"stop if no","text":"RTH set to safe altitude"},
    {"order":6,"category":"stop if no","text":"Remote and screen working"},
    {"order":7,"category":"stop if no","text":"Observer present"},
    {"order":8,"category":"coordination","text":"HQ notified - going up now"}
  ]'::jsonb
);
