import type {
  PublicQuizQuestion,
  QuizAnswerDetail,
  QuizSubmissionDetails,
} from "./quiz";

export type { PublicQuizQuestion, QuizAnswerDetail, QuizSubmissionDetails };

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PublicClass = {
  id: string;
  name: string;
  accessCode: string;
};

export type PublicActivity = {
  id: string;
  title: string;
  templateType: string;
  librasVideoUrl: string | null;
  jsonOptions: Json;
  quizQuestions?: PublicQuizQuestion[];
  createdAt: string;
};

export type PublicClassPayload = {
  class: PublicClass;
  activities: PublicActivity[];
};

export type DashboardClass = PublicClass & {
  createdAt: string;
  updatedAt: string;
};

export type DashboardActivity = PublicActivity & {
  updatedAt: string;
  classIds: string[];
};

export type DashboardPerformanceLog = {
  id: string;
  activityId: string;
  activityTitle: string;
  classId: string | null;
  className: string | null;
  classAccessCode: string | null;
  studentName: string | null;
  responseTimeSeconds: number;
  correctAnswers: number;
  wrongAnswers: number;
  answerDetails: QuizSubmissionDetails | null;
  createdAt: string;
};

export type PerformanceLogPayload = {
  activityId: string;
  classId?: string;
  studentName?: string;
  responseTimeSeconds: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  answerDetails?: QuizSubmissionDetails;
};
