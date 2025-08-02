-- Create admin_otps table for admin login OTP
CREATE TABLE public.admin_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_otps table
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_otps - only service role can access
CREATE POLICY "Service role can manage admin OTPs" 
  ON public.admin_otps 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policy for attendance - users can only see their own attendance
CREATE POLICY "Users can view their own attendance" 
  ON public.attendance 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Create policy for attendance - teachers/admins can manage attendance
CREATE POLICY "Teachers and admins can manage attendance" 
  ON public.attendance 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create fees table
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('tuition', 'library', 'laboratory', 'other')),
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'online')),
  transaction_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on fees table
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Create policy for fees - users can only see their own fees
CREATE POLICY "Users can view their own fees" 
  ON public.fees 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Create policy for fees - users can update their own fees (for payments)
CREATE POLICY "Users can update their own fees" 
  ON public.fees 
  FOR UPDATE 
  USING (auth.uid() = student_id);

-- Create policy for fees - admins can manage all fees
CREATE POLICY "Admins can manage all fees" 
  ON public.fees 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for messages - users can see messages they sent or received
CREATE POLICY "Users can view their messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Create policy for messages - users can send messages
CREATE POLICY "Users can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Create policy for messages - users can update their received messages (mark as read)
CREATE POLICY "Users can update their received messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Create policy for messages - users can delete their messages
CREATE POLICY "Users can delete their messages" 
  ON public.messages 
  FOR DELETE 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Add role column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin'));

-- Update existing profiles to have student role
UPDATE public.profiles 
SET role = 'student' 
WHERE role IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON public.grades(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON public.attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_otps_email ON public.admin_otps(email);
CREATE INDEX IF NOT EXISTS idx_admin_otps_expires_at ON public.admin_otps(expires_at); 