
import { createClient } from '@supabase/supabase-js'

// ===========================================================================
// تنظیمات اتصال به دیتابیس اختصاصی شما
// ===========================================================================
//
// شما جدول‌ها را در Navicat ایجاد کرده‌اید. عالی است!
// برای اینکه این برنامه (سایت) بتواند به آن دیتابیس وصل شود، باید سرویس
// Supabase را روی سرور خود (جایی که دیتابیس قرار دارد) نصب کنید.
//
// هنگام تنظیم سرویس Supabase در Docker، از اطلاعات زیر استفاده کنید:
//
// DB_HOST:     09ae25318ce74c37bbc1a80c699b44d5.db.arvandbaas.ir
// DB_PORT:     5432
// DB_NAME:     Amozeshbebimar
// DB_USER:     base-user
// DB_PASSWORD: N1-1_MZUK4J686o1VgkWbbM6
//
// ===========================================================================

// پس از راه‌اندازی سرویس روی سرور، آدرس و کلید جدید را در اینجا جایگزین کنید:
// مثال: const supabaseUrl = 'http://your-server-ip:8000'

// در حال حاضر برای جلوگیری از خطای برنامه، از اتصال نمایشی استفاده می‌شود.
// به محض آماده شدن سرور خودتان، مقادیر زیر را تغییر دهید.
const supabaseUrl = 'https://ziehnpkoveeuzvfneokc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZWhucGtvdmVldXp2Zm5lb2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODE0NjQsImV4cCI6MjA3NTk1NzQ2NH0.B1KlaebpyHalfPiw_wNo4H_J1U82nAYgNaWnmOlHvrs'

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and anonymous key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
