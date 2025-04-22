const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'license_db'
});

app.get('/', async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ status: 'error', message: 'No key provided' });

  try {
    const [rows] = await db.query('SELECT * FROM lisensi WHERE license_key = ?', [key]);
    if (rows.length === 0) return res.json({ status: 'tidak_terdaftar' });

    const lisensi = rows[0];
    const now = new Date();
    const expired = new Date(lisensi.expired);

    if (expired < now || lisensi.status !== 'aktif') {
      return res.json({ status: 'tidak_aktif', expired: lisensi.expired });
    }

    res.json({ status: 'aktif', nama: lisensi.nama, expired: lisensi.expired });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`License API running on http://localhost:${PORT}`);
});
