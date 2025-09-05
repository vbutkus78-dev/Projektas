import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { logAudit } from '../utils/db';
import type { Bindings, EntityType } from '../types';

const files = new Hono<{ Bindings: Bindings }>();

// Upload file endpoint
files.post('/upload', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    
    const file = formData.get('file') as File;
    const entityType = formData.get('entity_type') as EntityType;
    const entityId = parseInt(formData.get('entity_id') as string);
    const title = formData.get('title') as string || file.name;

    if (!file) {
      return c.json({
        error: 'Validation Error',
        message: 'File is required'
      }, 400);
    }

    if (!entityType || !entityId) {
      return c.json({
        error: 'Validation Error',
        message: 'Entity type and ID are required'
      }, 400);
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return c.json({
        error: 'Validation Error',
        message: 'Only JPEG, PNG, and PDF files are allowed'
      }, 400);
    }

    if (file.size > maxSize) {
      return c.json({
        error: 'Validation Error',
        message: 'File size must be less than 10MB'
      }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const fileName = `${entityType}/${entityId}/${timestamp}-${randomString}.${extension}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: file.name,
        uploadedBy: user.userId.toString(),
        entityType: entityType,
        entityId: entityId.toString()
      }
    });

    // Save to database
    const result = await c.env.DB.prepare(`
      INSERT INTO attachments (entity_type, entity_id, title, file_url, file_type, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entityType,
      entityId,
      title,
      fileName, // We store the R2 key as file_url
      file.type,
      file.size,
      user.userId
    ).run();

    const attachmentId = result.meta.last_row_id as number;

    // Log audit
    await logAudit(
      c.env.DB,
      'attachment',
      attachmentId,
      'uploaded',
      user.userId,
      null,
      { fileName, entityType, entityId, fileSize: file.size },
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    // Get the created attachment
    const attachment = await c.env.DB.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `).bind(attachmentId).first();

    return c.json(attachment, 201);

  } catch (error) {
    console.error('File upload error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to upload file'
    }, 500);
  }
});

// Get file endpoint
files.get('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid attachment ID'
      }, 400);
    }

    // Get attachment info from database
    const attachment = await c.env.DB.prepare(`
      SELECT a.*, 
             CASE a.entity_type
               WHEN 'request' THEN r.requester_id
               WHEN 'order' THEN req.requester_id
               ELSE NULL
             END as owner_id
      FROM attachments a
      LEFT JOIN requests r ON a.entity_type = 'request' AND a.entity_id = r.id
      LEFT JOIN orders o ON a.entity_type = 'order' AND a.entity_id = o.id
      LEFT JOIN requests req ON o.request_id = req.id
      WHERE a.id = ?
    `).bind(id).first();

    if (!attachment) {
      return c.json({
        error: 'Not Found',
        message: 'Attachment not found'
      }, 404);
    }

    // Check permissions
    const canAccess = user.role === 'admin' || 
                     user.role === 'supervisor' ||
                     user.role === 'manager' ||
                     user.role === 'accounting' ||
                     user.userId === attachment.owner_id ||
                     user.userId === attachment.uploaded_by;

    if (!canAccess) {
      return c.json({
        error: 'Forbidden',
        message: 'You do not have permission to access this file'
      }, 403);
    }

    // Get file from R2
    const object = await c.env.BUCKET.get(attachment.file_url);
    
    if (!object) {
      return c.json({
        error: 'Not Found',
        message: 'File not found in storage'
      }, 404);
    }

    // Return file with appropriate headers
    return new Response(object.body, {
      headers: {
        'Content-Type': attachment.file_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${attachment.title}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('File get error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve file'
    }, 500);
  }
});

// Delete file endpoint
files.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid attachment ID'
      }, 400);
    }

    // Get attachment info
    const attachment = await c.env.DB.prepare(`
      SELECT a.*, 
             CASE a.entity_type
               WHEN 'request' THEN r.requester_id
               WHEN 'order' THEN req.requester_id
               ELSE NULL
             END as owner_id
      FROM attachments a
      LEFT JOIN requests r ON a.entity_type = 'request' AND a.entity_id = r.id
      LEFT JOIN orders o ON a.entity_type = 'order' AND a.entity_id = o.id
      LEFT JOIN requests req ON o.request_id = req.id
      WHERE a.id = ?
    `).bind(id).first();

    if (!attachment) {
      return c.json({
        error: 'Not Found',
        message: 'Attachment not found'
      }, 404);
    }

    // Check permissions (only admin, manager, or file owner can delete)
    const canDelete = user.role === 'admin' || 
                     user.role === 'manager' ||
                     user.userId === attachment.uploaded_by;

    if (!canDelete) {
      return c.json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this file'
      }, 403);
    }

    // Delete from R2
    await c.env.BUCKET.delete(attachment.file_url);

    // Delete from database
    await c.env.DB.prepare(`
      DELETE FROM attachments WHERE id = ?
    `).bind(id).run();

    // Log audit
    await logAudit(
      c.env.DB,
      'attachment',
      id,
      'deleted',
      user.userId,
      { fileName: attachment.file_url, title: attachment.title },
      null,
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    return c.json({ success: true }, 204);

  } catch (error) {
    console.error('File delete error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to delete file'
    }, 500);
  }
});

// List files for entity
files.get('/entity/:type/:id', authMiddleware, async (c) => {
  try {
    const entityType = c.req.param('type') as EntityType;
    const entityId = parseInt(c.req.param('id'));

    if (!['request', 'order', 'invoice'].includes(entityType)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid entity type'
      }, 400);
    }

    if (isNaN(entityId)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid entity ID'
      }, 400);
    }

    // Get attachments for entity
    const attachments = await c.env.DB.prepare(`
      SELECT a.*, u.name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.created_at DESC
    `).bind(entityType, entityId).all();

    return c.json(attachments.results);

  } catch (error) {
    console.error('List files error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to list files'
    }, 500);
  }
});

export default files;