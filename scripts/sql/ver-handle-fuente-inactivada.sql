SELECT pg_get_functiondef((SELECT oid FROM pg_proc WHERE proname = 'handle_fuente_inactivada'));
