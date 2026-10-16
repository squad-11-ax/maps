// ==========================================================================
// AUDITED CAMPUS NODES & NETWORK GRAPH
// Standardized casing, typo fixes ("Saraswati"), aliases, and metadata
// Categories: Food, Hostels, Labs, ATM, Parking, Gates, Washrooms, Study
// ==========================================================================

export const CATEGORIES = [
  { id: 'all', label: 'All Places' },
  { id: 'Food', label: 'Food & Dining' },
  { id: 'Hostels', label: 'Hostels' },
  { id: 'Labs', label: 'Labs & Academics' },
  { id: 'ATM', label: 'ATM & Banking' },
  { id: 'Parking', label: 'Parking' },
  { id: 'Gates', label: 'Gates & Entrances' },
  { id: 'Washrooms', label: 'Washrooms' },
  { id: 'Study', label: 'Libraries & Study' },
];

export const NODES = [
  {
    id: 'Entrance',
    name: 'Main Campus Entrance & Gate',
    shortName: 'Main Gate',
    category: 'Gates',
    blockCode: 'Gate 1',
    subtitle: 'North Wing • Main Pedestrian Entry',
    departments: 'Campus Security & Visitor Check-in',
    hours: '24/7 Open',
    stepFree: true,
    aliases: ['gate', 'main gate', 'entrance', 'check-in', 'security', 'north gate'],
    x: -1.5,
    y: -1.5,
    z: 0.02,
  },
  {
    id: 'Plaza',
    name: 'Central Campus Plaza',
    shortName: 'Central Plaza',
    category: 'Gates',
    blockCode: 'Plaza',
    subtitle: 'Open Courtyard & Atrium',
    departments: 'Student Affairs & Event Center',
    hours: '6:00 AM - 11:00 PM',
    stepFree: true,
    aliases: ['plaza', 'central plaza', 'atrium', 'quad', 'courtyard'],
    x: -0.8,
    y: -0.5,
    z: 0.02,
  },
  {
    id: 'Hub',
    name: 'Student Innovation Hub',
    shortName: 'Innovation Hub',
    category: 'Labs',
    blockCode: 'Block A',
    subtitle: 'Building A • Tech Wing (Floor 1)',
    departments: 'Makerspace, Software Labs & Startup Incubation',
    hours: '8:00 AM - 10:00 PM',
    stepFree: true,
    aliases: ['hub', 'innovation hub', 'block a', 'makerspace', 'incubation'],
    x: -0.2,
    y: 0.8,
    z: 0.02,
  },
  {
    id: 'Station',
    name: 'Transit Station Alpha',
    shortName: 'Transit Station',
    category: 'Gates',
    blockCode: 'TS-1',
    subtitle: 'East Terminal • Shuttle & Bus Stop',
    departments: 'Campus Transit & Electric Shuttle Services',
    hours: '6:30 AM - 10:30 PM',
    stepFree: true,
    aliases: ['transit', 'shuttle', 'bus stop', 'station', 'bus'],
    x: 0.5,
    y: -0.5,
    z: 0.02,
  },
  {
    id: 'Kiosk',
    name: 'Campus Help & Information Kiosk',
    shortName: 'Info Kiosk',
    category: 'Gates',
    blockCode: 'Kiosk-B',
    subtitle: 'South Concourse • Information Desk',
    departments: 'Campus Navigation, Lost & Found',
    hours: '8:00 AM - 8:00 PM',
    stepFree: true,
    aliases: ['kiosk', 'help desk', 'info', 'lost and found', 'concourse'],
    x: 1.0,
    y: 0.6,
    z: 0.02,
  },
  {
    id: 'Exit',
    name: 'South Exit & Parking',
    shortName: 'South Parking',
    category: 'Parking',
    blockCode: 'P-South',
    subtitle: 'South Gate • EV Charging Available',
    departments: 'Vehicle Management & Permit Office',
    hours: '24/7 Open',
    stepFree: true,
    aliases: ['parking', 'south parking', 'car park', 'ev charging', 'south exit'],
    x: 1.5,
    y: 1.5,
    z: 0.02,
  },
  {
    id: 'Library',
    name: 'Saraswati Central Library',
    shortName: 'Saraswati Library',
    category: 'Study',
    blockCode: 'Block B',
    subtitle: 'Central Resource Center • Quiet Zones & Digital Catalog',
    departments: 'University Archives, Study Commons, Research Lifts',
    hours: '7:30 AM - Midnight',
    stepFree: true,
    aliases: ['library', 'saraswati', 'central library', 'saraswati library', 'books', 'quiet zone', 'block b'],
    x: 0.0,
    y: 0.2,
    z: 0.02,
  },
  {
    id: 'Cafeteria',
    name: 'Garden Food Court',
    shortName: 'Food Court',
    category: 'Food',
    blockCode: 'FC-1',
    subtitle: 'Courtyard Level • Meals, Coffee & Bakery',
    departments: 'Campus Dining Services & Nutrition',
    hours: '7:00 AM - 10:00 PM',
    stepFree: true,
    aliases: ['food', 'cafeteria', 'canteen', 'lunch', 'coffee', 'snacks', 'dining'],
    x: -0.5,
    y: 0.3,
    z: 0.02,
  },
  {
    id: 'PointA',
    name: 'Main Campus Center',
    shortName: 'Campus Center',
    category: 'Gates',
    blockCode: 'CC-Main',
    subtitle: 'Central Pedestrian Promenade',
    departments: 'Information & Wayfinding Junction',
    hours: '24/7 Open',
    stepFree: true,
    aliases: ['center', 'start', 'main walkway', 'promenade'],
    x: 0.22,
    y: 0.69,
    z: 0.02,
  },
  {
    id: 'PointB',
    name: 'MediSquare-1 Medical Sciences',
    shortName: 'MediSquare-1',
    category: 'Labs',
    blockCode: 'MS-1',
    subtitle: 'Health & Biomedical Research Complex',
    departments: 'Biomedical Engineering & Clinical Skills Lab',
    hours: '8:00 AM - 7:00 PM',
    stepFree: true,
    aliases: ['medisquare-1', 'medisquare', 'medical', 'biomed', 'health', 'ms1'],
    x: 0.32,
    y: 0.711,
    z: 0.02,
  },
  {
    id: 'PointC',
    name: 'MediSquare-2 Life Sciences',
    shortName: 'MediSquare-2',
    category: 'Labs',
    blockCode: 'MS-2',
    subtitle: 'Molecular Biology & Genetics Pavilion',
    departments: 'Genetics, Physiology & Microbiology',
    hours: '8:00 AM - 7:00 PM',
    stepFree: true,
    aliases: ['medisquare-2', 'life sciences', 'genetics', 'ms2'],
    x: 0.351,
    y: 0.661,
    z: 0.02,
  },
  {
    id: 'PointD',
    name: 'MediSquare Library',
    shortName: 'MS Library',
    category: 'Study',
    blockCode: 'Block M',
    subtitle: 'Medical Reference & Journal Collection',
    departments: 'Medical Information Resources',
    hours: '8:00 AM - 11:00 PM',
    stepFree: true,
    aliases: ['ms-library', 'medical library', 'ms library', 'block m'],
    x: 0.398,
    y: 0.546,
    z: 0.02,
  },
  {
    id: 'PointE',
    name: 'Saraswati Library',
    shortName: 'Saraswati Library',
    category: 'Study',
    blockCode: 'Block B',
    subtitle: 'Saraswati Central Library East Entrance',
    departments: 'Main Book Checkout, Ramps & Study Pods',
    hours: '7:30 AM - Midnight',
    stepFree: true,
    aliases: ['sarasawti-library', 'saraswati', 'saraswati library', 'central library', 'library east'],
    x: 0.501,
    y: 0.607,
    z: 0.02,
  },
  {
    id: 'PointF',
    name: 'Engineering Block F',
    shortName: 'Block F',
    category: 'Labs',
    blockCode: 'Block F',
    subtitle: 'Computer Science & Software Systems',
    departments: 'CSE, Data Science & Artificial Intelligence',
    hours: '8:00 AM - 9:00 PM',
    stepFree: true,
    aliases: ['block f', 'computer science', 'cs lab', 'engineering'],
    x: 0.503,
    y: 0.64,
    z: 0.02,
  },
  {
    id: 'PointG',
    name: 'Block G Academic Hall',
    shortName: 'Block G',
    category: 'Labs',
    blockCode: 'Block G',
    subtitle: 'Lecture Hall Complex & Seminar Rooms',
    departments: 'Faculty of Engineering & Mathematics',
    hours: '7:45 AM - 8:30 PM',
    stepFree: true,
    aliases: ['block g', 'hall g', 'lecture hall', 'seminar'],
    x: 0.523,
    y: 0.59,
    z: 0.02,
  },
  {
    id: 'PointH',
    name: 'Campus ATM & Banking Center',
    shortName: 'Campus ATM',
    category: 'ATM',
    blockCode: 'ATM-1',
    subtitle: '24-Hour ATM & Student Banking Kiosk',
    departments: 'National Bank & Cash Services',
    hours: '24/7 Open',
    stepFree: true,
    aliases: ['atm', 'bank', 'cash', 'money', 'banking'],
    x: 0.528,
    y: 0.662,
    z: 0.02,
  },
  {
    id: 'PointI',
    name: 'East Campus Crossing',
    shortName: 'East Crossing',
    category: 'Gates',
    blockCode: 'CX-East',
    subtitle: 'Pedestrian Crossing & Signal Plaza',
    departments: 'Pedestrian Safety Zone',
    hours: '24/7 Open',
    stepFree: true,
    aliases: ['crossing', 'junction', 'east crossing'],
    x: 0.546,
    y: 0.605,
    z: 0.02,
  },
  {
    id: 'PointJ',
    name: 'Aryabhatta Boys Residence Hostel',
    shortName: 'Aryabhatta Hostel',
    category: 'Hostels',
    blockCode: 'BH-1',
    subtitle: 'North Residential Complex • Blocks 1-4',
    departments: 'Hostel Administration & Warden Office',
    hours: 'Residents 24/7 (Visitors: 9 AM - 8 PM)',
    stepFree: true,
    aliases: ['hostel', 'boys hostel', 'aryabhatta', 'residence', 'dorm'],
    x: 0.504,
    y: 0.748,
    z: 0.02,
  },
  {
    id: 'PointK',
    name: 'Gargi Girls Residence Hostel',
    shortName: 'Gargi Hostel',
    category: 'Hostels',
    blockCode: 'GH-1',
    subtitle: 'South Residential Quad • Blocks A-C',
    departments: 'Women Housing & Student Support Services',
    hours: 'Residents 24/7 (Curfew 10 PM)',
    stepFree: true,
    aliases: ['gargi', 'girls hostel', 'women residence', 'hostel'],
    x: 0.272,
    y: 0.413,
    z: 0.02,
  },
  {
    id: 'PointL',
    name: 'Central Restrooms & Washrooms',
    shortName: 'Central Washrooms',
    category: 'Washrooms',
    blockCode: 'WR-1',
    subtitle: 'Accessible Universal Restrooms & Baby Care',
    departments: 'Campus Facilities',
    hours: '6:00 AM - 11:00 PM',
    stepFree: true,
    aliases: ['washroom', 'toilet', 'restroom', 'bathroom', 'lavatory', 'wc'],
    x: 0.271,
    y: 0.384,
    z: 0.02,
  },
  {
    id: 'PointM',
    name: 'Mechanical & Robotics Workshop',
    shortName: 'Robotics Workshop',
    category: 'Labs',
    blockCode: 'Block M-Mech',
    subtitle: 'Prototyping Labs & CNC Milling Center',
    departments: 'Department of Mechanical Engineering',
    hours: '8:30 AM - 7:30 PM',
    stepFree: false, // stair access example for step-free route testing
    aliases: ['workshop', 'robotics', 'mechanical', 'cnc', 'fabrication'],
    x: 0.323,
    y: 0.25,
    z: 0.02,
  },
  {
    id: 'PointN',
    name: 'Campus Health Clinic & Pharmacy',
    shortName: 'Campus Clinic',
    category: 'Services',
    blockCode: 'HC-1',
    subtitle: 'First Aid, Outpatient Care & Dispensary',
    departments: 'University Health Services',
    hours: '8:00 AM - 8:00 PM (Emergency 24/7)',
    stepFree: true,
    aliases: ['clinic', 'health', 'doctor', 'first aid', 'pharmacy', 'medicine'],
    x: 0.475,
    y: 0.347,
    z: 0.02,
  },
  {
    id: 'PointO',
    name: 'West Gate & Visitors Parking',
    shortName: 'West Parking',
    category: 'Parking',
    blockCode: 'P-West',
    subtitle: 'Designated Visitor, Staff & Disability Parking',
    departments: 'Parking Services & Shuttle Stop',
    hours: '24/7 Open',
    stepFree: true,
    aliases: ['parking', 'west parking', 'car park', 'visitor parking'],
    x: 0.651,
    y: 0.466,
    z: 0.02,
  },
  {
    id: 'PointP',
    name: 'Department of Electronics & Communications',
    shortName: 'ECE Department',
    category: 'Labs',
    blockCode: 'Block E',
    subtitle: 'VLSI Design & Communication Research Wing',
    departments: 'Department of Electronics & Communication Engineering',
    hours: '8:00 AM - 8:00 PM',
    stepFree: true,
    aliases: ['ece', 'electronics', 'vlsi', 'point p', 'destination'],
    x: 0.568,
    y: 0.543,
    z: 0.02,
  },
  {
    id: 'PointQ',
    name: 'Campus Bookstore & Stationery',
    shortName: 'Bookstore',
    category: 'Services',
    blockCode: 'BS-1',
    subtitle: 'Textbooks, Stationery & Printing Services',
    departments: 'University Press',
    hours: '9:00 AM - 6:30 PM',
    stepFree: true,
    aliases: ['bookstore', 'stationery', 'print', 'xerox', 'books'],
    x: 0.158,
    y: 0.462,
    z: 0.02,
  },
  {
    id: 'PointR',
    name: 'Sports Complex & Gymnasium',
    shortName: 'Gymnasium',
    category: 'Public Area',
    blockCode: 'SC-1',
    subtitle: 'Indoor Courts, Fitness Gym & Pool',
    departments: 'Physical Education & Athletics',
    hours: '6:00 AM - 9:30 PM',
    stepFree: true,
    aliases: ['gym', 'sports', 'fitness', 'badminton', 'courts', 'pool'],
    x: 0.116,
    y: 0.513,
    z: 0.02,
  },
  {
    id: 'PointS',
    name: 'Cricket & Football Ground',
    shortName: 'Campus Stadium',
    category: 'Public Area',
    blockCode: 'Stadium',
    subtitle: 'Outdoor Turf Arena & Track',
    departments: 'Athletics & Intramurals',
    hours: '5:30 AM - 8:30 PM',
    stepFree: true,
    aliases: ['stadium', 'ground', 'cricket', 'football', 'running track'],
    x: 0.097,
    y: 0.501,
    z: 0.02,
  },
  {
    id: 'PointT',
    name: 'East Campus Dining Hall',
    shortName: 'East Dining',
    category: 'Food',
    blockCode: 'DH-East',
    subtitle: 'Multi-cuisine Student Mess & Cafe',
    departments: 'Student Hospitality',
    hours: '7:30 AM - 9:30 PM',
    stepFree: true,
    aliases: ['mess', 'dining', 'food', 'lunch', 'dinner', 'east mess'],
    x: 0.672,
    y: 0.477,
    z: 0.02,
  },
  {
    id: 'PointU',
    name: 'Science & Chemistry Labs',
    shortName: 'Chemistry Labs',
    category: 'Labs',
    blockCode: 'Block C-Sci',
    subtitle: 'Analytical Chemistry & Instrumentation Lab',
    departments: 'Department of Pure & Applied Chemistry',
    hours: '8:30 AM - 6:00 PM',
    stepFree: true,
    aliases: ['chemistry', 'science lab', 'analytical chemistry'],
    x: 0.682,
    y: 0.442,
    z: 0.02,
  },
  {
    id: 'PointV',
    name: 'Campus Post Office & Courier',
    shortName: 'Post Office',
    category: 'Services',
    blockCode: 'PO-1',
    subtitle: 'Postal Packages & Delivery Lockers',
    departments: 'Campus Mail Services',
    hours: '9:00 AM - 5:00 PM',
    stepFree: true,
    aliases: ['post office', 'mail', 'courier', 'packages'],
    x: 0.674,
    y: 0.422,
    z: 0.02,
  },
  {
    id: 'PointW',
    name: 'Tagore International Hostel',
    shortName: 'Tagore Hostel',
    category: 'Hostels',
    blockCode: 'TH-Intl',
    subtitle: 'Exchange Students & Postgrad Dormitory',
    departments: 'International Student Accommodation',
    hours: 'Residents 24/7',
    stepFree: true,
    aliases: ['tagore', 'international hostel', 'dorm', 'pg hostel'],
    x: 0.697,
    y: 0.346,
    z: 0.02,
  },
  {
    id: 'PointX',
    name: 'South Gate Washrooms',
    shortName: 'South Washrooms',
    category: 'Washrooms',
    blockCode: 'WR-2',
    subtitle: 'Ground Level Accessible Washrooms',
    departments: 'Campus Facilities',
    hours: '6:00 AM - 10:00 PM',
    stepFree: true,
    aliases: ['toilet', 'washroom', 'restroom', 'restrooms'],
    x: 0.716,
    y: 0.335,
    z: 0.02,
  },
  {
    id: 'PointY',
    name: 'Campus Gate 4 (South East)',
    shortName: 'Gate 4',
    category: 'Gates',
    blockCode: 'Gate 4',
    subtitle: 'Vehicular & Pedestrian South East Access',
    departments: 'Security Checkpost 4',
    hours: '6:00 AM - 10:00 PM',
    stepFree: true,
    aliases: ['gate 4', 'south east gate', 'exit 4'],
    x: 0.753,
    y: 0.221,
    z: 0.02,
  },
  {
    id: 'PointZ',
    name: 'Administration Building & Chancellor Office',
    shortName: 'Admin Block',
    category: 'Services',
    blockCode: 'Admin Block',
    subtitle: 'Executive Offices, Registrar & Finance',
    departments: 'University Administration & Student Billing',
    hours: '9:00 AM - 5:30 PM (Mon-Fri)',
    stepFree: true,
    aliases: ['admin', 'administration', 'registrar', 'finance', 'chancellor'],
    x: 0.504,
    y: 0.206,
    z: 0.02,
  },
];

// Campus Walkway Edges Network
export const EDGES = [
  // Primary Core Walkways
  ['PointA', 'PointB'],
  ['PointB', 'PointC'],
  ['PointC', 'PointD'],
  ['PointD', 'PointE'],
  ['PointE', 'PointF'],
  ['PointE', 'PointG'],
  ['PointF', 'PointH'],
  ['PointG', 'PointI'],
  ['PointI', 'PointP'],
  
  // Secondary connections & Amenities
  ['PointB', 'PointJ'],
  ['PointA', 'PointK'],
  ['PointK', 'PointL'],
  ['PointL', 'PointM'],
  ['PointG', 'PointN'],
  ['PointI', 'PointO'],
  ['PointP', 'PointT'],
  ['PointT', 'PointU'],
  ['PointU', 'PointV'],
  ['PointV', 'PointW'],
  ['PointW', 'PointX'],
  ['PointX', 'PointY'],
  ['PointN', 'PointZ'],
  ['PointK', 'PointQ'],
  ['PointQ', 'PointR'],
  ['PointR', 'PointS'],

  // Legacy nodes connections
  ['Entrance', 'Plaza'],
  ['Plaza', 'Hub'],
  ['Plaza', 'Station'],
  ['Plaza', 'Cafeteria'],
  ['Hub', 'Library'],
  ['Hub', 'Kiosk'],
  ['Library', 'Kiosk'],
  ['Station', 'Kiosk'],
  ['Kiosk', 'Exit'],
  ['Cafeteria', 'Hub'],
  ['Library', 'PointA'],
  ['Kiosk', 'PointB'],
];

// Helper to get Euclidean distance between two nodes
function getDistance(n1, n2) {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Build adjacency lists for regular and step-free routing
export function buildGraph(nodesList = NODES, edgesList = EDGES) {
  const standard = {};
  const stepFree = {};

  nodesList.forEach((node) => {
    standard[node.id] = [];
    stepFree[node.id] = [];
  });

  edgesList.forEach(([fromId, toId]) => {
    const nodeA = nodesList.find((n) => n.id === fromId);
    const nodeB = nodesList.find((n) => n.id === toId);
    if (nodeA && nodeB) {
      const dist = getDistance(nodeA, nodeB);

      // Standard connection
      if (standard[fromId]) standard[fromId].push({ id: toId, weight: dist });
      if (standard[toId]) standard[toId].push({ id: fromId, weight: dist });

      // Step-free connection (only if both nodes support step-free access)
      if (nodeA.stepFree !== false && nodeB.stepFree !== false) {
        if (stepFree[fromId]) stepFree[fromId].push({ id: toId, weight: dist });
        if (stepFree[toId]) stepFree[toId].push({ id: fromId, weight: dist });
      }
    }
  });

  return { standardGraph: standard, stepFreeGraph: stepFree };
}

const staticGraph = buildGraph(NODES, EDGES);

/**
 * Dijkstra shortest path solver with support for step-free preference and dynamic nodes/edges
 */
export function findShortestPath(startNodeId, endNodeId, options = {}) {
  const { stepFreeOnly = false, dynamicNodes = null, dynamicEdges = null } = options;
  const nodes = dynamicNodes || NODES;
  const edges = dynamicEdges || EDGES;

  const { standardGraph, stepFreeGraph } = (dynamicNodes || dynamicEdges)
    ? buildGraph(nodes, edges)
    : staticGraph;

  const graph = stepFreeOnly ? stepFreeGraph : standardGraph;

  if (!startNodeId || !endNodeId) return [];
  if (startNodeId === endNodeId) {
    const node = nodes.find((n) => n.id === startNodeId);
    return node ? [node] : [];
  }

  const distances = {};
  const previous = {};
  const unvisited = new Set();

  nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currentId = null;
    let smallestDist = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < smallestDist) {
        smallestDist = distances[id];
        currentId = id;
      }
    });

    if (currentId === null || currentId === endNodeId) break;

    unvisited.delete(currentId);

    const neighbors = graph[currentId] || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.id)) {
        const newDist = distances[currentId] + neighbor.weight;
        if (newDist < distances[neighbor.id]) {
          distances[neighbor.id] = newDist;
          previous[neighbor.id] = currentId;
        }
      }
    }
  }

  const path = [];
  let curr = endNodeId;
  if (distances[endNodeId] === Infinity) {
    // If step-free has no direct path, fallback to standard
    if (stepFreeOnly) {
      return findShortestPath(startNodeId, endNodeId, { ...options, stepFreeOnly: false });
    }
    return [];
  }

  while (curr !== null) {
    const node = nodes.find((n) => n.id === curr);
    if (node) path.unshift(node);
    curr = previous[curr];
  }

  return path;
}

/**
 * Generate human-friendly turn-by-turn navigation steps from a list of nodes
 */
export function generateTurnByTurnSteps(nodeList) {
  if (!nodeList || nodeList.length === 0) return [];
  if (nodeList.length === 1) {
    return [{
      nodeId: nodeList[0].id,
      lat: nodeList[0].x,
      lng: nodeList[0].y,
      instruction: `You have arrived at ${nodeList[0].name}.`,
      direction: 'arrive',
      distanceMeters: 0,
      timeSeconds: 0,
    }];
  }

  const steps = [];

  for (let i = 0; i < nodeList.length; i++) {
    const curr = nodeList[i];
    const prev = nodeList[i - 1];
    const next = nodeList[i + 1];

    if (i === 0) {
      steps.push({
        nodeId: curr.id,
        lat: curr.x,
        lng: curr.y,
        instruction: `Start at ${curr.name}`,
        direction: 'start',
        distanceMeters: 0,
        timeSeconds: 0,
      });
      continue;
    }

    // Approximate meters based on map scale (1 unit ~ 1200 meters)
    const legDistUnits = getDistance(prev, curr);
    const legMeters = Math.max(15, Math.round(legDistUnits * 1100));
    const legSeconds = Math.round(legMeters / 1.3); // ~1.3 m/s walking speed

    if (i === nodeList.length - 1) {
      steps.push({
        nodeId: curr.id,
        lat: curr.x,
        lng: curr.y,
        instruction: `Arrive at ${curr.name}`,
        direction: 'arrive',
        distanceMeters: legMeters,
        timeSeconds: legSeconds,
      });
      continue;
    }

    // Compute heading change angle
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const cross = v1.x * v2.y - v1.y * v2.x;
    const dot = v1.x * v2.x + v1.y * v2.y;
    const angle = Math.atan2(cross, dot);

    let direction = 'straight';
    let dirText = 'Continue straight past';

    if (angle > 0.45) {
      direction = 'left';
      dirText = 'Turn left towards';
    } else if (angle < -0.45) {
      direction = 'right';
      dirText = 'Turn right towards';
    }

    steps.push({
      nodeId: curr.id,
      lat: curr.x,
      lng: curr.y,
      instruction: `${dirText} ${curr.name}`,
      direction,
      distanceMeters: legMeters,
      timeSeconds: legSeconds,
    });
  }

  return steps;
}