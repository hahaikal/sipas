'use client';

import { useEffect, useState } from 'react';
import { getAllLetters } from '@/services/letterService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ApprovalTask {
  _id: string;
  judul: string;
  createdBy: string;
}

export default function ApprovalTasksComponent() {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingTasks() {
      try {
        const response = await getAllLetters({ status: 'PENDING' });
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch approval tasks', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingTasks();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (tasks.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">Tidak ada tugas persetujuan saat ini.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Dari</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task._id}>
            <TableCell className="font-medium">{task.judul}</TableCell>
          <TableCell>{typeof task.createdBy === 'string' ? task.createdBy : '-'}</TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/arsip/${task._id}/view`}>
                <Button variant="outline" size="sm">Lihat Detail</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
