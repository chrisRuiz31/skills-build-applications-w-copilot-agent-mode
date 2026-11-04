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

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team payload is required'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as {
    name?: string;
    mascot?: string;
    members?: Array<string | mongoose.Types.ObjectId>;
  };

  if (!name || !String(name).trim()) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const memberIds = Array.isArray(members)
    ? members.filter((memberId) => memberId != null).map((memberId) => new mongoose.Types.ObjectId(String(memberId)))
    : [];

  const team = await Team.create({
    name: String(name).trim(),
    mascot: mascot ? String(mascot).trim() : '',
    members: memberIds,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  const leaderboard = await Promise.all(
    totals.map(async ({ _id, totalPoints }, index) => {
      const team = await Team.findById(_id).select('name').lean();
      return {
        teamName: team?.name ?? 'Unknown team',
        totalPoints: Number(totalPoints) || 0,
        rank: index + 1,
      };
    }),
  );

  return leaderboard;
}

export async function suggestWorkouts(userEmail: string) {
  const email = userEmail?.trim();
  if (!email) {
    throw Object.assign(new Error('userEmail is required'), { status: 400 });
  }

  const user = await User.findOne({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const recentFocuses = recentActivities.map((activity) => activity.type).filter(Boolean);
  const preferredFocus = user.fitnessGoal ?? recentFocuses[0] ?? 'endurance';

  const matchingWorkouts = await Workout.find({
    $or: [
      { focus: preferredFocus },
      ...recentFocuses.map((focus) => ({ focus })),
    ],
  }).lean();

  const workouts = matchingWorkouts.length > 0 ? matchingWorkouts : await Workout.find().lean();

  const suggestions = workouts
    .map((workout) => {
      const reason = recentFocuses.includes(workout.focus)
        ? `Matches your recent ${workout.focus} activity and supports your current training pattern.`
        : `Aligns with your ${user.fitnessGoal ?? 'fitness'} goal and recent activity pattern.`;

      return {
        ...workout,
        reason,
      };
    })
    .sort((left, right) => {
      const leftScore = left.focus === preferredFocus ? 1 : 0;
      const rightScore = right.focus === preferredFocus ? 1 : 0;
      return rightScore - leftScore;
    });

  return suggestions;
}

export { User };
