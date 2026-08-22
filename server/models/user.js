const db = require('../db'); // Assuming db pool is exported from here
const bcrypt = require('bcrypt');

const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
    );
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const getUserById = async (id) => {
    const result = await db.query('SELECT id, name, email, photo FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const updateUser = async (id, name, photo, email) => {
    const result = await db.query(
        'UPDATE users SET name = $1, photo = $2, email = $3 WHERE id = $4 RETURNING id, name, email, photo',
        [name, photo, email, id]
    );
    return result.rows[0];
};

const deleteUser = async (id) => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = { createUser, getUserByEmail, getUserById, updateUser, deleteUser };
