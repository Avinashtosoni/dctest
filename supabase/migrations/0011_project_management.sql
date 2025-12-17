-- =============================================
-- Project Management System
-- =============================================

-- =============================================
-- ENUMS
-- =============================================
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_member_role AS ENUM ('owner', 'manager', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('assignment', 'status_change', 'update', 'deadline', 'mention');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    title text NOT NULL,
    description text,
    
    -- Client Information
    client_name text NOT NULL,
    client_email text,
    
    -- Project Status & Priority
    status project_status DEFAULT 'planning',
    priority project_priority DEFAULT 'medium',
    progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Financial
    budget numeric(10, 2),
    
    -- Timeline
    start_date date,
    due_date date,
    completion_date date,
    
    -- Metadata
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- PROJECT MEMBERS TABLE (User Assignments)
-- =============================================
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role project_member_role DEFAULT 'member',
    
    assigned_at timestamptz DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    UNIQUE(project_id, user_id)
);

-- =============================================
-- PROJECT STATUS UPDATES TABLE (Client Communications)
-- =============================================
CREATE TABLE IF NOT EXISTS public.project_status_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    title text NOT NULL,
    message text NOT NULL,
    
    sent_to_client boolean DEFAULT false,
    sent_at timestamptz,
    
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- =============================================
-- PROJECT NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.project_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    title text NOT NULL,
    message text,
    
    is_read boolean DEFAULT false,
    read_at timestamptz,
    
    created_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_client_name ON public.projects(client_name);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON public.projects(due_date);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

CREATE INDEX IF NOT EXISTS idx_project_status_updates_project_id ON public.project_status_updates(project_id);

CREATE INDEX IF NOT EXISTS idx_project_notifications_user_id ON public.project_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_is_read ON public.project_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_project_notifications_project_id ON public.project_notifications(project_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Projects Table RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can view projects they created or if they're admin
-- We remove project_members reference to avoid circular dependency
DROP POLICY IF EXISTS "Users can view their projects" ON public.projects;
CREATE POLICY "Users can view their projects"
    ON public.projects FOR SELECT
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Admins and creators can create projects
DROP POLICY IF EXISTS "Admins and project owners can create projects" ON public.projects;
CREATE POLICY "Admins and project owners can create projects"
    ON public.projects FOR INSERT
    WITH CHECK (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Project creators and admins can update
DROP POLICY IF EXISTS "Project owners and managers can update" ON public.projects;
CREATE POLICY "Project owners and managers can update"
    ON public.projects FOR UPDATE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Only admins and project creators can delete
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
    ON public.projects FOR DELETE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Project Members RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of projects they're part of
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;
CREATE POLICY "Users can view project members"
    ON public.project_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        project_id IN (
            SELECT id FROM public.projects WHERE created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Project owners and managers can manage members
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;
CREATE POLICY "Project owners can manage members"
    ON public.project_members FOR ALL
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Project Status Updates RLS
ALTER TABLE public.project_status_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view updates" ON public.project_status_updates;
CREATE POLICY "Project members can view updates"
    ON public.project_status_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid())
            )
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

DROP POLICY IF EXISTS "Project members can create updates" ON public.project_status_updates;
CREATE POLICY "Project members can create updates"
    ON public.project_status_updates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.project_members 
                    WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'manager', 'member')
                )
            )
        )
    );

-- Project Notifications RLS
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.project_notifications;
CREATE POLICY "Users can view their notifications"
    ON public.project_notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their notifications" ON public.project_notifications;
CREATE POLICY "Users can update their notifications"
    ON public.project_notifications FOR UPDATE
    USING (user_id = auth.uid());

-- =============================================
-- TRIGGERS
-- =============================================

-- Update projects updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_updated_at();

-- Notify project members on assignment
CREATE OR REPLACE FUNCTION public.notify_on_project_assignment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_notifications (project_id, user_id, type, title, message)
    VALUES (
        NEW.project_id,
        NEW.user_id,
        'assignment',
        'Assigned to Project',
        'You have been assigned to a project with role: ' || NEW.role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_assignment ON public.project_members;
CREATE TRIGGER trigger_notify_assignment
    AFTER INSERT ON public.project_members
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_project_assignment();

-- Notify on status change
CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.project_notifications (project_id, user_id, type, title, message)
        SELECT 
            NEW.id,
            pm.user_id,
            'status_change',
            'Project Status Changed',
            'Project status changed from ' || OLD.status || ' to ' || NEW.status
        FROM public.project_members pm
        WHERE pm.project_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_status_change ON public.projects;
CREATE TRIGGER trigger_notify_status_change
    AFTER UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_status_change();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get user's projects
CREATE OR REPLACE FUNCTION public.get_user_projects(user_uuid uuid)
RETURNS TABLE (
    id uuid,
    title text,
    client_name text,
    status project_status,
    priority project_priority,
    progress integer,
    due_date date,
    member_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.client_name,
        p.status,
        p.priority,
        p.progress,
        p.due_date,
        COUNT(pm.user_id) as member_count
    FROM public.projects p
    LEFT JOIN public.project_members pm ON p.id = pm.project_id
    WHERE p.created_by = user_uuid 
       OR EXISTS (
           SELECT 1 FROM public.project_members 
           WHERE project_id = p.id AND user_id = user_uuid
       )
    GROUP BY p.id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get project statistics
CREATE OR REPLACE FUNCTION public.get_project_stats()
RETURNS TABLE (
    total_projects bigint,
    active_projects bigint,
    completed_projects bigint,
    on_hold_projects bigint,
    overdue_projects bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::bigint as total_projects,
        COUNT(*) FILTER (WHERE status = 'active')::bigint as active_projects,
        COUNT(*) FILTER (WHERE status = 'completed')::bigint as completed_projects,
        COUNT(*) FILTER (WHERE status = 'on-hold')::bigint as on_hold_projects,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled'))::bigint as overdue_projects
    FROM public.projects
    WHERE created_by = auth.uid()
       OR EXISTS (
           SELECT 1 FROM public.project_members 
           WHERE project_id = projects.id AND user_id = auth.uid()
       );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_projects(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_stats() TO authenticated;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Note: Sample data will be added after first admin user is created
-- For now, this migration sets up the structure
