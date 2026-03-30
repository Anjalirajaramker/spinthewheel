require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const XLSX = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_KEY = process.env.ADMIN_KEY || 'quest-admin-2026';
const DATABASE_URL = process.env.DATABASE_URL || '';
const USE_DATABASE = Boolean(DATABASE_URL);
const pool = USE_DATABASE
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : null;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'quest2026-treasure-hunt.html'));
});
app.get('/health', (req, res) => {
  res.json({ ok: true });
});
const axios = require('axios');

let approvedStudents = [];

async function loadApprovedStudents() {
  try {
    // Google Sheets export URL (CSV format)
    const SHEET_ID = '1V6VlldnTD7N5-QzKv1vo-7WXsXGcv5kT-7phLV53u3g';
    const GID = '240800619';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx&gid=${GID}`;
    
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    approvedStudents = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Loaded ${approvedStudents.length} students from Google Sheets`);
  } catch (error) {
    console.error('❌ Error loading Google Sheets:', error.message);
  }
}

// Load on startup
loadApprovedStudents();
setInterval(loadApprovedStudents, 60000);
const DOMAIN_ORDER = ['github', 'docs', 'wikipedia', 'wayback', 'inspect'];
const QUESTION_BANK = {
  github: [
    {
      id: 'gh-octocat',
      type: 'GITHUB HUNT',
      title: 'The Octocat Detective',
      task: 'Visit the GitHub Octodex gallery.',
      clue: 'Find the official name of GitHub mascot, a half-cat hybrid creature.',
      link: 'https://octodex.github.com',
      hint: 'Look at the mascot name used in Octodex and GitHub references.',
      answers: ['octocat']
    },
    {
      id: 'gh-hello-world',
      type: 'GITHUB HUNT',
      title: 'The Hello World Starter',
      task: 'Visit GitHub Hello World guide.',
      clue: 'What repository name is used in the tutorial?',
      link: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
      hint: 'It is two words connected by a hyphen.',
      answers: ['hello-world', 'hello world']
    },
    {
      id: 'gh-stars',
      type: 'GITHUB HUNT',
      title: 'The GitHub Star Hunter',
      task: 'Visit TensorFlow GitHub repository.',
      clue: 'What does the star icon represent?',
      link: 'https://github.com/tensorflow/tensorflow',
      hint: 'The label is the plural form of the icon name.',
      answers: ['stars', 'star']
    },
    {
      id: 'gh-language-linux',
      type: 'GITHUB HUNT',
      title: 'The Repository Language Hunt',
      task: 'Visit Linux repository on GitHub.',
      clue: 'Which language dominates this project?',
      link: 'https://github.com/torvalds/linux',
      hint: 'It is a foundational systems programming language.',
      answers: ['c']
    },
    {
      id: 'gh-readme-react',
      type: 'GITHUB HUNT',
      title: 'The Story of the Project',
      task: 'Visit React repository on GitHub.',
      clue: 'What section shows installation and usage details?',
      link: 'https://github.com/facebook/react',
      hint: 'Scroll below file list to the markdown section.',
      answers: ['readme', 'readme.md']
    }
  ],
  docs: [
    {
      id: 'docs-zen',
      type: 'DOCS DIVE',
      title: 'The Zen of Python',
      task: 'Visit PEP 20.',
      clue: 'What is the first word of the 7th line?',
      link: 'https://peps.python.org/pep-0020/',
      hint: 'It is a famous code quality principle.',
      answers: ['readability']
    },
    {
      id: 'docs-len',
      type: 'DOCS DIVE',
      title: 'The Built-in Function Hunt',
      task: 'Visit Python built-ins documentation.',
      clue: 'Which function returns list size?',
      link: 'https://docs.python.org/3/library/functions.html',
      hint: 'Search by the word length.',
      answers: ['len', 'len()']
    },
    {
      id: 'docs-h1',
      type: 'DOCS DIVE',
      title: 'The HTML Structure Detective',
      task: 'Visit MDN HTML element docs.',
      clue: 'Which tag is used for the main heading?',
      link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
      hint: 'It is the first heading level.',
      answers: ['h1', '<h1>']
    },
    {
      id: 'docs-color',
      type: 'DOCS DIVE',
      title: 'The CSS Color Trick',
      task: 'Visit MDN CSS documentation.',
      clue: 'Which property sets text color?',
      link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      hint: 'Property name is also the concept itself.',
      answers: ['color']
    },
    {
      id: 'docs-click',
      type: 'DOCS DIVE',
      title: 'The JavaScript Event Hunt',
      task: 'Visit MDN click event page.',
      clue: 'What is the event name fired on clicking an element?',
      link: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event',
      hint: 'Single word event.',
      answers: ['click']
    }
  ],
  wikipedia: [
    {
      id: 'wiki-ai',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Father of AI',
      task: 'Visit Artificial intelligence page on Wikipedia.',
      clue: 'In which year was AI coined?',
      link: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      hint: 'Check Dartmouth conference year.',
      answers: ['1956']
    },
    {
      id: 'wiki-qr',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The QR Code Secret',
      task: 'Visit QR code page.',
      clue: 'What does QR stand for?',
      link: 'https://en.wikipedia.org/wiki/QR_code',
      hint: 'See first paragraph.',
      answers: ['quick response']
    },
    {
      id: 'wiki-python-creator',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Python Origin',
      task: 'Visit Python programming language page.',
      clue: 'Who created Python?',
      link: 'https://en.wikipedia.org/wiki/Python_(programming_language)',
      hint: 'Check infobox creator field.',
      answers: ['guido van rossum', 'van rossum']
    },
    {
      id: 'wiki-linux-year',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Linux Legend',
      task: 'Visit Linux page.',
      clue: 'What year was Linux first released?',
      link: 'https://en.wikipedia.org/wiki/Linux',
      hint: 'See initial release in infobox.',
      answers: ['1991']
    },
    {
      id: 'wiki-arpanet',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Internet Birthday',
      task: 'Visit Internet page.',
      clue: 'Which early network led to modern Internet?',
      link: 'https://en.wikipedia.org/wiki/Internet',
      hint: 'Search for ARPANET.',
      answers: ['arpanet']
    }
  ],
  wayback: [
    {
      id: 'wb-google',
      type: 'WAYBACK DETECTIVE',
      title: 'The Google Time Travel',
      task: 'Use Wayback for google.com from year 2000.',
      clue: 'What punctuation mark appeared in old Google logo?',
      link: 'https://archive.org',
      hint: 'It appears at the end of Google word.',
      answers: ['!', 'exclamation mark', 'exclamation']
    },
    {
      id: 'wb-facebook',
      type: 'WAYBACK DETECTIVE',
      title: 'The Facebook Beginning',
      task: 'Use Wayback for facebook.com from 2004.',
      clue: 'What word appeared before Facebook in original name?',
      link: 'https://archive.org',
      hint: 'Original name was TheFacebook.',
      answers: ['the', 'thefacebook']
    },
    {
      id: 'wb-youtube',
      type: 'WAYBACK DETECTIVE',
      title: 'The YouTube First Look',
      task: 'Use Wayback for youtube.com from 2005.',
      clue: 'What old slogan appears under logo?',
      link: 'https://archive.org',
      hint: 'Two-word phrase followed by yourself.',
      answers: ['broadcast yourself']
    },
    {
      id: 'wb-wikipedia',
      type: 'WAYBACK DETECTIVE',
      title: 'The Wikipedia Past',
      task: 'Use Wayback for wikipedia.org from 2003.',
      clue: 'What phrase appears below the Wikipedia logo?',
      link: 'https://archive.org',
      hint: 'It says encyclopedia phrase.',
      answers: ['the free encyclopedia', 'free encyclopedia']
    },
    {
      id: 'wb-jntuh',
      type: 'WAYBACK DETECTIVE',
      title: 'The JNTUH Archive',
      task: 'Use Wayback for jntuh.ac.in around 2010.',
      clue: 'What phrase appears below JNTUH logo?',
      link: 'https://archive.org',
      hint: 'Ends with Excellence.',
      answers: ['gateway to excellence']
    }
  ],
  inspect: [
    {
      id: 'ins-comment',
      type: 'INSPECT CHALLENGE',
      title: 'The Hidden Comment',
      task: 'Open this page source or inspect element.',
      clue: 'Find the hidden HTML comment secret key.',
      link: '',
      hint: 'Search for HTML comment markers.',
      answers: ['quest2026_secret', 'quest2026_win']
    },
    {
      id: 'ins-meta',
      type: 'INSPECT CHALLENGE',
      title: 'The Hidden Meta Tag',
      task: 'Inspect head section of this page.',
      clue: 'Find content value of meta tag named quest-key.',
      link: '',
      hint: 'Search for name="quest-key".',
      answers: ['spin_the_wheel']
    },
    {
      id: 'ins-hidden-text',
      type: 'INSPECT CHALLENGE',
      title: 'The Invisible Text',
      task: 'Inspect hidden elements on this page.',
      clue: 'Find text hidden with display:none.',
      link: '',
      hint: 'There is a hidden paragraph element.',
      answers: ['jackpot']
    },
    {
      id: 'ins-data-code',
      type: 'INSPECT CHALLENGE',
      title: 'The Data Attribute',
      task: 'Inspect hidden button attributes.',
      clue: 'Find value of data-code attribute.',
      link: '',
      hint: 'Search for attribute name data-code.',
      answers: ['debug_master']
    },
    {
      id: 'ins-image',
      type: 'INSPECT CHALLENGE',
      title: 'The Hidden Image Name',
      task: 'Inspect hidden image element.',
      clue: 'Find the filename in hidden image source.',
      link: '',
      hint: 'Search for hidden img tag.',
      answers: ['golden_spin.png', 'golden spin png']
    }
  ]
};

function getDefaultQuestionsFlat() {
  return Object.entries(QUESTION_BANK)
    .flatMap(([domain, list]) =>
      list.map(question => ({
        ...question,
        domain,
        isActive: true
      }))
    );
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const activeParticipants = new Set();
// Add this ROOT route

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      participants: [],
      questionUsage: {},
      questions: getDefaultQuestionsFlat(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }

  const current = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!Array.isArray(current.questions) || current.questions.length === 0) {
    current.questions = getDefaultQuestionsFlat();
    current.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2), 'utf8');
  }
}

async function ensureDatabase() {
  if (!USE_DATABASE) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team_name TEXT NOT NULL,
      assigned_question_ids JSONB NOT NULL,
      current_clue INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      start_at TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ,
      elapsed_seconds INTEGER,
      hints_used INTEGER NOT NULL DEFAULT 0,
      penalty_seconds INTEGER NOT NULL DEFAULT 0,
      final_code TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attempts (
      id BIGSERIAL PRIMARY KEY,
      participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      clue_number INTEGER NOT NULL,
      answer TEXT NOT NULL,
      correct BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS question_usage (
      question_id TEXT PRIMARY KEY,
      usage_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      domain TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      task TEXT NOT NULL,
      clue TEXT NOT NULL,
      link TEXT,
      hint TEXT NOT NULL,
      answers JSONB NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function seedDatabaseQuestions() {
  if (!USE_DATABASE) return;

  const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM questions');
  if (countResult.rows[0].count > 0) return;

  const defaults = getDefaultQuestionsFlat();
  for (const q of defaults) {
    await pool.query(
      `
      INSERT INTO questions (id, domain, type, title, task, clue, link, hint, answers, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, TRUE)
      `,
      [q.id, q.domain, q.type, q.title, q.task, q.clue, q.link || '', q.hint, JSON.stringify(q.answers || [])]
    );
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeStore(store) {
  store.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
}

async function listQuestions(includeInactive = false) {
  if (!USE_DATABASE) {
    const store = readStore();
    const all = Array.isArray(store.questions) ? store.questions : [];
    return includeInactive ? all : all.filter(q => q.isActive !== false);
  }

  const query = includeInactive
    ? 'SELECT * FROM questions ORDER BY domain, title'
    : 'SELECT * FROM questions WHERE is_active = TRUE ORDER BY domain, title';
  const { rows } = await pool.query(query);
  return rows.map(row => ({
    id: row.id,
    domain: row.domain,
    type: row.type,
    title: row.title,
    task: row.task,
    clue: row.clue,
    link: row.link || '',
    hint: row.hint,
    answers: Array.isArray(row.answers) ? row.answers : [],
    isActive: Boolean(row.is_active)
  }));
}

async function getQuestionMapById(includeInactive = false) {
  const questions = await listQuestions(includeInactive);
  return questions.reduce((acc, q) => {
    acc[q.id] = q;
    return acc;
  }, {});
}

async function getQuestionsByDomain() {
  const questions = await listQuestions(false);
  return questions.reduce((acc, q) => {
    if (!acc[q.domain]) acc[q.domain] = [];
    acc[q.domain].push(q);
    return acc;
  }, {});
}

async function createQuestion(question) {
  if (!USE_DATABASE) {
    const store = readStore();
    store.questions = store.questions || [];
    store.questions.push(question);
    writeStore(store);
    return;
  }

  await pool.query(
    `
    INSERT INTO questions (id, domain, type, title, task, clue, link, hint, answers, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
    `,
    [
      question.id,
      question.domain,
      question.type,
      question.title,
      question.task,
      question.clue,
      question.link || '',
      question.hint,
      JSON.stringify(question.answers || []),
      question.isActive !== false
    ]
  );
}

async function updateQuestion(questionId, updates) {
  if (!USE_DATABASE) {
    const store = readStore();
    const idx = (store.questions || []).findIndex(q => q.id === questionId);
    if (idx < 0) return false;
    store.questions[idx] = { ...store.questions[idx], ...updates };
    writeStore(store);
    return true;
  }

  const result = await pool.query(
    `
    UPDATE questions
    SET domain = $2,
        type = $3,
        title = $4,
        task = $5,
        clue = $6,
        link = $7,
        hint = $8,
        answers = $9::jsonb,
        is_active = $10,
        updated_at = NOW()
    WHERE id = $1
    `,
    [
      questionId,
      updates.domain,
      updates.type,
      updates.title,
      updates.task,
      updates.clue,
      updates.link || '',
      updates.hint,
      JSON.stringify(updates.answers || []),
      updates.isActive !== false
    ]
  );

  return result.rowCount > 0;
}

async function deactivateQuestion(questionId) {
  if (!USE_DATABASE) {
    const store = readStore();
    const q = (store.questions || []).find(item => item.id === questionId);
    if (!q) return false;
    q.isActive = false;
    writeStore(store);
    return true;
  }

  const result = await pool.query(
    'UPDATE questions SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
    [questionId]
  );

  return result.rowCount > 0;
}

async function getUsageMap() {
  if (!USE_DATABASE) {
    const store = readStore();
    return store.questionUsage || {};
  }

  const { rows } = await pool.query('SELECT question_id, usage_count FROM question_usage');
  const usage = {};
  for (const row of rows) {
    usage[row.question_id] = Number(row.usage_count || 0);
  }
  return usage;
}

async function incrementUsage(questionIds) {
  if (!USE_DATABASE) {
    const store = readStore();
    for (const id of questionIds) {
      store.questionUsage[id] = Number(store.questionUsage[id] || 0) + 1;
    }
    writeStore(store);
    return;
  }

  for (const id of questionIds) {
    await pool.query(
      `
      INSERT INTO question_usage (question_id, usage_count)
      VALUES ($1, 1)
      ON CONFLICT (question_id)
      DO UPDATE SET usage_count = question_usage.usage_count + 1
      `,
      [id]
    );
  }
}

async function createParticipant(participant) {
  if (!USE_DATABASE) {
    const store = readStore();
    store.participants.push(participant);
    writeStore(store);
    return;
  }

  await pool.query(
    `
    INSERT INTO participants (
      id, name, team_name, assigned_question_ids, current_clue, status,
      start_at, completed_at, elapsed_seconds, hints_used, penalty_seconds, final_code
    ) VALUES (
      $1, $2, $3, $4::jsonb, $5, $6,
      $7, $8, $9, $10, $11, $12
    )
    `,
    [
      participant.id,
      participant.name,
      participant.teamName,
      JSON.stringify(participant.assignedQuestionIds),
      participant.currentClue,
      participant.status,
      participant.startAt,
      participant.completedAt,
      participant.elapsedSeconds,
      participant.hintsUsed,
      participant.penaltySeconds,
      participant.finalCode
    ]
  );
}

function hydrateParticipantDb(row) {
  return {
    id: row.id,
    name: row.name,
    teamName: row.team_name,
    assignedQuestionIds: Array.isArray(row.assigned_question_ids)
      ? row.assigned_question_ids
      : typeof row.assigned_question_ids === 'string'
      ? JSON.parse(row.assigned_question_ids)
      : [],
    currentClue: Number(row.current_clue),
    status: row.status,
    startAt: row.start_at,
    completedAt: row.completed_at,
    elapsedSeconds: row.elapsed_seconds,
    hintsUsed: Number(row.hints_used || 0),
    penaltySeconds: Number(row.penalty_seconds || 0),
    finalCode: row.final_code
  };
}

async function fetchParticipant(participantId) {
  if (!USE_DATABASE) {
    const store = readStore();
    return store.participants.find(p => p.id === participantId) || null;
  }

  const { rows } = await pool.query('SELECT * FROM participants WHERE id = $1', [participantId]);
  if (!rows.length) return null;
  return hydrateParticipantDb(rows[0]);
}

async function appendAttempt(participantId, clueNumber, answer, correct) {
  if (!USE_DATABASE) {
    const store = readStore();
    const participant = store.participants.find(p => p.id === participantId);
    if (!participant) return;
    participant.attempts = participant.attempts || [];
    participant.attempts.push({
      clueNumber,
      answer: answer.slice(0, 120),
      correct,
      at: new Date().toISOString()
    });
    writeStore(store);
    return;
  }

  await pool.query(
    `
    INSERT INTO attempts (participant_id, clue_number, answer, correct)
    VALUES ($1, $2, $3, $4)
    `,
    [participantId, clueNumber, answer.slice(0, 120), correct]
  );
}

async function incrementParticipantClue(participantId) {
  if (!USE_DATABASE) {
    const store = readStore();
    const participant = store.participants.find(p => p.id === participantId);
    if (!participant) return;
    participant.currentClue += 1;
    writeStore(store);
    return;
  }

  await pool.query('UPDATE participants SET current_clue = current_clue + 1 WHERE id = $1', [participantId]);
}

async function completeParticipant(participantId, data) {
  if (!USE_DATABASE) {
    const store = readStore();
    const participant = store.participants.find(p => p.id === participantId);
    if (!participant) return null;
    if (participant.status === 'completed') return participant;

    participant.status = 'completed';
    participant.completedAt = new Date().toISOString();
    participant.elapsedSeconds = data.elapsedSeconds;
    participant.hintsUsed = data.hintsUsed;
    participant.penaltySeconds = data.penaltySeconds;
    participant.finalCode = data.finalCode;
    writeStore(store);
    return participant;
  }

  await pool.query(
    `
    UPDATE participants
    SET status = 'completed',
        completed_at = NOW(),
        elapsed_seconds = $2,
        hints_used = $3,
        penalty_seconds = $4,
        final_code = $5
    WHERE id = $1 AND status != 'completed'
    `,
    [participantId, data.elapsedSeconds, data.hintsUsed, data.penaltySeconds, data.finalCode]
  );

  return fetchParticipant(participantId);
}

async function fetchAllParticipants() {
  if (!USE_DATABASE) {
    const store = readStore();
    return store.participants;
  }

  const { rows } = await pool.query('SELECT * FROM participants ORDER BY start_at DESC');
  return rows.map(hydrateParticipantDb);
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9' _.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeQuestion(question) {
  return {
    id: question.id,
    domain: question.domain,
    type: question.type,
    title: question.title,
    task: question.task,
    clue: question.clue,
    link: question.link,
    hint: question.hint
  };
}

function pickWeighted(pool, usageMap) {
  const weighted = pool.map(question => {
    const usage = Number(usageMap[question.id] || 0);
    return {
      question,
      weight: 1 / (1 + usage)
    };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.question;
    }
  }

  return weighted[weighted.length - 1].question;
}

function getParticipant(store, participantId) {
  return store.participants.find(p => p.id === participantId);
}

function generateFinalCode(name, seconds) {
  const namePart = String(name || '')
    .replace(/[^a-z]/gi, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  const timePart = String(Number(seconds || 0)).slice(-3).padStart(3, '0');
  return `${namePart}${timePart}`;
}

function requireAdmin(req, res, next) {
  const supplied = req.get('x-admin-key') || req.query.key;
  if (supplied !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized admin key' });
  }
  return next();
}
// Verification route
app.post('/api/verify-student', (req, res) => {
  const { name, team_name, phone_num } = req.body;
  
  console.log('=== VERIFICATION DEBUG ===');
  console.log('Input:', { name, team_name, phone_num });
  console.log('Total students in sheet:', approvedStudents.length);
  console.log('First student:', approvedStudents[0]);
  
  const found = approvedStudents.some(row => {
    const rowName = (row['Full Name '] || '').toString().trim().toLowerCase();
    const rowTeam = (row['Team Name (Fill the same name as your Teammate)'] || '').toString().trim().toLowerCase();
    const rowPhone = (row['Mobile No'] || '').toString().trim();
    
    const match = 
      rowName === name?.trim().toLowerCase() &&
      rowTeam === team_name?.trim().toLowerCase() &&
      rowPhone === phone_num?.trim();
    
    if (match) {
      console.log('✅ MATCH FOUND:', { rowName, rowTeam, rowPhone });
    }
    
    return match;
  });
  
  console.log('Result:', { valid: found });
  res.json({ valid: found });
});
app.post('/api/start', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const teamName = String(req.body.teamName || '').trim();

  if (!name || !teamName) {
    return res.status(400).json({ error: 'name and teamName are required' });
  }

  try {
    // CHECK for existing participant
    let existing = null;
    
    if (USE_DATABASE && pool) {
      const result = await pool.query(
        `SELECT id, status FROM participants WHERE LOWER(name) = LOWER($1) AND LOWER(team_name) = LOWER($2) LIMIT 1`,
        [name, teamName]
      );
      if (result.rows.length > 0) {
        existing = result.rows[0];
      }
    } else {
      // File-based storage
      const store = readStore();
      const found = store.participants.find(p => 
        p.name.toLowerCase() === name.toLowerCase() && 
        p.teamName.toLowerCase() === teamName.toLowerCase()
      );
      if (found) {
        existing = { id: found.id, status: found.status };
      }
    }

    // If user already attempted
    if (existing) {
      if (existing.status === 'completed') {
        return res.status(409).json({ error: '❌ You have already completed this quiz. Each user can only attempt ONCE!' });
      }
      if (existing.status === 'active') {
        return res.status(409).json({ error: '❌ You already have an active session. Complete it first.' });
      }
    }

    // Rest of your code...
    const usage = await getUsageMap();
    const byDomain = await getQuestionsByDomain();

    for (const domain of DOMAIN_ORDER) {
      if (!Array.isArray(byDomain[domain]) || byDomain[domain].length === 0) {
        return res.status(500).json({ error: `No active questions found for domain: ${domain}` });
      }
    }

    const assigned = DOMAIN_ORDER.map(domain => pickWeighted(byDomain[domain], usage));

    const participantId = crypto.randomUUID();
    const participant = {
      id: participantId,
      name,
      teamName,
      assignedQuestionIds: assigned.map(q => q.id),
      currentClue: 1,
      status: 'active',
      startAt: new Date().toISOString(),
      completedAt: null,
      elapsedSeconds: null,
      hintsUsed: 0,
      penaltySeconds: 0,
      finalCode: null,
      attempts: []
    };

    await createParticipant(participant);
    await incrementUsage(participant.assignedQuestionIds);

    return res.json({
      participantId,
      clues: assigned.map(sanitizeQuestion)
    });
  } catch (error) {
    console.error('Start error:', error);
    return res.status(500).json({ error: 'Failed to start session' });
  }
});

app.post('/api/answer', async (req, res) => {
  const participantId = String(req.body.participantId || '').trim();
  const clueNumber = Number(req.body.clueNumber || 0);
  const answer = String(req.body.answer || '').trim();

  if (!participantId || !clueNumber || !answer) {
    return res.status(400).json({ error: 'participantId, clueNumber and answer are required' });
  }

  let participant;
  try {
    participant = await fetchParticipant(participantId);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load participant' });
  }

  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  if (participant.status !== 'active') {
    return res.status(409).json({ error: 'Session is already completed' });
  }

  if (clueNumber !== participant.currentClue) {
    return res.status(409).json({
      error: `Submit clue ${participant.currentClue} next`
    });
  }

  let question;
  const questionId = participant.assignedQuestionIds[clueNumber - 1];
  try {
    const questionMap = await getQuestionMapById(true);
    question = questionMap[questionId];
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load questions' });
  }

  if (!question) {
    return res.status(500).json({ error: 'Assigned question missing' });
  }

  const normalizedInput = normalize(answer);
  const correct = question.answers.some(expected => {
    const normalizedExpected = normalize(expected);
    return normalizedExpected === normalizedInput || normalizedExpected.replace(/[()<>]/g, '') === normalizedInput;
  });

  try {
    await appendAttempt(participantId, clueNumber, answer, correct);
    if (correct) {
      await incrementParticipantClue(participantId);
      participant.currentClue += 1;
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save attempt' });
  }

  return res.json({
    correct,
    done: participant.currentClue > 5,
    nextClue: Math.min(participant.currentClue, 5)
  });
});

app.post('/api/complete', async (req, res) => {
  const participantId = String(req.body.participantId || '').trim();
  const elapsedSeconds = Number(req.body.elapsedSeconds || 0);
  const hintsUsed = Number(req.body.hintsUsed || 0);
  const penaltySeconds = Number(req.body.penaltySeconds || 0);

  if (!participantId) {
    return res.status(400).json({ error: 'participantId is required' });
  }

  let participant;
  try {
    participant = await fetchParticipant(participantId);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load participant' });
  }

  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  if (participant.status === 'completed') {
    return res.json({ ok: true, finalCode: participant.finalCode, elapsedSeconds: participant.elapsedSeconds });
  }

  const start = new Date(participant.startAt).getTime();
  const serverElapsed = start ? Math.max(0, Math.floor((Date.now() - start) / 1000)) : 0;
  const finalElapsed = elapsedSeconds > 0 ? elapsedSeconds : serverElapsed + penaltySeconds;

  const completionData = {
    elapsedSeconds: finalElapsed,
    hintsUsed: Math.max(0, hintsUsed),
    penaltySeconds: Math.max(0, penaltySeconds),
    finalCode: generateFinalCode(participant.name, finalElapsed)
  };

  try {
    participant = await completeParticipant(participantId, completionData);
    
    // Remove from active participants when completed
    const normalizedKey = `${participant.name}|${participant.teamName}`.toLowerCase();
    activeParticipants.delete(normalizedKey);
    
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save completion' });
  }

  return res.json({
    ok: true,
    finalCode: participant.finalCode,
    elapsedSeconds: participant.elapsedSeconds
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, storage: USE_DATABASE ? 'postgres' : 'file-json' });
});

async function boot() {
  if (USE_DATABASE) {
    await ensureDatabase();
    await seedDatabaseQuestions();
  } else {
    ensureStore();
  }

  app.listen(PORT, () => {
    console.log(`Quest backend running at ${baseUrl}`);
    console.log(`Storage mode: ${USE_DATABASE ? 'postgres' : 'file-json'}`);
  });
}

boot().catch(error => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
