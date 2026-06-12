import { openDB, type DBSchema } from 'idb'

interface OfflineDB extends DBSchema {
  employees: {
    key: string
    value: {
      id: string
      name: string
      nik: string
      department_id: string
      department_name: string
      default_shift_id: string
      shift_name: string
      role: string
      is_active: boolean
      avatar_url?: string
    }
  }
  shifts: {
    key: string
    value: {
      id: string
      name: string
      start_time: string
      end_time: string
      late_tolerance_minutes: number
    }
  }
  departments: {
    key: string
    value: {
      id: string
      name: string
      description: string
    }
  }
  scan_queue: {
    key: number
    value: {
      id?: number
      token: string
      kiosk_id: string
      timestamp: string
      status: 'pending' | 'synced' | 'failed'
    }
    indexes: { 'by-status': string }
  }
  'offline-queue': {
    key: number
    value: {
      id?: number
      token: string
      kiosk_id: string
      synced: boolean
      created_at: string
    }
    indexes: { 'by-synced': string }
  }
  attendance_cache: {
    key: string
    value: {
      date: string
      logs: Record<string, unknown>[]
      cached_at: string
    }
  }
  roster_cache: {
    key: string
    value: {
      month: string
      entries: Record<string, unknown>[]
      cached_at: string
    }
  }
}

const DB_NAME = 'alhamra-offline'
const DB_VERSION = 2

export async function getDB() {
  return openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('employees', { keyPath: 'id' })
        db.createObjectStore('shifts', { keyPath: 'id' })
        db.createObjectStore('departments', { keyPath: 'id' })
        const scanQueue = db.createObjectStore('scan_queue', { keyPath: 'id', autoIncrement: true })
        scanQueue.createIndex('by-status', 'status')
        db.createObjectStore('attendance_cache', { keyPath: 'date' })
        db.createObjectStore('roster_cache', { keyPath: 'month' })
      }
      if (oldVersion < 2) {
        const offlineQueue = db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true })
        offlineQueue.createIndex('by-synced', 'synced')
      }
    },
  })
}

export async function cacheEmployees(employees: Record<string, unknown>[]) {
  const db = await getDB()
  const tx = db.transaction('employees', 'readwrite')
  const store = tx.objectStore('employees')
  await Promise.all([...employees.map(e => store.put(e as OfflineDB['employees']['value']))])
  await tx.done
}

export async function getCachedEmployees() {
  const db = await getDB()
  return db.getAll('employees')
}

export async function addToScanQueue(token: string, kioskId: string) {
  const db = await getDB()
  await db.add('scan_queue', {
    token,
    kiosk_id: kioskId,
    timestamp: new Date().toISOString(),
    status: 'pending',
  })
}

export async function getPendingScans() {
  const db = await getDB()
  return db.getAllFromIndex('scan_queue', 'by-status', 'pending')
}

export async function markScanSynced(id: number) {
  const db = await getDB()
  const scan = await db.get('scan_queue', id)
  if (scan) {
    scan.status = 'synced'
    await db.put('scan_queue', scan)
  }
}
