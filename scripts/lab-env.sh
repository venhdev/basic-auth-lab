#!/bin/bash

# Lab Control Script for Auth Lab RBAC
# Usage: ./lab-env.sh [stateless|stateful|seed|exploit-05|exploit-06]

BE_ENV_FILE="apps/be/.env"

case "$1" in
    "stateless")
        echo "Switching to STATELESS mode (Vulnerable)..."
        sed -i 's/RBAC_VERIFICATION_STRATEGY=.*/RBAC_VERIFICATION_STRATEGY=stateless/' $BE_ENV_FILE
        echo "Done. Please restart the backend."
        ;;
    "stateful")
        echo "Switching to STATEFUL mode (Secure)..."
        sed -i 's/RBAC_VERIFICATION_STRATEGY=.*/RBAC_VERIFICATION_STRATEGY=stateful/' $BE_ENV_FILE
        echo "Done. Please restart the backend."
        ;;
    "seed")
        echo "Seeding database from scripts/db/seeds.sql..."
        docker compose exec -T postgres psql -U lab -d auth_lab < scripts/db/seeds.sql
        echo "Seeding complete."
        ;;
    "exploit-05")
        echo "Running Lab 05 Exploit (Algorithm Confusion)..."
        python3 scripts/exploit/lab05_priv_esc.py "${@:2}"
        ;;
    "exploit-06")
        echo "Running Lab 06 Exploit (IDOR)..."
        python3 scripts/exploit/lab06_idor.py "${@:2}"
        ;;
    "prune")
        echo "Pruning database from scripts/db/prune.sql..."
        docker compose exec -T postgres psql -U lab -d auth_lab < scripts/db/prune.sql
        ;;
    "status")
        echo "Database Status Report:"
        docker compose exec -T postgres psql -U lab -d auth_lab < scripts/db/status.sql
        ;;
    *)
        echo "Usage: $0 {stateless|stateful|seed|exploit-05|exploit-06}"
        exit 1
        ;;
esac
