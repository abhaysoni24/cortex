import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks, taskTags, tags } from '@/lib/db/schema';
import { eq, asc, and, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// GET /api/tasks
// Query params:
//   workstream_id — filter by workstream
//   cortex        — if "true", return only cortex items (is_cortex_item = true)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workstreamId = searchParams.get('workstream_id');
    const cortex = searchParams.get('cortex');

    // Build conditions array
    const conditions = [];

    if (workstreamId) {
      conditions.push(eq(tasks.workstreamId, workstreamId));
    }

    if (cortex === 'true') {
      conditions.push(eq(tasks.isCortexItem, true));
    }

    // Fetch tasks with optional filters
    const result = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        workstream_id: tasks.workstreamId,
        parent_task_id: tasks.parentTaskId,
        due_date: tasks.dueDate,
        sort_order: tasks.sortOrder,
        is_cortex_item: tasks.isCortexItem,
        cortex_category: tasks.cortexCategory,
        source_type: tasks.sourceType,
        source_reference_id: tasks.sourceReferenceId,
        created_at: tasks.createdAt,
        updated_at: tasks.updatedAt,
        completed_at: tasks.completedAt,
      })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));

    // Fetch tags for all returned tasks
    const taskIds = result.map((t) => t.id);

    let tagsByTaskId: Record<string, { id: string; name: string; color: string | null }[]> = {};

    if (taskIds.length > 0) {
      const tagResults = await db
        .select({
          taskId: taskTags.taskId,
          tagId: tags.id,
          tagName: tags.name,
          tagColor: tags.color,
        })
        .from(taskTags)
        .innerJoin(tags, eq(taskTags.tagId, tags.id))
        .where(
          sql`${taskTags.taskId} IN (${sql.join(
            taskIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );

      for (const row of tagResults) {
        if (!tagsByTaskId[row.taskId]) tagsByTaskId[row.taskId] = [];
        tagsByTaskId[row.taskId].push({
          id: row.tagId,
          name: row.tagName,
          color: row.tagColor,
        });
      }
    }

    // Count subtasks for each task
    const subtaskCounts: Record<string, { total: number; done: number }> = {};
    if (taskIds.length > 0) {
      const subtaskResults = await db
        .select({
          parentId: tasks.parentTaskId,
          total: sql<number>`count(*)`,
          done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
        })
        .from(tasks)
        .where(
          sql`${tasks.parentTaskId} IN (${sql.join(
            taskIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
        .groupBy(tasks.parentTaskId);

      for (const row of subtaskResults) {
        if (row.parentId) {
          subtaskCounts[row.parentId] = {
            total: Number(row.total),
            done: Number(row.done),
          };
        }
      }
    }

    // Assemble response
    const tasksWithMeta = result.map((t) => ({
      ...t,
      tags: tagsByTaskId[t.id] || [],
      subtask_count: subtaskCounts[t.id]?.total ?? 0,
      subtasks_done: subtaskCounts[t.id]?.done ?? 0,
    }));

    return NextResponse.json(tasksWithMeta);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/tasks
// Body: { title, description?, status?, priority?, workstream_id?,
//         due_date?, is_cortex_item?, cortex_category?, parent_task_id? }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const insertValues: Record<string, unknown> = {
      title: body.title.trim(),
    };

    if (body.description !== undefined) insertValues.description = body.description;
    if (body.status) insertValues.status = body.status;
    if (body.priority) insertValues.priority = body.priority;
    if (body.workstream_id) insertValues.workstreamId = body.workstream_id;
    if (body.parent_task_id) insertValues.parentTaskId = body.parent_task_id;
    if (body.due_date) insertValues.dueDate = new Date(body.due_date);
    if (body.sort_order !== undefined) insertValues.sortOrder = body.sort_order;
    if (body.is_cortex_item !== undefined) insertValues.isCortexItem = body.is_cortex_item;
    if (body.cortex_category) insertValues.cortexCategory = body.cortex_category;
    if (body.source_type) insertValues.sourceType = body.source_type;

    const [created] = await db.insert(tasks).values(insertValues as any).returning();

    return NextResponse.json(
      {
        id: created.id,
        title: created.title,
        description: created.description,
        status: created.status,
        priority: created.priority,
        workstream_id: created.workstreamId,
        parent_task_id: created.parentTaskId,
        due_date: created.dueDate,
        sort_order: created.sortOrder,
        is_cortex_item: created.isCortexItem,
        cortex_category: created.cortexCategory,
        source_type: created.sourceType,
        created_at: created.createdAt,
        updated_at: created.updatedAt,
        completed_at: created.completedAt,
        tags: [],
        subtask_count: 0,
        subtasks_done: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
