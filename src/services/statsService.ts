/**
 * سرویس آمار و گزارش‌ها
 * 
 * این ماژول برای تهیه آمار و گزارش‌های مختلف استفاده می‌شود
 */

import databaseService, { Task, User, Comment, TaskHistory } from './databaseService';
import { logger } from '../core/logger';

// نوع داده آمار داشبورد
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksPerStatus: {
    status: string;
    count: number;
  }[];
  tasksPerPriority: {
    priority: string;
    count: number;
  }[];
  recentActivities: {
    id: string;
    taskId: string;
    taskTitle: string;
    userId: string;
    userName: string;
    action: string;
    details?: string;
    createdAt: number;
  }[];
  upcomingTasks: {
    id: string;
    title: string;
    dueDate: number;
    priority: string;
    status: string;
  }[];
}

// نوع داده آمار کاربر
export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  tasksPerStatus: {
    status: string;
    count: number;
  }[];
  tasksPerPriority: {
    priority: string;
    count: number;
  }[];
  assignedToMe: number;
  createdByMe: number;
}

/**
 * کلاس سرویس آمار
 */
export class StatsService {
  /**
   * دریافت آمار داشبورد
   * @param userId شناسه کاربر (اختیاری)
   * @returns آمار داشبورد
   */
  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    try {
      // دریافت تمام وظایف
      const allTasks = databaseService.getAll<Task>('tasks');
      const filteredTasks = userId 
        ? allTasks.filter(task => task.userId === userId)
        : allTasks;

      // دریافت کاربران و تاریخچه وظایف
      const users = databaseService.getAll<User>('users');
      const taskHistory = databaseService.getAll<TaskHistory>('taskHistory')
        .sort((a, b) => b.createdAt - a.createdAt);
      
      // محاسبه تعداد وظایف بر اساس وضعیت
      const tasksPerStatus = this.calculateTasksPerStatus(filteredTasks);

      // محاسبه تعداد وظایف بر اساس اولویت
      const tasksPerPriority = this.calculateTasksPerPriority(filteredTasks);

      // محاسبه وظایف در وضعیت‌های مختلف
      const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
      const pendingTasks = filteredTasks.filter(task => task.status !== 'completed').length;
      
      // وظایف گذشته از موعد
      const now = Date.now();
      const overdueTasks = filteredTasks.filter(task => 
        task.status !== 'completed' && 
        task.dueDate !== undefined &&
        task.dueDate < now
      ).length;

      // فعالیت‌های اخیر
      const recentActivities = taskHistory
        .filter(history => userId ? history.userId === userId : true)
        .slice(0, 10)
        .map(history => {
          const task = allTasks.find(t => t.id === history.taskId);
          const user = users.find(u => u.id === history.userId);
          return {
            id: history.id,
            taskId: history.taskId,
            taskTitle: task ? task.title : 'وظیفه نامشخص',
            userId: history.userId,
            userName: user ? user.fullName : 'کاربر نامشخص',
            action: history.action,
            details: history.details,
            createdAt: history.createdAt
          };
        });

      // وظایف آینده
      const upcomingTasks = filteredTasks
        .filter(task => 
          task.status !== 'completed' && 
          task.dueDate !== undefined &&
          task.dueDate >= now
        )
        .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate || 0,
          priority: task.priority,
          status: task.status
        }));

      return {
        totalTasks: filteredTasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks,
        tasksPerStatus,
        tasksPerPriority,
        recentActivities,
        upcomingTasks
      };
    } catch (error) {
      logger.error('خطا در دریافت آمار داشبورد', error);
      throw error;
    }
  }

  /**
   * دریافت آمار کاربر
   * @param userId شناسه کاربر
   * @returns آمار کاربر
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // دریافت تمام وظایف
      const allTasks = databaseService.getAll<Task>('tasks');
      
      // وظایف مرتبط با کاربر
      const userTasks = allTasks.filter(task => task.userId === userId);
      
      // وظایف ایجاد شده توسط کاربر
      const createdByMe = userTasks.length;
      
      // محاسبه تعداد وظایف بر اساس وضعیت
      const tasksPerStatus = this.calculateTasksPerStatus(userTasks);

      // محاسبه تعداد وظایف بر اساس اولویت
      const tasksPerPriority = this.calculateTasksPerPriority(userTasks);

      // محاسبه وظایف در وضعیت‌های مختلف
      const completedTasks = userTasks.filter(task => task.status === 'completed').length;
      const pendingTasks = userTasks.filter(task => task.status !== 'completed').length;
      
      return {
        totalTasks: userTasks.length,
        completedTasks,
        pendingTasks,
        tasksPerStatus,
        tasksPerPriority,
        assignedToMe: 0, // در ساختار جدید مفهوم محول شده به کاربر وجود ندارد
        createdByMe
      };
    } catch (error) {
      logger.error(`خطا در دریافت آمار کاربر با شناسه ${userId}`, error);
      throw error;
    }
  }

  /**
   * دریافت آمار زمانی وظایف
   * @param period دوره زمانی
   * @param userId شناسه کاربر (اختیاری)
   * @returns آمار زمانی وظایف
   */
  async getTasksTimeStats(period: 'day' | 'week' | 'month' | 'year', userId?: string): Promise<any> {
    try {
      // دریافت تمام وظایف
      const allTasks = databaseService.getAll<Task>('tasks');
      const filteredTasks = userId 
        ? allTasks.filter(task => task.userId === userId)
        : allTasks;

      // تاریخ شروع بر اساس دوره
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const startTime = startDate.getTime();
      
      // فیلتر وظایف بر اساس زمان ایجاد
      const tasksInPeriod = filteredTasks.filter(task => task.createdAt >= startTime);
      
      // تعداد وظایف ایجاد شده در دوره زمانی
      const created = tasksInPeriod.length;
      
      // تعداد وظایف تکمیل شده در دوره زمانی
      const completed = filteredTasks
        .filter(task => task.status === 'completed' && task.updatedAt >= startTime)
        .length;

      return {
        period,
        startDate: startTime,
        endDate: now.getTime(),
        created,
        completed,
        ratio: created > 0 ? Math.round((completed / created) * 100) : 0
      };
      
    } catch (error) {
      logger.error(`خطا در دریافت آمار زمانی وظایف برای دوره ${period}`, error);
      throw error;
    }
  }

  /**
   * دریافت آمار کلی سیستم
   * @returns آمار کلی سیستم
   */
  async getSystemStats(): Promise<any> {
    try {
      // دریافت آمار کلی از جداول مختلف
      const users = databaseService.getAll<User>('users');
      const tasks = databaseService.getAll<Task>('tasks');
      const comments = databaseService.getAll<Comment>('comments');
      const taskHistory = databaseService.getAll<TaskHistory>('taskHistory');
      
      // آمار وظایف
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status !== 'completed').length;
      
      // میانگین کامنت بر وظیفه
      const commentsPerTask = tasks.length > 0 ? comments.length / tasks.length : 0;
      
      // میانگین وظیفه بر کاربر
      const tasksPerUser = users.length > 0 ? tasks.length / users.length : 0;
      
      // آمار فعالیت‌ها
      const activities = taskHistory.length;
      const activitiesPerDay = this.calculateActivitiesPerDay(taskHistory);
      
      return {
        userCount: users.length,
        taskCount: tasks.length,
        commentCount: comments.length,
        activityCount: activities,
        completedTasks,
        pendingTasks,
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        commentsPerTask: parseFloat(commentsPerTask.toFixed(2)),
        tasksPerUser: parseFloat(tasksPerUser.toFixed(2)),
        activitiesPerDay
      };
    } catch (error) {
      logger.error('خطا در دریافت آمار کلی سیستم', error);
      throw error;
    }
  }

  /**
   * محاسبه تعداد وظایف بر اساس وضعیت
   * @param tasks لیست وظایف
   */
  private calculateTasksPerStatus(tasks: Task[]): { status: string; count: number }[] {
    const statusCounts: Record<string, number> = {};
    
    // شمارش وظایف بر اساس وضعیت
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    // تبدیل به آرایه مورد نیاز
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  }

  /**
   * محاسبه تعداد وظایف بر اساس اولویت
   * @param tasks لیست وظایف
   */
  private calculateTasksPerPriority(tasks: Task[]): { priority: string; count: number }[] {
    const priorityCounts: Record<string, number> = {};
    
    // شمارش وظایف بر اساس اولویت
    tasks.forEach(task => {
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });
    
    // تبدیل به آرایه مورد نیاز
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count
    }));
  }

  /**
   * محاسبه میانگین فعالیت‌ها در روز
   * @param activities لیست فعالیت‌ها
   */
  private calculateActivitiesPerDay(activities: TaskHistory[]): number {
    if (activities.length === 0) return 0;
    
    // زمان اولین و آخرین فعالیت
    const timestamps = activities.map(a => a.createdAt).sort();
    const firstActivity = timestamps[0];
    const lastActivity = timestamps[timestamps.length - 1];
    
    // تعداد روزهای بین اولین و آخرین فعالیت
    const daysDiff = Math.max(1, Math.ceil((lastActivity - firstActivity) / (24 * 60 * 60 * 1000)));
    
    // میانگین فعالیت در روز
    return parseFloat((activities.length / daysDiff).toFixed(2));
  }
}

// ایجاد نمونه از سرویس
const statsService = new StatsService();
export default statsService; 