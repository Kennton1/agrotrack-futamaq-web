-- =============================================
-- AGROTRACK FUTAMAQ - AUDIT LOGGING SYSTEM
-- =============================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID DEFAULT auth.uid(), -- Users ID from Supabase Auth
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (or admins only in strict production)
CREATE POLICY "Authenticated users can view audit logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);

-- 3. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    old_val JSONB;
    new_val JSONB;
    record_identifier TEXT;
BEGIN
    -- Determine operation type and set values
    IF (TG_OP = 'INSERT') THEN
        old_val := NULL;
        new_val := to_jsonb(NEW);
        record_identifier := NEW.id::TEXT;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
        record_identifier := NEW.id::TEXT;
    ELSIF (TG_OP = 'DELETE') THEN
        old_val := to_jsonb(OLD);
        new_val := NULL;
        record_identifier := OLD.id::TEXT;
    END IF;

    -- Insert log record
    INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        record_identifier,
        TG_OP,
        old_val,
        new_val,
        auth.uid()
    );

    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply Triggers to Critical Tables
-- Machinery Checks
DROP TRIGGER IF EXISTS audit_machinery_changes ON machinery;
CREATE TRIGGER audit_machinery_changes
AFTER INSERT OR UPDATE OR DELETE ON machinery
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Work Orders Checks
DROP TRIGGER IF EXISTS audit_work_orders_changes ON work_orders;
CREATE TRIGGER audit_work_orders_changes
AFTER INSERT OR UPDATE OR DELETE ON work_orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Stock Checks (Spare Parts)
DROP TRIGGER IF EXISTS audit_spare_parts_changes ON spare_parts;
CREATE TRIGGER audit_spare_parts_changes
AFTER INSERT OR UPDATE OR DELETE ON spare_parts
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
