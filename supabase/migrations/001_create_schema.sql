-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  late_tolerance_minutes INT NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees (linked to Supabase Auth)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nik TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  default_shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'kiosk_security')),
  avatar_url TEXT,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('cuti_tahunan', 'sakit', 'izin')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Logs
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status_in TEXT CHECK (status_in IN ('tepat_waktu', 'terlambat')),
  anomaly_flag TEXT CHECK (anomaly_flag IN ('lupa_checkout', 'sistem_auto_close')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Roster
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Admin Activities
CREATE TABLE admin_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('scan', 'approval', 'leave_request', 'employee_update', 'login', 'logout')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan Records (for kiosk audit trail)
CREATE TABLE scan_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  kiosk_id TEXT NOT NULL DEFAULT 'kiosk-1',
  scanned_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('tepat_waktu', 'terlambat', 'expired', 'error')),
  type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out')),
  qr_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holidays
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'national' CHECK (type IN ('national', 'company')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attendance_employee_date ON attendance_logs(employee_id, date);
CREATE INDEX idx_roster_employee_date ON rosters(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_notifications_employee ON notifications(employee_id);
CREATE INDEX idx_scan_records_scanned_at ON scan_records(scanned_at);
CREATE INDEX idx_admin_activities_created_at ON admin_activities(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rosters_updated_at BEFORE UPDATE ON rosters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Helper function to get current employee role
CREATE OR REPLACE FUNCTION get_current_employee_role()
RETURNS TEXT AS $$
  SELECT role FROM employees WHERE auth_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get current employee id
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
  SELECT id FROM employees WHERE auth_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- DEPARTMENTS: Everyone can read, only admin can write
CREATE POLICY "departments_read_all" ON departments
  FOR SELECT USING (true);
CREATE POLICY "departments_admin_only" ON departments
  FOR ALL USING (get_current_employee_role() = 'admin');

-- SHIFTS: Everyone can read, only admin can write
CREATE POLICY "shifts_read_all" ON shifts
  FOR SELECT USING (true);
CREATE POLICY "shifts_admin_only" ON shifts
  FOR ALL USING (get_current_employee_role() = 'admin');

-- EMPLOYEES: Admin sees all, employees see only themselves
CREATE POLICY "employees_admin_all" ON employees
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "employees_self_read" ON employees
  FOR SELECT USING (auth_id = auth.uid());
CREATE POLICY "employees_self_update" ON employees
  FOR UPDATE USING (auth_id = auth.uid());

-- LEAVE REQUESTS: Admin sees all, employees see their own
CREATE POLICY "leaves_admin_all" ON leave_requests
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "leaves_self_all" ON leave_requests
  FOR ALL USING (employee_id = get_current_employee_id());

-- ATTENDANCE LOGS: Admin sees all, employees see their own
CREATE POLICY "attendance_admin_all" ON attendance_logs
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "attendance_self_read" ON attendance_logs
  FOR SELECT USING (employee_id = get_current_employee_id());

-- ROSTERS: Admin sees all, employees see their own
CREATE POLICY "rosters_admin_all" ON rosters
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "rosters_self_read" ON rosters
  FOR SELECT USING (employee_id = get_current_employee_id());

-- ADMIN ACTIVITIES: Admin sees all, employees see nothing
CREATE POLICY "activities_admin_all" ON admin_activities
  FOR ALL USING (get_current_employee_role() = 'admin');

-- NOTIFICATIONS: Users see their own
CREATE POLICY "notifications_self" ON notifications
  FOR ALL USING (employee_id = get_current_employee_id());

-- SCAN RECORDS: Admin and kiosk_security see all
CREATE POLICY "scan_records_admin_all" ON scan_records
  FOR ALL USING (get_current_employee_role() IN ('admin', 'kiosk_security'));
CREATE POLICY "scan_records_self_read" ON scan_records
  FOR SELECT USING (employee_id = get_current_employee_id());

-- HOLIDAYS: Everyone can read
CREATE POLICY "holidays_read_all" ON holidays
  FOR SELECT USING (true);
CREATE POLICY "holidays_admin_only" ON holidays
  FOR ALL USING (get_current_employee_role() = 'admin');
