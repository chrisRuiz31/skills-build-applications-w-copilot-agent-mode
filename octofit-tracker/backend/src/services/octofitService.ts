import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity payload is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: string;
    teamId?: string;
    type?: string;
    minutes?: number;
  };

  if (!userId || !teamId || !type || minutes === undefined || minutes === null || Number.isNaN(Number(minutes))) {
    throw Object.assign(new Error('userId, teamId, type, and minutes are required'), { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid MongoDB ObjectIds'), { status: 400 });
  }

  const user = await User.findById(userId).lean();
  const team = await Team.findById(teamId).lean();

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 404 });
  }

  const staticType = String(type).trim();
  const numericMinutes = Number(minutes);
  if (!staticType || numericMinutes <= 0) {
    throw Object.assign(new Error('type must be a non-empty string and minutes must be greater than zero'), { status: 400 });
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: staticType,
    minutes: numericMinutes,
    points: numericMinutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
