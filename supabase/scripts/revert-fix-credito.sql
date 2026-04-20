BEGIN;
SET LOCAL "request.jwt.claims" = '{"sub": null, "email": "sistema@revert.com", "role": "admin"}';
UPDATE fuentes_pago
SET monto_aprobado = 17228530, capital_para_cierre = 16253330
WHERE id = 'e4f5278c-7a14-44cf-9149-7a482b78da3f';
COMMIT;
