import { NODES, EDGES, CATEGORIES } from './nodesData';

const STORAGE_KEY = 'aimaps_campus_db_v1';

/**
 * Validates and gets the current campus database from localStorage,
 * falling back to initial seed data if not present.
 */
export function getDatabase() {
  if (typeof window === 'undefined') {
    return { nodes: [...NODES], edges: [...EDGES] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialDb = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        nodes: [...NODES],
        edges: [...EDGES],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      return { nodes: initialDb.nodes, edges: initialDb.edges };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error('Invalid database format in localStorage');
    }

    return { nodes: parsed.nodes, edges: parsed.edges };
  } catch (err) {
    console.warn('[CampusDatabase] Could not read database from localStorage, resetting to defaults:', err);
    return { nodes: [...NODES], edges: [...EDGES] };
  }
}

/**
 * Persist database to localStorage and notify listeners
 */
export function saveDatabase(nodes, edges) {
  if (typeof window === 'undefined') return { success: false };

  try {
    const payload = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      nodes,
      edges,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('campusDbUpdated', { detail: { nodes, edges } }));
    return { success: true, count: nodes.length, edgesCount: edges.length };
  } catch (err) {
    console.error('[CampusDatabase] Failed to save to localStorage:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Reset database to default static seed data
 */
export function resetDatabase() {
  const initialDb = {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    nodes: [...NODES],
    edges: [...EDGES],
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      window.dispatchEvent(new CustomEvent('campusDbUpdated', { detail: { nodes: initialDb.nodes, edges: initialDb.edges } }));
    } catch (err) {
      console.error('[CampusDatabase] Failed to reset database:', err);
    }
  }

  return { nodes: initialDb.nodes, edges: initialDb.edges };
}

/**
 * Helper to find all node IDs directly connected to a given node ID
 */
export function getConnectedNodeIds(nodeId, edges) {
  const connected = new Set();
  edges.forEach(([a, b]) => {
    if (a === nodeId) connected.add(b);
    if (b === nodeId) connected.add(a);
  });
  return Array.from(connected);
}

/**
 * Add a new node and establish its walkway edges
 */
export function addNode(nodeData, connectedNodeIds = []) {
  const { nodes, edges } = getDatabase();

  // Generate safe unique ID if missing
  let id = nodeData.id ? String(nodeData.id).trim().replace(/\s+/g, '_') : '';
  if (!id) {
    const baseSlug = (nodeData.shortName || nodeData.name || 'Node')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 10);
    id = `${baseSlug}_${Date.now().toString(36).slice(-4)}`;
  }

  // Ensure ID uniqueness
  let finalId = id;
  let counter = 1;
  while (nodes.some((n) => n.id === finalId)) {
    finalId = `${id}_${counter++}`;
  }

  const newNode = {
    id: finalId,
    name: (nodeData.name || (nodeData.isWaypoint ? 'Walkway Waypoint' : 'New Campus Location')).trim(),
    shortName: (nodeData.shortName || nodeData.name || (nodeData.isWaypoint ? 'Waypoint' : 'New Place')).trim(),
    category: nodeData.category || (nodeData.isWaypoint ? 'Waypoint' : 'Gates'),
    blockCode: (nodeData.blockCode || '').trim(),
    subtitle: (nodeData.subtitle || '').trim(),
    departments: (nodeData.departments || '').trim(),
    hours: (nodeData.hours || (nodeData.isWaypoint ? 'Always Accessible' : '24/7 Open')).trim(),
    stepFree: nodeData.stepFree !== false,
    isWaypoint: Boolean(nodeData.isWaypoint),
    aliases: Array.isArray(nodeData.aliases)
      ? nodeData.aliases
      : (nodeData.aliases || '')
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
    x: Number(nodeData.x != null ? Number(nodeData.x).toFixed(3) : 0.5),
    y: Number(nodeData.y != null ? Number(nodeData.y).toFixed(3) : 0.5),
    z: 0.02,
  };

  const updatedNodes = [...nodes, newNode];
  const updatedEdges = [...edges];

  // Add new edges for connected nodes
  connectedNodeIds.forEach((targetId) => {
    if (targetId && targetId !== finalId && nodes.some((n) => n.id === targetId)) {
      const exists = updatedEdges.some(
        ([a, b]) => (a === finalId && b === targetId) || (a === targetId && b === finalId)
      );
      if (!exists) {
        updatedEdges.push([finalId, targetId]);
      }
    }
  });

  saveDatabase(updatedNodes, updatedEdges);
  return { nodes: updatedNodes, edges: updatedEdges, newNode };
}

/**
 * Update an existing node and synchronize its connected edges
 */
export function updateNode(id, fields, connectedNodeIds = null) {
  const { nodes, edges } = getDatabase();
  const index = nodes.findIndex((n) => n.id === id);
  if (index === -1) {
    throw new Error(`Node with ID "${id}" not found.`);
  }

  const existing = nodes[index];
  const updatedNode = {
    ...existing,
    ...fields,
    id: existing.id, // ID remains immutable during standard edit
    name: fields.name != null ? String(fields.name).trim() : existing.name,
    shortName: fields.shortName != null ? String(fields.shortName).trim() : existing.shortName,
    category: fields.category || existing.category,
    blockCode: fields.blockCode != null ? String(fields.blockCode).trim() : existing.blockCode,
    subtitle: fields.subtitle != null ? String(fields.subtitle).trim() : existing.subtitle,
    departments: fields.departments != null ? String(fields.departments).trim() : existing.departments,
    hours: fields.hours != null ? String(fields.hours).trim() : existing.hours,
    stepFree: fields.stepFree !== undefined ? Boolean(fields.stepFree) : existing.stepFree,
    isWaypoint: fields.isWaypoint !== undefined ? Boolean(fields.isWaypoint) : Boolean(existing.isWaypoint),
    x: fields.x != null ? Number(Number(fields.x).toFixed(3)) : existing.x,
    y: fields.y != null ? Number(Number(fields.y).toFixed(3)) : existing.y,
    z: existing.z || 0.02,
  };

  if (fields.aliases) {
    updatedNode.aliases = Array.isArray(fields.aliases)
      ? fields.aliases
      : String(fields.aliases)
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
  }

  const updatedNodes = [...nodes];
  updatedNodes[index] = updatedNode;

  let updatedEdges = [...edges];

  // If connectedNodeIds was supplied, reconcile edges
  if (Array.isArray(connectedNodeIds)) {
    // Remove all current edges touching this node
    updatedEdges = updatedEdges.filter(([a, b]) => a !== id && b !== id);
    // Add requested connections
    connectedNodeIds.forEach((targetId) => {
      if (targetId && targetId !== id && updatedNodes.some((n) => n.id === targetId)) {
        updatedEdges.push([id, targetId]);
      }
    });
  }

  saveDatabase(updatedNodes, updatedEdges);
  return { nodes: updatedNodes, edges: updatedEdges, updatedNode };
}

/**
 * Quick Rename helper: Updates name and shortName with automatic alias indexing
 */
export function renameNode(id, newName, newShortName = null) {
  const { nodes, edges } = getDatabase();
  const index = nodes.findIndex((n) => n.id === id);
  if (index === -1) {
    throw new Error(`Node with ID "${id}" not found.`);
  }

  const node = nodes[index];
  const trimmedName = String(newName || '').trim();
  const trimmedShort = newShortName ? String(newShortName).trim() : trimmedName;

  const currentAliases = Array.isArray(node.aliases) ? [...node.aliases] : [];
  if (trimmedName && !currentAliases.includes(trimmedName.toLowerCase())) {
    currentAliases.unshift(trimmedName.toLowerCase());
  }

  const updatedNode = {
    ...node,
    name: trimmedName,
    shortName: trimmedShort,
    aliases: currentAliases,
  };

  const updatedNodes = [...nodes];
  updatedNodes[index] = updatedNode;

  saveDatabase(updatedNodes, edges);
  return { nodes: updatedNodes, edges, updatedNode };
}

/**
 * Delete a node and all associated edges
 */
export function deleteNode(id) {
  const { nodes, edges } = getDatabase();

  const updatedNodes = nodes.filter((n) => n.id !== id);
  const updatedEdges = edges.filter(([a, b]) => a !== id && b !== id);

  saveDatabase(updatedNodes, updatedEdges);
  return { nodes: updatedNodes, edges: updatedEdges };
}

/**
 * Export full JSON for database developer
 */
export function exportDatabaseJSON(nodes, edges) {
  const payload = {
    meta: {
      application: 'AIMAPS Interactive Campus Navigation',
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      stats: {
        totalNodes: nodes.length,
        placesCount: nodes.filter((n) => !n.isWaypoint).length,
        waypointsCount: nodes.filter((n) => n.isWaypoint).length,
        totalEdges: edges.length,
        totalCategories: CATEGORIES.length,
      },
      coordinateSystem: {
        type: 'Normalized UV',
        axisX: '0.000 to 1.000 (Left to Right on Campus SVG)',
        axisY: '0.000 to 1.000 (Top to Bottom on Campus SVG)',
        unitScale: '1 unit ~ 1,100 meters walking distance',
      },
    },
    categories: CATEGORIES,
    nodes,
    edges,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Escape string for safe SQL literals
 */
function escapeSql(str) {
  if (str == null) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

/**
 * Export production-ready SQL migration and seed script for database developer
 */
export function exportDatabaseSQL(nodes, edges) {
  const timestamp = new Date().toISOString();

  let sql = `-- =========================================================================
-- AIMAPS Interactive Campus Database Schema & Seed Data
-- Generated At: ${timestamp}
-- Compatible with: PostgreSQL 12+, MySQL 8.0+, SQLite 3
-- Instructions: Execute this migration in your database to persist campus nodes & edges.
-- =========================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS campus_categories (
  id VARCHAR(64) PRIMARY KEY,
  label VARCHAR(128) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. NODES (PLACES & WAYPOINTS) TABLE
CREATE TABLE IF NOT EXISTS campus_nodes (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(128) NOT NULL,
  category_id VARCHAR(64) REFERENCES campus_categories(id) ON UPDATE CASCADE ON DELETE SET NULL,
  block_code VARCHAR(64),
  subtitle TEXT,
  departments TEXT,
  hours VARCHAR(128) DEFAULT '24/7 Open',
  step_free BOOLEAN DEFAULT TRUE,
  is_waypoint BOOLEAN DEFAULT FALSE, -- True for invisible path-correction bends and walkway junctions
  aliases JSONB, -- For MySQL/SQLite, use JSON or TEXT
  x_coord DOUBLE PRECISION NOT NULL,
  y_coord DOUBLE PRECISION NOT NULL,
  z_coord DOUBLE PRECISION DEFAULT 0.02,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EDGES (WALKWAY CONNECTIONS GRAPH) TABLE
CREATE TABLE IF NOT EXISTS campus_edges (
  id BIGSERIAL PRIMARY KEY,
  from_node_id VARCHAR(64) NOT NULL REFERENCES campus_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  to_node_id VARCHAR(64) NOT NULL REFERENCES campus_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  distance_units DOUBLE PRECISION,
  is_bidirectional BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_campus_edge_pair UNIQUE(from_node_id, to_node_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_campus_nodes_category ON campus_nodes(category_id);
CREATE INDEX IF NOT EXISTS idx_campus_nodes_coords ON campus_nodes(x_coord, y_coord);
CREATE INDEX IF NOT EXISTS idx_campus_nodes_waypoint ON campus_nodes(is_waypoint);
CREATE INDEX IF NOT EXISTS idx_campus_edges_from ON campus_edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_campus_edges_to ON campus_edges(to_node_id);

-- -------------------------------------------------------------------------
-- SEED DATA: CATEGORIES
-- -------------------------------------------------------------------------
`;

  CATEGORIES.forEach((cat) => {
    sql += `INSERT INTO campus_categories (id, label) VALUES (${escapeSql(cat.id)}, ${escapeSql(cat.label)}) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;\n`;
  });

  sql += `\n-- -------------------------------------------------------------------------
-- SEED DATA: CAMPUS NODES (${nodes.length} places & waypoints)
-- -------------------------------------------------------------------------
`;

  nodes.forEach((node) => {
    const aliasesJson = JSON.stringify(node.aliases || []);
    sql += `INSERT INTO campus_nodes (id, name, short_name, category_id, block_code, subtitle, departments, hours, step_free, is_waypoint, aliases, x_coord, y_coord, z_coord) VALUES (
  ${escapeSql(node.id)},
  ${escapeSql(node.name)},
  ${escapeSql(node.shortName || node.name)},
  ${escapeSql(node.category)},
  ${escapeSql(node.blockCode || '')},
  ${escapeSql(node.subtitle || '')},
  ${escapeSql(node.departments || '')},
  ${escapeSql(node.hours || '24/7 Open')},
  ${node.stepFree !== false ? 'TRUE' : 'FALSE'},
  ${node.isWaypoint ? 'TRUE' : 'FALSE'},
  ${escapeSql(aliasesJson)},
  ${Number(node.x).toFixed(4)},
  ${Number(node.y).toFixed(4)},
  ${Number(node.z || 0.02).toFixed(4)}
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  category_id = EXCLUDED.category_id,
  block_code = EXCLUDED.block_code,
  subtitle = EXCLUDED.subtitle,
  departments = EXCLUDED.departments,
  hours = EXCLUDED.hours,
  step_free = EXCLUDED.step_free,
  is_waypoint = EXCLUDED.is_waypoint,
  aliases = EXCLUDED.aliases,
  x_coord = EXCLUDED.x_coord,
  y_coord = EXCLUDED.y_coord,
  updated_at = CURRENT_TIMESTAMP;\n`;
  });

  sql += `\n-- -------------------------------------------------------------------------
-- SEED DATA: CAMPUS EDGES / WALKWAYS (${edges.length} network edges)
-- -------------------------------------------------------------------------
`;

  edges.forEach(([fromId, toId]) => {
    const nodeA = nodes.find((n) => n.id === fromId);
    const nodeB = nodes.find((n) => n.id === toId);
    let dist = 0.1;
    if (nodeA && nodeB) {
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      dist = Number(Math.sqrt(dx * dx + dy * dy).toFixed(4));
    }

    sql += `INSERT INTO campus_edges (from_node_id, to_node_id, distance_units) VALUES (${escapeSql(fromId)}, ${escapeSql(toId)}, ${dist}) ON CONFLICT DO NOTHING;\n`;
  });

  sql += `\n-- End of migration script\n`;
  return sql;
}

/**
 * Generate README markdown for the backend/database developer
 */
export function exportDocumentation(nodes, edges) {
  return `# AIMAPS Campus Database Integration Guide

This package contains the exported database structure and current seed records for the **AIMAPS Interactive 3D Campus Navigation System**.

## Contents
1. \`schema_and_seed.sql\`: Production-ready SQL DDL & DML migration script.
2. \`campus_nodes_edges.json\`: Structured JSON dataset containing all nodes, categories, and network edges.

## Database Schema Overview

### 1. \`campus_nodes\` Table
Stores all physical locations, buildings, gates, POIs, and navigational waypoints on campus.
- **\`id\`** (VARCHAR 64, PK): Unique slug identifier (e.g., \`PointA\`, \`PointE\`, \`Library\`).
- **\`name\`** (VARCHAR 255): Full institutional display name (e.g. \`Saraswati Central Library\`).
- **\`short_name\`** (VARCHAR 128): Concise label for map markers (e.g. \`Saraswati Library\`).
- **\`category_id\`** (VARCHAR 64, FK): One of: \`Food\`, \`Hostels\`, \`Labs\`, \`ATM\`, \`Parking\`, \`Gates\`, \`Washrooms\`, \`Study\`, \`Services\`, \`Public Area\`.
- **\`block_code\`** (VARCHAR 64): Architectural block code (e.g. \`Block B\`, \`Gate 1\`).
- **\`subtitle\`** (TEXT): Contextual subtitle (e.g. \`North Wing • Level 2\`).
- **\`departments\`** (TEXT): Departments or services hosted at this node.
- **\`hours\`** (VARCHAR 128): Operating schedule (e.g. \`8:00 AM - 10:00 PM\`, \`24/7 Open\`).
- **\`step_free\`** (BOOLEAN): \`true\` if accessible without stairs; \`false\` if stairs required. Used by accessible routing.
- **\`is_waypoint\`** (BOOLEAN): \`true\` if this node is an internal path correction / corner-bending waypoint (invisible to visitors on public map, directory & search); \`false\` for regular buildings, places & POIs.
- **\`x_coord\`**, **\`y_coord\`** (DOUBLE PRECISION): Normalized UV coordinates on the base SVG map \`[0.000, 1.000]\`.
- **\`aliases\`** (JSONB / TEXT): Array of alternative search terms for instant search matching.

### 2. \`campus_edges\` Table
Stores walkable pedestrian connections between two nodes.
- **\`from_node_id\`** (VARCHAR 64, FK)
- **\`to_node_id\`** (VARCHAR 64, FK)
- **\`distance_units\`** (DOUBLE PRECISION): Euclidean distance in normalized coordinate space.
- Connections are bidirectional by default.

## Recommended Backend REST Endpoints

To make the database permanent and replace the browser's \`localStorage\`, implement the following API endpoints:

\`\`\`http
GET    /api/campus/nodes           -> Returns array of campus nodes
POST   /api/campus/nodes           -> Create new node (Admin authenticated)
PUT    /api/campus/nodes/:id       -> Update node details (Admin authenticated)
DELETE /api/campus/nodes/:id       -> Delete node & connected edges

GET    /api/campus/edges           -> Returns array of edge pairs [ [fromId, toId], ... ]
POST   /api/campus/edges           -> Create walkway connection
DELETE /api/campus/edges           -> Remove walkway connection
\`\`\`

## Coordinate Space Reference
The coordinates (\`x\`, \`y\`) map directly to the 2D plane of the campus map:
- \`x = 0.0\` is the left edge; \`x = 1.0\` is the right edge.
- \`y = 0.0\` is the top edge; \`y = 1.0\` is the bottom edge.
- \`1.0\` map unit is approximately equal to \`1,100\` walking meters on campus.

Generated: ${new Date().toLocaleString()}
Total Nodes: ${nodes.length} | Total Walkway Edges: ${edges.length}
`;
}
