'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TaskManagementView from '../../../../components/TaskManagementView';

export default function DashboardTaskDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '1042';

  return <TaskManagementView taskIdParam={id} />;
}
