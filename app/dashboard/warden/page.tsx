import React from 'react'
import { insertIfTodayAttendanceNotExists } from './attendance/actions';
import { getUserFromToken } from '@/app/functions';
import { UserPayload } from '@/lib/types';

const DashboardWardenPage = async () => {
  const user: UserPayload = await getUserFromToken()
  await insertIfTodayAttendanceNotExists(user);
  return (
    <div>Dashboard Warden</div>
  )
}

export default DashboardWardenPage