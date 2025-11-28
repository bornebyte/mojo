# Data Consistency Guide

## Overview
This document explains how data consistency is maintained when admins update user allocations (buildings, floors, rooms).

## Current Implementation

### 1. **Warden Allocation Updates**
When an admin changes a warden's assigned building/floors through the manage members page:

**Location:** `/app/dashboard/admin/manage-members/actions.ts`

```typescript
export async function updateUserAllocation(userId: number, data: {
    allocated_building?: string;
    allocated_floor?: string;
    allocated_room?: string;
    assigned_building?: string;  // For wardens
    assigned_floor?: string;     // For wardens (JSON array of floor numbers)
})
```

**What happens:**
- The `users` table is updated with new building/floor assignments
- Cache is invalidated for the warden
- When warden logs in next or refreshes, they see students from NEW assigned floors

**Data Flow:**
1. Admin updates warden → `users.assigned_building`, `users.assigned_floor` updated
2. Warden page loads → Calls `getAllStudents(wardenDetails)` 
3. Function reads warden's `assigned_building` and `assigned_floor` from token
4. Queries students WHERE `allocated_building = warden.assigned_building AND allocated_floor IN (warden.assigned_floor)`
5. Returns only students matching current warden assignment

### 2. **Student Allocation Updates**
When an admin changes a student's room/floor/building:

**Location:** `/app/dashboard/admin/manage-members/actions.ts`

```typescript
export async function updateUserAllocation(userId: number, data: {
    allocated_building?: string;
    allocated_floor?: string;
    allocated_room?: string;
})
```

**What happens:**
- Student's `users.allocated_building`, `users.allocated_floor`, `users.allocated_room` are updated
- Cache is invalidated
- Warden sees updated student location immediately after refresh

**Data Flow:**
1. Admin updates student → `users.allocated_building/floor/room` updated
2. Warden refreshes student list → Calls `getAllStudents(wardenDetails)`
3. Query filters students by warden's assigned building/floors
4. Student appears under correct warden based on new allocation

### 3. **Attendance & Violations Consistency**

**Attendance Table:**
- Each attendance record stores snapshot of student's location at time of marking
- Fields: `allocated_building`, `allocated_floor` (from student at time of marking)
- Historical data remains unchanged even if student moves
- New attendance uses current student location

**Violations Table:**
- Each violation stores student's location at time of filing
- Fields: `student_building`, `student_floor`, `student_room`
- Historical violations show where student WAS when violation occurred
- New violations use current student location

## Cache Management

### Cache Keys
- `warden_students`: Stores student list for warden (30-minute TTL)
- `warden_violations_{building}_{floor}`: Violations by building/floor (30-minute TTL)  
- `admin_all_users`: All users list for admin (1-hour TTL)

### Cache Invalidation
Cache is automatically invalidated when:
1. Admin updates any user allocation
2. User manually clicks refresh button
3. Cache TTL expires (30 min for wardens, 1 hour for admins)

## Floor Filter Logic

### Warden Students Table
**File:** `/app/dashboard/warden/students/studentsTable.tsx`

```typescript
// Dynamically extract unique floors from actual student data
const uniqueFloors = React.useMemo(() => {
    const floors = new Set<string>();
    data.forEach(student => {
        if (student.allocated_floor) {
            floors.add(student.allocated_floor);
        }
    });
    return Array.from(floors).sort((a, b) => parseInt(a) - parseInt(b));
}, [data])
```

**Benefits:**
- Filter shows ONLY floors that have students assigned to the warden
- No hardcoded floor numbers
- Updates automatically when student allocations change
- Prevents showing empty floors

## Ensuring Consistency

### ✅ **Automatic Consistency Features**

1. **Single Source of Truth**
   - User allocations stored only in `users` table
   - All queries read from this table
   - No duplicate allocation data

2. **Real-time Query Filtering**
   - Warden's student list is queried fresh each time
   - WHERE clause filters by current warden assignment
   - Students automatically appear/disappear based on allocations

3. **Historical Integrity**
   - Attendance records preserve location at time of marking
   - Violations preserve location at time of filing
   - Historical data provides audit trail

4. **Cache Invalidation**
   - Update functions clear relevant caches
   - Prevents showing stale data
   - Forces fresh database queries

### 🔧 **Manual Consistency Actions**

If data appears inconsistent:

1. **Clear Browser Cache**
   - Local storage cache may be stale
   - Click refresh button to force re-fetch

2. **Verify Database**
   - Check `users` table for correct allocations
   - Verify `assigned_floor` is valid JSON array for wardens
   - Ensure `allocated_floor` is string for students

3. **Check Token**
   - User token caches user data
   - Logout/login to refresh token with new allocations

## SQL Triggers (Future Enhancement)

For even stronger consistency, consider adding triggers:

```sql
-- Update attendance when student moves
CREATE OR REPLACE FUNCTION update_attendance_on_student_move()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the move for audit
    INSERT INTO student_moves (student_id, old_building, old_floor, old_room, new_building, new_floor, new_room, moved_at)
    VALUES (NEW.id, OLD.allocated_building, OLD.allocated_floor, OLD.allocated_room, 
            NEW.allocated_building, NEW.allocated_floor, NEW.allocated_room, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_allocation_change
AFTER UPDATE OF allocated_building, allocated_floor, allocated_room ON users
FOR EACH ROW
WHEN (OLD.allocated_building IS DISTINCT FROM NEW.allocated_building 
   OR OLD.allocated_floor IS DISTINCT FROM NEW.allocated_floor 
   OR OLD.allocated_room IS DISTINCT FROM NEW.allocated_room)
EXECUTE FUNCTION update_attendance_on_student_move();
```

## Testing Consistency

### Test Scenario 1: Warden Assignment Change
1. Admin changes Warden A from Floor 1,2 to Floor 3,4
2. Warden A logs out and back in (or refreshes with cache clear)
3. Verify: Warden A sees only students on Floor 3,4
4. Verify: Floor filter shows only Floor 3,4

### Test Scenario 2: Student Room Change  
1. Admin moves Student X from Floor 1 Room 101 to Floor 3 Room 301
2. Warden managing Floor 1 refreshes
3. Verify: Student X no longer appears in Floor 1 warden's list
4. Warden managing Floor 3 refreshes
5. Verify: Student X now appears in Floor 3 warden's list

### Test Scenario 3: Historical Data Integrity
1. Warden files violation for Student Y in Building A Floor 2
2. Admin moves Student Y to Building B Floor 5
3. Check violations page
4. Verify: Violation still shows Building A Floor 2 (historical)
5. File new violation for Student Y
6. Verify: New violation shows Building B Floor 5 (current)

## Key Files

- `/app/dashboard/admin/manage-members/actions.ts` - User allocation updates
- `/app/dashboard/warden/attendance/actions.ts` - Student queries for wardens
- `/app/dashboard/warden/students/studentsTable.tsx` - Dynamic floor filtering
- `/lib/cache-utils.ts` - Cache management utilities
