const bcrypt = require('bcryptjs');
const db = require('../../src/config/db').pool;

async function seed() {
    console.log('Starting database seeding...');
    const connection = await db.getConnection()
    try {
        await connection.beginTransaction();
        console.log('Seeding users...');
        const adminPassword = await bcrypt.hash('1234', 10);
        const memberPassword = await bcrypt.hash('1234', 10);
        const [usersResult] = await connection.execute(
            `INSERT INTO users (name, email, password_hash, role) VALUES
        ('Thushan Madhushara', 'thushan@gamil.com', ?, 'admin'),
        ('Dilshan Madhuaranga', 'dilshan@gmail.com', ?, 'member'),
        ('amindu Indushan', 'amindu@gmail.com', ?, 'member')
       ON DUPLICATE KEY UPDATE name=VALUES(name);`,
            [adminPassword, memberPassword, memberPassword]
        );
        const adminId = 1;
        const aliceId = 2;
        const bobId = 3;
        console.log('Seeding projects...');
        const [projectResult] = await connection.execute(
            `INSERT INTO projects (id, name, description) VALUES
        (1, 'Task Maneger Project', 'Best Idea What To you Do This Project Maneg You')
       ON DUPLICATE KEY UPDATE name=VALUES(name);`
        );
        const projectId = 1;
        console.log('Seeding tasks...');
        await connection.execute(
            `INSERT INTO tasks (project_id, title, status, assignee_user_id) VALUES
        (?, 'Setup new Project', 'in_progress', ?),
        (?, 'Migrate user database', 'todo', ?),
        (?, 'Deploy frontend application V1', 'todo', ?),
        (?, 'Write API documentation', 'done', ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title);`,
            [projectId, aliceId, projectId, bobId, projectId, aliceId, projectId, adminId]
        );
        await connection.commit();
        console.log('Seeding completed successfully.');
    } catch (error) {
        await connection.rollback();
        console.error('Error during seeding:', error);
        process.exit(1);
    } finally {
        connection.release();
        db.end();
    }
}
seed();
