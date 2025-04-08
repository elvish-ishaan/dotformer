import { CronJob } from 'cron';
import { billingService } from './billingService';

/**
 * Service for scheduling recurring tasks
 */
export const schedulerService = {
  /**
   * Initialize all scheduled jobs
   */
  initializeJobs: () => {
    // Schedule monthly billing job - runs on the 1st of each month at 1:00 AM
    const monthlyBillingJob = new CronJob('0 1 1 * *', async () => {
      try {
        console.log('Running monthly billing job...');
        
        // Get last month's date range
        const endDate = new Date();
        endDate.setDate(1); // First day of current month
        endDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 1); // First day of last month
        
        // Generate bills for all users
        const bills = await billingService.generateBills(startDate, endDate);
        
        console.log(`Generated ${bills.filter(Boolean).length} bills successfully.`);
      } catch (error) {
        console.error('Error running monthly billing job:', error);
      }
    }, null, false, 'UTC');
    
    // Schedule daily storage usage tracking - runs every day at 2:00 AM
    const storageTrackingJob = new CronJob('0 2 * * *', async () => {
      try {
        console.log('Running daily storage tracking job...');
        
        // TODO: Calculate storage usage for all users and record it
        // This would scan all assets, calculate total storage used per user,
        // and create usage records for storage
        
        console.log('Storage tracking job completed successfully.');
      } catch (error) {
        console.error('Error running storage tracking job:', error);
      }
    }, null, false, 'UTC');
    
    // Start all scheduled jobs
    monthlyBillingJob.start();
    storageTrackingJob.start();
    
    console.log('Scheduler service initialized');
    
    return {
      monthlyBillingJob,
      storageTrackingJob
    };
  },
  
  /**
   * Run the monthly billing job manually (for testing)
   */
  runMonthlyBillingManually: async () => {
    try {
      console.log('Running monthly billing job manually...');
      
      // Get last month's date range
      const endDate = new Date();
      endDate.setDate(1); // First day of current month
      endDate.setHours(0, 0, 0, 0);
      
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 1); // First day of last month
      
      // Generate bills for all users
      const bills = await billingService.generateBills(startDate, endDate);
      
      console.log(`Generated ${bills.filter(Boolean).length} bills successfully.`);
      
      return bills.filter(Boolean);
    } catch (error) {
      console.error('Error running monthly billing job manually:', error);
      throw error;
    }
  }
}; 