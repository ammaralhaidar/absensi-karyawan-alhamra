# 🔄 Migration Guide: Next.js+Supabase → Odoo 16

> **Panduan lengkap untuk developer Odoo yang akan melakukan migrasi aplikasi Alhamra Attendance dari arsitektur Next.js + Supabase ke Odoo 16.**

---

## 📋 Daftar Isi

1. [Overview Migrasi](#overview-migrasi)
2. [Arsitektur: Asal vs Tujuan](#arsitektur-asal-vs-tujuan)
3. [Mapping Database: Supabase → Odoo](#mapping-database)
4. [Mapping Business Logic](#mapping-business-logic)
5. [Mapping Frontend](#mapping-frontend)
6. [Modul Odoo yang Perlu Dibuat](#modul-odoo-yang-perlu-dibuat)
7. [Step-by-Step Migrasi](#step-by-step-migrasi)
8. [Panduan QR Code di Odoo](#panduan-qr-code-di-odoo)
9. [Panduan Offline-First di Odoo](#panduan-offline-first-di-odoo)
10. [Panduan PWA di Odoo](#panduan-pwa-di-odoo)
11. [Data Migration Strategy](#data-migration-strategy)
12. [Tips & Catatan Penting](#tips--catatan-penting)
13. [Troubleshooting Migrasi](#troubleshooting-migrasi)

---

## 🎯 Overview Migrasi

### Aplikasi Asal
- **Frontend**: Next.js 16 (React 19) + Tailwind CSS 4 + shadcn/ui
- **Backend**: Supabase Cloud (PostgreSQL + Auth + Edge Functions)
- **Database**: PostgreSQL (10 tabel)
- **Auth**: Supabase Auth (JWT) + Role-based access
- **Offline**: IndexedDB + Service Worker
- **QR**: JWT-based QR (30s expiry)
- **PWA**: Manifest.json + standalone display

### Target: Odoo 16
- **Framework**: Odoo 16 (Python 3.8+ + PostgreSQL)
- **Frontend**: Odoo Web Framework (OWL) + QWeb Templates
- **Backend**: Odoo ORM + Server Actions
- **Auth**: Odoo built-in (res.users + res.partner)
- **Mobile**: Odoo Mobile Web atau PWA custom
- **QR**: Custom controller/route + Odoo ORM

---

## 🏗️ Arsitektur: Asal vs Tujuan

### Asal (Next.js + Supabase)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js    │────▶│ API Routes  │────▶│  Supabase   │
│  (React)    │     │ (Next.js)   │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │ Edge Functions│
                    │ (Deno/TS)     │
                    └─────────────┘
```

### Tujuan (Odoo 16)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Odoo Web    │────▶│ Controllers │────▶│ Odoo ORM    │
│ (OWL + QWeb)│     │ (Python)    │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │ Server Actions│
                    │ (Python)      │
                    └─────────────┘
```

---

## 🗄️ Mapping Database

### 1. Tabel → Odoo Model

| Supabase Table | Odoo Model | Keterangan |
|----------------|------------|------------|
| `employees` | `hr.employee` | Odoo sudah punya HR module |
| `departments` | `hr.department` | Odoo sudah punya |
| `shifts` | Custom: `alhamra.shift` | Perlu model baru |
| `attendance_logs` | `hr.attendance` | Odoo sudah punya, perlu extend |
| `leave_requests` | `hr.leave` | Odoo sudah punya, perlu extend |
| `rosters` | Custom: `alhamra.roster` | Perlu model baru |
| `admin_activities` | `mail.activity` atau custom | Odoo punya mail.activity |
| `notifications` | `mail.notification` | Odoo punya mail module |
| `scan_records` | Custom: `alhamra.scan.record` | Perlu model baru |
| `holidays` | `resource.calendar.leaves` | Odoo sudah punya |

### 2. Fields Mapping

#### employees → hr.employee

```python
# Odoo 16: hr.employee sudah ada, tambahkan field custom:

class HrEmployee(models.Model):
    _inherit = 'hr.employee'
    
    # Mapping dari Supabase:
    nik = fields.Char(string='NIK', required=True)                    # ← Supabase: nik
    # name = fields.Char (sudah ada)                                   # ← Supabase: name
    # department_id = fields.Many2one (sudah ada)                      # ← Supabase: department_id
    default_shift_id = fields.Many2one('alhamra.shift')               # ← Supabase: default_shift_id
    role = fields.Selection([                                         # ← Supabase: role
        ('employee', 'Karyawan'),
        ('admin', 'Admin'),
        ('kiosk_security', 'Kiosk Security')
    ], default='employee')
    # phone = fields.Char (sudah ada)                                 # ← Supabase: phone
    # email = fields.Char (sudah ada)                                 # ← Supabase: email
    # joined_at = fields.Date (sudah ada: create_date)                 # ← Supabase: joined_at
    is_active = fields.Boolean(default=True)                          # ← Supabase: is_active
    # avatar_url = fields.Char (sudah ada: image_128)                 # ← Supabase: avatar_url
    # auth_id = fields.Char (TIDAK PERLU, Odoo pakai res.users)       # ← Supabase: auth_id
```

#### shifts → alhamra.shift

```python
# Buat model baru:

class AlhamraShift(models.Model):
    _name = 'alhamra.shift'
    _description = 'Shift Kerja Alhamra'
    
    name = fields.Char(required=True)                                 # ← Supabase: name
    start_time = fields.Float(required=True)                          # ← Supabase: start_time (float: 6.0 = 06:00)
    end_time = fields.Float(required=True)                            # ← Supabase: end_time
    late_tolerance_minutes = fields.Integer(default=0)                # ← Supabase: late_tolerance_minutes
    is_default = fields.Boolean(default=False)                        # ← Supabase: is_default
```

#### attendance_logs → hr.attendance (extend)

```python
# Odoo sudah punya hr.attendance, extend:

class HrAttendance(models.Model):
    _inherit = 'hr.attendance'
    
    # Mapping dari Supabase:
    # employee_id = fields.Many2one (sudah ada)                      # ← Supabase: employee_id
    # check_in = fields.Datetime (sudah ada)                          # ← Supabase: check_in
    # check_out = fields.Datetime (sudah ada)                         # ← Supabase: check_out
    date = fields.Date()                                              # ← Supabase: date
    shift_id = fields.Many2one('alhamra.shift')                       # ← Supabase: shift_id
    status_in = fields.Selection([                                    # ← Supabase: status_in
        ('tepat_waktu', 'Tepat Waktu'),
        ('terlambat', 'Terlambat')
    ])
    anomaly_flag = fields.Selection([                               # ← Supabase: anomaly_flag
        ('lupa_checkout', 'Lupa Check-out'),
        ('sistem_auto_close', 'Sistem Auto Close')
    ])
    # Note: Odoo hr.attendance tidak punya check_in/check_out di v16,
    # tapi check_in dan check_out sudah ada di v16.
```

#### leave_requests → hr.leave (extend)

```python
# Odoo sudah punya hr.leave, extend:

class HrLeave(models.Model):
    _inherit = 'hr.leave'
    
    # Mapping dari Supabase:
    # employee_id = fields.Many2one (sudah ada)                        # ← Supabase: employee_id
    leave_type = fields.Selection([                                   # ← Supabase: leave_type
        ('cuti_tahunan', 'Cuti Tahunan'),
        ('sakit', 'Sakit'),
        ('izin', 'Izin')
    ])
    # date_from = fields.Date (sudah ada)                             # ← Supabase: start_date
    # date_to = fields.Date (sudah ada)                               # ← Supabase: end_date
    reason = fields.Text()                                            # ← Supabase: reason
    attachment_url = fields.Char()                                    # ← Supabase: attachment_url
    # state = fields.Selection (sudah ada)                           # ← Supabase: status
    # ('confirm', 'draft', 'validate', 'refuse') → mapping ke pending/approved/rejected
```

#### scan_records → alhamra.scan.record

```python
class AlhamraScanRecord(models.Model):
    _name = 'alhamra.scan.record'
    _description = 'Scan Record'
    _order = 'scanned_at desc'
    
    employee_id = fields.Many2one('hr.employee')                      # ← Supabase: employee_id
    employee_name = fields.Char()                                     # ← Supabase: employee_name
    kiosk_id = fields.Char(default='kiosk-1')                         # ← Supabase: kiosk_id
    scanned_at = fields.Datetime()                                    # ← Supabase: scanned_at
    status = fields.Selection([                                       # ← Supabase: status
        ('tepat_waktu', 'Tepat Waktu'),
        ('terlambat', 'Terlambat'),
        ('expired', 'Expired'),
        ('error', 'Error')
    ])
    type = fields.Selection([                                         # ← Supabase: type
        ('check_in', 'Check In'),
        ('check_out', 'Check Out')
    ])
    qr_token = fields.Char()                                          # ← Supabase: qr_token
```

#### rosters → alhamra.roster

```python
class AlhamraRoster(models.Model):
    _name = 'alhamra.roster'
    _description = 'Jadwal Shift'
    
    employee_id = fields.Many2one('hr.employee', required=True)       # ← Supabase: employee_id
    date = fields.Date(required=True)                                 # ← Supabase: date
    shift_id = fields.Many2one('alhamra.shift', required=True)        # ← Supabase: shift_id
    
    _sql_constraints = [
        ('unique_employee_date', 'unique(employee_id, date)', 
         'Jadwal untuk karyawan dan tanggal ini sudah ada!')
    ]
```

### 3. Security: RLS → Odoo Record Rules

```python
# Odoo menggunakan record rules (ir.rule):

# Employee: Hanya lihat data sendiri
<record id="rule_attendance_employee" model="ir.rule">
    <field name="name">Attendance: Employee sees own</field>
    <field name="model_id" ref="model_hr_attendance"/>
    <field name="domain_force">[('employee_id.user_id', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>

# Admin: Lihat semua
<record id="rule_attendance_admin" model="ir.rule">
    <field name="name">Attendance: Admin sees all</field>
    <field name="model_id" ref="model_hr_attendance"/>
    <field name="domain_force">[(1, '=', 1)]</field>
    <field name="groups" eval="[(4, ref('alhamra.group_admin'))]"/>
</record>

# Kiosk: Lihat scan records
<record id="rule_scan_kiosk" model="ir.rule">
    <field name="name">Scan: Kiosk sees all</field>
    <field name="model_id" ref="model_alhamra_scan_record"/>
    <field name="domain_force">[(1, '=', 1)]</field>
    <field name="groups" eval="[(4, ref('alhamra.group_kiosk'))]"/>
</record>
```

---

## 🔄 Mapping Business Logic

### 1. QR Code Generation (Next.js API → Odoo Controller)

#### Asal (Next.js)
```typescript
// /api/qr-generate/route.ts
export async function POST(request: Request) {
  // 1. Verify auth
  // 2. Get employee_id from token
  // 3. Generate JWT with 30s expiry
  // 4. Return token
}
```

#### Tujuan (Odoo Controller)
```python
# controllers/qr_controller.py
from odoo import http
from odoo.http import request
import jwt
import time

class QRController(http.Controller):
    
    @http.route('/alhamra/qr/generate', type='json', auth='user')
    def generate_qr(self):
        # 1. Get current employee
        employee = request.env['hr.employee'].search([
            ('user_id', '=', request.uid)
        ], limit=1)
        
        if not employee:
            return {'error': 'Employee not found'}
        
        # 2. Generate JWT
        secret = request.env['ir.config_parameter'].get_param('alhamra.jwt_secret')
        payload = {
            'employee_id': employee.id,
            'name': employee.name,
            'iat': time.time(),
            'exp': time.time() + 30  # 30 seconds
        }
        token = jwt.encode(payload, secret, algorithm='HS256')
        
        return {'success': True, 'token': token}
```

### 2. QR Code Validation (Next.js API → Odoo Controller)

#### Asal (Next.js)
```typescript
// /api/qr-validate/route.ts
export async function POST(request: Request) {
  // 1. Decode JWT
  // 2. Check expiry
  // 3. Check if already checked in today
  // 4. Determine check-in or check-out
  // 5. Record attendance
  // 6. Return feedback
}
```

#### Tujuan (Odoo Controller)
```python
# controllers/qr_controller.py

@http.route('/alhamra/qr/validate', type='json', auth='user', methods=['POST'])
def validate_qr(self, token, kiosk_id='kiosk-1'):
    try:
        # 1. Decode JWT
        secret = request.env['ir.config_parameter'].get_param('alhamra.jwt_secret')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        # 2. Check expiry
        if payload['exp'] < time.time():
            return {'success': False, 'error': 'QR Code expired'}
        
        employee_id = payload['employee_id']
        employee = request.env['hr.employee'].browse(employee_id)
        
        # 3. Check if already checked in today
        today = fields.Date.today()
        attendance = request.env['hr.attendance'].search([
            ('employee_id', '=', employee_id),
            ('date', '=', today)
        ], limit=1)
        
        # 4. Determine check-in or check-out
        if not attendance:
            # Check-in
            attendance = request.env['hr.attendance'].create({
                'employee_id': employee_id,
                'date': today,
                'check_in': fields.Datetime.now(),
                'status_in': self._calculate_status(employee, 'check_in')
            })
            action_type = 'check_in'
        elif not attendance.check_out:
            # Check-out
            attendance.write({
                'check_out': fields.Datetime.now()
            })
            action_type = 'check_out'
        else:
            return {'success': False, 'error': 'Already checked out'}
        
        # 5. Record scan
        request.env['alhamra.scan.record'].create({
            'employee_id': employee_id,
            'employee_name': employee.name,
            'kiosk_id': kiosk_id,
            'scanned_at': fields.Datetime.now(),
            'status': 'tepat_waktu',  # Calculate based on shift
            'type': action_type,
            'qr_token': token
        })
        
        return {
            'success': True,
            'employee_name': employee.name,
            'type': action_type,
            'status': 'tepat_waktu'
        }
        
    except jwt.ExpiredSignatureError:
        return {'success': False, 'error': 'QR Code expired'}
    except Exception as e:
        return {'success': False, 'error': str(e)}
```

### 3. Export Excel (Next.js API → Odoo Controller)

#### Asal (Next.js)
```typescript
// /api/export-excel/route.ts
// Uses xlsx library to generate 2-sheet Excel
```

#### Tujuan (Odoo Controller)
```python
# controllers/export_controller.py
from odoo import http
from odoo.http import request
import xlsxwriter  # Odoo sudah include
import io

class ExportController(http.Controller):
    
    @http.route('/alhamra/export/excel', type='http', auth='user')
    def export_excel(self, month, year):
        # 1. Get data
        attendances = request.env['hr.attendance'].search([
            ('date', '>=', f'{year}-{month}-01'),
            ('date', '<=', f'{year}-{month}-31')
        ])
        
        # 2. Create Excel
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        
        # Sheet 1: Rekapitulasi
        sheet1 = workbook.add_worksheet('Rekapitulasi')
        # ... write data
        
        # Sheet 2: Log Kronologis
        sheet2 = workbook.add_worksheet('Log Kronologis')
        # ... write data
        
        workbook.close()
        
        # 3. Return file
        response = request.make_response(
            output.getvalue(),
            headers=[
                ('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
                ('Content-Disposition', f'attachment; filename=absensi_{month}_{year}.xlsx')
            ]
        )
        return response
```

### 4. Auto-Flagging (Supabase Cron → Odoo Scheduled Action)

#### Asal (Supabase Edge Function)
```typescript
// supabase/functions/auto-flag/index.ts
// Runs daily at 00:00
// Checks attendance_logs where check_out is null
// Sets anomaly_flag = 'lupa_checkout'
```

#### Tujuan (Odoo Scheduled Action)
```xml
<!-- data/ir_cron.xml -->
<record id="ir_cron_auto_flag" model="ir.cron">
    <field name="name">Auto Flag: Lupa Check-out</field>
    <field name="model_id" ref="model_hr_attendance"/>
    <field name="state">code</field>
    <field name="code">
model.search([
    ('date', '=', (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')),
    ('check_in', '!=', False),
    ('check_out', '=', False),
    ('anomaly_flag', '=', False)
]).write({'anomaly_flag': 'lupa_checkout'})
    </field>
    <field name="interval_number">1</field>
    <field name="interval_type">days</field>
    <field name="nextcall">2026-01-01 00:00:00</field>
</record>
```

### 5. Notifications (Supabase Realtime → Odoo Bus/Discuss)

#### Asal (Supabase Realtime)
```typescript
// Subscribe to notifications table
supabase.channel('notifications').on('postgres_changes', ...)
```

#### Tujuan (Odoo Bus)
```python
# Odoo menggunakan bus.bus untuk real-time notifications:

# 1. Send notification
self.env['bus.bus']._sendone(
    self.env.user.partner_id,
    'alhamra/notification',
    {
        'title': 'Pengajuan Disetujui',
        'message': 'Cuti Anda telah disetujui',
        'type': 'success'
    }
)

# 2. Frontend (OWL) listen:
// Listen to bus notifications
this.env.services['bus_service'].addChannel('alhamra/notification');
this.env.services['bus_service'].addEventListener('notification', (notif) => {
    // Show toast/notification
});
```

---

## 🎨 Mapping Frontend

### 1. Component Mapping

| Next.js Component | Odoo Equivalent | Keterangan |
|-------------------|-----------------|------------|
| React Page | Form View / Tree View | Gunakan Odoo views |
| Dashboard | Dashboard View | Odoo v16 punya dashboard |
| QRCodeDisplay | Custom Widget | Buat widget QR di form view |
| QRScanner | Custom Controller | Buka camera via controller |
| DataTable | Tree View | Gunakan Odoo tree view |
| Modal/Dialog | Form Dialog | Odoo form view dengan popup |
| Toast (Sonner) | Notification Service | Odoo notification service |
| Charts | Graph View | Odoo graph view |
| Calendar | Calendar View | Odoo calendar view |

### 2. Route Mapping

| Next.js Route | Odoo Menu/Action | Keterangan |
|---------------|------------------|------------|
| `/` | Dashboard action | Root menu |
| `/dashboard` | Employee Dashboard | Form view karyawan |
| `/login` | `/web/login` | Odoo built-in login |
| `/admin` | Admin Dashboard | Custom dashboard |
| `/admin/employees` | `hr.employee` tree view | HR menu |
| `/admin/departments` | `hr.department` tree view | HR menu |
| `/kiosk` | Custom Controller | QR scanner page |
| `/leaves` | `hr.leave` form view | Time Off menu |

### 3. State Management

| Next.js | Odoo |
|---------|------|
| React Context | OWL Reactive State |
| useState | useState (OWL) |
| useEffect | onWillStart, onMounted (OWL) |
| SWR/React Query | Odoo ORM read/search |
| Redux/Zustand | Odoo Store (env.services) |

### 4. Styling

| Next.js | Odoo |
|---------|------|
| Tailwind CSS | Odoo SCSS/CSS |
| shadcn/ui | Odoo Components (OWL) |
| CSS Modules | asset bundle |
| Inline styles | style attribute |

---

## 📦 Modul Odoo yang Perlu Dibuat

### Struktur Modul

```
alhamra_attendance/
├── __init__.py
├── __manifest__.py
├── data/
│   ├── ir_cron.xml               # Scheduled actions
│   ├── ir_sequence.xml           # Sequence
│   └── mail_template.xml         # Email templates
├── models/
│   ├── __init__.py
│   ├── hr_employee.py            # Extend hr.employee
│   ├── hr_attendance.py          # Extend hr.attendance
│   ├── hr_leave.py               # Extend hr.leave
│   ├── alhamra_shift.py          # Shift model
│   ├── alhamra_roster.py         # Roster model
│   ├── alhamra_scan_record.py    # Scan record model
│   └── alhamra_department.py     # Extend hr.department
├── controllers/
│   ├── __init__.py
│   ├── qr_controller.py          # QR generate/validate
│   ├── export_controller.py      # Export Excel
│   └── main_controller.py        # Main routes
├── security/
│   ├── ir.model.access.csv        # Access rights
│   ├── ir.rule.xml               # Record rules
│   └── alhamra_groups.xml        # Custom groups
├── views/
│   ├── hr_employee_views.xml
│   ├── hr_attendance_views.xml
│   ├── hr_leave_views.xml
│   ├── alhamra_shift_views.xml
│   ├── alhamra_roster_views.xml
│   ├── alhamra_scan_views.xml
│   ├── dashboard_views.xml
│   └── menu_views.xml
├── static/
│   ├── src/
│   │   ├── components/
│   │   │   ├── qr_scanner.js     # OWL QR scanner component
│   │   │   ├── dashboard.js      # OWL Dashboard component
│   │   │   └── notification.js   # OWL Notification component
│   │   ├── scss/
│   │   │   └── alhamra.scss
│   │   └── xml/
│   │       └── templates.xml
│   └── manifest.json             # PWA manifest
├── report/
│   └── alhamra_report.xml        # Report definitions
└── wizard/
    ├── __init__.py
    └── export_wizard.py          # Export wizard
```

### Dependencies

```python
# __manifest__.py
{
    'name': 'Alhamra Attendance',
    'version': '16.0.1.0.0',
    'depends': [
        'base',
        'hr',
        'hr_attendance',
        'hr_holidays',  # Time Off
        'mail',         # Notifications
        'web',          # Web framework
        'report_xlsx',  # Optional: for Excel export
    ],
    'data': [
        'security/alhamra_groups.xml',
        'security/ir.model.access.csv',
        'security/ir.rule.xml',
        'data/ir_cron.xml',
        'data/ir_sequence.xml',
        'views/alhamra_shift_views.xml',
        'views/alhamra_roster_views.xml',
        'views/alhamra_scan_views.xml',
        'views/hr_employee_views.xml',
        'views/hr_attendance_views.xml',
        'views/hr_leave_views.xml',
        'views/dashboard_views.xml',
        'views/menu_views.xml',
        'report/alhamra_report.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'alhamra_attendance/static/src/scss/alhamra.scss',
            'alhamra_attendance/static/src/components/**/*.js',
            'alhamra_attendance/static/src/xml/**/*.xml',
        ],
        'web.assets_frontend': [
            'alhamra_attendance/static/src/scss/alhamra.scss',
        ],
    },
    'installable': True,
    'application': True,
}
```

---

## 📝 Step-by-Step Migrasi

### Phase 1: Persiapan (1-2 hari)

1. **Setup Environment Odoo 16**
   ```bash
   # Install Odoo 16
   git clone https://github.com/odoo/odoo.git --branch 16.0 --single-branch
   cd odoo
   pip install -r requirements.txt
   ```

2. **Buat Database Baru**
   ```bash
   createdb alhamra_attendance
   ```

3. **Install Module HR**
   - Install `hr`, `hr_attendance`, `hr_holidays`, `mail`

### Phase 2: Database Schema (2-3 hari)

1. **Buat Model Dasar**
   - `alhamra.shift`
   - `alhamra.roster`
   - `alhamra.scan.record`

2. **Extend Model HR**
   - `hr.employee` (tambah: nik, role, default_shift_id)
   - `hr.attendance` (tambah: date, shift_id, status_in, anomaly_flag)
   - `hr.leave` (tambah: leave_type, reason, attachment_url)

3. **Setup Security**
   - Groups: `alhamra.group_admin`, `alhamra.group_kiosk`
   - Record rules
   - Access rights

### Phase 3: Business Logic (3-4 hari)

1. **QR Code System**
   - Controller: `/alhamra/qr/generate`
   - Controller: `/alhamra/qr/validate`
   - JWT secret management

2. **Attendance Logic**
   - Check-in/check-out detection
   - Late calculation
   - Anomaly flagging

3. **Leave Approval**
   - Workflow: draft → confirm → validate
   - Email notifications
   - Attachment upload

4. **Export Excel**
   - Controller: `/alhamra/export/excel`
   - 2-sheet format (rekapitulasi + log)

### Phase 4: Frontend (3-4 hari)

1. **Dashboard Views**
   - Admin dashboard (KPI cards)
   - Employee dashboard
   - Kiosk scanner page

2. **Custom Components**
   - QR Code widget (generate + display)
   - QR Scanner (camera access)
   - Notification toast
   - Offline indicator

3. **Menu Structure**
   ```
   Alhamra Attendance
   ├── Dashboard
   ├── Karyawan
   │   ├── Daftar Karyawan
   │   ├── Department
   │   └── Shift
   ├── Absensi
   │   ├── Log Absensi
   │   ├── Scan Records
   │   └── Roster
   ├── Pengajuan
   │   ├── Cuti/Sakit/Izin
   │   └── Approval
   ├── Laporan
   │   ├── Export Excel
   │   └── Anomaly
   └── Pengaturan
   ```

### Phase 5: PWA & Offline (1-2 hari)

1. **PWA Setup**
   - Service worker (custom)
   - Manifest.json
   - Install prompt

2. **Offline Support**
   - IndexedDB via localStorage (fallback)
   - Background sync (periodic)
   - Queue system

### Phase 6: Testing & Data Migration (1-2 hari)

1. **Export Data dari Supabase**
   ```bash
   # Export CSV dari Supabase
   supabase db dump > alhamra_backup.sql
   ```

2. **Import ke Odoo**
   - Gunakan Odoo import feature (CSV)
   - Atau buat migration script (Python)

3. **Testing**
   - Unit tests (Python)
   - Integration tests
   - Manual testing (QR scan, export, etc)

### Phase 7: Deployment (1 hari)

1. **Deploy ke Server**
   - Setup reverse proxy (nginx)
   - SSL certificate
   - Database backup

2. **Go Live**
   - Switch DNS
   - Monitor logs
   - Support user

---

## 📱 Panduan QR Code di Odoo

### QR Code Generator (Widget)

```javascript
// static/src/components/qr_code_widget.js
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

const { Component, useState, onMounted } = owl;

class QRCodeWidget extends Component {
    setup() {
        this.state = useState({
            token: null,
            countdown: 30,
        });
        
        onMounted(() => {
            this.generateQR();
            this.interval = setInterval(() => {
                this.state.countdown--;
                if (this.state.countdown <= 0) {
                    this.generateQR();
                    this.state.countdown = 30;
                }
            }, 1000);
        });
    }
    
    async generateQR() {
        const result = await this.env.services.rpc('/alhamra/qr/generate', {});
        if (result.success) {
            this.state.token = result.token;
        }
    }
    
    // Render QR code using qrcode.js or similar
}

QRCodeWidget.template = 'alhamra.QRCodeWidget';
QRCodeWidget.props = standardFieldProps;

registry.category("fields").add("qr_code", QRCodeWidget);
```

### QR Scanner (Kiosk)

```javascript
// static/src/components/qr_scanner.js
import { Component, useState, onMounted } from "@owl/owl";

class QRScanner extends Component {
    setup() {
        this.state = useState({
            scanning: false,
            lastScan: null,
        });
    }
    
    async startScan() {
        this.state.scanning = true;
        // Use html5-qrcode library
        const scanner = new Html5Qrcode("reader");
        await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
                await this.validateQR(decodedText);
            }
        );
    }
    
    async validateQR(token) {
        const result = await this.env.services.rpc('/alhamra/qr/validate', {
            token: token,
            kiosk_id: 'kiosk-1'
        });
        
        if (result.success) {
            this.state.lastScan = result;
            // Play sound
            this.playBeep();
        }
    }
}
```

---

## 📴 Panduan Offline-First di Odoo

### Strategy

Odoo tidak native support offline-first seperti Next.js. Solusi:

### 1. Custom Service Worker

```javascript
// static/src/js/service_worker.js
self.addEventListener('fetch', (event) => {
    // Intercept API calls
    if (event.request.url.includes('/alhamra/qr/validate')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Save to IndexedDB
                return saveToQueue(event.request);
            })
        );
    }
});

// Background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-attendance') {
        event.waitUntil(syncAttendance());
    }
});
```

### 2. Odoo Integration

```xml
<!-- Register service worker in manifest -->
<template id="alhamra.assets" inherit_id="web.layout">
    <xpath expr="//head" position="inside">
        <script>
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/alhamra/static/src/js/service_worker.js');
            }
        </script>
    </xpath>
</template>
```

### 3. Fallback Strategy

- **Online**: Gunakan Odoo RPC normal
- **Offline**: Simpan ke localStorage/IndexedDB
- **Reconnected**: Sinkronisasi via background sync

---

## 📱 Panduan PWA di Odoo

### 1. Manifest.json

```json
{
  "name": "Alhamra Attendance",
  "short_name": "Alhamra",
  "start_url": "/web",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#164e7f",
  "icons": [
    {
      "src": "/alhamra/static/img/icon-192.png",
      "sizes": "192x192"
    }
  ]
}
```

### 2. Install Prompt

```javascript
// static/src/js/pwa_install.js
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    // Show install button
    document.getElementById('pwa-install').style.display = 'block';
});

document.getElementById('pwa-install').addEventListener('click', async () => {
    const prompt = window.deferredPrompt;
    if (prompt) {
        prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === 'accepted') {
            console.log('PWA installed');
        }
    }
});
```

### 3. Odoo Integration

```xml
<!-- views/menu_views.xml -->
<record id="action_alhamra_pwa" model="ir.actions.client">
    <field name="name">Alhamra PWA</field>
    <field name="tag">alhamra.pwa</field>
</record>

<menuitem id="menu_alhamra_pwa" 
          name="Install App" 
          parent="menu_alhamra_root"
          action="action_alhamra_pwa"
          sequence="100"/>
```

---

## 📊 Data Migration Strategy

### Phase 1: Export dari Supabase

```bash
# 1. Export schema
pg_dump -h db.wyewqgyldltujjunmfmp.supabase.co -U postgres alhamra > schema.sql

# 2. Export data (CSV)
# Gunakan Supabase Dashboard atau psql:
\COPY employees TO '/tmp/employees.csv' CSV HEADER;
\COPY departments TO '/tmp/departments.csv' CSV HEADER;
\COPY shifts TO '/tmp/shifts.csv' CSV HEADER;
\COPY attendance_logs TO '/tmp/attendance_logs.csv' CSV HEADER;
\COPY leave_requests TO '/tmp/leave_requests.csv' CSV HEADER;
```

### Phase 2: Transform & Import ke Odoo

```python
# migration_script.py
import csv
import xmlrpc.client

# Connect to Odoo
url = 'http://localhost:8069'
db = 'alhamra_attendance'
username = 'admin'
password = 'admin'

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

# 1. Import Departments
with open('/tmp/departments.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        models.execute_kw(db, uid, password, 'hr.department', 'create', [{
            'name': row['name'],
        }])

# 2. Import Shifts
with open('/tmp/shifts.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        models.execute_kw(db, uid, password, 'alhamra.shift', 'create', [{
            'name': row['name'],
            'start_time': float(row['start_time']),
            'end_time': float(row['end_time']),
            'late_tolerance_minutes': int(row['late_tolerance_minutes']),
        }])

# 3. Import Employees
with open('/tmp/employees.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # First create res.user
        user_id = models.execute_kw(db, uid, password, 'res.users', 'create', [{
            'name': row['name'],
            'login': row['email'],
            'password': '123456',  # Set default password
        }])
        
        # Then create hr.employee
        models.execute_kw(db, uid, password, 'hr.employee', 'create', [{
            'name': row['name'],
            'user_id': user_id,
            'nik': row['nik'],
            'department_id': get_department_id(row['department_id']),
            'default_shift_id': get_shift_id(row['default_shift_id']),
            'role': row['role'],
            'phone': row['phone'],
            'email': row['email'],
        }])

# 4. Import Attendance Logs
with open('/tmp/attendance_logs.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        models.execute_kw(db, uid, password, 'hr.attendance', 'create', [{
            'employee_id': get_employee_id(row['employee_id']),
            'date': row['date'],
            'check_in': row['check_in'],
            'check_out': row['check_out'],
            'status_in': row['status_in'],
            'anomaly_flag': row['anomaly_flag'],
        }])

print("Migration complete!")
```

### Phase 3: Verification

1. **Check data count**
   ```sql
   -- Supabase
   SELECT COUNT(*) FROM employees;
   
   -- Odoo
   SELECT COUNT(*) FROM hr_employee;
   ```

2. **Check data integrity**
   - Verify employee names
   - Verify attendance dates
   - Verify leave statuses

3. **Test key features**
   - Login with migrated users
   - Generate QR code
   - View attendance logs
   - Export Excel

---

## 💡 Tips & Catatan Penting

### 1. Gunakan Odoo HR Module

**Jangan buat dari nol!** Odoo sudah punya module HR yang powerful:
- `hr.employee` → Sudah ada
- `hr.attendance` → Sudah ada
- `hr.leave` → Sudah ada (Time Off)
- `hr.department` → Sudah ada

**Cukup extend** dengan field custom yang diperlukan.

### 2. JWT untuk QR Code

- Gunakan library `PyJWT` (install via pip)
- Simpan secret di `ir.config_parameter` (bukan hardcoded)
- Expiry: 30 detik (sama dengan asal)

### 3. Camera Permission

- QR Scanner butuh HTTPS (kecuali localhost)
- Gunakan `getUserMedia` API
- Test di mobile devices (iOS Safari tricky)

### 4. Excel Export

- Odoo punya `report_xlsx` module (community)
- Atau gunakan `xlsxwriter` library (Python)
- Format 2-sheet harus sama persis dengan asal

### 5. Real-time Notifications

- Gunakan `bus.bus` (Odoo built-in)
- Atau `mail.activity` untuk approval workflow
- Atau `mail.notification` untuk general notifications

### 6. Multi-Device

- Odoo responsive (sudah mobile-friendly)
- Untuk PWA: tambahkan service worker custom
- Kiosk: gunakan tablet dengan browser fullscreen

### 7. Security

- **Jangan** expose `SUPABASE_SERVICE_ROLE_KEY` ke frontend
- Di Odoo: gunakan `request.env` (server-side)
- RLS → Record Rules (ir.rule)
- Auth → Odoo built-in (res.users)

### 8. Performance

- Odoo caching: `ormcache` decorator
- Database indexing: tambahkan index di Odoo model
- Assets: bundle CSS/JS via `assets` in manifest

### 9. Backup Strategy

- Odoo: backup database via `pg_dump`
- Filestore: backup folder `filestore`
- Automate: cron job daily backup

### 10. Upgrade Path

- Odoo 16 → 17 → 18 (future)
- Test upgrade di staging
- Backup sebelum upgrade
- Follow Odoo migration guide

---

## 🐛 Troubleshooting Migrasi

### 1. QR Code Tidak Generate

```
Cause: JWT secret tidak di-set
Fix:
  - Setting → Parameters → ir.config_parameter
  - Tambahkan: alhamra.jwt_secret = <random-string>
  - Restart Odoo
```

### 2. Camera Tidak Buka di Kiosk

```
Cause: HTTPS required atau permission denied
Fix:
  - Pastikan Odoo running via HTTPS (nginx reverse proxy)
  - Browser setting: allow camera
  - iOS: hanya works di HTTPS
```

### 3. Data Migration Gagal

```
Cause: Foreign key constraint atau duplicate
Fix:
  - Import urut: departments → shifts → employees → attendance
  - Check CSV format (date, datetime, float)
  - Use `write` untuk update existing record
```

### 4. Performance Lambat

```
Cause: Too many RPC calls atau missing index
Fix:
  - Gunakan `read_group` untuk aggregate
  - Add index: `index=True` di model fields
  - Use `fields` parameter di search_read
  - Implement caching
```

### 5. Mobile Layout Rusak

```
Cause: Odoo form view tidak responsive
Fix:
  - Gunakan custom form view (mobile-friendly)
  - Atau buat separate mobile controller
  - Use CSS media queries
```

---

## 📚 Resources

### Odoo Documentation
- [Odoo 16 Documentation](https://www.odoo.com/documentation/16.0/)
- [Odoo ORM API](https://www.odoo.com/documentation/16.0/developer/reference/backend/orm.html)
- [Odoo Web Framework](https://www.odoo.com/documentation/16.0/developer/reference/frontend/framework.html)
- [Odoo OWL](https://github.com/odoo/owl)

### Odoo Tutorials
- [Building Module](https://www.odoo.com/documentation/16.0/developer/howtos/build_a_module.html)
- [Controllers](https://www.odoo.com/documentation/16.0/developer/reference/backend/http.html)
- [Reports](https://www.odoo.com/documentation/16.0/developer/reference/backend/reports.html)

### Python Libraries
- `PyJWT` → JWT untuk QR Code
- `xlsxwriter` → Excel export
- `qrcode` → QR Code generation (Python)

### Odoo Apps
- `report_xlsx` → Excel report (OCA)
- `web_responsive` → Mobile UI (OCA)

---

## 🎯 Checklist Migrasi

### Phase 1: Setup
- [ ] Install Odoo 16
- [ ] Create database
- [ ] Install HR modules
- [ ] Setup development environment

### Phase 2: Models
- [ ] Create `alhamra.shift`
- [ ] Create `alhamra.roster`
- [ ] Create `alhamra.scan.record`
- [ ] Extend `hr.employee`
- [ ] Extend `hr.attendance`
- [ ] Extend `hr.leave`
- [ ] Setup security (groups, rules, access)

### Phase 3: Business Logic
- [ ] QR generate controller
- [ ] QR validate controller
- [ ] Attendance logic (check-in/out)
- [ ] Leave approval workflow
- [ ] Export Excel controller
- [ ] Auto-flag cron job

### Phase 4: Frontend
- [ ] Dashboard views
- [ ] QR Code widget
- [ ] QR Scanner component
- [ ] Menu structure
- [ ] Form views
- [ ] Tree views

### Phase 5: Advanced
- [ ] PWA manifest
- [ ] Service worker
- [ ] Offline queue
- [ ] Real-time notifications
- [ ] Mobile responsive

### Phase 6: Migration
- [ ] Export Supabase data
- [ ] Transform data
- [ ] Import ke Odoo
- [ ] Verify data integrity
- [ ] Test all features

### Phase 7: Deployment
- [ ] Deploy ke server
- [ ] Setup SSL
- [ ] Backup automation
- [ ] User training
- [ ] Go live

---

> **Selamat Migrasi!** 🚀
> 
> Semoga panduan ini membantu. Kalau ada pertanyaan, silakan hubungi developer tim Alhamra.

**© 2026 Alhamra IT Team**
