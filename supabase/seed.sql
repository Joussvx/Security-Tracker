-- Seed default shifts
insert into public.shifts (id, name, start_time, end_time) values
  ('a', 'A Shift', '06:00', '14:00'),
  ('b', 'B Shift', '14:00', '22:00'),
  ('c', 'C Shift', '22:00', '06:00'),
  ('off', 'Off Duty', null, null)
on conflict (id) do nothing;

-- Optional: seed initial guards (uncomment to use once)
-- insert into public.guards (employee_id, name, default_shift_id) values
--   ('13008','ທ ທີ','a'),
--   ('13912','ທ ເຕືອງ','a'),
--   ('14709','ທ ອໍລະວີ','a');


