import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';

/***********************************CREATING JWT TOKEN******************** */
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '10d' });
};

/***********************************REGISTER USER******************** */
const registerUser = async (req, res) => {
  //Get data from request body
  const { email, password } = req.body;

  //Check the fields are not empty
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  //Check if email already exists
  const exist = await User.findOne({ email });
  if (exist) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  //Hash password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  try {
    //register user
    const user = await User.create({ email, password: hashed });
    //create JSON Web Token
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/***********************************LOGIN USER******************** */
const loginUser = async (req, res) => {
  //Get data from request body
  const { email, password } = req.body;

  //Check the fields are not empty
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  //Check if email already exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Incorrect Email.' });
  }

  //Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: 'Incorrect password.' });
  }

  try {
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { registerUser, loginUser };
