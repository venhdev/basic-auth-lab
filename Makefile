up:
	docker compose up -d
down:
	docker compose down
db-shell:
	docker compose exec postgres psql -U lab auth_lab
logs:
	docker compose logs -f
restart:
	docker compose restart

# --- RBAC Lab Scripts ---
seed:
	bash scripts/lab-env.sh seed

mode-stateless:
	bash scripts/lab-env.sh stateless

mode-stateful:
	bash scripts/lab-env.sh stateful

exploit-05:
	bash scripts/lab-env.sh exploit-05

exploit-06:
	bash scripts/lab-env.sh exploit-06

prune:
	bash scripts/lab-env.sh prune

db-status:
	bash scripts/lab-env.sh status
