import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id
// Body: partial fields { title?, description?, status?, priority?,
//        due_date?, sort_order?, workstream_id?, is_cortex_item?,
//        cortex_category? }
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateValues: Record<string, unknown> = {};

    if (body.title !== undefined) updateValues.title = body.title;
    if (body.description !== undefined) updateValues.description = body.description;
    if (body.status !== undefined) {
      updateValues.status = body.status;
      // Set completed_at when marking as done
      if (body.status === 'done') {
        updateValues.completedAt = new Date();
      } else {
        updateValues.completedAt = null;
      }
    }
    if (body.priority !== undefined) updateValues.priority = body.priority;
    if (body.due_date !== undefined) {
      updateValues.dueDate = body.due_date ? new Date(body.due_date) : null;
    }
    if (body.sort_order !== undefined) updateValues.sortOrder = body.sort_order;
    if (body.workstream_id !== undefined) updateValues.workstreamId = body.workstream_id;
    if (body.is_cortex_item !== undefined) updateValues.isCortexItem = body.is_cortex_item;
    if (body.cortex_category !== undefined) updateValues.cortexCategory = body.cortex_category;
    if (body.parent_task_id !== undefined) updateValues.parentTaskId = body.parent_task_id;

    if (Object.keys(updateValues).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(tasks)
      .set(updateValues as any)
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      workstream_id: updated.workstreamId,
      parent_task_id: updated.parentTaskId,
      due_date: updated.dueDate,
      sort_order: updated.sortOrder,
      is_cortex_item: updated.isCortexItem,
      cortex_category: updated.cortexCategory,
      source_type: updated.sourceType,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
      completed_at: updated.completedAt,
    });
  } catch (error) {
    console.error('PATCH /api/tasks/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/tasks/:id
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
