# Soft-delete movies via is_active flag

Movies are never hard-deleted from the database. The DELETE endpoint sets `is_active=False` and returns 204. Active movies are shown in the public catalog; inactive movies remain visible in the admin panel. This preserves data integrity — movie records referenced by other systems (future orders, reviews) won't be orphaned.

**Alternatives considered**: Hard delete with CASCADE — rejected because it loses data and breaks potential future relationships. Separate `deleted_at` timestamp field — rejected as over-engineering; a boolean flag is sufficient for the current scope.
