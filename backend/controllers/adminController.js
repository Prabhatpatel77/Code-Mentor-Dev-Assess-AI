import mongoose from 'mongoose';
import http from 'node:http';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { HintUsage } from '../models/HintUsage.js';
import { SEED_PROBLEMS } from '../seed/seedProblems.js';
import { memoryUsers } from './authController.js';
import { memorySubmissions } from './submissionController.js';
import { memoryHintUsages } from './aiController.js';

/**
 * GET /api/admin/overview
 * Platform-wide analytics for Admin Dashboard
 */
export const getPlatformOverview = async (req, res, next) => {
  try {
    let allUsers = [];
    let allSubmissions = [];
    let allProblemsCount = SEED_PROBLEMS.length;

    if (mongoose.connection.readyState === 1) {
      try {
        allUsers = await User.find({ role: 'student' }).select('-password').exec();
        allSubmissions = await Submission.find({}).exec();
        const dbProblemCount = await Problem.countDocuments();
        if (dbProblemCount > 0) allProblemsCount = dbProblemCount;
      } catch (dbErr) {
        console.warn(`[Admin Overview DB Warning] ${dbErr.message}`);
      }
    }

    // Merge in-memory records
    if (allUsers.length === 0) {
      allUsers = memoryUsers.filter(u => u.role === 'student');
    }
    if (allSubmissions.length === 0) {
      allSubmissions = memorySubmissions;
    }

    const totalStudents = allUsers.length;
    const totalSubmissions = allSubmissions.length;
    const solvedSubmissions = allSubmissions.filter(s => s.status === 'Accepted' || (s.passedTests > 0 && s.passedTests === s.totalTests)).length;
    const overallSuccessRate = totalSubmissions > 0 ? Math.round((solvedSubmissions / totalSubmissions) * 100) : 0;

    // Active students in last 30 days
    const activeStudentsCount = new Set(allSubmissions.map(s => String(s.userId))).size;

    // Most attempted problems breakdown
    const problemAttempts = {};
    allSubmissions.forEach(s => {
      const pid = String(s.problemId);
      problemAttempts[pid] = (problemAttempts[pid] || 0) + 1;
    });

    const topAttempted = Object.entries(problemAttempts)
      .map(([problemId, attempts]) => {
        const prob = SEED_PROBLEMS.find(p => String(p._id) === problemId || p.title.toLowerCase().replace(/\s+/g, '_') === problemId.toLowerCase());
        return {
          problemId,
          title: prob ? prob.title : problemId,
          attempts
        };
      })
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      overview: {
        totalStudents,
        activeStudents: activeStudentsCount,
        totalProblems: allProblemsCount,
        totalSubmissions,
        solvedSubmissions,
        overallSuccessRate,
        topAttemptedProblems: topAttempted
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/students
 * Searchable list of registered students
 */
export const getStudentList = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    let students = [];
    let submissions = [];

    if (mongoose.connection.readyState === 1) {
      try {
        students = await User.find({ role: 'student' }).select('-password').exec();
        submissions = await Submission.find({}).exec();
      } catch (dbErr) {}
    }

    if (students.length === 0) {
      students = memoryUsers.filter(u => u.role === 'student');
    }
    if (submissions.length === 0) {
      submissions = memorySubmissions;
    }

    const query = search.toLowerCase().trim();
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
    );

    // Calculate per-student stats
    const studentList = filtered.map(s => {
      const sId = String(s._id || s.id);
      const userSubs = submissions.filter(sub => String(sub.userId) === sId);
      const attemptedPids = new Set(userSubs.map(sub => String(sub.problemId)));
      const solvedPids = new Set(
        userSubs
          .filter(sub => sub.status === 'Accepted' || (sub.passedTests > 0 && sub.passedTests === sub.totalTests))
          .map(sub => String(sub.problemId))
      );

      const attempted = attemptedPids.size;
      const solved = solvedPids.size;
      const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

      return {
        id: sId,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt || new Date(),
        totalSubmissions: userSubs.length,
        attempted,
        solved,
        accuracy
      };
    });

    res.status(200).json({
      success: true,
      count: studentList.length,
      students: studentList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/students/:id/progress
 * Individual learner report
 */
export const getIndividualStudentReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    let student = null;
    let userSubmissions = [];
    let userHints = [];

    if (mongoose.connection.readyState === 1) {
      try {
        student = await User.findById(id).select('-password').exec();
        userSubmissions = await Submission.find({ userId: id }).sort({ createdAt: -1 }).exec();
        userHints = await HintUsage.find({ userId: id }).exec();
      } catch (dbErr) {}
    }

    if (!student) {
      const memU = memoryUsers.find(u => String(u._id) === id);
      if (memU) {
        student = { id: String(memU._id), name: memU.name, email: memU.email, createdAt: memU.createdAt };
      }
    }

    if (userSubmissions.length === 0) {
      userSubmissions = memorySubmissions.filter(s => String(s.userId) === id);
    }
    if (userHints.length === 0) {
      userHints = memoryHintUsages.filter(h => String(h.userId) === id);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const attemptedPids = new Set(userSubmissions.map(s => String(s.problemId)));
    const solvedPids = new Set(
      userSubmissions
        .filter(s => s.status === 'Accepted' || (s.passedTests > 0 && s.passedTests === s.totalTests))
        .map(s => String(s.problemId))
    );

    const attempted = attemptedPids.size;
    const solved = solvedPids.size;
    const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
    const totalHints = userHints.filter(h => !h.isSolutionReveal).length;
    const totalReveals = userHints.filter(h => h.isSolutionReveal).length;

    res.status(200).json({
      success: true,
      report: {
        student: {
          id: String(student._id || student.id),
          name: student.name,
          email: student.email,
          createdAt: student.createdAt
        },
        metrics: {
          attempted,
          solved,
          accuracy,
          totalSubmissions: userSubmissions.length,
          totalHints,
          totalReveals
        },
        recentSubmissions: userSubmissions.slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/system/health
 * Operational system health check
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    let aiActive = false;
    let aiDetails = null;

    try {
      await new Promise((resolve) => {
        const pingReq = http.get('http://127.0.0.1:5000/health', (pingRes) => {
          let body = '';
          pingRes.on('data', chunk => body += chunk);
          pingRes.on('end', () => {
            try {
              aiDetails = JSON.parse(body);
              aiActive = true;
            } catch (e) {
              aiActive = true;
            }
            resolve();
          });
        });
        pingReq.on('error', () => {
          aiActive = false;
          resolve();
        });
        pingReq.setTimeout(1500, () => {
          pingReq.destroy();
          resolve();
        });
      });
    } catch (e) {}

    const dbConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
      success: true,
      health: {
        timestamp: new Date(),
        backend: {
          status: 'healthy',
          nodeVersion: process.version,
          uptimeSeconds: Math.floor(process.uptime()),
          memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        database: {
          status: dbConnected ? 'connected' : 'disconnected (using memory fallback)',
          host: mongoose.connection.host || 'localhost',
          database: mongoose.connection.name || 'codementor_ai'
        },
        aiService: {
          active: aiActive,
          url: 'http://localhost:5000',
          details: aiDetails
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/system/architecture
 */
export const getSystemArchitecture = async (req, res, next) => {
  res.status(200).json({
    success: true,
    architecture: {
      frontend: "React SPA (Vite, React Router v7, Lucide Icons)",
      backend: "Node.js / Express.js (Port 3000)",
      database: "MongoDB / Mongoose (or in-memory resilient fallback)",
      aiService: "Python / FastAPI Service (Port 5000) with LangGraph Supervisor & Gemini 2.5 Flash",
      pipeline: [
        "React Frontend -> Express REST API -> Auth/RBAC Middleware -> Controller",
        "Express Controller -> Python AI Service (Port 5000) -> LangGraph Workflow",
        "LangGraph Supervisor -> Hint Agent / Code Review Agent / Learning Coach -> Gemini 2.5 Flash API"
      ]
    }
  });
};
