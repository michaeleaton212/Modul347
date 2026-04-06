const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';

app.post('/send', async (req, res) => {
  const { id, receiverId, amount } = req.body;

  const friendsRes = await axios.get(`${ACCOUNT_URL}/Account/Friends/?userid=${id}`);
  const isFriend = friendsRes.data.some(f => f.id === receiverId);
  if (!isFriend) return res.status(400).json({ error: 'Not a friend' });

  const balanceRes = await axios.get(`${ACCOUNT_URL}/Account/Cryptos/?userid=${id}`);
  if (balanceRes.data.amount < amount) return res.status(400).json({ error: 'Not enough coins' });

  await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Subtract`, { userId: id, amount });
  await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Add`, { userId: receiverId, amount });

  res.json({ success: true });
});

app.listen(8003, () => console.log('SendReceive running on port 8003'));