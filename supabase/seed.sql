-- Seed Departments
INSERT INTO departments (id, name, description) VALUES
  ('47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', 'Web Developer', 'Tim pengembangan web dan aplikasi'),
  ('bb6d4828-4135-4c5a-a469-4899905b980c', 'Dapur', 'Tim dapur dan produksi'),
  ('55921cdd-a752-422c-8f5f-2b056fd03fbd', 'Security', 'Tim keamanan dan pengawasan'),
  ('6a05c05e-0a45-4515-8e01-5f6c9b0b051a', 'HR', 'Tim Human Resources');

-- Seed Shifts
INSERT INTO shifts (id, name, start_time, end_time, late_tolerance_minutes, is_default) VALUES
  ('5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'Shift Pagi', '08:00:00', '17:00:00', 15, true),
  ('4bacfa4e-9fbe-4a99-b927-3c30f7cb3c5f', 'Shift Siang', '14:00:00', '23:00:00', 15, false),
  ('3ca06c9b-05d3-4705-ac9b-0878e1232af7', 'Shift Malam', '22:00:00', '07:00:00', 15, false);

-- Seed Employees (auth_id will be linked later)
INSERT INTO employees (id, nik, name, email, phone, department_id, default_shift_id, role, joined_at, is_active) VALUES
  ('29351ea4-4ceb-4ee2-8121-320d375ea015', '890001', 'Ahmad Fauzi', 'ahmad@alhamra.com', '081234567001', '47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-01-15', true),
  ('6c27da2d-db66-4f78-ae35-4094194a3843', '890002', 'Budi Santoso', 'budi@alhamra.com', '081234567002', '47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-02-20', true),
  ('1e7bb5c9-7655-4742-a1e9-19b44cede184', '890003', 'Citra Lestari', 'citra@alhamra.com', '081234567003', 'bb6d4828-4135-4c5a-a469-4899905b980c', '4bacfa4e-9fbe-4a99-b927-3c30f7cb3c5f', 'employee', '2024-01-10', true),
  ('06c38771-bcab-47d1-a7c8-beed4ae8aacb', '890004', 'Dedi Pratama', 'dedi@alhamra.com', '081234567004', '55921cdd-a752-422c-8f5f-2b056fd03fbd', '3ca06c9b-05d3-4705-ac9b-0878e1232af7', 'employee', '2024-03-01', true),
  ('3a472e82-63da-40e6-9ec5-8926a006773d', '890005', 'Eka Wulandari', 'eka@alhamra.com', '081234567005', '6a05c05e-0a45-4515-8e01-5f6c9b0b051a', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'admin', '2023-06-01', true),
  ('ef7b4ddb-e5ae-429d-916d-2a09e55795a8', '890006', 'Fajar Hidayat', 'fajar@alhamra.com', '081234567006', '47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-04-15', true),
  ('3c2d5693-1209-4941-995f-89328818d048', '890007', 'Gita Ananda', 'gita@alhamra.com', '081234567007', 'bb6d4828-4135-4c5a-a469-4899905b980c', '4bacfa4e-9fbe-4a99-b927-3c30f7cb3c5f', 'employee', '2024-02-01', true),
  ('1615e619-5066-4b97-984c-5d42089a0255', '890008', 'Hadi Wijaya', 'hadi@alhamra.com', '081234567008', '55921cdd-a752-422c-8f5f-2b056fd03fbd', '3ca06c9b-05d3-4705-ac9b-0878e1232af7', 'kiosk_security', '2024-01-20', true),
  ('be76bc15-bb52-44c9-aeab-df5644e60885', '890009', 'Indah Permata', 'indah@alhamra.com', '081234567009', '47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-05-10', true),
  ('e5eae105-6cbe-4ec6-80de-ef5227068570', '890010', 'Joko Suryanto', 'joko@alhamra.com', '081234567010', 'bb6d4828-4135-4c5a-a469-4899905b980c', '4bacfa4e-9fbe-4a99-b927-3c30f7cb3c5f', 'employee', '2024-03-15', true),
  ('7ad9db87-5575-4209-a870-e341ca1d289d', '890011', 'Kartika Sari', 'kartika@alhamra.com', '081234567011', '47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-06-01', true),
  ('1d3fb430-57db-4033-99c4-f082d279e80d', '890012', 'Lukman Hakim', 'lukman@alhamra.com', '081234567012', 'bb6d4828-4135-4c5a-a469-4899905b980c', '4bacfa4e-9fbe-4a99-b927-3c30f7cb3c5f', 'employee', '2024-04-20', true),
  ('46a2865e-cd87-499a-818f-dae37af43d57', '890013', 'Maya Dewi', 'maya@alhamra.com', '081234567013', '55921cdd-a752-422c-8f5f-2b056fd03fbd', '3ca06c9b-05d3-4705-ac9b-0878e1232af7', 'employee', '2024-01-05', false),
  ('0f331b25-54da-4f0c-9d0c-c904b13437ac', '890014', 'Nico Pratomo', 'nico@alhamra.com', '081234567014', '6a05c05e-0a45-4515-8e01-5f6c9b0b051a', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-07-01', true),
  ('83369c1f-8802-4ec6-88fa-f01a18e53f7a', '890015', 'Olivia Putri', 'olivia@alhamra.com', '081234567015', '47a59bbe-70bf-45a9-bf72-cb5d6d18ebba', '5605e4f4-7e41-48ea-a10b-7b35c4f6bd04', 'employee', '2024-05-20', true);

-- Seed Holidays
INSERT INTO holidays (date, name, type) VALUES
  ('2026-06-01', 'Hari Lahir Pancasila', 'national'),
  ('2026-06-08', 'Idul Adha', 'national'),
  ('2026-06-09', 'Cuti Bersama Idul Adha', 'national');

-- Seed Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, created_at) VALUES
  ('ca789332-c47c-4ba4-b402-2de16fc51b7c', 'be76bc15-bb52-44c9-aeab-df5644e60885', 'sakit', '2026-06-13', '2026-06-14', 'Sakit perut', 'pending', '2026-06-12'),
  ('387bdfd8-bbde-47c7-b1a6-c6a859cd4099', '29351ea4-4ceb-4ee2-8121-320d375ea015', 'cuti_tahunan', '2026-06-15', '2026-06-17', 'Liburan keluarga', 'pending', '2026-06-10'),
  ('3c99b44b-e5a8-4715-8f63-692638adab95', '06c38771-bcab-47d1-a7c8-beed4ae8aacb', 'izin', '2026-06-20', '2026-06-20', 'Urusan keluarga', 'pending', '2026-06-11'),
  ('1055a508-2d8a-486b-83cd-cd7cb0368c72', '1e7bb5c9-7655-4742-a1e9-19b44cede184', 'sakit', '2026-06-05', '2026-06-06', 'Demam', 'approved', '2026-06-04');
