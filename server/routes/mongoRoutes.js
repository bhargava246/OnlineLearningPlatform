import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Test from '../models/Test.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth routes
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Course routes
router.get('/courses', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName')
      .select('-modules.correctAnswer -notes');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
});

// Admin: Create course with modules and notes
router.post('/courses', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      thumbnail,
      level,
      price,
      modules,
      notes
    } = req.body;

    // Use admin user ID for instructor
    const adminUser = await User.findOne({ role: 'admin' });
    
    const course = new Course({
      title,
      description,
      category,
      thumbnail,
      level: level || 'Beginner',
      price: price || 0,
      instructor: adminUser._id,
      modules: modules || [],
      notes: notes || []
    });

    await course.save();
    await course.populate('instructor', 'firstName lastName');
    
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create course', error: error.message });
  }
});

// Admin: Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update course', error: error.message });
  }
});

// Admin: Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
});

// Admin: Add module to course
router.post('/courses/:id/modules', async (req, res) => {
  try {
    const { title, description, youtubeUrl, duration, orderIndex } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.modules.push({
      title,
      description,
      youtubeUrl,
      duration,
      orderIndex: orderIndex || course.modules.length
    });
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add module', error: error.message });
  }
});

// Admin: Add note to course
router.post('/courses/:id/notes', async (req, res) => {
  try {
    const { title, pdfUrl, fileSize } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.notes.push({
      title,
      pdfUrl,
      fileSize: fileSize || 'Unknown'
    });
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add note', error: error.message });
  }
});

// Get course modules
router.get('/courses/:id/modules', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course.modules.sort((a, b) => a.orderIndex - b.orderIndex));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch modules', error: error.message });
  }
});

// Get course notes
router.get('/courses/:id/notes', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course.notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

// Enrollment routes
router.get('/users/:id/enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate('course', 'title description category thumbnail duration videoCount');
    
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollments', error: error.message });
  }
});

router.post('/enrollments', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    const enrollment = new Enrollment({
      student: userId,
      course: courseId
    });
    
    await enrollment.save();
    await enrollment.populate('course', 'title description category thumbnail duration videoCount');
    
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create enrollment', error: error.message });
  }
});

// Update enrollment progress
router.put('/enrollments/:studentId/:courseId/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.params.studentId, course: req.params.courseId },
      { progress },
      { new: true }
    );
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
});

// User stats
router.get('/users/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const enrollments = await Enrollment.find({ student: userId }).populate('course');
    const enrolledCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.isCompleted).length;
    
    let hoursLearned = 0;
    enrollments.forEach(enrollment => {
      if (enrollment.course) {
        hoursLearned += Math.floor((enrollment.course.duration * enrollment.progress) / 100);
      }
    });
    
    // Calculate average test scores (implement when tests are added)
    const averageScore = 85; // Placeholder
    
    res.json({
      enrolledCourses,
      completedCourses,
      hoursLearned,
      averageScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user stats', error: error.message });
  }
});

// Admin stats
router.get('/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const activeCourses = await Course.countDocuments({ isActive: true });
    const testsCompleted = 0; // Placeholder - implement when tests are added
    const averageScore = 85; // Placeholder
    
    res.json({
      totalUsers,
      activeCourses,
      testsCompleted,
      averageScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
  }
});

export default router;