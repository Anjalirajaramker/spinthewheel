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
const DOMAIN_ORDER = ['github', 'docs', 'wikipedia', 'neal', 'inspect'];
const QUESTION_BANK = {
  github: [
    {
      id: 'gh-octocat',
      type: 'GITHUB HUNT',
      title: 'The Octodex Gallery',
      task: 'Visit the GitHub Octodex gallery.',
      clue: 'GitHub\'s mascot appears in many creative costumes here. Visit the Octodex gallery and tell us the name used to describe these mascot illustrations.',
      link: 'https://octodex.github.com',
      hint: 'Look at the title of the website itself.',
      answers: ['octodex']
    },
    {
      id: 'gh-hello-world',
      type: 'GITHUB HUNT',
      title: 'The Hello World Starter',
      task: "Visit GitHub's official Hello World guide.",
      clue: "Every developer's journey begins with a simple phrase. On GitHub's Hello World guide page, what two-word repository name is used in the tutorial?",
      link: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
      hint: 'Look at the first example repository created in the tutorial.',
      answers: ['hello-world', 'hello world']
    },
    {
      id: 'gh-trending',
      type: 'GITHUB HUNT',
      title: 'The Linux Kernel Vault',
      task: 'Visit the Linux kernel repository on GitHub.',
      clue: 'The world\'s most famous open-source operating system lives here. Visit the Linux repository on GitHub and find the username of the person who created this repository.',
      link: 'https://github.com/torvalds/linux',
      hint: 'Look at the repository URL and the owner name at the top of the page.',
      answers: ['torvalds']
    },
    {
      id: 'gh-stars',
      type: 'GITHUB HUNT',
      title: 'The GitHub Star Hunter',
      task: 'Visit the TensorFlow repository.',
      clue: 'Some repositories shine brighter than others. Visit the TensorFlow GitHub repository and look beside the star icon. What does this icon represent?',
      link: 'https://github.com/tensorflow/tensorflow',
      hint: 'Look at the icons near the top right of the repository page.',
      answers: ['stars', 'star']
    },
    {
      id: 'gh-language-linux',
      type: 'GITHUB HUNT',
      title: 'The Language Hunt',
      task: 'Visit the Linux kernel repository.',
      clue: "The world's most famous open-source operating system lives here. Visit the Linux GitHub repository and find the programming language that dominates the project.",
      link: 'https://github.com/torvalds/linux',
      hint: 'Look at the colored language bar on the right side of the repository page.',
      answers: ['c']
    },
    {
      id: 'gh-readme-react',
      type: 'GITHUB HUNT',
      title: 'The Story of the Project',
      task: 'Visit the React repository.',
      clue: 'Every project tells its story somewhere. On the React GitHub repository page, find the section where installation instructions and project details are written. What is the name of this section?',
      link: 'https://github.com/facebook/react',
      hint: 'Scroll down on the repository page and look for the large markdown document displayed below the files list.',
      answers: ['readme', 'readme.md']
    }
  ],
  docs: [
    {
      id: 'docs-zen',
      type: 'DOCS DIVE',
      title: 'The Zen of Python',
      task: 'Visit the Python documentation.',
      clue: "Python has a secret philosophy hidden in its documentation. Find the famous 'Zen of Python'. What is the very first word of the 7th line?",
      link: 'https://peps.python.org/pep-0020/',
      hint: 'Look for the list of short philosophical lines written by Tim Peters.',
      answers: ['readability']
    },
    {
      id: 'docs-len',
      type: 'DOCS DIVE',
      title: 'The Built-in Function Hunt',
      task: 'Visit Python built-in functions documentation.',
      clue: 'Python has many built-in helpers. Find the function that returns the number of items in a list. What is its name?',
      link: 'https://docs.python.org/3/library/functions.html',
      hint: 'Search the page for the word length.',
      answers: ['len', 'len()']
    },
    {
      id: 'docs-h1',
      type: 'DOCS DIVE',
      title: 'The HTML Structure Detective',
      task: 'Visit MDN Web Docs.',
      clue: 'Every webpage has a skeleton. According to MDN, which HTML tag represents the main heading of a page?',
      link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
      hint: 'Look for the largest heading tag.',
      answers: ['h1', '<h1>']
    },
    {
      id: 'docs-color',
      type: 'DOCS DIVE',
      title: 'The CSS Color Trick',
      task: 'Visit MDN CSS documentation.',
      clue: 'Webpages become colorful thanks to CSS. According to MDN, which CSS property changes the text color of an element?',
      link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      hint: 'Search for text color property.',
      answers: ['color']
    },
    {
      id: 'docs-for-keyword',
      type: 'DOCS DIVE',
      title: 'The Python Keyword Search',
      task: 'Visit Python keyword documentation.',
      clue: 'In Python, loops allow us to repeat actions. Which keyword is used to start a loop that iterates over items in a sequence?',
      link: 'https://docs.python.org/3/reference/lexical_analysis.html#keywords',
      hint: 'Think of the keyword used in for loops.',
      answers: ['for']
    },
    {
      id: 'docs-click',
      type: 'DOCS DIVE',
      title: 'The JavaScript Button Event',
      task: 'Visit MDN JavaScript documentation.',
      clue: 'When users click a button on a webpage, JavaScript detects the action using an event. According to MDN, what is the name of the event triggered when a user clicks an element?',
      link: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event',
      hint: 'Search for mouse click event.',
      answers: ['click']
    }
  ],
  wikipedia: [
    {
      id: 'wiki-ai',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Father of AI',
      task: 'Visit the Wikipedia page for Artificial Intelligence.',
      clue: "The field of Artificial Intelligence had a historic conference where its name was first officially used. According to Wikipedia, in which year was the term 'Artificial Intelligence' first coined?",
      link: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      hint: 'Look for the Dartmouth Conference mentioned in the history section.',
      answers: ['1956']
    },
    {
      id: 'wiki-qr',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The QR Code Secret',
      task: 'Visit the Wikipedia page for QR Code.',
      clue: "Every QR code hides a simple meaning in its name. According to Wikipedia, what do the letters 'QR' stand for?",
      link: 'https://en.wikipedia.org/wiki/QR_code',
      hint: 'Check the first paragraph of the article.',
      answers: ['quick response']
    },
    {
      id: 'wiki-python-creator',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Python Origin',
      task: 'Visit the Wikipedia page for Python (programming language).',
      clue: 'The Python language was created by a programmer inspired by a comedy show. According to Wikipedia, who created Python?',
      link: 'https://en.wikipedia.org/wiki/Python_(programming_language)',
      hint: 'Look at the infobox on the right side of the page.',
      answers: ['guido van rossum', 'van rossum']
    },
    {
      id: 'wiki-arpanet',
      type: 'WIKIPEDIA FACT FIND',
      title: "The Internet's Birthday",
      task: 'Visit the Wikipedia page for the Internet.',
      clue: "The internet didn't appear overnight. According to Wikipedia, which early network is considered the foundation of the modern Internet?",
      link: 'https://en.wikipedia.org/wiki/Internet',
      hint: 'Search the page for ARPANET.',
      answers: ['arpanet']
    },
    {
      id: 'wiki-linux-year',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Linux Legend',
      task: 'Visit the Wikipedia page for Linux.',
      clue: "The world's most famous open-source operating system started as a personal project. According to Wikipedia, in which year was Linux first released?",
      link: 'https://en.wikipedia.org/wiki/Linux',
      hint: "Look in the infobox under 'Initial release'.",
      answers: ['1991']
    },
    {
      id: 'wiki-turing',
      type: 'WIKIPEDIA FACT FIND',
      title: 'The Alan Turing Mystery',
      task: 'Visit the Wikipedia page for Alan Turing.',
      clue: 'This brilliant mathematician helped break Nazi codes during World War II. According to Wikipedia, what famous machine concept is named after him?',
      link: 'https://en.wikipedia.org/wiki/Alan_Turing',
      hint: 'Search the page for machine theory.',
      answers: ['turing machine']
    }
  ],
  neal: [
    {
      id: 'neal-rigel',
      type: 'NEAL.FUN HUNT',
      title: 'The Bright Blue Giant',
      task: 'Visit the Space scale explorer.',
      clue: 'In the cosmic scale of stars, one brilliant blue star shines in the Orion constellation. Find Rigel in the Space visualization. According to the page, what type of star is Rigel?',
      link: 'https://neal.fun/',
      hint: 'Scroll through the star comparison until you find Rigel.',
      answers: ['blue supergiant star']
    },
    {
      id: 'neal-crab',
      type: 'NEAL.FUN HUNT',
      title: 'The Cosmic Crab',
      task: 'Visit the Space scale explorer.',
      clue: 'In the vast universe, the remains of an exploded star form a glowing cloud named after a sea creature. Find the Crab Nebula in the space visualization. According to the page, what type of cosmic object is it?',
      link: 'https://neal.fun/',
      hint: 'Look just below the name of the object.',
      answers: ['supernova remnant']
    },
    {
      id: 'neal-angler',
      type: 'NEAL.FUN HUNT',
      title: 'The Glowing Angler',
      task: 'Visit the Deep Sea explorer.',
      clue: 'A fish that hunts with a glowing light on its head waits in the darkness. Find the Anglerfish in the deep sea chart. According to the page, in which ocean region does this creature live?',
      link: 'https://neal.fun/',
      hint: 'Scroll into the dark part of the ocean.',
      answers: ['the midnight zone', 'midnight zone']
    },
    {
      id: 'neal-spider-crab',
      type: 'NEAL.FUN HUNT',
      title: 'The Giant of the Twilight',
      task: 'Visit the Deep Sea explorer.',
      clue: 'One of the largest arthropods on Earth crawls slowly in the deep ocean. Find the Japanese Spider Crab in the Deep Sea visualization. According to the chart, in which ocean region does this creature live?',
      link: 'https://neal.fun/',
      hint: 'You will find it not too deep in the ocean — do not scroll too far down.',
      answers: ['the twilight zone', 'twilight zone']
    },
    {
      id: 'neal-paper-29',
      type: 'NEAL.FUN HUNT',
      title: 'The Paper Tower',
      task: 'Visit the paper folding experiment.',
      clue: 'A single sheet of paper doubles its thickness every time it is folded. According to the experiment, after how many folds does the paper become about 53.7 km tall, roughly the length of Rhode Island?',
      link: 'https://neal.fun/',
      hint: 'Just fold or unfold the paper until the height matches the value shown.',
      answers: ['29 folds', '29']
    },
    {
      id: 'neal-paper-34',
      type: 'NEAL.FUN HUNT',
      title: 'The Paper Tower',
      task: 'Visit the paper folding experiment.',
      clue: 'A single sheet of paper doubles its thickness every time it is folded. According to the experiment, how many folds are needed for the paper to reach about 1,718 km, longer than California?',
      link: 'https://neal.fun/',
      hint: 'Just fold or unfold the paper until the height matches the value shown.',
      answers: ['34 folds', '34']
    }
  ],
  inspect: [
    {
      id: 'ins-comment',
      type: 'INSPECT CHALLENGE',
      title: 'The Hidden Comment',
      task: 'Visit the event page.',
      clue: 'Every developer leaves little secrets in the code. Visit the event webpage and open the page source (Ctrl+U or F12). Somewhere inside the HTML comments, a hidden phrase is waiting. What is the secret key?',
      link: '',
      hint: 'Search the page source for <!-- comment -->.',
      answers: ['quest2026_win']
    },
    {
      id: 'ins-meta',
      type: 'INSPECT CHALLENGE',
      title: 'The Hidden Meta Tag',
      task: 'Inspect the <head> section.',
      clue: "Every developer leaves little secrets in the code. Visit the event webpage and open the page source (Ctrl+U or F12). Inspect the <head> section of the page and find the hidden meta tag named 'quest-key'. What is its content value?",
      link: '',
      hint: 'Look for a <meta> tag with a custom name.',
      answers: ['spin_the_wheel']
    },
    {
      id: 'ins-hidden-text',
      type: 'INSPECT CHALLENGE',
      title: 'The Invisible Text',
      task: 'Inspect hidden CSS text.',
      clue: 'Every developer leaves little secrets in the code. Visit the event webpage and open the page source (Ctrl+U or F12). Inspect the page elements and find the text that is hidden using CSS display:none. What word is hidden there?',
      link: '',
      hint: 'Search for elements with display:none.',
      answers: ['jackpot']
    },
    {
      id: 'ins-data-code',
      type: 'INSPECT CHALLENGE',
      title: 'The Data Attribute',
      task: 'Inspect element attributes.',
      clue: 'Every developer leaves little secrets in the code. Visit the event webpage and open the page source (Ctrl+U or F12). Inspect the button element on the page and find the value of the data-code attribute.',
      link: '',
      hint: 'Look for attributes starting with data-.',
      answers: ['debug_master']
    },
    {
      id: 'ins-js-variable',
      type: 'INSPECT CHALLENGE',
      title: 'The API Endpoint Secret',
      task: 'Check the script section.',
      clue: 'Every developer leaves little secrets in the code. Visit the event webpage and open the page source (Ctrl+U or F12). Inspect the page and find the API_URL variable. What domain value is assigned to it?',
      link: '',
      hint: 'Search inside <script> tags for const API_URL.',
      answers: ['https://webdetective.onrender.com', 'webdetective.onrender.com']
    },
    {
      id: 'ins-image',
      type: 'INSPECT CHALLENGE',
      title: 'The Hidden Image Name',
      task: 'Inspect hidden media.',
      clue: 'Every developer leaves little secrets in the code. Visit the event webpage and open the page source (Ctrl+U or F12). A hidden treasure is stored in the assets. Inspect the page elements and find the name of the hidden image file used in the HTML.',
      link: '',
      hint: 'Look at <img> tags inside the code.',
      answers: ['golden_spin.png', 'golden spin png']
    }
  ]
};

function normalizeDomainName(domain) {
  const normalized = String(domain || '').trim().toLowerCase();
  return normalized === 'nigel' ? 'neal' : normalized;
}

function getDefaultQuestionsFlat() {
  return Object.entries(QUESTION_BANK)
    .flatMap(([domain, list]) =>
      list.map(question => ({
        ...question,
        domain: normalizeDomainName(domain),
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
    const domain = normalizeDomainName(q.domain);
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push({ ...q, domain });
    return acc;
  }, {});
}

async function createQuestion(question) {
  const normalizedDomain = normalizeDomainName(question.domain);

  if (!USE_DATABASE) {
    const store = readStore();
    store.questions = store.questions || [];
    store.questions.push({ ...question, domain: normalizedDomain });
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
      normalizedDomain,
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
  const normalizedDomain = normalizeDomainName(updates.domain);

  if (!USE_DATABASE) {
    const store = readStore();
    const idx = (store.questions || []).findIndex(q => q.id === questionId);
    if (idx < 0) return false;
    store.questions[idx] = { ...store.questions[idx], ...updates, domain: normalizedDomain };
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
      normalizedDomain,
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
  if (approvedStudents.length > 0) {
    console.log('First student:', approvedStudents[0]);
  }
  
  const found = approvedStudents.some(row => {
    // Handle all variations of column names and data types
    const rowName = (row['Full Name'] || row['Full Name '] || row['Name'] || '').toString().trim().toLowerCase();
    const rowTeam = (row['Team Name (Enter the SAME Team Name as your teammates)'] || 
                     row['Team Name (Fill the same name as your Teammate)'] || 
                     row['Team Name'] || 
                     row['Team'] || '').toString().trim().toLowerCase();
    const rowPhone = String(row['Mobile No'] || row['Phone'] || row['Mobile'] || '').trim();
    
    const inputName = String(name || '').trim().toLowerCase();
    const inputTeam = String(team_name || '').trim().toLowerCase();
    const inputPhone = String(phone_num || '').trim();
    
    const match = rowName === inputName && rowTeam === inputTeam && rowPhone === inputPhone;
    
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